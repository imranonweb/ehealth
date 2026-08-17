-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 003: Storage Security Policies
-- ═══════════════════════════════════════════════════════════
-- Description: Private storage bucket configuration and strict
-- object-level authorization policies for medical files.
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. CREATE PRIVATE BUCKET
-- ───────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false,                          -- Strictly private: requires authenticated signed URL
  10485760,                       -- 10 MB maximum file size
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];


-- ───────────────────────────────────────────────────────────
-- 2. STORAGE OBJECT ACCESS POLICIES
-- ───────────────────────────────────────────────────────────

-- 1) Patient can read their own medical document files
-- (Path pattern: patients/<patient_id>/<category>/<filename>)
CREATE POLICY "storage_select_patient_own_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.extract_patient_id_from_storage_path(name) = public.get_my_profile_id()
  );

-- 2) Providers can read medical documents ONLY for authorized patients
CREATE POLICY "storage_select_authorized_providers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.is_provider_authorized_for_patient(public.extract_patient_id_from_storage_path(name))
  );

-- 3) Uploader can always access files they uploaded
CREATE POLICY "storage_select_uploader"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );

-- 4) Providers can upload files ONLY for patients they are authorized to treat
CREATE POLICY "storage_insert_authorized_providers_only"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND public.is_provider_authorized_for_patient(public.extract_patient_id_from_storage_path(name))
  );

-- 5) Uploader can update their own uploaded files
CREATE POLICY "storage_update_uploader"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );

-- 6) Uploader can delete files they uploaded
CREATE POLICY "storage_delete_uploader"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );
