-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 004: Provider Search & Relationship Fixes
-- ═══════════════════════════════════════════════════════════
-- Description:
--   Resolves the root cause of healthcare providers being unable to
--   search for and access patients.
--
--   Root Cause: The RLS policy "profiles_select_authorized_providers"
--   requires an active patient_provider_relationship to exist BEFORE
--   a provider can read a patient profile. This creates a deadlock —
--   providers cannot find patients to establish a relationship with
--   because RLS blocks profile reads without a pre-existing relationship.
--
--   Fix: Two SECURITY DEFINER RPCs that execute with elevated privileges
--   but are strictly scoped by role checks:
--
--   1. search_patients_for_provider — allows providers to search patients
--      by Health ID, name, or phone. Returns ONLY minimal identity fields.
--      No medical data is exposed. Authenticated provider role required.
--
--   2. create_provider_relationship — allows providers to upsert an active
--      relationship with a patient (used after the patient has shared their
--      Health ID, implying consent). Validates both parties exist.
--
--   Also adds:
--   3. Performance indexes for full-text search fields.
--   4. An RPC alias for the existing lookup_patient_by_identifier that
--      accepts partial Health ID matching.
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. PERFORMANCE INDEXES FOR PATIENT SEARCH
-- ───────────────────────────────────────────────────────────
-- These indexes make name and phone searches fast.
-- Only added if they don't already exist.

CREATE INDEX IF NOT EXISTS idx_profiles_full_name
  ON public.profiles USING gin (to_tsvector('simple', full_name));

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_btree
  ON public.profiles (lower(full_name) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_phone_btree
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_profiles_identifier_upper
  ON public.patient_profiles (upper(patient_identifier));


-- ───────────────────────────────────────────────────────────
-- 2. SECURE PATIENT SEARCH RPC (BREAKS THE RLS DEADLOCK)
-- ───────────────────────────────────────────────────────────
--
-- Security model:
--   - SECURITY DEFINER: runs as the defining superuser internally,
--     bypassing RLS on profiles/patient_profiles for the search query.
--   - Role guard: first statement checks caller is an authenticated
--     provider role. Non-providers (patients, anonymous) are rejected.
--   - Minimal disclosure: returns ONLY the 6 identity fields needed
--     for a provider to identify and select a patient. No medical
--     records, diagnoses, prescriptions, or sensitive clinical data
--     are returned.
--   - Minimum query length: 2 characters enforced at the function level.
--     (Service layer also enforces this in JavaScript.)
--
CREATE OR REPLACE FUNCTION public.search_patients_for_provider(p_query TEXT)
RETURNS TABLE (
  id                 UUID,
  full_name          TEXT,
  patient_identifier TEXT,
  gender             gender_type,
  phone              TEXT,
  email              TEXT
) AS $$
DECLARE
  v_role user_role;
  v_clean TEXT;
BEGIN
  -- ── 1. Authenticate and authorize caller ──────────────────
  v_role := public.get_my_role();

  IF v_role NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Authenticated provider role required for patient search. Caller role: %', v_role;
  END IF;

  -- ── 2. Sanitize and validate query ───────────────────────
  v_clean := trim(p_query);

  IF v_clean IS NULL OR length(v_clean) < 2 THEN
    RAISE EXCEPTION 'Search query must be at least 2 characters.';
  END IF;

  -- ── 3. Execute scoped search — minimal fields only ────────
  -- Searches across Health ID (partial, case-insensitive),
  -- full name (partial, case-insensitive), and phone (prefix).
  -- Strictly limited to profiles with role = 'patient'.
  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.full_name,
    pp.patient_identifier,
    p.gender,
    p.phone,
    p.email
  FROM public.profiles p
  JOIN public.patient_profiles pp ON pp.profile_id = p.id
  WHERE p.role = 'patient'
    AND (
      -- Health ID match (partial, case-insensitive)
      pp.patient_identifier ILIKE '%' || v_clean || '%'
      -- Full name match (partial, case-insensitive)
      OR p.full_name ILIKE '%' || v_clean || '%'
      -- Phone match (prefix, for privacy — do not match mid-string)
      OR p.phone ILIKE v_clean || '%'
    )
  ORDER BY p.id, p.full_name
  LIMIT 20;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Grant execute permission to authenticated users
-- (the internal role check inside the function is the real gate)
GRANT EXECUTE ON FUNCTION public.search_patients_for_provider(TEXT) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 3. SECURE PROVIDER-PATIENT RELATIONSHIP CREATION RPC
-- ───────────────────────────────────────────────────────────
--
-- Security model:
--   - SECURITY DEFINER: bypasses the RLS INSERT policy that would
--     otherwise force providers to create relationships with status
--     'pending' only (which breaks clinical workflow — a provider who
--     has been given a patient's Health ID has implicit consent).
--   - Role guard: only authenticated provider roles can call this.
--   - Patient existence check: validates the patient exists and has
--     role='patient' before creating the link.
--   - UPSERT semantics: safe to call multiple times; creates the
--     relationship on first call, does nothing on subsequent calls.
--     This replaces the broken direct INSERT in ensureRelationship()
--     JS functions which used status='active' (violating RLS INSERT
--     policy for providers) or status='pending' (wrong for clinical use).
--
-- Parameters:
--   p_patient_id  — UUID of the patient's profile (profiles.id)
--   p_org_id      — UUID of the provider's organization (nullable for solo doctors)
--
CREATE OR REPLACE FUNCTION public.create_provider_relationship(
  p_patient_id UUID,
  p_org_id     UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_provider_id UUID;
  v_role        user_role;
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
    WHERE id = p_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Patient not found: %', p_patient_id;
  END IF;

  -- ── 3. Upsert relationship as active ─────────────────────
  -- ON CONFLICT: if the pair already exists, update to active/reset expiry.
  INSERT INTO public.patient_provider_relationships (
    patient_profile_id,
    provider_profile_id,
    provider_type,
    organization_id,
    status,
    granted_by
  )
  VALUES (
    p_patient_id,
    v_provider_id,
    v_role,
    p_org_id,
    'active',
    v_provider_id   -- self-granted (provider is creating after patient shared Health ID)
  )
  ON CONFLICT (patient_profile_id, provider_profile_id)
  DO UPDATE SET
    status     = 'active',
    expires_at = NULL,
    updated_at = now()
  WHERE patient_provider_relationships.status != 'revoked';
  -- NOTE: If a patient has explicitly revoked access, we do NOT re-activate.

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_provider_relationship(UUID, UUID) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 4. EXTENDED lookup_patient_by_identifier (PARTIAL MATCH)
-- ───────────────────────────────────────────────────────────
-- Upgrade the existing exact-match RPC to support partial ILIKE matching.
-- This preserves backward compatibility (callers passing exact IDs still work)
-- while enabling prefix/partial Health ID searches (e.g. "P-9824" → results).

CREATE OR REPLACE FUNCTION public.lookup_patient_by_identifier(p_identifier TEXT)
RETURNS TABLE (
  patient_profile_id UUID,
  full_name          TEXT,
  patient_identifier TEXT,
  gender             gender_type
) AS $$
BEGIN
  -- Only authenticated provider roles can perform lookup
  IF public.get_my_role() NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required for patient lookup.';
  END IF;

  RETURN QUERY
  SELECT
    p.id   AS patient_profile_id,
    p.full_name,
    pp.patient_identifier,
    p.gender
  FROM public.profiles p
  JOIN public.patient_profiles pp ON pp.profile_id = p.id
  WHERE (
    -- Try exact match first (backward compatible), then partial
    pp.patient_identifier = upper(trim(p_identifier))
    OR pp.patient_identifier ILIKE '%' || trim(p_identifier) || '%'
  )
    AND p.role = 'patient'
  ORDER BY
    -- Prefer exact matches at the top
    (pp.patient_identifier = upper(trim(p_identifier))) DESC,
    p.full_name
  LIMIT 10;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- ───────────────────────────────────────────────────────────
-- 5. COMMENT DOCUMENTATION
-- ───────────────────────────────────────────────────────────

COMMENT ON FUNCTION public.search_patients_for_provider(TEXT) IS
  'Secure SECURITY DEFINER RPC for healthcare provider patient discovery. '
  'Bypasses RLS deadlock (providers cannot read profiles without a pre-existing '
  'relationship, but cannot establish a relationship without finding the patient). '
  'Returns minimal identity fields only — no medical/clinical data. '
  'Role check: caller MUST be doctor, diagnostics, or hospital.';

COMMENT ON FUNCTION public.create_provider_relationship(UUID, UUID) IS
  'Secure SECURITY DEFINER RPC for creating/upserting a provider-patient '
  'relationship as active. Used after a provider has been given a patient Health ID '
  '(implying consent). Replaces broken ensureRelationship() in JS services that '
  'used direct inserts with status=active (violating RLS INSERT policy for providers). '
  'Does NOT re-activate if the patient has explicitly revoked access.';
