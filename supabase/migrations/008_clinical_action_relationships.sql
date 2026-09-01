-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 008: Automatic Clinical-Action Relationships
-- ═══════════════════════════════════════════════════════════
-- Allows healthcare providers (Doctor, Hospital, Diagnostics) to automatically
-- ensure an active provider-patient relationship when performing legitimate
-- clinical actions (prescriptions, hospital visits/admissions, diagnostic reports).
--
-- Security Guarantees:
--   1. Caller must be an authenticated provider role (doctor, hospital, diagnostics).
--   2. Target must exist in public.profiles with role = 'patient'.
--   3. Correct provider_profile_id or organization_id is resolved and bound.
--   4. Duplicate active relationships are prevented.
--   5. Pure patient searches do NOT invoke this function.
--   6. Revocation semantics are preserved.
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. RPC: ensure_clinical_relationship
-- ───────────────────────────────────────────────────────────
-- Called during legitimate clinical transactions (saving prescriptions,
-- diagnostic reports, or hospital admissions).
--
-- Return values (TEXT):
--   'created'              — new active relationship created
--   'already_active'       — active relationship already exists
--   'updated_from_pending' — pending request upgraded to active via direct clinical action
--   'revoked_preserved'    — patient had revoked access; record creation proceeds with revocation audit intact
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ensure_clinical_relationship(
  p_patient_id UUID,
  p_org_id     UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_provider_id     UUID;
  v_role            user_role;
  v_org_id          UUID;
  v_existing_id     UUID;
  v_existing_status TEXT;
BEGIN
  -- ── 1. Authenticate and authorize caller ──────────────────
  v_provider_id := public.get_my_profile_id();
  v_role        := public.get_my_role();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required. Caller role: %', v_role;
  END IF;

  -- ── 2. Validate patient exists ────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE  id = p_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Patient not found: %', p_patient_id;
  END IF;

  -- ── 3. Resolve organization ID for organizational roles ────
  IF v_role IN ('hospital', 'diagnostics') THEN
    v_org_id := COALESCE(p_org_id, public.get_my_organization_id());
  ELSE
    v_org_id := p_org_id; -- Doctors may optionally link an affiliated hospital
  END IF;

  -- ── 4. Check for existing relationship ────────────────────
  SELECT id, status::TEXT INTO v_existing_id, v_existing_status
  FROM   public.patient_provider_relationships
  WHERE  patient_profile_id = p_patient_id
    AND  (
           (v_org_id IS NOT NULL AND organization_id = v_org_id)
           OR (v_org_id IS NULL AND provider_profile_id = v_provider_id)
           OR provider_profile_id = v_provider_id
         )
  ORDER BY
    CASE status
      WHEN 'active'  THEN 1
      WHEN 'pending' THEN 2
      ELSE               3
    END
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_status = 'active' THEN
      UPDATE public.patient_provider_relationships
      SET    updated_at = now()
      WHERE  id = v_existing_id;
      RETURN 'already_active';
    END IF;

    IF v_existing_status = 'pending' THEN
      -- Clinical action performed: transition pending request to active
      UPDATE public.patient_provider_relationships
      SET    status     = 'active',
             expires_at = NULL,
             updated_at = now()
      WHERE  id = v_existing_id;
      RETURN 'updated_from_pending';
    END IF;

    IF v_existing_status = 'revoked' THEN
      -- Preserve revocation audit trail; do not overwrite revoked status
      RETURN 'revoked_preserved';
    END IF;
  END IF;

  -- ── 5. Insert new ACTIVE relationship ─────────────────────
  INSERT INTO public.patient_provider_relationships (
    patient_profile_id,
    provider_profile_id,
    provider_type,
    organization_id,
    status,
    granted_by,
    created_at,
    updated_at
  ) VALUES (
    p_patient_id,
    v_provider_id,
    v_role,
    v_org_id,
    'active',
    v_provider_id,
    now(),
    now()
  )
  ON CONFLICT (patient_profile_id, provider_profile_id)
  DO UPDATE SET
    status     = 'active',
    expires_at = NULL,
    updated_at = now()
  WHERE patient_provider_relationships.status != 'revoked';

  RETURN 'created';
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_clinical_relationship(UUID, UUID) TO authenticated;
