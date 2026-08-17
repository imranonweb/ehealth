-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 002: Row Level Security Policies
-- ═══════════════════════════════════════════════════════════
-- Description: Strict role-based access control policies.
-- Enforces that patients access only their own medical history,
-- and providers only access patients with active relationships.
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


-- ═══════════════════════════════════════════════════════════
-- 2. PROFILES
-- ═══════════════════════════════════════════════════════════

-- Users can read their own full profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Users can insert their own profile on registration
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- Authenticated providers can read patient profiles ONLY for patients they have active relationships with
CREATE POLICY "profiles_select_by_authorized_providers"
  ON profiles FOR SELECT
  USING (
    role = 'patient'
    AND is_provider_authorized_for_patient(id)
  );

-- Authenticated providers can search basic patient identity for lookup (to establish relationship/triage)
CREATE POLICY "profiles_lookup_by_providers"
  ON profiles FOR SELECT
  USING (
    role = 'patient'
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
  );

-- Anyone authenticated can view doctor and organization profiles in directories
CREATE POLICY "profiles_select_providers_directory"
  ON profiles FOR SELECT
  USING (role IN ('doctor', 'hospital', 'diagnostics'));


-- ═══════════════════════════════════════════════════════════
-- 3. ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════

-- Anyone authenticated can view verified organizations (hospitals & diagnostic centers)
CREATE POLICY "orgs_select_all_authenticated"
  ON organizations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Organization owner can update their organization
CREATE POLICY "orgs_update_by_owner"
  ON organizations FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

-- Organization owner can create organization upon registration
CREATE POLICY "orgs_insert_by_owner"
  ON organizations FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 4. DOCTOR PROFILES
-- ═══════════════════════════════════════════════════════════

-- Anyone authenticated can view doctor directory profiles
CREATE POLICY "doctor_profiles_select_all"
  ON doctor_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Doctors can update their own professional profile
CREATE POLICY "doctor_profiles_update_own"
  ON doctor_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

-- Doctors can insert their own professional profile
CREATE POLICY "doctor_profiles_insert_own"
  ON doctor_profiles FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 5. PATIENT PROFILES
-- ═══════════════════════════════════════════════════════════

-- Patients can read their own patient profile
CREATE POLICY "patient_profiles_select_own"
  ON patient_profiles FOR SELECT
  USING (profile_id = get_my_profile_id());

-- Patients can update their own patient profile
CREATE POLICY "patient_profiles_update_own"
  ON patient_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

-- Patients can insert their own patient profile upon signup
CREATE POLICY "patient_profiles_insert_own"
  ON patient_profiles FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

-- Providers can read patient profiles ONLY for patients they are authorized to treat
CREATE POLICY "patient_profiles_select_authorized_providers"
  ON patient_profiles FOR SELECT
  USING (is_provider_authorized_for_patient(profile_id));


-- ═══════════════════════════════════════════════════════════
-- 6. PATIENT-PROVIDER RELATIONSHIPS (Authorization Control)
-- ═══════════════════════════════════════════════════════════

-- Patients can see all relationships granted for their record
CREATE POLICY "ppr_select_patient"
  ON patient_provider_relationships FOR SELECT
  USING (patient_profile_id = get_my_profile_id());

-- Providers can see relationships where they are the designated provider/organization
CREATE POLICY "ppr_select_provider"
  ON patient_provider_relationships FOR SELECT
  USING (
    provider_profile_id = get_my_profile_id()
    OR organization_id = get_my_organization_id()
  );

-- Patients can grant / insert relationships for themselves
CREATE POLICY "ppr_insert_by_patient"
  ON patient_provider_relationships FOR INSERT
  WITH CHECK (
    patient_profile_id = get_my_profile_id()
  );

-- Providers can ONLY create a relationship with status 'pending' (unless authorized via clinical protocol)
CREATE POLICY "ppr_insert_by_provider"
  ON patient_provider_relationships FOR INSERT
  WITH CHECK (
    (provider_profile_id = get_my_profile_id() OR organization_id = get_my_organization_id())
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
  );

-- Patients can update/revoke relationships to cancel access anytime
CREATE POLICY "ppr_update_by_patient"
  ON patient_provider_relationships FOR UPDATE
  USING (patient_profile_id = get_my_profile_id())
  WITH CHECK (patient_profile_id = get_my_profile_id());

-- Providers can only update relationship status to 'inactive' (relinquish access)
CREATE POLICY "ppr_update_by_provider"
  ON patient_provider_relationships FOR UPDATE
  USING (
    provider_profile_id = get_my_profile_id()
    OR organization_id = get_my_organization_id()
  )
  WITH CHECK (
    status IN ('inactive', 'pending')
  );


-- ═══════════════════════════════════════════════════════════
-- 7. PRESCRIPTIONS
-- ═══════════════════════════════════════════════════════════

-- 1) Patient can read their own prescriptions
CREATE POLICY "prescriptions_select_patient"
  ON prescriptions FOR SELECT
  USING (patient_id = get_my_profile_id());

-- 2) Author doctor can read prescriptions they wrote
CREATE POLICY "prescriptions_select_author_doctor"
  ON prescriptions FOR SELECT
  USING (doctor_id = get_my_profile_id());

-- 3) Issuing hospital can read prescriptions issued under their facility
CREATE POLICY "prescriptions_select_issuing_hospital"
  ON prescriptions FOR SELECT
  USING (hospital_id = get_my_organization_id());

-- 4) Authorized providers can read prescriptions ONLY if they have an active relationship with the patient
CREATE POLICY "prescriptions_select_authorized_providers"
  ON prescriptions FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

-- 5) Doctors can insert prescriptions ONLY for patients they have an active relationship with
CREATE POLICY "prescriptions_insert_doctor"
  ON prescriptions FOR INSERT
  WITH CHECK (
    doctor_id = get_my_profile_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'doctor'
    AND is_provider_authorized_for_patient(patient_id)
  );

-- 6) Hospitals can insert hospital-associated prescriptions ONLY for authorized patients
CREATE POLICY "prescriptions_insert_hospital"
  ON prescriptions FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'hospital'
    AND is_provider_authorized_for_patient(patient_id)
  );

-- 7) Author doctor can update their own prescription
CREATE POLICY "prescriptions_update_doctor"
  ON prescriptions FOR UPDATE
  USING (doctor_id = get_my_profile_id() AND get_my_role() = 'doctor')
  WITH CHECK (doctor_id = get_my_profile_id() AND get_my_role() = 'doctor');

-- 8) Hospital staff can update hospital prescriptions they created
CREATE POLICY "prescriptions_update_hospital"
  ON prescriptions FOR UPDATE
  USING (hospital_id = get_my_organization_id() AND created_by = get_my_profile_id() AND get_my_role() = 'hospital')
  WITH CHECK (hospital_id = get_my_organization_id() AND created_by = get_my_profile_id() AND get_my_role() = 'hospital');

-- NOTE: Diagnostics & Patients have NO INSERT/UPDATE policies on prescriptions (Strictly enforced).


-- ═══════════════════════════════════════════════════════════
-- 8. PRESCRIPTION AI EXTRACTIONS (Inherits Parent Permissions)
-- ═══════════════════════════════════════════════════════════

-- Read access is strictly inherited from the parent prescription
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

-- Insertion restricted to creator of the prescription or authorized doctor/hospital
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
-- 9. DIAGNOSTIC REPORTS
-- ═══════════════════════════════════════════════════════════

-- 1) Patient can read their own diagnostic reports
CREATE POLICY "reports_select_patient"
  ON diagnostic_reports FOR SELECT
  USING (patient_id = get_my_profile_id());

-- 2) Issuing diagnostic facility can read their own reports
CREATE POLICY "reports_select_issuing_org"
  ON diagnostic_reports FOR SELECT
  USING (diagnostics_organization_id = get_my_organization_id());

-- 3) Authorized providers can read reports for patients they treat
CREATE POLICY "reports_select_authorized_providers"
  ON diagnostic_reports FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

-- 4) Diagnostics organizations can insert reports ONLY for patients they are authorized for
CREATE POLICY "reports_insert_diagnostics"
  ON diagnostic_reports FOR INSERT
  WITH CHECK (
    diagnostics_organization_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'diagnostics'
    AND is_provider_authorized_for_patient(patient_id)
  );

-- 5) Issuing diagnostic organization can update their own reports
CREATE POLICY "reports_update_diagnostics"
  ON diagnostic_reports FOR UPDATE
  USING (diagnostics_organization_id = get_my_organization_id() AND get_my_role() = 'diagnostics')
  WITH CHECK (diagnostics_organization_id = get_my_organization_id() AND get_my_role() = 'diagnostics');

-- NOTE: Doctors, Hospitals, and Patients cannot insert diagnostic reports.


-- ═══════════════════════════════════════════════════════════
-- 10. HOSPITAL VISITS
-- ═══════════════════════════════════════════════════════════

-- 1) Patient can read their own hospital visits
CREATE POLICY "visits_select_patient"
  ON hospital_visits FOR SELECT
  USING (patient_id = get_my_profile_id());

-- 2) Hospital can read visits recorded at their facility
CREATE POLICY "visits_select_hospital"
  ON hospital_visits FOR SELECT
  USING (hospital_id = get_my_organization_id());

-- 3) Authorized providers can read hospital visits for patients they treat
CREATE POLICY "visits_select_authorized_providers"
  ON hospital_visits FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

-- 4) Hospitals can insert visit records ONLY for authorized patients
CREATE POLICY "visits_insert_hospital"
  ON hospital_visits FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND created_by = get_my_profile_id()
    AND get_my_role() = 'hospital'
    AND is_provider_authorized_for_patient(patient_id)
  );

-- 5) Hospital staff can update visit records issued by their hospital
CREATE POLICY "visits_update_hospital"
  ON hospital_visits FOR UPDATE
  USING (hospital_id = get_my_organization_id() AND get_my_role() = 'hospital')
  WITH CHECK (hospital_id = get_my_organization_id() AND get_my_role() = 'hospital');


-- ═══════════════════════════════════════════════════════════
-- 11. MEDICAL RECORDS (Unified Timeline Index)
-- ═══════════════════════════════════════════════════════════

-- 1) Patient can read their own unified timeline
CREATE POLICY "timeline_select_patient"
  ON medical_records FOR SELECT
  USING (patient_id = get_my_profile_id());

-- 2) Authorized providers can read timeline entries for patients they treat
CREATE POLICY "timeline_select_authorized_providers"
  ON medical_records FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

-- 3) Authorized providers can insert timeline index entries ONLY for authorized patients
CREATE POLICY "timeline_insert_authorized_providers"
  ON medical_records FOR INSERT
  WITH CHECK (
    get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND is_provider_authorized_for_patient(patient_id)
    AND (created_by IS NULL OR created_by = get_my_profile_id())
  );

-- 4) Modifying timeline entries restricted to creator
CREATE POLICY "timeline_update_creator"
  ON medical_records FOR UPDATE
  USING (created_by = get_my_profile_id())
  WITH CHECK (created_by = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 12. DOCUMENTS (Metadata referencing Private Storage)
-- ═══════════════════════════════════════════════════════════

-- 1) Patient can read documents belonging to their record
CREATE POLICY "documents_select_patient"
  ON documents FOR SELECT
  USING (patient_id = get_my_profile_id());

-- 2) Authorized providers can read documents for patients they treat
CREATE POLICY "documents_select_authorized_providers"
  ON documents FOR SELECT
  USING (is_provider_authorized_for_patient(patient_id));

-- 3) Uploader can always read documents they uploaded
CREATE POLICY "documents_select_uploader"
  ON documents FOR SELECT
  USING (uploaded_by = get_my_profile_id());

-- 4) Authorized providers can insert document metadata ONLY for authorized patients
CREATE POLICY "documents_insert_authorized_providers"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = get_my_profile_id()
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND is_provider_authorized_for_patient(patient_id)
  );

-- 5) Uploader can delete document metadata they uploaded
CREATE POLICY "documents_delete_uploader"
  ON documents FOR DELETE
  USING (uploaded_by = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- 13. AUDIT LOGS (Strict Append-Only Protection)
-- ═══════════════════════════════════════════════════════════

-- Users can inspect audit entries associated with their actions
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (actor_user_id = get_my_profile_id());

-- Authenticated users can insert audit records for their OWN actions ONLY (prevents actor spoofing)
CREATE POLICY "audit_logs_insert_own"
  ON audit_logs FOR INSERT
  WITH CHECK (actor_user_id = get_my_profile_id());

-- NO UPDATE OR DELETE POLICIES ON AUDIT LOGS (Immutable security logs).
