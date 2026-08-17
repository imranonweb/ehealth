-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 001: Initial Schema
-- ═══════════════════════════════════════════════════════════
-- Description: Core tables, custom ENUMs, triggers, and helper
-- functions for role-based medical record architecture.
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ───────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'diagnostics', 'hospital', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE org_type AS ENUM ('hospital', 'diagnostics');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_type AS ENUM ('inpatient', 'outpatient', 'emergency', 'day_care');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE record_type AS ENUM ('prescription', 'diagnostic_report', 'hospital_visit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE relationship_status AS ENUM ('pending', 'active', 'revoked', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ───────────────────────────────────────────────────────────
-- 2. PROFILES (Linked 1:1 with auth.users)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user   ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email       ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone       ON profiles(phone);

-- ───────────────────────────────────────────────────────────
-- 3. ORGANIZATIONS (Hospitals & Diagnostics Centers)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  type           org_type NOT NULL,
  address        TEXT,
  phone          TEXT,
  email          TEXT,
  license_number TEXT NOT NULL,
  logo_url       TEXT,
  is_verified    BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_type       ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_profile_id ON organizations(profile_id);

-- ───────────────────────────────────────────────────────────
-- 4. DOCTOR PROFILES
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctor_profiles (
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

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_profile_id ON doctor_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_org_id     ON doctor_profiles(organization_id);

-- ───────────────────────────────────────────────────────────
-- 5. PATIENT PROFILES
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patient_profiles (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id         UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_identifier TEXT UNIQUE DEFAULT ('P-' || upper(substr(uuid_generate_v4()::text, 1, 8))),
  emergency_contact  TEXT,
  blood_group        TEXT,
  allergies          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_profile_id ON patient_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_identifier ON patient_profiles(patient_identifier);

-- ───────────────────────────────────────────────────────────
-- 6. PATIENT-PROVIDER RELATIONSHIPS (Access Control Gate)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patient_provider_relationships (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_type       user_role NOT NULL,
  organization_id     UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status              relationship_status NOT NULL DEFAULT 'active',
  granted_by          UUID REFERENCES profiles(id),
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_profile_id, provider_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_ppr_patient    ON patient_provider_relationships(patient_profile_id);
CREATE INDEX IF NOT EXISTS idx_ppr_provider   ON patient_provider_relationships(provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_ppr_org        ON patient_provider_relationships(organization_id);
CREATE INDEX IF NOT EXISTS idx_ppr_status     ON patient_provider_relationships(status);

-- ───────────────────────────────────────────────────────────
-- 7. HOSPITAL VISITS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hospital_visits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visit_type        visit_type NOT NULL DEFAULT 'outpatient',
  department        TEXT,
  admission_date    DATE NOT NULL,
  discharge_date    DATE,
  reason            TEXT NOT NULL,
  diagnosis_summary TEXT,
  notes             TEXT,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hospital_visits_patient  ON hospital_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospital_visits_hospital ON hospital_visits(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_visits_date     ON hospital_visits(admission_date);

-- ───────────────────────────────────────────────────────────
-- 8. PRESCRIPTIONS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  hospital_id       UUID REFERENCES organizations(id) ON DELETE SET NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis         TEXT NOT NULL,
  clinical_notes    TEXT,
  medications       JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions      TEXT,
  document_path     TEXT,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_prescription_author CHECK (doctor_id IS NOT NULL OR hospital_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient  ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor   ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_hospital ON prescriptions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date     ON prescriptions(prescription_date);

-- ───────────────────────────────────────────────────────────
-- 9. PRESCRIPTION AI EXTRACTIONS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prescription_ai_extractions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  extracted_text  TEXT,
  medicines       JSONB DEFAULT '[]'::jsonb,
  summary         TEXT,
  model           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pai_prescription ON prescription_ai_extractions(prescription_id);

-- ───────────────────────────────────────────────────────────
-- 10. DIAGNOSTIC REPORTS
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diagnostics_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doctor_id                   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  hospital_id                 UUID REFERENCES organizations(id) ON DELETE SET NULL,
  test_name                   TEXT NOT NULL,
  test_category               TEXT,
  report_date                 DATE NOT NULL DEFAULT CURRENT_DATE,
  summary                     TEXT NOT NULL,
  doctor_notes                TEXT,
  document_path               TEXT,
  created_by                  UUID NOT NULL REFERENCES profiles(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_patient ON diagnostic_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_org     ON diagnostic_reports(diagnostics_organization_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_date    ON diagnostic_reports(report_date);

-- ───────────────────────────────────────────────────────────
-- 11. MEDICAL RECORDS (Unified Chronological Index)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS medical_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_type         record_type NOT NULL,
  record_reference_id UUID NOT NULL,
  record_date         DATE NOT NULL,
  title               TEXT NOT NULL,
  summary             TEXT,
  provider_name       TEXT,
  organization_name   TEXT,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date    ON medical_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_type    ON medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_ref     ON medical_records(record_reference_id);

-- ───────────────────────────────────────────────────────────
-- 12. DOCUMENTS (File Metadata referencing Private Storage)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
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

CREATE INDEX IF NOT EXISTS idx_documents_patient   ON documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_record    ON documents(record_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploader  ON documents(uploaded_by);

-- ───────────────────────────────────────────────────────────
-- 13. AUDIT LOGS (Immutable Security Log)
-- ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor    ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity   ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON audit_logs(created_at DESC);

-- ───────────────────────────────────────────────────────────
-- 14. HELPER FUNCTIONS (SECURITY DEFINER with strict search_path)
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID AS $$
  SELECT id FROM public.organizations WHERE profile_id = public.get_my_profile_id() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Helper to check if current caller has active relationship with target patient
CREATE OR REPLACE FUNCTION public.is_provider_authorized_for_patient(target_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_provider_relationships ppr
    WHERE ppr.patient_profile_id = target_patient_id
      AND (
        ppr.provider_profile_id = public.get_my_profile_id()
        OR ppr.organization_id = public.get_my_organization_id()
      )
      AND ppr.status = 'active'
      AND (ppr.expires_at IS NULL OR ppr.expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Helper to extract patient ID from storage object path (patients/<patient_uuid>/...)
CREATE OR REPLACE FUNCTION public.extract_patient_id_from_storage_path(object_name TEXT)
RETURNS UUID AS $$
DECLARE
  parts TEXT[];
BEGIN
  parts := string_to_array(object_name, '/');
  IF array_length(parts, 1) >= 2 AND parts[1] = 'patients' THEN
    RETURN parts[2]::uuid;
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ───────────────────────────────────────────────────────────
-- 15. AUTOMATIC UPDATED_AT TRIGGER
-- ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_ppr_updated_at BEFORE UPDATE ON patient_provider_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_hospital_visits_updated_at BEFORE UPDATE ON hospital_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_diagnostic_reports_updated_at BEFORE UPDATE ON diagnostic_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;
