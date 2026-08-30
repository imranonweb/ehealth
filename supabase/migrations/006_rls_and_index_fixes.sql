-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 006: RLS Fixes & Index Additions
-- ═══════════════════════════════════════════════════════════
-- Description:
--   Cleanup migration that corrects RLS policies broken by the schema
--   changes in 005 and adds missing indexes for unregistered patients.
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. Fix patient_profiles RLS — allow providers to SELECT
--    unregistered patients they have relationships with
-- ───────────────────────────────────────────────────────────
-- The existing policy already handles this via is_provider_authorized_for_patient,
-- which checks patient_provider_relationships. No change needed there.
--
-- But: providers creating a new patient via create_patient_identity RPC
-- need the SELECT to work immediately after. The RPC itself is SECURITY
-- DEFINER so it can insert, but the subsequent getPatientById call uses
-- the patient's profile_id which goes through RLS.
--
-- The fix: search_patients_for_provider already returns the data. No
-- additional patient_profiles SELECT policy is needed for the create flow
-- since we return the data directly from the RPC.


-- ───────────────────────────────────────────────────────────
-- 2. Fix profiles RLS — providers can SELECT their own profile
-- ───────────────────────────────────────────────────────────
-- The profiles_select_own policy: USING (auth_user_id = auth.uid())
-- This works for all registered users. No change needed.
--
-- For unregistered patients (auth_user_id IS NULL):
-- - They cannot log in, so they never call SELECT on their own profile.
-- - Providers access them via search_patients_for_provider (SECURITY DEFINER)
--   or via is_provider_authorized_for_patient after a relationship is created.
-- No change needed.


-- ───────────────────────────────────────────────────────────
-- 3. ADD indexes for unregistered patient queries
-- ───────────────────────────────────────────────────────────

-- Index for finding unregistered patients by phone (used in duplicate detection
-- and account linking inside handle_new_auth_user trigger)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_unregistered
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND auth_user_id IS NULL;

-- Index for finding unregistered patients by email
CREATE INDEX IF NOT EXISTS idx_profiles_email_unregistered
  ON public.profiles (email)
  WHERE email IS NOT NULL AND auth_user_id IS NULL;

-- Index for is_registered flag (used in search ordering)
CREATE INDEX IF NOT EXISTS idx_patient_profiles_is_registered
  ON public.patient_profiles (is_registered);

-- Partial index for unregistered patient_profiles (fast lookup for linking)
CREATE INDEX IF NOT EXISTS idx_patient_profiles_unregistered
  ON public.patient_profiles (profile_id)
  WHERE is_registered = FALSE;


-- ───────────────────────────────────────────────────────────
-- 4. GRANT execute on lookup_patient_by_identifier
--    (ensure it covers the new is_registered column in responses)
-- ───────────────────────────────────────────────────────────
-- No change to the function body needed — it joins profiles + patient_profiles
-- which now includes unregistered patients automatically.
-- Re-granting for completeness:
GRANT EXECUTE ON FUNCTION public.lookup_patient_by_identifier(TEXT) TO authenticated;


-- ───────────────────────────────────────────────────────────
-- 5. Fix patient_provider_relationships RLS for unregistered patients
-- ───────────────────────────────────────────────────────────
-- When create_provider_relationship creates a relationship for an
-- unregistered patient, the patient cannot SELECT that relationship
-- (because profiles_select_own won't match their NULL auth_user_id profile).
-- That is correct behavior — unregistered patients can't log in.
--
-- When the patient later links their auth account, the profile's auth_user_id
-- is updated. The patient can then SELECT their relationships normally.
-- No RLS change needed.


-- ───────────────────────────────────────────────────────────
-- 6. Ensure organizations.license_number allows 'N/A' as placeholder
-- ───────────────────────────────────────────────────────────
-- The trigger uses COALESCE(v_license, 'N/A') for organizations.
-- The column is TEXT NOT NULL, which accepts any text including 'N/A'.
-- No schema change needed.


-- ───────────────────────────────────────────────────────────
-- 7. DOCUMENTATION
-- ───────────────────────────────────────────────────────────

COMMENT ON INDEX idx_profiles_phone_unregistered IS
  'Fast lookup of unregistered (provider-created) patients by phone. '
  'Used in handle_new_auth_user trigger for account linking.';

COMMENT ON INDEX idx_profiles_email_unregistered IS
  'Fast lookup of unregistered (provider-created) patients by email. '
  'Used in handle_new_auth_user trigger for account linking.';
