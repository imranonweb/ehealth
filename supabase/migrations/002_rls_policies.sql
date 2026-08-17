-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 002: Row Level Security Policies
-- ═══════════════════════════════════════════════════════════
-- Description: Strict role-based access control, role escalation
-- prevention, patient confidentiality isolation, relationship-gated
-- clinical data access, and secure directory views.
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. ENABLE RLS ON ALL TABLES
-- ───────────────────────────────────────────────────────────

ALTER TABLE profiles                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_visits                ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_ai_extractions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records                ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                     ENABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────
-- 2. INTEGRITY TRIGGERS (DATABASE-LEVEL IMMUTABILITY & ANTI-ESCALATION)
-- ───────────────────────────────────────────────────────────

-- Trigger 2.1: Prevent users from escalating their own role in profiles
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    IF current_user NOT IN ('postgres', 'service_role', 'supabase_admin') THEN
      RAISE EXCEPTION 'Security violation: Account roles cannot be modified by the user.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profile_role_integrity ON profiles;
CREATE TRIGGER trg_profile_role_integrity
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_role_integrity();

-- Trigger 2.2: Prevent tampering with relationship participants and granting authority
CREATE OR REPLACE FUNCTION public.enforce_ppr_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.patient_profile_id IS DISTINCT FROM NEW.patient_profile_id OR
       OLD.provider_profile_id IS DISTINCT FROM NEW.provider_profile_id OR
       OLD.organization_id IS DISTINCT FROM NEW.organization_id OR
       OLD.granted_by IS DISTINCT FROM NEW.granted_by THEN
      RAISE EXCEPTION 'Security violation: Cannot modify relationship participants or granting authority.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_ppr_immutable_fields ON patient_provider_relationships;
CREATE TRIGGER trg_ppr_immutable_fields
  BEFORE UPDATE ON patient_provider_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ppr_immutable_fields();


-- ───────────────────────────────────────────────────────────
-- 3. SECURE PATIENT LOOKUP FUNCTION (MINIMAL DATA DISCLOSURE)
-- ───────────────────────────────────────────────────────────

-- Controlled lookup: Providers CANNOT browse all patients.
-- They can only query a single patient by exact Patient Identifier (e.g. P-9824F1A2).
-- Returns only the minimum necessary identity fields without date_of_birth.
CREATE OR REPLACE FUNCTION public.lookup_patient_by_identifier(p_identifier TEXT)
RETURNS TABLE (
  patient_profile_id UUID,
  full_name TEXT,
  patient_identifier TEXT,
  gender gender_type
) AS $$
BEGIN
  -- Only authenticated provider roles can perform lookup
  IF public.get_my_role() NOT IN ('doctor', 'diagnostics', 'hospital') THEN
    RAISE EXCEPTION 'Access denied: Provider role required for patient lookup.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id AS patient_profile_id,
    p.full_name,
    pp.patient_identifier,
    p.gender
  FROM public.profiles p
  JOIN public.patient_profiles pp ON pp.profile_id = p.id
  WHERE pp.patient_identifier = upper(trim(p_identifier))
    AND p.role = 'patient';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;


-- ═══════════════════════════════════════════════════════════
-- 4. PROFILES RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
-- Normal self-signup must ONLY allow creating a 'patient' role
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (
    auth_user_id = auth.uid()
    AND role = 'patient'
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
-- Users can update their profile information but NEVER change their role
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
    AND role = (SELECT p.role FROM profiles p WHERE p.auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "profiles_select_authorized_providers" ON profiles;
-- Providers can read patient profiles ONLY for patients they have an active relationship with
CREATE POLICY "profiles_select_authorized_providers"
  ON profiles FOR SELECT
  USING (
    role = 'patient'
    AND is_provider_authorized_for_patient(id)
  );

DROP POLICY IF EXISTS "profiles_select_provider_identities" ON profiles;
-- Directory access to doctor and organization profile names
CREATE POLICY "profiles_select_provider_identities"
  ON profiles FOR SELECT
  USING (role IN ('doctor', 'hospital', 'diagnostics'));


-- ═══════════════════════════════════════════════════════════
-- 5. PATIENT PROFILES RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "patient_profiles_select_own" ON patient_profiles;
CREATE POLICY "patient_profiles_select_own"
  ON patient_profiles FOR SELECT
  USING (profile_id = get_my_profile_id());

DROP POLICY IF EXISTS "patient_profiles_insert_own" ON patient_profiles;
-- Only patients can insert a patient_profile row
CREATE POLICY "patient_profiles_insert_own"
  ON patient_profiles FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND get_my_role() = 'patient'
  );

DROP POLICY IF EXISTS "patient_profiles_update_own" ON patient_profiles;
CREATE POLICY "patient_profiles_update_own"
  ON patient_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id() AND get_my_role() = 'patient')
  WITH CHECK (profile_id = get_my_profile_id() AND get_my_role() = 'patient');

DROP POLICY IF EXISTS "patient_profiles_select_authorized_providers" ON patient_profiles;
-- Authorized providers can view patient clinical flags (allergies, emergency contact)
CREATE POLICY "patient_profiles_select_authorized_providers"
  ON patient_profiles FOR SELECT
  USING (is_provider_authorized_for_patient(profile_id));


-- ═══════════════════════════════════════════════════════════
-- 6. DOCTOR PROFILES RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "doctor_profiles_select_all" ON doctor_profiles;
CREATE POLICY "doctor_profiles_select_all"
  ON doctor_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "doctor_profiles_insert_own" ON doctor_profiles;
-- Requires user role to be 'doctor'
CREATE POLICY "doctor_profiles_insert_own"
  ON doctor_profiles FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND get_my_role() = 'doctor'
  );

DROP POLICY IF EXISTS "doctor_profiles_update_own" ON doctor_profiles;
CREATE POLICY "doctor_profiles_update_own"
  ON doctor_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id() AND get_my_role() = 'doctor')
  WITH CHECK (profile_id = get_my_profile_id() AND get_my_role() = 'doctor');


-- ═══════════════════════════════════════════════════════════
-- 7. ORGANIZATIONS RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "orgs_select_all" ON organizations;
CREATE POLICY "orgs_select_all"
  ON organizations FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "orgs_insert_by_owner" ON organizations;
-- Role-scoped creation: hospital creates hospital org, diagnostics creates diagnostics org
CREATE POLICY "orgs_insert_by_owner"
  ON organizations FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND (
      (type = 'hospital' AND get_my_role() = 'hospital') OR
      (type = 'diagnostics' AND get_my_role() = 'diagnostics')
    )
  );

DROP POLICY IF EXISTS "orgs_update_by_owner" ON organizations;
CREATE POLICY "orgs_update_by_owner"
  ON organizations FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 8. PATIENT-PROVIDER RELATIONSHIPS RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "ppr_select_patient" ON patient_provider_relationships;
CREATE POLICY "ppr_select_patient"
  ON patient_provider_relationships FOR SELECT
  USING (patient_profile_id = get_my_profile_id());

DROP POLICY IF EXISTS "ppr_select_provider" ON patient_provider_relationships;
CREATE POLICY "ppr_select_provider"
  ON patient_provider_relationships FOR SELECT
  USING (
    provider_profile_id = get_my_profile_id()
    OR organization_id = get_my_organization_id()
  );

DROP POLICY IF EXISTS "ppr_insert_by_patient" ON patient_provider_relationships;
-- Patients can create active or pending relationships for themselves
CREATE POLICY "ppr_insert_by_patient"
  ON patient_provider_relationships FOR INSERT
  WITH CHECK (
    patient_profile_id = get_my_profile_id()
    AND status IN ('active', 'pending')
  );

DROP POLICY IF EXISTS "ppr_insert_by_provider" ON patient_provider_relationships;
-- Providers can ONLY initiate relationships with status 'pending' (MUST NOT be active)
CREATE POLICY "ppr_insert_by_provider"
  ON patient_provider_relationships FOR INSERT
  WITH CHECK (
    (provider_profile_id = get_my_profile_id() OR organization_id = get_my_organization_id())
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "ppr_update_by_patient" ON patient_provider_relationships;
-- Patients can approve pending relationships to 'active', or revoke them
CREATE POLICY "ppr_update_by_patient"
  ON patient_provider_relationships FOR UPDATE
  USING (patient_profile_id = get_my_profile_id())
  WITH CHECK (
    patient_profile_id = get_my_profile_id()
    AND status IN ('active', 'revoked')
  );

DROP POLICY IF EXISTS "ppr_update_by_provider" ON patient_provider_relationships;
-- Providers can ONLY relinquish access by moving relationship from active to revoked
CREATE POLICY "ppr_update_by_provider"
  ON patient_provider_relationships FOR UPDATE
  USING (
    (provider_profile_id = get_my_profile_id() OR organization_id = get_my_organization_id())
    AND status = 'active'
  )
  WITH CHECK (
    (provider_profile_id = get_my_profile_id() OR organization_id = get_my_organization_id())
    AND status = 'revoked'
  );


-- ═══════════════════════════════════════════════════════════
-- 9. PRESCRIPTIONS RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "prescriptions_select_patient" ON prescriptions;
CREATE POLICY "prescriptions_select_patient"
  ON prescriptions FOR SELECT
  USING (patient_id = get_my_profile_id());

DROP POLICY IF EXISTS "prescriptions_select_author_doctor" ON prescriptions;
CREATE POLICY "prescriptions_select_author_doctor"
  ON prescriptions FOR SELECT
  USING (doctor_id = get_my_profile_id());

DROP POLICY IF EXISTS "prescriptions_select_issuing_hospital" ON prescriptions;
CREATE POLICY "prescriptions_select_issuing_hospital"
  ON prescriptions FOR SELECT
  USING (hospital_id = get_my_organization_id());

DROP POLICY IF EXISTS "prescriptions_select_authorized_providers" ON prescriptions;
CREATE POLICY "prescriptions_select_authorized_providers"
  ON prescriptions FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

DROP POLICY IF EXISTS "prescriptions_insert_doctor" ON prescriptions;
-- Doctors can insert prescriptions ONLY for authorized patients
CREATE POLICY "prescriptions_insert_doctor"
  ON prescriptions FOR INSERT
  WITH CHECK (
    doctor_id = get_my_profile_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'doctor'
    AND is_provider_authorized_for_patient(patient_id)
  );

DROP POLICY IF EXISTS "prescriptions_insert_hospital" ON prescriptions;
-- Hospitals can insert prescriptions ONLY for authorized patients
CREATE POLICY "prescriptions_insert_hospital"
  ON prescriptions FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'hospital'
    AND is_provider_authorized_for_patient(patient_id)
  );

DROP POLICY IF EXISTS "prescriptions_update_doctor" ON prescriptions;
CREATE POLICY "prescriptions_update_doctor"
  ON prescriptions FOR UPDATE
  USING (doctor_id = get_my_profile_id() AND get_my_role() = 'doctor')
  WITH CHECK (doctor_id = get_my_profile_id() AND get_my_role() = 'doctor');

DROP POLICY IF EXISTS "prescriptions_update_hospital" ON prescriptions;
CREATE POLICY "prescriptions_update_hospital"
  ON prescriptions FOR UPDATE
  USING (hospital_id = get_my_organization_id() AND created_by = get_my_profile_id() AND get_my_role() = 'hospital')
  WITH CHECK (hospital_id = get_my_organization_id() AND created_by = get_my_profile_id() AND get_my_role() = 'hospital');


-- ═══════════════════════════════════════════════════════════
-- 10. PRESCRIPTION AI EXTRACTIONS RLS (Inherits Parent Permissions)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "pai_select_inherited" ON prescription_ai_extractions;
CREATE POLICY "pai_select_inherited"
  ON prescription_ai_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_ai_extractions.prescription_id
        AND (
          p.patient_id = get_my_profile_id()
          OR p.doctor_id = get_my_profile_id()
          OR p.hospital_id = get_my_organization_id()
          OR is_provider_authorized_for_patient(p.patient_id)
        )
    )
  );

DROP POLICY IF EXISTS "pai_insert_authorized" ON prescription_ai_extractions;
CREATE POLICY "pai_insert_authorized"
  ON prescription_ai_extractions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_ai_extractions.prescription_id
        AND (
          p.doctor_id = get_my_profile_id()
          OR p.hospital_id = get_my_organization_id()
          OR p.created_by = get_my_profile_id()
        )
    )
  );


-- ═══════════════════════════════════════════════════════════
-- 11. DIAGNOSTIC REPORTS RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "reports_select_patient" ON diagnostic_reports;
CREATE POLICY "reports_select_patient"
  ON diagnostic_reports FOR SELECT
  USING (patient_id = get_my_profile_id());

DROP POLICY IF EXISTS "reports_select_issuing_org" ON diagnostic_reports;
CREATE POLICY "reports_select_issuing_org"
  ON diagnostic_reports FOR SELECT
  USING (diagnostics_organization_id = get_my_organization_id());

DROP POLICY IF EXISTS "reports_select_authorized_providers" ON diagnostic_reports;
CREATE POLICY "reports_select_authorized_providers"
  ON diagnostic_reports FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

DROP POLICY IF EXISTS "reports_insert_diagnostics" ON diagnostic_reports;
-- Only diagnostics organizations can insert reports for authorized patients
CREATE POLICY "reports_insert_diagnostics"
  ON diagnostic_reports FOR INSERT
  WITH CHECK (
    diagnostics_organization_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'diagnostics'
    AND is_provider_authorized_for_patient(patient_id)
  );

DROP POLICY IF EXISTS "reports_update_diagnostics" ON diagnostic_reports;
CREATE POLICY "reports_update_diagnostics"
  ON diagnostic_reports FOR UPDATE
  USING (diagnostics_organization_id = get_my_organization_id() AND get_my_role() = 'diagnostics')
  WITH CHECK (diagnostics_organization_id = get_my_organization_id() AND get_my_role() = 'diagnostics');


-- ═══════════════════════════════════════════════════════════
-- 12. HOSPITAL VISITS RLS
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "visits_select_patient" ON hospital_visits;
CREATE POLICY "visits_select_patient"
  ON hospital_visits FOR SELECT
  USING (patient_id = get_my_profile_id());

DROP POLICY IF EXISTS "visits_select_hospital" ON hospital_visits;
CREATE POLICY "visits_select_hospital"
  ON hospital_visits FOR SELECT
  USING (hospital_id = get_my_organization_id());

DROP POLICY IF EXISTS "visits_select_authorized_providers" ON hospital_visits;
CREATE POLICY "visits_select_authorized_providers"
  ON hospital_visits FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

DROP POLICY IF EXISTS "visits_insert_hospital" ON hospital_visits;
-- Only hospital organizations can insert hospital visit records for authorized patients
CREATE POLICY "visits_insert_hospital"
  ON hospital_visits FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'hospital'
    AND is_provider_authorized_for_patient(patient_id)
  );

DROP POLICY IF EXISTS "visits_update_hospital" ON hospital_visits;
CREATE POLICY "visits_update_hospital"
  ON hospital_visits FOR UPDATE
  USING (hospital_id = get_my_organization_id() AND get_my_role() = 'hospital')
  WITH CHECK (hospital_id = get_my_organization_id() AND get_my_role() = 'hospital');


-- ═══════════════════════════════════════════════════════════
-- 13. MEDICAL RECORDS RLS (Timeline Index)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "timeline_select_patient" ON medical_records;
CREATE POLICY "timeline_select_patient"
  ON medical_records FOR SELECT
  USING (patient_id = get_my_profile_id());

DROP POLICY IF EXISTS "timeline_select_authorized_providers" ON medical_records;
CREATE POLICY "timeline_select_authorized_providers"
  ON medical_records FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

DROP POLICY IF EXISTS "timeline_insert_authorized_providers" ON medical_records;
-- Timeline entries can ONLY be inserted by authorized providers treating the patient
CREATE POLICY "timeline_insert_authorized_providers"
  ON medical_records FOR INSERT
  WITH CHECK (
    get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND is_provider_authorized_for_patient(patient_id)
    AND (created_by IS NULL OR created_by = get_my_profile_id())
  );

DROP POLICY IF EXISTS "timeline_update_creator" ON medical_records;
CREATE POLICY "timeline_update_creator"
  ON medical_records FOR UPDATE
  USING (created_by = get_my_profile_id())
  WITH CHECK (created_by = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 14. DOCUMENTS RLS (Metadata referencing Private Storage)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "documents_select_patient" ON documents;
CREATE POLICY "documents_select_patient"
  ON documents FOR SELECT
  USING (patient_id = get_my_profile_id());

DROP POLICY IF EXISTS "documents_select_authorized_providers" ON documents;
CREATE POLICY "documents_select_authorized_providers"
  ON documents FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

DROP POLICY IF EXISTS "documents_select_uploader" ON documents;
CREATE POLICY "documents_select_uploader"
  ON documents FOR SELECT
  USING (uploaded_by = get_my_profile_id());

DROP POLICY IF EXISTS "documents_insert_authorized_providers" ON documents;
-- Documents can ONLY be attached by authorized providers treating the patient
CREATE POLICY "documents_insert_authorized_providers"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = get_my_profile_id()
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND is_provider_authorized_for_patient(patient_id)
  );

DROP POLICY IF EXISTS "documents_delete_uploader" ON documents;
CREATE POLICY "documents_delete_uploader"
  ON documents FOR DELETE
  USING (uploaded_by = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 15. AUDIT LOGS RLS (Strict Append-Only Protection)
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (actor_user_id = get_my_profile_id());

DROP POLICY IF EXISTS "audit_logs_insert_own" ON audit_logs;
-- Append-only: Users can only record logs under their own authenticated profile
CREATE POLICY "audit_logs_insert_own"
  ON audit_logs FOR INSERT
  WITH CHECK (actor_user_id = get_my_profile_id());

-- NO UPDATE OR DELETE POLICIES PERMITTED (Logs are strictly immutable).


-- ═══════════════════════════════════════════════════════════
-- 16. SANITIZED PUBLIC/PROVIDER DIRECTORY VIEWS (SECURITY INVOKER)
-- ═══════════════════════════════════════════════════════════

-- Secure View: Public doctor directory (exposes ONLY professional/public attributes)
CREATE OR REPLACE VIEW public.doctor_directory
WITH (security_invoker = true) AS
SELECT
  d.id,
  d.profile_id,
  p.full_name,
  p.avatar_url,
  d.specialization,
  d.qualification,
  d.years_of_experience,
  d.bio,
  o.name AS organization_name
FROM public.doctor_profiles d
JOIN public.profiles p ON p.id = d.profile_id
LEFT JOIN public.organizations o ON o.id = d.organization_id
WHERE p.role = 'doctor';

-- Secure View: Public organization directory (exposes ONLY public business attributes)
CREATE OR REPLACE VIEW public.organization_directory
WITH (security_invoker = true) AS
SELECT
  o.id,
  o.name,
  o.type,
  o.address,
  o.phone,
  o.email,
  o.logo_url,
  o.is_verified
FROM public.organizations o
WHERE o.is_verified = true;
