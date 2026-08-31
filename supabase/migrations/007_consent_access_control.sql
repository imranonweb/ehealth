-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 007: Patient Consent Access Control
-- ═══════════════════════════════════════════════════════════
-- Adds patient-consent-based access request workflow for hospital
-- and diagnostics providers. Patients must explicitly approve access
-- before providers can read sensitive medical history.
--
-- Changes:
--   1. Add request_note column to patient_provider_relationships
--   2. Add performance index on (patient_profile_id, status)
--   3. RPC: request_provider_access  — provider submits a PENDING request
--   4. RPC: approve_provider_access  — patient approves a PENDING request
--   5. RPC: reject_provider_access   — patient rejects/revokes a relationship
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. Add optional request_note column
-- ───────────────────────────────────────────────────────────
ALTER TABLE public.patient_provider_relationships
  ADD COLUMN IF NOT EXISTS request_note TEXT;


-- ───────────────────────────────────────────────────────────
-- 2. Performance index for patient notification queries
-- ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ppr_patient_status
  ON public.patient_provider_relationships (patient_profile_id, status);


-- ───────────────────────────────────────────────────────────
-- 3. RPC: request_provider_access
-- ───────────────────────────────────────────────────────────
-- Called by hospital or diagnostics providers from the patient search UI.
-- Creates a PENDING relationship that must be approved by the patient.
--
-- Return values (TEXT):
--   'pending'        — new pending request created successfully
--   'already_pending'— a pending request already exists (idempotent)
--   'already_active' — an active relationship already exists (no action)
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.request_provider_access(
  p_patient_id UUID,
  p_org_id     UUID  DEFAULT NULL,
  p_note       TEXT  DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_provider_id  UUID;
  v_role         user_role;
  v_existing_id  UUID;
  v_existing_status TEXT;
BEGIN
  -- ── 1. Authenticate and authorize ──────────────────────────────────
  v_provider_id := public.get_my_profile_id();
  v_role        := public.get_my_role();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role NOT IN ('hospital', 'diagnostics', 'doctor') THEN
    RAISE EXCEPTION 'Access denied: Provider role required. Caller role: %', v_role;
  END IF;

  -- ── 2. Validate patient exists ─────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE  id = p_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Patient not found: %', p_patient_id;
  END IF;

  -- ── 3. Check for existing relationship ────────────────────────────
  SELECT id, status::TEXT INTO v_existing_id, v_existing_status
  FROM   public.patient_provider_relationships
  WHERE  patient_profile_id = p_patient_id
    AND  (
           provider_profile_id = v_provider_id
           OR (p_org_id IS NOT NULL AND organization_id = p_org_id)
         )
  ORDER BY
    -- Prioritise: active > pending > revoked
    CASE status
      WHEN 'active'  THEN 1
      WHEN 'pending' THEN 2
      ELSE               3
    END
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_status = 'active' THEN
      RETURN 'already_active';
    END IF;
    IF v_existing_status = 'pending' THEN
      -- Optionally update the note on the existing request
      IF p_note IS NOT NULL THEN
        UPDATE public.patient_provider_relationships
        SET    request_note = p_note,
               updated_at   = now()
        WHERE  id = v_existing_id;
      END IF;
      RETURN 'already_pending';
    END IF;
    -- status = 'revoked': fall through to create a fresh pending request
  END IF;

  -- ── 4. Insert new PENDING relationship ────────────────────────────
  INSERT INTO public.patient_provider_relationships (
    patient_profile_id,
    provider_profile_id,
    provider_type,
    organization_id,
    status,
    granted_by,
    request_note
  ) VALUES (
    p_patient_id,
    v_provider_id,
    v_role,
    p_org_id,
    'pending',
    v_provider_id,
    p_note
  )
  ON CONFLICT DO NOTHING;

  RETURN 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_provider_access(UUID, UUID, TEXT) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 4. RPC: approve_provider_access
-- ───────────────────────────────────────────────────────────
-- Called by the patient to approve a pending access request.
-- Validates the caller is the patient in the relationship.
-- Updates status: pending → active.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.approve_provider_access(
  p_relationship_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_patient_id UUID;
  v_role       user_role;
BEGIN
  v_patient_id := public.get_my_profile_id();
  v_role       := public.get_my_role();

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role != 'patient' THEN
    RAISE EXCEPTION 'Only patients can approve access requests.';
  END IF;

  UPDATE public.patient_provider_relationships
  SET    status     = 'active',
         updated_at = now()
  WHERE  id                 = p_relationship_id
    AND  patient_profile_id = v_patient_id
    AND  status             = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Relationship not found, not pending, or not owned by this patient.';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_provider_access(UUID) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 5. RPC: reject_provider_access
-- ───────────────────────────────────────────────────────────
-- Called by the patient to reject a pending request OR revoke
-- an existing active relationship.
-- Updates status: pending|active → revoked.
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reject_provider_access(
  p_relationship_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_patient_id UUID;
  v_role       user_role;
BEGIN
  v_patient_id := public.get_my_profile_id();
  v_role       := public.get_my_role();

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role != 'patient' THEN
    RAISE EXCEPTION 'Only patients can reject or revoke access.';
  END IF;

  UPDATE public.patient_provider_relationships
  SET    status     = 'revoked',
         updated_at = now()
  WHERE  id                 = p_relationship_id
    AND  patient_profile_id = v_patient_id
    AND  status             IN ('pending', 'active');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Relationship not found or not owned by this patient.';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_provider_access(UUID) TO authenticated;
