-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Initial Database Schema
-- Run this in Supabase SQL Editor (or via CLI migrations).
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────
-- ENUM TYPES
-- ───────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'diagnostics', 'hospital', 'admin');
CREATE TYPE org_type AS ENUM ('hospital', 'diagnostics');
CREATE TYPE visit_type AS ENUM ('inpatient', 'outpatient', 'emergency', 'day_care');
CREATE TYPE record_type AS ENUM ('prescription', 'diagnostic_report', 'hospital_visit');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE relationship_status AS ENUM ('active', 'inactive', 'revoked');

-- ───────────────────────────────────────────────────────────
-- 1. PROFILES  (linked to auth.users)
-- ───────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id  UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'patient',
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL,
  phone         TEXT,
  date_of_birth DATE,
  gender        gender_type,
  blood_group   TEXT,
  address       TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user   ON profiles(auth_user_id);
CREATE INDEX idx_profiles_role        ON profiles(role);
CREATE INDEX idx_profiles_email       ON profiles(email);

-- ───────────────────────────────────────────────────────────
-- 2. ORGANIZATIONS  (hospitals & diagnostics centers)
-- ───────────────────────────────────────────────────────────

CREATE TABLE organizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  type           org_type NOT NULL,
  address        TEXT,
  phone          TEXT,
  email          TEXT,
  license_number TEXT,
  logo_url       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_type       ON organizations(type);
CREATE INDEX idx_organizations_profile_id ON organizations(profile_id);

-- ───────────────────────────────────────────────────────────
-- 3. DOCTOR PROFILES
-- ───────────────────────────────────────────────────────────

CREATE TABLE doctor_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id          UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id     UUID REFERENCES organizations(id) ON DELETE SET NULL,
  specialization      TEXT,
  license_number      TEXT,
  qualification       TEXT,
  years_of_experience INT,
  bio                 TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctor_profiles_profile_id ON doctor_profiles(profile_id);

-- ───────────────────────────────────────────────────────────
-- 4. PATIENT PROFILES
-- ───────────────────────────────────────────────────────────

CREATE TABLE patient_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_identifier TEXT UNIQUE DEFAULT ('P-' || upper(substr(uuid_generate_v4()::text, 1, 8))),
  emergency_contact TEXT,
  blood_group       TEXT,
  allergies         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_profiles_profile_id ON patient_profiles(profile_id);
CREATE INDEX idx_patient_profiles_identifier ON patient_profiles(patient_identifier);

-- ───────────────────────────────────────────────────────────
-- 5. PATIENT-PROVIDER RELATIONSHIPS
-- ───────────────────────────────────────────────────────────

CREATE TABLE patient_provider_relationships (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_type       user_role NOT NULL,
  organization_id     UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status              relationship_status NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_profile_id, provider_profile_id)
);

CREATE INDEX idx_ppr_patient  ON patient_provider_relationships(patient_profile_id);
CREATE INDEX idx_ppr_provider ON patient_provider_relationships(provider_profile_id);

-- ───────────────────────────────────────────────────────────
-- 6. HOSPITAL VISITS
-- ───────────────────────────────────────────────────────────

CREATE TABLE hospital_visits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visit_type        visit_type NOT NULL DEFAULT 'outpatient',
  department        TEXT,
  admission_date    DATE NOT NULL,
  discharge_date    DATE,
  reason            TEXT,
  diagnosis_summary TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_visits_patient  ON hospital_visits(patient_id);
CREATE INDEX idx_hospital_visits_hospital ON hospital_visits(hospital_id);
CREATE INDEX idx_hospital_visits_date     ON hospital_visits(admission_date);

-- ───────────────────────────────────────────────────────────
-- 7. PRESCRIPTIONS
-- ───────────────────────────────────────────────────────────

CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id       UUID REFERENCES organizations(id) ON DELETE SET NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis         TEXT,
  clinical_notes    TEXT,
  medications       JSONB DEFAULT '[]'::jsonb,
  instructions      TEXT,
  document_path     TEXT,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor  ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_date    ON prescriptions(prescription_date);

-- ───────────────────────────────────────────────────────────
-- 8. PRESCRIPTION AI EXTRACTIONS
-- ───────────────────────────────────────────────────────────

CREATE TABLE prescription_ai_extractions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  extracted_text  TEXT,
  medicines       JSONB DEFAULT '[]'::jsonb,
  summary         TEXT,
  model           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pai_prescription ON prescription_ai_extractions(prescription_id);

-- ───────────────────────────────────────────────────────────
-- 9. DIAGNOSTIC REPORTS
-- ───────────────────────────────────────────────────────────

CREATE TABLE diagnostic_reports (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diagnostics_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id                  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  hospital_id                UUID REFERENCES organizations(id) ON DELETE SET NULL,
  test_name                  TEXT NOT NULL,
  test_category              TEXT,
  report_date                DATE NOT NULL DEFAULT CURRENT_DATE,
  summary                    TEXT,
  doctor_notes               TEXT,
  document_path              TEXT,
  created_by                 UUID REFERENCES profiles(id),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnostic_reports_patient ON diagnostic_reports(patient_id);
CREATE INDEX idx_diagnostic_reports_org     ON diagnostic_reports(diagnostics_organization_id);
CREATE INDEX idx_diagnostic_reports_date    ON diagnostic_reports(report_date);

-- ───────────────────────────────────────────────────────────
-- 10. MEDICAL RECORDS  (unified timeline index)
-- ───────────────────────────────────────────────────────────

CREATE TABLE medical_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_type         record_type NOT NULL,
  record_reference_id UUID NOT NULL,
  record_date         DATE NOT NULL,
  title               TEXT NOT NULL,
  summary             TEXT,
  provider_name       TEXT,
  organization_name   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_date    ON medical_records(record_date DESC);
CREATE INDEX idx_medical_records_type    ON medical_records(record_type);

-- ───────────────────────────────────────────────────────────
-- 11. DOCUMENTS  (file metadata — actual files in Storage)
-- ───────────────────────────────────────────────────────────

CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_by  UUID NOT NULL REFERENCES profiles(id),
  record_type  record_type,
  record_id    UUID,
  storage_path TEXT NOT NULL,
  file_name    TEXT NOT NULL,
  mime_type    TEXT,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_patient   ON documents(patient_id);
CREATE INDEX idx_documents_record    ON documents(record_id);

-- ───────────────────────────────────────────────────────────
-- 12. AUDIT LOGS
-- ───────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor    ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created  ON audit_logs(created_at DESC);

-- ───────────────────────────────────────────────────────────
-- HELPER FUNCTION: get profile id from auth.uid()
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ───────────────────────────────────────────────────────────
-- HELPER FUNCTION: get my role
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ───────────────────────────────────────────────────────────
-- HELPER FUNCTION: get my organization ID
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
  SELECT id FROM organizations WHERE profile_id = get_my_profile_id() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ───────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_hospital_visits_updated_at BEFORE UPDATE ON hospital_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_diagnostic_reports_updated_at BEFORE UPDATE ON diagnostic_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
