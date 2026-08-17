-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Demo Seed Data
-- ═══════════════════════════════════════════════════════════
--
-- IMPORTANT: Before running this seed, you must create the
-- corresponding auth.users in Supabase Auth (Dashboard or API).
--
-- Demo accounts to create in Supabase Auth:
--
-- | Email                        | Password      | Role        |
-- |------------------------------|---------------|-------------|
-- | patient1@ehealth.demo        | Demo@12345    | patient     |
-- | patient2@ehealth.demo        | Demo@12345    | patient     |
-- | patient3@ehealth.demo        | Demo@12345    | patient     |
-- | dr.rahman@ehealth.demo       | Demo@12345    | doctor      |
-- | dr.khan@ehealth.demo         | Demo@12345    | doctor      |
-- | dr.chowdhury@ehealth.demo    | Demo@12345    | doctor      |
-- | greencare@ehealth.demo       | Demo@12345    | hospital    |
-- | citymedical@ehealth.demo     | Demo@12345    | hospital    |
-- | populardiag@ehealth.demo     | Demo@12345    | diagnostics |
--
-- After creating auth users, replace the UUIDs below with
-- the actual auth.users UUIDs from your Supabase project.
-- ═══════════════════════════════════════════════════════════

-- ─── Placeholder UUIDs (replace with real auth user IDs) ───
-- Patient 1
DO $$
DECLARE
  p1_auth UUID := '00000000-0000-0000-0000-000000000001';
  p2_auth UUID := '00000000-0000-0000-0000-000000000002';
  p3_auth UUID := '00000000-0000-0000-0000-000000000003';
  d1_auth UUID := '00000000-0000-0000-0000-000000000004';
  d2_auth UUID := '00000000-0000-0000-0000-000000000005';
  d3_auth UUID := '00000000-0000-0000-0000-000000000006';
  h1_auth UUID := '00000000-0000-0000-0000-000000000007';
  h2_auth UUID := '00000000-0000-0000-0000-000000000008';
  dx_auth UUID := '00000000-0000-0000-0000-000000000009';

  -- Profile IDs
  p1_id UUID; p2_id UUID; p3_id UUID;
  d1_id UUID; d2_id UUID; d3_id UUID;
  h1_id UUID; h2_id UUID; dx_id UUID;

  -- Organization IDs
  h1_org UUID; h2_org UUID; dx_org UUID;

  -- Patient profile IDs
  pp1_id UUID; pp2_id UUID; pp3_id UUID;

BEGIN
  -- ─── PROFILES ────────────────────────────────────────
  INSERT INTO profiles (auth_user_id, role, full_name, email, phone, date_of_birth, gender, blood_group, address)
  VALUES
    (p1_auth, 'patient', 'Rafiq Ahmed',     'patient1@ehealth.demo',     '+8801711234567', '1985-03-15', 'male',   'B+',  'House 12, Road 5, Dhanmondi, Dhaka'),
    (p2_auth, 'patient', 'Fatema Begum',     'patient2@ehealth.demo',     '+8801812345678', '1990-07-22', 'female', 'A+',  'Flat 3B, Gulshan Tower, Gulshan-2, Dhaka'),
    (p3_auth, 'patient', 'Kamal Hossain',    'patient3@ehealth.demo',     '+8801612345678', '1978-11-08', 'male',   'O+',  '45/A Agrabad C/A, Chittagong'),
    (d1_auth, 'doctor',  'Dr. Sarah Rahman', 'dr.rahman@ehealth.demo',    '+8801911234567', '1980-05-10', 'female', NULL,  'Chamber: Green Care Hospital, Dhaka'),
    (d2_auth, 'doctor',  'Dr. Imran Khan',   'dr.khan@ehealth.demo',      '+8801511234567', '1975-01-20', 'male',   NULL,  'Chamber: City Medical Center, Dhaka'),
    (d3_auth, 'doctor',  'Dr. Nusrat Chowdhury', 'dr.chowdhury@ehealth.demo', '+8801311234567', '1982-09-03', 'female', NULL, 'Chamber: Green Care Hospital, Dhaka'),
    (h1_auth, 'hospital','Green Care Hospital', 'greencare@ehealth.demo', '+8802123456789', NULL, NULL, NULL, 'Green Road, Dhanmondi, Dhaka-1205'),
    (h2_auth, 'hospital','City Medical Center',  'citymedical@ehealth.demo', '+8802234567890', NULL, NULL, NULL, 'Mirpur Road, Dhaka-1216'),
    (dx_auth, 'diagnostics', 'Popular Diagnostics', 'populardiag@ehealth.demo', '+8802345678901', NULL, NULL, NULL, 'Dhanmondi 27, Dhaka-1209')
  RETURNING id INTO p1_id;

  -- Get all profile IDs
  SELECT id INTO p1_id FROM profiles WHERE auth_user_id = p1_auth;
  SELECT id INTO p2_id FROM profiles WHERE auth_user_id = p2_auth;
  SELECT id INTO p3_id FROM profiles WHERE auth_user_id = p3_auth;
  SELECT id INTO d1_id FROM profiles WHERE auth_user_id = d1_auth;
  SELECT id INTO d2_id FROM profiles WHERE auth_user_id = d2_auth;
  SELECT id INTO d3_id FROM profiles WHERE auth_user_id = d3_auth;
  SELECT id INTO h1_id FROM profiles WHERE auth_user_id = h1_auth;
  SELECT id INTO h2_id FROM profiles WHERE auth_user_id = h2_auth;
  SELECT id INTO dx_id FROM profiles WHERE auth_user_id = dx_auth;

  -- ─── ORGANIZATIONS ──────────────────────────────────
  INSERT INTO organizations (profile_id, name, type, address, phone, email, license_number)
  VALUES
    (h1_id, 'Green Care Hospital',  'hospital',    'Green Road, Dhanmondi, Dhaka-1205', '+8802123456789', 'greencare@ehealth.demo', 'HOSP-DHK-2024-001'),
    (h2_id, 'City Medical Center',  'hospital',    'Mirpur Road, Dhaka-1216',           '+8802234567890', 'citymedical@ehealth.demo', 'HOSP-DHK-2024-002'),
    (dx_id, 'Popular Diagnostics',  'diagnostics', 'Dhanmondi 27, Dhaka-1209',          '+8802345678901', 'populardiag@ehealth.demo', 'DIAG-DHK-2024-001');

  SELECT id INTO h1_org FROM organizations WHERE profile_id = h1_id;
  SELECT id INTO h2_org FROM organizations WHERE profile_id = h2_id;
  SELECT id INTO dx_org FROM organizations WHERE profile_id = dx_id;

  -- ─── DOCTOR PROFILES ────────────────────────────────
  INSERT INTO doctor_profiles (profile_id, organization_id, specialization, license_number, qualification, years_of_experience, bio)
  VALUES
    (d1_id, h1_org, 'Internal Medicine',  'BMDC-2010-12345', 'MBBS, FCPS (Medicine)',     16, 'Specialist in internal medicine with expertise in hypertension and diabetes management.'),
    (d2_id, h2_org, 'Cardiology',         'BMDC-2005-67890', 'MBBS, MD (Cardiology)',     21, 'Senior cardiologist specializing in interventional cardiology and heart failure management.'),
    (d3_id, h1_org, 'Endocrinology',      'BMDC-2012-11111', 'MBBS, MRCP, Fellowship',   14, 'Endocrinologist focusing on thyroid disorders and metabolic diseases.');

  -- ─── PATIENT PROFILES ───────────────────────────────
  INSERT INTO patient_profiles (profile_id, emergency_contact, blood_group, allergies)
  VALUES
    (p1_id, '+8801711111111 (Wife - Nasreen)', 'B+', 'Penicillin'),
    (p2_id, '+8801822222222 (Husband - Karim)', 'A+', NULL),
    (p3_id, '+8801633333333 (Son - Tanvir)', 'O+', 'Sulfa drugs, Aspirin');

  SELECT id INTO pp1_id FROM patient_profiles WHERE profile_id = p1_id;
  SELECT id INTO pp2_id FROM patient_profiles WHERE profile_id = p2_id;
  SELECT id INTO pp3_id FROM patient_profiles WHERE profile_id = p3_id;

  -- ─── PATIENT-PROVIDER RELATIONSHIPS ─────────────────
  INSERT INTO patient_provider_relationships (patient_profile_id, provider_profile_id, provider_type, organization_id, status)
  VALUES
    (p1_id, d1_id, 'doctor', h1_org, 'active'),
    (p1_id, d2_id, 'doctor', h2_org, 'active'),
    (p1_id, h1_id, 'hospital', h1_org, 'active'),
    (p1_id, dx_id, 'diagnostics', dx_org, 'active'),
    (p2_id, d1_id, 'doctor', h1_org, 'active'),
    (p2_id, d3_id, 'doctor', h1_org, 'active'),
    (p2_id, h1_id, 'hospital', h1_org, 'active'),
    (p2_id, dx_id, 'diagnostics', dx_org, 'active'),
    (p3_id, d2_id, 'doctor', h2_org, 'active'),
    (p3_id, h2_id, 'hospital', h2_org, 'active');

  -- ─── HOSPITAL VISITS ────────────────────────────────
  INSERT INTO hospital_visits (patient_id, hospital_id, doctor_id, visit_type, department, admission_date, discharge_date, reason, diagnosis_summary, notes, created_by)
  VALUES
    (p1_id, h1_org, d1_id, 'outpatient', 'Internal Medicine', '2026-08-03', NULL, 'Routine checkup and blood pressure follow-up', 'Hypertension Stage 1 — well controlled on current medication. Continue Amlodipine 5mg.', 'Patient reports improved diet compliance. BP readings at home averaging 130/85.', h1_id),
    (p1_id, h2_org, d2_id, 'outpatient', 'Cardiology',        '2026-07-15', NULL, 'Annual cardiac evaluation', 'Normal sinus rhythm. No significant cardiac abnormalities on ECG. Lipid profile mildly elevated.', 'Advised dietary modification and follow-up lipid panel in 3 months.', h2_id),
    (p2_id, h1_org, d1_id, 'inpatient',  'Internal Medicine', '2026-07-20', '2026-07-23', 'Acute gastroenteritis with dehydration', 'Acute viral gastroenteritis. IV rehydration completed. Discharged stable.', 'Patient responded well to IV fluids and antiemetics. Oral intake restored by day 2.', h1_id),
    (p2_id, h1_org, d3_id, 'outpatient', 'Endocrinology',     '2026-08-10', NULL, 'Thyroid function review', 'Subclinical hypothyroidism. TSH mildly elevated at 5.8 mIU/L.', 'Started on low-dose Levothyroxine 25mcg. Recheck TSH in 6 weeks.', h1_id),
    (p3_id, h2_org, d2_id, 'emergency',  'Emergency',         '2026-06-28', '2026-06-30', 'Chest pain — rule out MI', 'Non-cardiac chest pain. Troponin negative. Likely musculoskeletal.', 'Cardiac workup negative. Discharged with analgesics and follow-up.', h2_id);

  -- ─── PRESCRIPTIONS ──────────────────────────────────
  INSERT INTO prescriptions (patient_id, doctor_id, hospital_id, prescription_date, diagnosis, clinical_notes, medications, instructions, created_by)
  VALUES
    (p1_id, d1_id, h1_org, '2026-08-03', 'Hypertension Stage 1', 'BP controlled. Continue current regimen.',
     '[{"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "3 months", "instructions": "Take in the morning with water"},
       {"name": "Losartan", "dosage": "50mg", "frequency": "Once daily", "duration": "3 months", "instructions": "Take in the evening"}]'::jsonb,
     'Monitor BP daily at home. Low sodium diet. Follow-up in 3 months.', d1_id),

    (p1_id, d2_id, h2_org, '2026-07-15', 'Dyslipidemia', 'Lipid panel shows elevated LDL. Starting statin therapy.',
     '[{"name": "Atorvastatin", "dosage": "10mg", "frequency": "Once daily at bedtime", "duration": "6 months", "instructions": "Take at night before sleep"},
       {"name": "Omega-3 Fish Oil", "dosage": "1000mg", "frequency": "Once daily", "duration": "6 months", "instructions": "Take with meal"}]'::jsonb,
     'Avoid fatty foods. Regular exercise 30 minutes daily. Repeat lipid profile in 3 months.', d2_id),

    (p2_id, d1_id, h1_org, '2026-07-23', 'Acute Viral Gastroenteritis (resolved)', 'Post-discharge prescription. Patient stable.',
     '[{"name": "Domperidone", "dosage": "10mg", "frequency": "Three times daily before meals", "duration": "5 days", "instructions": "Take 30 minutes before eating"},
       {"name": "Oral Rehydration Salt", "dosage": "1 sachet", "frequency": "After each loose stool", "duration": "As needed", "instructions": "Dissolve in 500ml clean water"},
       {"name": "Probiotics", "dosage": "1 capsule", "frequency": "Twice daily", "duration": "14 days", "instructions": "Take with food"}]'::jsonb,
     'Bland diet for one week. Gradually reintroduce regular foods. Return if symptoms worsen.', d1_id),

    (p2_id, d3_id, h1_org, '2026-08-10', 'Subclinical Hypothyroidism', 'Initial thyroid management.',
     '[{"name": "Levothyroxine", "dosage": "25mcg", "frequency": "Once daily", "duration": "6 weeks", "instructions": "Take on empty stomach, 30 min before breakfast"}]'::jsonb,
     'Recheck TSH after 6 weeks. Do not take with calcium or iron supplements within 4 hours.', d3_id),

    (p3_id, d2_id, h2_org, '2026-06-30', 'Musculoskeletal Chest Pain', 'Non-cardiac. Discharge prescription.',
     '[{"name": "Naproxen", "dosage": "500mg", "frequency": "Twice daily with food", "duration": "7 days", "instructions": "Take with meals. Stop if stomach pain occurs."},
       {"name": "Omeprazole", "dosage": "20mg", "frequency": "Once daily", "duration": "7 days", "instructions": "Take 30 minutes before first meal"}]'::jsonb,
     'Rest from strenuous activity for 2 weeks. Return to ER if chest pain recurs or worsens.', d2_id);

  -- ─── DIAGNOSTIC REPORTS ─────────────────────────────
  INSERT INTO diagnostic_reports (patient_id, diagnostics_organization_id, doctor_id, test_name, test_category, report_date, summary, created_by)
  VALUES
    (p1_id, dx_org, d1_id, 'Complete Blood Count (CBC)', 'Hematology', '2026-08-01',
     'WBC: 7,200/μL (Normal). RBC: 5.1 million/μL (Normal). Hemoglobin: 14.2 g/dL (Normal). Platelet: 250,000/μL (Normal). All parameters within normal range.', dx_id),

    (p1_id, dx_org, d2_id, 'Lipid Profile', 'Biochemistry', '2026-07-14',
     'Total Cholesterol: 242 mg/dL (High). LDL: 165 mg/dL (High). HDL: 42 mg/dL (Low). Triglycerides: 175 mg/dL (Borderline High). Cardiovascular risk: Moderate.', dx_id),

    (p1_id, dx_org, d1_id, 'Fasting Blood Sugar', 'Biochemistry', '2026-08-01',
     'Fasting glucose: 98 mg/dL (Normal). HbA1c: 5.6% (Normal). No evidence of diabetes or pre-diabetes.', dx_id),

    (p2_id, dx_org, d3_id, 'Thyroid Function Test', 'Endocrinology', '2026-08-08',
     'TSH: 5.8 mIU/L (Mildly Elevated, Normal: 0.4–4.0). Free T4: 1.1 ng/dL (Normal). Free T3: 3.2 pg/mL (Normal). Consistent with subclinical hypothyroidism.', dx_id),

    (p2_id, dx_org, d1_id, 'Liver Function Test', 'Biochemistry', '2026-07-21',
     'ALT: 28 U/L (Normal). AST: 22 U/L (Normal). ALP: 78 U/L (Normal). Bilirubin Total: 0.8 mg/dL (Normal). Albumin: 4.2 g/dL (Normal). Normal hepatic function.', dx_id),

    (p3_id, dx_org, d2_id, 'Cardiac Troponin I', 'Cardiology', '2026-06-28',
     'Troponin I: <0.01 ng/mL (Normal, Reference: <0.04). Serial measurement at 0h and 6h both negative. No evidence of myocardial injury.', dx_id),

    (p3_id, dx_org, d2_id, 'ECG Report', 'Cardiology', '2026-06-28',
     'Normal sinus rhythm at 78 bpm. Normal axis. No ST-segment changes. No Q waves. Normal PR and QT intervals. No evidence of ischemia or arrhythmia.', dx_id);

  -- ─── MEDICAL RECORDS (unified timeline) ─────────────
  -- Hospital visits
  INSERT INTO medical_records (patient_id, record_type, record_reference_id, record_date, title, summary, provider_name, organization_name)
  SELECT patient_id, 'hospital_visit', id, admission_date, 
         'Hospital Visit — ' || COALESCE(department, 'General'),
         COALESCE(diagnosis_summary, reason),
         (SELECT full_name FROM profiles WHERE id = doctor_id),
         (SELECT name FROM organizations WHERE id = hospital_id)
  FROM hospital_visits;

  -- Prescriptions
  INSERT INTO medical_records (patient_id, record_type, record_reference_id, record_date, title, summary, provider_name, organization_name)
  SELECT patient_id, 'prescription', id, prescription_date,
         'Prescription — ' || COALESCE(diagnosis, 'General'),
         COALESCE(clinical_notes, instructions),
         (SELECT full_name FROM profiles WHERE id = doctor_id),
         (SELECT name FROM organizations WHERE id = hospital_id)
  FROM prescriptions;

  -- Diagnostic reports
  INSERT INTO medical_records (patient_id, record_type, record_reference_id, record_date, title, summary, provider_name, organization_name)
  SELECT patient_id, 'diagnostic_report', id, report_date,
         test_name,
         summary,
         (SELECT full_name FROM profiles WHERE id = doctor_id),
         (SELECT name FROM organizations WHERE id = diagnostics_organization_id)
  FROM diagnostic_reports;

END $$;
