-- ═══════════════════════════════════════════════════════════
-- E-Health Platform — Migration 003: Storage Security Policies
-- ═══════════════════════════════════════════════════════════
-- Description: Private storage bucket configuration and immutable,
-- relationship-gated access policies for medical files.
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────
-- 1. CONFIGURE PRIVATE BUCKET
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
-- 2. STORAGE OBJECT ACCESS POLICIES (IMMUTABLE & RELATIONSHIP-GATED)
-- ───────────────────────────────────────────────────────────

-- Clean up any prior/stale policies
DROP POLICY IF EXISTS "storage_select_patient_own_files" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_authorized_providers" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_uploader" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_authorized_providers_only" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_uploader" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_uploader" ON storage.objects;

-- 1) Patient can read their own medical document files
-- (Path pattern: patients/<patient_profile_id>/<category>/<filename>)
CREATE POLICY "storage_select_patient_own_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.extract_patient_id_from_storage_path(name) = public.get_my_profile_id()
  );

-- 2) Providers can read medical documents ONLY if they have an active, non-expired relationship
-- (Note: Uploader ownership alone does NOT grant access if the relationship has been revoked)
CREATE POLICY "storage_select_authorized_providers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.is_provider_authorized_for_patient(public.extract_patient_id_from_storage_path(name))
  );

-- 3) Providers can upload files ONLY for patients they are authorized to treat
CREATE POLICY "storage_insert_authorized_providers_only"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-records'
    AND auth.uid() IS NOT NULL
    AND public.get_my_role() IN ('doctor', 'diagnostics', 'hospital')
    AND public.is_provider_authorized_for_patient(public.extract_patient_id_from_storage_path(name))
  );

-- NOTE: No Storage UPDATE or DELETE policies are granted.
-- Medical record files are strictly immutable after upload.
-- If corrections are needed, a new record/document must be authored.
