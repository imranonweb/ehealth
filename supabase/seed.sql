-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Seed Data (PostgreSQL & Supabase Auth)
-- ═══════════════════════════════════════════════════════════
--
-- INSTRUCTIONS FOR RUNNING THIS SEED:
--
-- Step 1: Create the demo accounts in Supabase Auth (Dashboard > Authentication > Users)
--         or via Supabase Auth Admin API with the following credentials:
--
--   | Email                     | Role        | Initial Password |
--   | :------------------------ | :---------- | :--------------- |
--   | patient1@ehealth.demo     | patient     | Demo@12345       |
--   | patient2@ehealth.demo     | patient     | Demo@12345       |
--   | patient3@ehealth.demo     | patient     | Demo@12345       |
--   | dr.rahman@ehealth.demo    | doctor      | Demo@12345       |
--   | dr.khan@ehealth.demo      | doctor      | Demo@12345       |
--   | dr.chowdhury@ehealth.demo | doctor      | Demo@12345       |
--   | greencare@ehealth.demo    | hospital    | Demo@12345       |
--   | citymedical@ehealth.demo  | hospital    | Demo@12345       |
--   | populardiag@ehealth.demo  | diagnostics | Demo@12345       |
--
-- Step 2: Run this script in the Supabase SQL Editor.
--         It dynamically binds existing auth user IDs by email and inserts
--         the corresponding profiles, active patient-provider relationships,
--         prescriptions, diagnostic test reports, and hospital admissions.
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  -- Auth User IDs (looked up dynamically from auth.users by email)
  v_p1_auth UUID;
  v_p2_auth UUID;
  v_p3_auth UUID;
  v_d1_auth UUID;
  v_d2_auth UUID;
  v_d3_auth UUID;
  v_h1_auth UUID;
  v_h2_auth UUID;
  v_dx_auth UUID;

  -- Profile IDs
  v_p1_id UUID;
  v_p2_id UUID;
  v_p3_id UUID;
  v_d1_id UUID;
  v_d2_id UUID;
  v_d3_id UUID;
  v_h1_id UUID;
  v_h2_id UUID;
  v_dx_id UUID;

  -- Organization IDs
  v_h1_org UUID;
  v_h2_org UUID;
  v_dx_org UUID;

  -- Record IDs
  v_presc1 UUID;
  v_presc2 UUID;
  v_presc3 UUID;
  v_diag1  UUID;
  v_diag2  UUID;
  v_diag3  UUID;
  v_visit1 UUID;
  v_visit2 UUID;

BEGIN
  -- ─────────────────────────────────────────────────────────
  -- 1. RESOLVE OR GENERATE AUTH USER IDS
  -- ─────────────────────────────────────────────────────────
  SELECT id INTO v_p1_auth FROM auth.users WHERE email = 'patient1@ehealth.demo';
  SELECT id INTO v_p2_auth FROM auth.users WHERE email = 'patient2@ehealth.demo';
  SELECT id INTO v_p3_auth FROM auth.users WHERE email = 'patient3@ehealth.demo';
  SELECT id INTO v_d1_auth FROM auth.users WHERE email = 'dr.rahman@ehealth.demo';
  SELECT id INTO v_d2_auth FROM auth.users WHERE email = 'dr.khan@ehealth.demo';
  SELECT id INTO v_d3_auth FROM auth.users WHERE email = 'dr.chowdhury@ehealth.demo';
  SELECT id INTO v_h1_auth FROM auth.users WHERE email = 'greencare@ehealth.demo';
  SELECT id INTO v_h2_auth FROM auth.users WHERE email = 'citymedical@ehealth.demo';
  SELECT id INTO v_dx_auth FROM auth.users WHERE email = 'populardiag@ehealth.demo';

  -- Fallback generated UUIDs if not yet created in auth.users (for offline SQL test environments)
  IF v_p1_auth IS NULL THEN v_p1_auth := '11111111-1111-1111-1111-111111111101'; END IF;
  IF v_p2_auth IS NULL THEN v_p2_auth := '11111111-1111-1111-1111-111111111102'; END IF;
  IF v_p3_auth IS NULL THEN v_p3_auth := '11111111-1111-1111-1111-111111111103'; END IF;
  IF v_d1_auth IS NULL THEN v_d1_auth := '11111111-1111-1111-1111-111111111104'; END IF;
  IF v_d2_auth IS NULL THEN v_d2_auth := '11111111-1111-1111-1111-111111111105'; END IF;
  IF v_d3_auth IS NULL THEN v_d3_auth := '11111111-1111-1111-1111-111111111106'; END IF;
  IF v_h1_auth IS NULL THEN v_h1_auth := '11111111-1111-1111-1111-111111111107'; END IF;
  IF v_h2_auth IS NULL THEN v_h2_auth := '11111111-1111-1111-1111-111111111108'; END IF;
  IF v_dx_auth IS NULL THEN v_dx_auth := '11111111-1111-1111-1111-111111111109'; END IF;

  -- ─────────────────────────────────────────────────────────
  -- 2. INSERT PROFILES
  -- ─────────────────────────────────────────────────────────
  INSERT INTO profiles (auth_user_id, role, full_name, email, phone, date_of_birth, gender, blood_group, address)
  VALUES
    (v_p1_auth, 'patient',     'Rafiq Ahmed',          'patient1@ehealth.demo',     '+8801711234567', '1985-03-15', 'male',   'B+',  'House 12, Road 5, Dhanmondi, Dhaka'),
    (v_p2_auth, 'patient',     'Fatema Begum',          'patient2@ehealth.demo',     '+8801812345678', '1990-07-22', 'female', 'A+',  'Flat 3B, Gulshan Tower, Gulshan-2, Dhaka'),
    (v_p3_auth, 'patient',     'Kamal Hossain',         'patient3@ehealth.demo',     '+8801612345678', '1978-11-08', 'male',   'O+',  '45/A Agrabad C/A, Chittagong'),
    (v_d1_auth, 'doctor',      'Dr. Sarah Rahman',      'dr.rahman@ehealth.demo',    '+8801911234567', '1980-05-10', 'female', NULL,  'Chamber: Green Care Hospital, Dhaka'),
    (v_d2_auth, 'doctor',      'Dr. Imran Khan',        'dr.khan@ehealth.demo',      '+8801511234567', '1975-01-20', 'male',   NULL,  'Chamber: City Medical Center, Dhaka'),
    (v_d3_auth, 'doctor',      'Dr. Nusrat Chowdhury',  'dr.chowdhury@ehealth.demo', '+8801311234567', '1982-09-03', 'female', NULL,  'Chamber: Green Care Hospital, Dhaka'),
    (v_h1_auth, 'hospital',    'Green Care Hospital',   'greencare@ehealth.demo',    '+8802123456789', NULL,         NULL,     NULL,  'Green Road, Dhanmondi, Dhaka-1205'),
    (v_h2_auth, 'hospital',    'City Medical Center',   'citymedical@ehealth.demo',  '+8802234567890', NULL,         NULL,     NULL,  'Mirpur Road, Dhaka-1216'),
    (v_dx_auth, 'diagnostics', 'Popular Diagnostics',   'populardiag@ehealth.demo',  '+8802345678901', NULL,         NULL,     NULL,  'Dhanmondi 27, Dhaka-1209')
  ON CONFLICT (auth_user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  SELECT id INTO v_p1_id FROM profiles WHERE email = 'patient1@ehealth.demo';
  SELECT id INTO v_p2_id FROM profiles WHERE email = 'patient2@ehealth.demo';
  SELECT id INTO v_p3_id FROM profiles WHERE email = 'patient3@ehealth.demo';
  SELECT id INTO v_d1_id FROM profiles WHERE email = 'dr.rahman@ehealth.demo';
  SELECT id INTO v_d2_id FROM profiles WHERE email = 'dr.khan@ehealth.demo';
  SELECT id INTO v_d3_id FROM profiles WHERE email = 'dr.chowdhury@ehealth.demo';
  SELECT id INTO v_h1_id FROM profiles WHERE email = 'greencare@ehealth.demo';
  SELECT id INTO v_h2_id FROM profiles WHERE email = 'citymedical@ehealth.demo';
  SELECT id INTO v_dx_id FROM profiles WHERE email = 'populardiag@ehealth.demo';

  -- ─────────────────────────────────────────────────────────
  -- 3. INSERT ORGANIZATIONS
  -- ─────────────────────────────────────────────────────────
  INSERT INTO organizations (profile_id, name, type, address, phone, email, license_number, is_verified)
  VALUES
    (v_h1_id, 'Green Care Hospital', 'hospital',    'Green Road, Dhanmondi, Dhaka-1205', '+8802123456789', 'greencare@ehealth.demo',   'HOSP-DHK-2024-001', true),
    (v_h2_id, 'City Medical Center', 'hospital',    'Mirpur Road, Dhaka-1216',           '+8802234567890', 'citymedical@ehealth.demo', 'HOSP-DHK-2024-002', true),
    (v_dx_id, 'Popular Diagnostics', 'diagnostics', 'Dhanmondi 27, Dhaka-1209',          '+8802345678901', 'populardiag@ehealth.demo', 'DIAG-DHK-2024-001', true)
  ON CONFLICT (profile_id) DO UPDATE SET
    name = EXCLUDED.name,
    license_number = EXCLUDED.license_number;

  SELECT id INTO v_h1_org FROM organizations WHERE profile_id = v_h1_id;
  SELECT id INTO v_h2_org FROM organizations WHERE profile_id = v_h2_id;
  SELECT id INTO v_dx_org FROM organizations WHERE profile_id = v_dx_id;

  -- ─────────────────────────────────────────────────────────
  -- 4. INSERT DOCTOR & PATIENT PROFILES
  -- ─────────────────────────────────────────────────────────
  INSERT INTO doctor_profiles (profile_id, organization_id, specialization, license_number, qualification, years_of_experience, bio)
  VALUES
    (v_d1_id, v_h1_org, 'Internal Medicine', 'BMDC-2010-12345', 'MBBS, FCPS (Medicine)',    16, 'Specialist in internal medicine with expertise in hypertension and diabetes.'),
    (v_d2_id, v_h2_org, 'Cardiology',        'BMDC-2005-67890', 'MBBS, MD (Cardiology)',    21, 'Senior cardiologist specializing in coronary artery disease and heart failure.'),
    (v_d3_id, v_h1_org, 'Endocrinology',     'BMDC-2012-11111', 'MBBS, MRCP (UK)',          14, 'Endocrinologist focusing on thyroid disorders and metabolic wellness.')
  ON CONFLICT (profile_id) DO UPDATE SET
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number;

  INSERT INTO patient_profiles (profile_id, patient_identifier, emergency_contact, blood_group, allergies)
  VALUES
    (v_p1_id, 'P-9824F1A2', '+8801711111111 (Wife - Nasreen)', 'B+',  'Penicillin'),
    (v_p2_id, 'P-7741C3B8', '+8801822222222 (Husband - Karim)', 'A+',  'No known allergies'),
    (v_p3_id, 'P-3319E5D4', '+8801633333333 (Son - Tanvir)',   'O+',  'Sulfa drugs, Aspirin')
  ON CONFLICT (profile_id) DO UPDATE SET
    emergency_contact = EXCLUDED.emergency_contact,
    allergies = EXCLUDED.allergies;

  -- ─────────────────────────────────────────────────────────
  -- 5. ESTABLISH EXPLICIT ACTIVE PATIENT-PROVIDER RELATIONSHIPS
  -- (Required before any provider can view or insert patient records)
  -- ─────────────────────────────────────────────────────────
  INSERT INTO patient_provider_relationships (patient_profile_id, provider_profile_id, provider_type, organization_id, status, granted_by)
  VALUES
    -- Patient 1 relationships
    (v_p1_id, v_d1_id, 'doctor',      v_h1_org, 'active', v_p1_id),
    (v_p1_id, v_d2_id, 'doctor',      v_h2_org, 'active', v_p1_id),
    (v_p1_id, v_h1_id, 'hospital',    v_h1_org, 'active', v_p1_id),
    (v_p1_id, v_dx_id, 'diagnostics', v_dx_org, 'active', v_p1_id),

    -- Patient 2 relationships
    (v_p2_id, v_d1_id, 'doctor',      v_h1_org, 'active', v_p2_id),
    (v_p2_id, v_d3_id, 'doctor',      v_h1_org, 'active', v_p2_id),
    (v_p2_id, v_h1_id, 'hospital',    v_h1_org, 'active', v_p2_id),
    (v_p2_id, v_dx_id, 'diagnostics', v_dx_org, 'active', v_p2_id),

    -- Patient 3 relationships
    (v_p3_id, v_d2_id, 'doctor',      v_h2_org, 'active', v_p3_id),
    (v_p3_id, v_h2_id, 'hospital',    v_h2_org, 'active', v_p3_id)
  ON CONFLICT (patient_profile_id, provider_profile_id) DO UPDATE SET
    status = 'active';

  -- ─────────────────────────────────────────────────────────
  -- 6. INSERT CLINICAL HOSPITAL VISITS
  -- ─────────────────────────────────────────────────────────
  INSERT INTO hospital_visits (patient_id, hospital_id, doctor_id, visit_type, department, admission_date, discharge_date, reason, diagnosis_summary, notes, created_by)
  VALUES
    (v_p1_id, v_h1_org, v_d1_id, 'outpatient', 'Internal Medicine', '2026-08-03', NULL,
     'Blood pressure follow-up and clinical review',
     'Hypertension Stage 1 — stable control on current medication.',
     'Advised low sodium diet. Home BP log reviewed.', v_h1_id)
  RETURNING id INTO v_visit1;

  INSERT INTO hospital_visits (patient_id, hospital_id, doctor_id, visit_type, department, admission_date, discharge_date, reason, diagnosis_summary, notes, created_by)
  VALUES
    (v_p2_id, v_h1_org, v_d1_id, 'inpatient', 'Internal Medicine', '2026-07-20', '2026-07-23',
     'Acute viral gastroenteritis with moderate dehydration',
     'Acute viral gastroenteritis resolved. IV rehydration completed. Stable on discharge.',
     'Tolerating oral intake. Discharged with oral probiotics and rehydration salts.', v_h1_id)
  RETURNING id INTO v_visit2;

  -- ─────────────────────────────────────────────────────────
  -- 7. INSERT PRESCRIPTIONS
  -- ─────────────────────────────────────────────────────────
  INSERT INTO prescriptions (patient_id, doctor_id, hospital_id, prescription_date, diagnosis, clinical_notes, medications, instructions, created_by)
  VALUES
    (v_p1_id, v_d1_id, v_h1_org, '2026-08-03', 'Hypertension Stage 1',
     'BP recorded at 132/84 mmHg. Well tolerated regimen.',
     '[{"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "3 months", "instructions": "Take in morning after breakfast"},
       {"name": "Losartan Potassium", "dosage": "50mg", "frequency": "Once daily", "duration": "3 months", "instructions": "Take at night"}]'::jsonb,
     'Check BP twice weekly. Follow up in 3 months with repeat lipid profile.', v_d1_id)
  RETURNING id INTO v_presc1;

  INSERT INTO prescriptions (patient_id, doctor_id, hospital_id, prescription_date, diagnosis, clinical_notes, medications, instructions, created_by)
  VALUES
    (v_p1_id, v_d2_id, v_h2_org, '2026-07-15', 'Dyslipidemia',
     'Elevated LDL-C. Target LDL < 100 mg/dL.',
     '[{"name": "Atorvastatin", "dosage": "10mg", "frequency": "Once daily at bedtime", "duration": "6 months", "instructions": "Take at night"},
       {"name": "Omega-3 Triglycerides", "dosage": "1000mg", "frequency": "Once daily", "duration": "6 months", "instructions": "Take with lunch"}]'::jsonb,
     '30 minutes brisk walking daily. Reduce saturated fat intake.', v_d2_id)
  RETURNING id INTO v_presc2;

  INSERT INTO prescriptions (patient_id, doctor_id, hospital_id, prescription_date, diagnosis, clinical_notes, medications, instructions, created_by)
  VALUES
    (v_p2_id, v_d3_id, v_h1_org, '2026-08-10', 'Subclinical Hypothyroidism',
     'TSH 5.8 mIU/L. Symptomatic lethargy.',
     '[{"name": "Levothyroxine Sodium", "dosage": "25mcg", "frequency": "Once daily", "duration": "6 weeks", "instructions": "Take 30 min before breakfast with plain water"}]'::jsonb,
     'Do not take with calcium/iron within 4 hours. Recheck TSH in 6 weeks.', v_d3_id)
  RETURNING id INTO v_presc3;

  -- ─────────────────────────────────────────────────────────
  -- 8. INSERT DIAGNOSTIC REPORTS
  -- ─────────────────────────────────────────────────────────
  INSERT INTO diagnostic_reports (patient_id, diagnostics_organization_id, doctor_id, test_name, test_category, report_date, summary, doctor_notes, created_by)
  VALUES
    (v_p1_id, v_dx_org, v_d1_id, 'Complete Blood Count (CBC)', 'Hematology', '2026-08-01',
     'Hb: 14.2 g/dL (Normal: 13-17). WBC: 7,200/μL. Platelet: 250,000/μL. ESR: 12 mm/1st hr. Normal cellular morphology.',
     'All hematological parameters within expected physiological limits.', v_dx_id)
  RETURNING id INTO v_diag1;

  INSERT INTO diagnostic_reports (patient_id, diagnostics_organization_id, doctor_id, test_name, test_category, report_date, summary, doctor_notes, created_by)
  VALUES
    (v_p1_id, v_dx_org, v_d2_id, 'Lipid Profile (Fasting)', 'Biochemistry', '2026-07-14',
     'Total Cholesterol: 242 mg/dL (High). LDL-C: 165 mg/dL (High). HDL-C: 42 mg/dL. Triglycerides: 175 mg/dL.',
     'Moderate cardiovascular risk profile. Statin therapy recommended.', v_dx_id)
  RETURNING id INTO v_diag2;

  INSERT INTO diagnostic_reports (patient_id, diagnostics_organization_id, doctor_id, test_name, test_category, report_date, summary, doctor_notes, created_by)
  VALUES
    (v_p2_id, v_dx_org, v_d3_id, 'Thyroid Function Test (TSH, FT4)', 'Endocrinology', '2026-08-08',
     'Serum TSH: 5.8 mIU/L (High, Ref: 0.4-4.0). Free T4: 1.15 ng/dL (Normal). Free T3: 3.1 pg/mL (Normal).',
     'Pattern indicative of subclinical hypothyroidism.', v_dx_id)
  RETURNING id INTO v_diag3;

  -- ─────────────────────────────────────────────────────────
  -- 9. POPULATE UNIFIED MEDICAL RECORDS TIMELINE
  -- ─────────────────────────────────────────────────────────
  DELETE FROM medical_records WHERE patient_id IN (v_p1_id, v_p2_id, v_p3_id);

  INSERT INTO medical_records (patient_id, record_type, record_reference_id, record_date, title, summary, provider_name, organization_name, created_by)
  VALUES
    -- Patient 1 records
    (v_p1_id, 'prescription',      v_presc1, '2026-08-03', 'Prescription — Hypertension Stage 1', 'Amlodipine 5mg, Losartan 50mg', 'Dr. Sarah Rahman', 'Green Care Hospital', v_d1_id),
    (v_p1_id, 'hospital_visit',    v_visit1, '2026-08-03', 'Hospital Visit — Internal Medicine', 'Blood pressure follow-up and clinical review', 'Dr. Sarah Rahman', 'Green Care Hospital', v_h1_id),
    (v_p1_id, 'diagnostic_report', v_diag1,  '2026-08-01', 'Complete Blood Count (CBC)', 'Hb 14.2 g/dL, WBC 7,200/μL. Normal panel.', 'Dr. Sarah Rahman', 'Popular Diagnostics', v_dx_id),
    (v_p1_id, 'prescription',      v_presc2, '2026-07-15', 'Prescription — Dyslipidemia', 'Atorvastatin 10mg, Omega-3', 'Dr. Imran Khan', 'City Medical Center', v_d2_id),
    (v_p1_id, 'diagnostic_report', v_diag2,  '2026-07-14', 'Lipid Profile (Fasting)', 'Total Chol 242 mg/dL, LDL 165 mg/dL', 'Dr. Imran Khan', 'Popular Diagnostics', v_dx_id),

    -- Patient 2 records
    (v_p2_id, 'prescription',      v_presc3, '2026-08-10', 'Prescription — Subclinical Hypothyroidism', 'Levothyroxine 25mcg daily', 'Dr. Nusrat Chowdhury', 'Green Care Hospital', v_d3_id),
    (v_p2_id, 'diagnostic_report', v_diag3,  '2026-08-08', 'Thyroid Function Test (TSH, FT4)', 'Serum TSH: 5.8 mIU/L (Mildly Elevated)', 'Dr. Nusrat Chowdhury', 'Popular Diagnostics', v_dx_id),
    (v_p2_id, 'hospital_visit',    v_visit2, '2026-07-20', 'Hospital Admission — Gastroenterology', 'Acute viral gastroenteritis resolved. IV rehydration.', 'Dr. Sarah Rahman', 'Green Care Hospital', v_h1_id);

END $$;
