-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 005: Unregistered Patient Identity
-- ═══════════════════════════════════════════════════════════
-- Description:
--   Implements the "patient identity first, auth account later" model.
--
--   Core Architecture Change:
--     profiles.auth_user_id is made NULLABLE. A patient profile can now
--     exist without a Supabase Auth account. This is the root change that
--     enables provider-created (walk-in) patients.
--
--   New Capabilities:
--     1. Providers can create a patient identity without an auth account.
--     2. When the patient later signs up, their new auth account is linked
--        to the existing patient identity (no duplicate created).
--     3. A database trigger on auth.users replaces the fragile manual
--        profile insertion in AuthContext.signUp — all roles now work
--        correctly and atomically, including in email-confirmation flows.
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. MAKE auth_user_id NULLABLE
-- ───────────────────────────────────────────────────────────
-- Enables provider-created patient profiles with no auth account.
-- The UNIQUE constraint is preserved — PostgreSQL treats each NULL as
-- distinct, so multiple unregistered patients coexist safely.

ALTER TABLE public.profiles
  ALTER COLUMN auth_user_id DROP NOT NULL;


-- ───────────────────────────────────────────────────────────
-- 2. ADD is_registered FLAG TO patient_profiles
-- ───────────────────────────────────────────────────────────
-- Distinguishes provider-created (unregistered) patients from patients
-- who have self-registered via the auth flow.

ALTER TABLE public.patient_profiles
  ADD COLUMN IF NOT EXISTS is_registered  BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registered_at  TIMESTAMPTZ;

-- Back-fill: all existing patient_profiles rows that have a linked
-- auth account (profiles.auth_user_id IS NOT NULL) are registered.
UPDATE public.patient_profiles pp
SET is_registered = TRUE,
    registered_at = pp.created_at
FROM public.profiles p
WHERE p.id = pp.profile_id
  AND p.auth_user_id IS NOT NULL;


-- ───────────────────────────────────────────────────────────
-- 3. DATABASE TRIGGER: Auto-create profile on auth user creation
-- ───────────────────────────────────────────────────────────
-- This replaces the fragile manual profile insertion in AuthContext.signUp.
--
-- Why a trigger?
--   - AuthContext.signUp could not insert a profile for non-patient roles
--     because profiles_insert_own RLS policy only allowed role = 'patient'.
--   - With email confirmation enabled, no live session exists after signUp()
--     so RLS-authenticated inserts were blocked.
--   - This trigger runs AFTER INSERT ON auth.users with SECURITY DEFINER
--     (bypasses RLS), solving both problems atomically.
--
-- Additionally:
--   - For patient signup: checks if an unregistered patient exists with a
--     matching health_id/phone/email and LINKS the auth account to it
--     instead of creating a duplicate identity.
--   - This is the mechanism that enables Scenario B (Provider creates
--     patient first → patient registers later → history preserved).

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role                   user_role;
  v_full_name              TEXT;
  v_phone                  TEXT;
  v_gender                 TEXT;
  v_dob_text               TEXT;
  v_org_name               TEXT;
  v_address                TEXT;
  v_license                TEXT;
  v_spec                   TEXT;
  v_qual                   TEXT;
  v_health_id              TEXT;
  v_new_profile_id         UUID;
  v_unregistered_profile_id UUID;
BEGIN
  -- ── Extract user metadata (set by AuthContext.signUp options.data) ─
  v_role      := COALESCE(
                   NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role,
                   'patient'
                 );
  v_full_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), '');
  v_phone     := NULLIF(trim(NEW.raw_user_meta_data->>'phone'), '');
  v_gender    := NULLIF(trim(NEW.raw_user_meta_data->>'gender'), '');
  v_dob_text  := NULLIF(trim(NEW.raw_user_meta_data->>'date_of_birth'), '');
  v_health_id := NULLIF(trim(NEW.raw_user_meta_data->>'health_id'), '');
  v_org_name  := NULLIF(trim(COALESCE(
                   NEW.raw_user_meta_data->>'orgName',
                   NEW.raw_user_meta_data->>'org_name',
                   v_full_name
                 )), '');
  v_address   := NULLIF(trim(NEW.raw_user_meta_data->>'address'), '');
  v_license   := NULLIF(trim(COALESCE(
                   NEW.raw_user_meta_data->>'licenseNumber',
                   NEW.raw_user_meta_data->>'license_number'
                 )), '');
  v_spec      := NULLIF(trim(NEW.raw_user_meta_data->>'specialization'), '');
  v_qual      := NULLIF(trim(NEW.raw_user_meta_data->>'qualification'), '');

  -- ── Patient linking: check for existing unregistered identity ─────
  IF v_role = 'patient' THEN
    SELECT p.id
    INTO   v_unregistered_profile_id
    FROM   public.profiles p
    JOIN   public.patient_profiles pp ON pp.profile_id = p.id
    WHERE  p.auth_user_id IS NULL
      AND  p.role = 'patient'
      AND  (
             -- Health ID match (strongest identifier — provider gave this to patient)
             (v_health_id IS NOT NULL
              AND pp.patient_identifier ILIKE v_health_id)
             -- Phone match (patient knows their own phone)
             OR (v_phone IS NOT NULL AND p.phone = v_phone)
             -- Email match (patient knows their own email)
             OR (NEW.email IS NOT NULL AND p.email = NEW.email)
           )
    ORDER BY
      -- Prioritise: health_id match > phone match > email match
      (v_health_id IS NOT NULL AND pp.patient_identifier ILIKE v_health_id) DESC,
      (v_phone IS NOT NULL AND p.phone = v_phone) DESC,
      pp.created_at
    LIMIT 1;
  END IF;

  -- ── If an unregistered identity matched, LINK and return ───────────
  IF v_unregistered_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET    auth_user_id = NEW.id,
           -- Update contact details from the registration form if better data exists
           email        = COALESCE(NULLIF(NEW.email, ''), email),
           phone        = COALESCE(v_phone, phone),
           full_name    = CASE
                            WHEN length(v_full_name) > 0 THEN v_full_name
                            ELSE full_name
                          END,
           updated_at   = now()
    WHERE  id = v_unregistered_profile_id;

    UPDATE public.patient_profiles
    SET    is_registered = TRUE,
           registered_at = now()
    WHERE  profile_id = v_unregistered_profile_id;

    RETURN NEW;  -- profile already exists — skip new profile creation
  END IF;

  -- ── No existing identity found — create a new profile ──────────────
  BEGIN
    INSERT INTO public.profiles (
      auth_user_id,
      role,
      full_name,
      email,
      phone,
      gender,
      date_of_birth
    ) VALUES (
      NEW.id,
      v_role,
      v_full_name,
      NEW.email,
      v_phone,
      CASE WHEN v_gender IS NOT NULL THEN v_gender::gender_type ELSE NULL END,
      CASE WHEN v_dob_text IS NOT NULL THEN v_dob_text::DATE ELSE NULL END
    )
    RETURNING id INTO v_new_profile_id;
  EXCEPTION WHEN OTHERS THEN
    -- Profile already exists (duplicate trigger call or race) — safe to skip
    RAISE WARNING 'handle_new_auth_user: profile insert skipped for user %. Error: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- ── Create role-specific sub-profile ──────────────────────────────
  IF v_role = 'patient' THEN
    INSERT INTO public.patient_profiles (profile_id, is_registered)
    VALUES (v_new_profile_id, TRUE)
    ON CONFLICT (profile_id) DO NOTHING;

  ELSIF v_role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (
      profile_id, specialization, license_number, qualification
    ) VALUES (
      v_new_profile_id, v_spec, v_license, v_qual
    )
    ON CONFLICT (profile_id) DO NOTHING;

  ELSIF v_role IN ('hospital', 'diagnostics') THEN
    INSERT INTO public.organizations (
      profile_id, name, type, address, phone, email, license_number
    ) VALUES (
      v_new_profile_id,
      COALESCE(v_org_name, v_full_name, 'Organization'),
      v_role::org_type,
      v_address,
      v_phone,
      NEW.email,
      COALESCE(v_license, 'N/A')
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Create the trigger (idempotent DROP + CREATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();


-- ───────────────────────────────────────────────────────────
-- 4. RPC: create_patient_identity
-- ───────────────────────────────────────────────────────────
-- Allows authenticated providers (doctor/hospital/diagnostics) to create
-- a walk-in patient identity that has no associated auth account.
--
-- Returns:
--   profile_id         — the new (or matched) profiles.id
--   patient_identifier — the Health ID (e.g. "P-9824F1A2")
--   is_duplicate       — true if an existing patient was found by phone/email
--   duplicate_id       — the existing profile.id (if is_duplicate = true)
--
-- Duplicate detection: if an exact phone or exact email match is found,
-- the function returns that patient's data without creating a duplicate.
-- The frontend can then decide whether to select the existing patient or
-- override (forcing a new record with a note).

CREATE OR REPLACE FUNCTION public.create_patient_identity(
  p_full_name          TEXT,
  p_gender             TEXT          DEFAULT NULL,
  p_date_of_birth      DATE          DEFAULT NULL,
  p_phone              TEXT          DEFAULT NULL,
  p_email              TEXT          DEFAULT NULL,
  p_blood_group        TEXT          DEFAULT NULL,
  p_emergency_contact  TEXT          DEFAULT NULL
)
RETURNS TABLE (
  profile_id         UUID,
  patient_identifier TEXT,
  is_duplicate       BOOLEAN,
  duplicate_id       UUID
) AS $$
DECLARE
  v_role              user_role;
  v_provider_id       UUID;
  v_new_profile_id    UUID;
  v_patient_id_text   TEXT;
  v_existing_id       UUID;
  v_clean_phone       TEXT;
  v_clean_email       TEXT;
BEGIN
  -- ── Authenticate and authorize ────────────────────────────────────
  v_provider_id := public.get_my_profile_id();
  v_role        := public.get_my_role();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required. Caller role: %', v_role;
  END IF;

  IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full name is required (minimum 2 characters).';
  END IF;

  -- ── Normalize inputs ──────────────────────────────────────────────
  v_clean_phone := NULLIF(trim(p_phone), '');
  v_clean_email := NULLIF(lower(trim(p_email)), '');

  -- ── Duplicate detection by exact phone or exact email ─────────────
  -- Name is intentionally excluded — names are not unique identifiers.
  IF v_clean_phone IS NOT NULL OR v_clean_email IS NOT NULL THEN
    SELECT p.id, pp.patient_identifier
    INTO   v_existing_id, v_patient_id_text
    FROM   public.profiles p
    JOIN   public.patient_profiles pp ON pp.profile_id = p.id
    WHERE  p.role = 'patient'
      AND  (
             (v_clean_phone IS NOT NULL AND p.phone = v_clean_phone)
             OR (v_clean_email IS NOT NULL AND lower(p.email) = v_clean_email)
           )
    ORDER BY p.created_at
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Return existing patient with duplicate flag — caller decides what to do
      RETURN QUERY SELECT v_existing_id, v_patient_id_text, TRUE, v_existing_id;
      RETURN;
    END IF;
  END IF;

  -- ── Create new unregistered patient profile ───────────────────────
  INSERT INTO public.profiles (
    auth_user_id,   -- NULL — no auth account yet
    role,
    full_name,
    email,
    phone,
    gender,
    date_of_birth
  ) VALUES (
    NULL,
    'patient',
    trim(p_full_name),
    v_clean_email,
    v_clean_phone,
    CASE WHEN p_gender IS NOT NULL THEN p_gender::gender_type ELSE NULL END,
    p_date_of_birth
  )
  RETURNING id INTO v_new_profile_id;

  -- ── Create patient_profiles row ───────────────────────────────────
  -- patient_identifier is auto-generated by DEFAULT expression.
  INSERT INTO public.patient_profiles (
    profile_id,
    blood_group,
    emergency_contact,
    is_registered        -- FALSE = provider-created, not yet self-registered
  ) VALUES (
    v_new_profile_id,
    NULLIF(trim(p_blood_group), ''),
    NULLIF(trim(p_emergency_contact), ''),
    FALSE
  )
  RETURNING patient_identifier INTO v_patient_id_text;

  -- Return the new patient's data
  RETURN QUERY SELECT v_new_profile_id, v_patient_id_text, FALSE, NULL::UUID;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_patient_identity(TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.create_patient_identity IS
  'Allows healthcare providers to create a walk-in patient identity that has '
  'no associated Supabase Auth account. Returns patient_identifier (Health ID). '
  'Performs duplicate detection by phone/email before creating a new record. '
  'Provider role required (doctor, hospital, diagnostics).';


-- ───────────────────────────────────────────────────────────
-- 5. UPDATE RLS: profiles_insert_own — Allow all roles
-- ───────────────────────────────────────────────────────────
-- BEFORE: Only role = 'patient' could self-insert a profile.
-- AFTER:  Any role can insert their own profile (as long as auth_user_id
--         matches the caller). The database trigger now handles this, but
--         we also fix the direct policy for cases where manual insert is needed.
--
-- Note: Role escalation is still prevented post-creation by the
--       enforce_profile_role_integrity trigger and profiles_update_own policy.

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());


-- ───────────────────────────────────────────────────────────
-- 6. UPDATE search_patients_for_provider — Include unregistered patients
-- ───────────────────────────────────────────────────────────
-- The JOIN to patient_profiles is already there. Since unregistered
-- patients have profile_id in patient_profiles (the join works), the only
-- change needed is to ensure STABLE is appropriate (it is — SECURITY
-- DEFINER functions that only read are fine as STABLE).
-- No change needed to the SQL itself; unregistered patients are included
-- automatically because the JOIN is on patient_profiles.profile_id which
-- exists for both registered and unregistered patients.
--
-- However: we upgrade the return set to also include is_registered so
-- the frontend can badge provider-created patients differently.

-- DROP required: return type changes from 6 → 7 columns (adds is_registered).
-- PostgreSQL 42P13 prevents CREATE OR REPLACE when the return type changes.
-- This function has no dependent objects (no policies, triggers, or views reference it).
DROP FUNCTION IF EXISTS public.search_patients_for_provider(TEXT);

CREATE OR REPLACE FUNCTION public.search_patients_for_provider(p_query TEXT)
RETURNS TABLE (
  id                 UUID,
  full_name          TEXT,
  patient_identifier TEXT,
  gender             gender_type,
  phone              TEXT,
  email              TEXT,
  is_registered      BOOLEAN
) AS $$
DECLARE
  v_role  user_role;
  v_clean TEXT;
BEGIN
  -- ── 1. Authenticate and authorize caller ──────────────────────────
  v_role := public.get_my_role();

  IF v_role NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required. Caller role: %', v_role;
  END IF;

  -- ── 2. Sanitize and validate query ────────────────────────────────
  v_clean := trim(p_query);

  IF v_clean IS NULL OR length(v_clean) < 2 THEN
    RAISE EXCEPTION 'Search query must be at least 2 characters.';
  END IF;

  -- ── 3. Execute scoped search — minimal fields only ────────────────
  -- Includes both registered (auth_user_id NOT NULL) and unregistered
  -- (auth_user_id IS NULL) patients — the JOIN to patient_profiles covers both.
  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.full_name,
    pp.patient_identifier,
    p.gender,
    p.phone,
    p.email,
    pp.is_registered
  FROM   public.profiles p
  JOIN   public.patient_profiles pp ON pp.profile_id = p.id
  WHERE  p.role = 'patient'
    AND  (
           pp.patient_identifier ILIKE '%' || v_clean || '%'
           OR p.full_name         ILIKE '%' || v_clean || '%'
           OR p.phone             ILIKE v_clean || '%'
         )
  ORDER BY p.id,
           -- Prioritise: registered first, then name alphabetically
           pp.is_registered DESC,
           p.full_name
  LIMIT 20;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.search_patients_for_provider(TEXT) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 7. UPDATE create_provider_relationship — fix conflict handling
-- ───────────────────────────────────────────────────────────
-- Issue: The UNIQUE(patient_profile_id, provider_profile_id) constraint
-- on patient_provider_relationships means ON CONFLICT only fires for
-- identical (patient, provider) pairs. But when an organization creates
-- a relationship via p_org_id, a second call with the same org but a
-- different staff member's provider_profile_id creates a new row.
--
-- Fix: Before inserting, explicitly check for any existing active
-- relationship between this patient and (this provider OR this org).
-- If found, just update it to active. Only insert if truly no relationship exists.
--
-- Also: the validation now accepts unregistered patients (auth_user_id IS NULL).

CREATE OR REPLACE FUNCTION public.create_provider_relationship(
  p_patient_id UUID,
  p_org_id     UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_provider_id UUID;
  v_role        user_role;
  v_existing_id UUID;
BEGIN
  -- ── 1. Authenticate and authorize ────────────────────────────────
  v_provider_id := public.get_my_profile_id();
  v_role        := public.get_my_role();

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;

  IF v_role NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required. Caller role: %', v_role;
  END IF;

  -- ── 2. Validate patient exists (registered OR unregistered) ───────
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE  id = p_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Patient not found: %', p_patient_id;
  END IF;

  -- ── 3. Check for existing relationship (by provider OR by org) ────
  SELECT id INTO v_existing_id
  FROM   public.patient_provider_relationships
  WHERE  patient_profile_id = p_patient_id
    AND  (
           provider_profile_id = v_provider_id
           OR (p_org_id IS NOT NULL AND organization_id = p_org_id)
         )
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing relationship to active (respects revocation)
    UPDATE public.patient_provider_relationships
    SET    status     = 'active',
           expires_at = NULL,
           updated_at = now()
    WHERE  id = v_existing_id
      AND  status != 'revoked';  -- Never re-activate an explicitly revoked relationship
    RETURN;
  END IF;

  -- ── 4. Insert new active relationship ────────────────────────────
  INSERT INTO public.patient_provider_relationships (
    patient_profile_id,
    provider_profile_id,
    provider_type,
    organization_id,
    status,
    granted_by
  ) VALUES (
    p_patient_id,
    v_provider_id,
    v_role,
    p_org_id,
    'active',
    v_provider_id
  )
  ON CONFLICT (patient_profile_id, provider_profile_id)
  DO UPDATE SET
    status     = 'active',
    expires_at = NULL,
    updated_at = now()
  WHERE patient_provider_relationships.status != 'revoked';

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_provider_relationship(UUID, UUID) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 8. COMMENT DOCUMENTATION
-- ───────────────────────────────────────────────────────────

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'Trigger function: runs AFTER INSERT ON auth.users. '
  'Creates a profile + role-specific sub-profile for every new auth user. '
  'For patient signups: checks if an unregistered patient identity exists '
  '(matched by health_id/phone/email) and links the auth account to it '
  'instead of creating a duplicate. Replaces the fragile manual profile '
  'insertion in AuthContext.signUp which failed for non-patient roles '
  'and email-confirmation flows.';

COMMENT ON COLUMN public.patient_profiles.is_registered IS
  'TRUE = patient has created a Supabase Auth account and linked it to this '
  'identity. FALSE = this identity was created by a provider for a walk-in '
  'patient who has not yet registered on the platform.';

COMMENT ON COLUMN public.patient_profiles.registered_at IS
  'Timestamp when the patient linked their auth account to this identity.';
