-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Storage Setup
-- Run AFTER 002_rls_policies.sql
-- ═══════════════════════════════════════════════════════════

-- Create a PRIVATE storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────────────
-- STORAGE POLICIES
-- ───────────────────────────────────────────────────────────

-- Providers can upload documents to patient folders
CREATE POLICY "Providers can upload medical documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND (
      SELECT role FROM profiles WHERE auth_user_id = auth.uid()
    ) IN ('doctor', 'diagnostics', 'hospital')
  );

-- Patients can read their own documents
CREATE POLICY "Patients can read own medical documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[2] = (
      SELECT id::text FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Providers can read documents for patients they treat
CREATE POLICY "Providers can read related patient documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM patient_provider_relationships ppr
      WHERE ppr.patient_profile_id::text = (storage.foldername(name))[2]
        AND ppr.provider_profile_id = (
          SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
        AND ppr.status = 'active'
    )
  );

-- Uploaders can read documents they uploaded
CREATE POLICY "Uploaders can read own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );
