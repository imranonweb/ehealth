-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ───────────────────────────────────────────────────────────

ALTER TABLE profiles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_visits              ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_ai_extractions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                   ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile (limited fields handled in app)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow insert during registration
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- Providers can read patient profiles they have a relationship with
CREATE POLICY "Providers can read related patient profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = profiles.id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );

-- Providers can search patients by basic info (for patient lookup)
CREATE POLICY "Providers can search patients"
  ON profiles FOR SELECT
  USING (
    get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND role = 'patient'
  );


-- ═══════════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════

-- Anyone authenticated can read organizations
CREATE POLICY "Authenticated users can read organizations"
  ON organizations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Organization owners can update their org
CREATE POLICY "Org owners can update"
  ON organizations FOR UPDATE
  USING (profile_id = get_my_profile_id())
  WITH CHECK (profile_id = get_my_profile_id());

-- Insert during registration
CREATE POLICY "Users can create their organization"
  ON organizations FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());


-- ═══════════════════════════════════════════════════════════
-- DOCTOR PROFILES
-- ═══════════════════════════════════════════════════════════

-- Doctors can read and update own doctor profile
CREATE POLICY "Doctors can read own doctor profile"
  ON doctor_profiles FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Doctors can update own doctor profile"
  ON doctor_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Doctors can insert own doctor profile"
  ON doctor_profiles FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

-- Patients & providers can view doctor profiles
CREATE POLICY "Anyone authenticated can view doctor profiles"
  ON doctor_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);


-- ═══════════════════════════════════════════════════════════
-- PATIENT PROFILES
-- ═══════════════════════════════════════════════════════════

-- Patients can manage own patient profile
CREATE POLICY "Patients can read own patient profile"
  ON patient_profiles FOR SELECT
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Patients can update own patient profile"
  ON patient_profiles FOR UPDATE
  USING (profile_id = get_my_profile_id());

CREATE POLICY "Patients can insert own patient profile"
  ON patient_profiles FOR INSERT
  WITH CHECK (profile_id = get_my_profile_id());

-- Providers can read patient profiles for related patients
CREATE POLICY "Providers can read related patient profiles"
  ON patient_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = patient_profiles.profile_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );


-- ═══════════════════════════════════════════════════════════
-- PATIENT-PROVIDER RELATIONSHIPS
-- ═══════════════════════════════════════════════════════════

-- Patients can see their relationships
CREATE POLICY "Patients can see own relationships"
  ON patient_provider_relationships FOR SELECT
  USING (patient_profile_id = get_my_profile_id());

-- Providers can see their relationships
CREATE POLICY "Providers can see own relationships"
  ON patient_provider_relationships FOR SELECT
  USING (provider_profile_id = get_my_profile_id());

-- Providers can create relationships (when treating a patient)
CREATE POLICY "Providers can create relationships"
  ON patient_provider_relationships FOR INSERT
  WITH CHECK (
    provider_profile_id = get_my_profile_id()
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
  );


-- ═══════════════════════════════════════════════════════════
-- PRESCRIPTIONS
-- ═══════════════════════════════════════════════════════════

-- Patients can read own prescriptions
CREATE POLICY "Patients can read own prescriptions"
  ON prescriptions FOR SELECT
  USING (patient_id = get_my_profile_id());

-- Doctors can read prescriptions they authored
CREATE POLICY "Doctors can read own prescriptions"
  ON prescriptions FOR SELECT
  USING (doctor_id = get_my_profile_id());

-- Doctors can create prescriptions (as the author)
CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    doctor_id = get_my_profile_id()
    AND get_my_role() = 'doctor'
  );

-- Hospitals can create prescriptions (hospital-based)
CREATE POLICY "Hospitals can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND get_my_role() = 'hospital'
  );

-- Hospitals can read prescriptions from their hospital
CREATE POLICY "Hospitals can read own prescriptions"
  ON prescriptions FOR SELECT
  USING (hospital_id = get_my_organization_id());

-- Related providers can read patient prescriptions
CREATE POLICY "Related providers can read patient prescriptions"
  ON prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = prescriptions.patient_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );

-- Patients CANNOT create prescriptions (enforced by no INSERT policy for patient role)
-- Diagnostics CANNOT create prescriptions (no INSERT policy for diagnostics role)


-- ═══════════════════════════════════════════════════════════
-- PRESCRIPTION AI EXTRACTIONS
-- ═══════════════════════════════════════════════════════════

-- Readable if user can read the parent prescription
CREATE POLICY "Users can read AI extractions for accessible prescriptions"
  ON prescription_ai_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_ai_extractions.prescription_id
        AND (
          p.patient_id = get_my_profile_id()
          OR p.doctor_id = get_my_profile_id()
          OR p.hospital_id = get_my_organization_id()
        )
    )
  );


-- ═══════════════════════════════════════════════════════════
-- DIAGNOSTIC REPORTS
-- ═══════════════════════════════════════════════════════════

-- Patients can read own reports
CREATE POLICY "Patients can read own diagnostic reports"
  ON diagnostic_reports FOR SELECT
  USING (patient_id = get_my_profile_id());

-- Diagnostics orgs can create reports
CREATE POLICY "Diagnostics orgs can create reports"
  ON diagnostic_reports FOR INSERT
  WITH CHECK (
    diagnostics_organization_id = get_my_organization_id()
    AND get_my_role() = 'diagnostics'
  );

-- Diagnostics orgs can read their own reports
CREATE POLICY "Diagnostics orgs can read own reports"
  ON diagnostic_reports FOR SELECT
  USING (diagnostics_organization_id = get_my_organization_id());

-- Related providers can read patient diagnostic reports
CREATE POLICY "Related providers can read patient diagnostic reports"
  ON diagnostic_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = diagnostic_reports.patient_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );

-- Doctors CANNOT create diagnostic reports (no INSERT policy for doctor role)
-- Hospitals CANNOT modify external diagnostic reports


-- ═══════════════════════════════════════════════════════════
-- HOSPITAL VISITS
-- ═══════════════════════════════════════════════════════════

-- Patients can read own visits
CREATE POLICY "Patients can read own hospital visits"
  ON hospital_visits FOR SELECT
  USING (patient_id = get_my_profile_id());

-- Hospitals can create visits
CREATE POLICY "Hospitals can create visits"
  ON hospital_visits FOR INSERT
  WITH CHECK (
    hospital_id = get_my_organization_id()
    AND get_my_role() = 'hospital'
  );

-- Hospitals can read their own visits
CREATE POLICY "Hospitals can read own visits"
  ON hospital_visits FOR SELECT
  USING (hospital_id = get_my_organization_id());

-- Hospitals can update their own visits
CREATE POLICY "Hospitals can update own visits"
  ON hospital_visits FOR UPDATE
  USING (hospital_id = get_my_organization_id())
  WITH CHECK (hospital_id = get_my_organization_id());

-- Related providers can read patient hospital visits
CREATE POLICY "Related providers can read patient hospital visits"
  ON hospital_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = hospital_visits.patient_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );


-- ═══════════════════════════════════════════════════════════
-- MEDICAL RECORDS (timeline)
-- ═══════════════════════════════════════════════════════════

-- Patients can read own timeline
CREATE POLICY "Patients can read own medical records"
  ON medical_records FOR SELECT
  USING (patient_id = get_my_profile_id());

-- Providers can insert records for patients
CREATE POLICY "Providers can insert medical records"
  ON medical_records FOR INSERT
  WITH CHECK (
    get_my_role() IN ('doctor', 'diagnostics', 'hospital')
  );

-- Related providers can read patient medical records
CREATE POLICY "Related providers can read patient medical records"
  ON medical_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = medical_records.patient_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );


-- ═══════════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════════

-- Patients can read own documents
CREATE POLICY "Patients can read own documents"
  ON documents FOR SELECT
  USING (patient_id = get_my_profile_id());

-- Providers can insert documents
CREATE POLICY "Providers can insert documents"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = get_my_profile_id()
    AND get_my_role() IN ('doctor', 'diagnostics', 'hospital')
  );

-- Related providers can read patient documents
CREATE POLICY "Related providers can read patient documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id = documents.patient_id
        AND ppr.provider_profile_id = get_my_profile_id()
        AND ppr.status = 'active'
    )
  );


-- ═══════════════════════════════════════════════════════════
-- AUDIT LOGS
-- ═══════════════════════════════════════════════════════════

-- Users can read their own audit log entries
CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  USING (actor_user_id = get_my_profile_id());

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (actor_user_id = get_my_profile_id());
