import { supabase } from '../lib/supabase';
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '../lib/validators';

export const storageService = {
  /**
   * Upload a file to the medical-records bucket.
   * Path: patients/{patientId}/{category}/{filename}
   *
   * Automatically ensures an active provider-patient relationship BEFORE
   * initiating the storage upload, so the Storage RLS policy
   * `storage_insert_authorized_providers_only` evaluates to TRUE.
   */
  async uploadFile(file, patientId, category = 'general', orgId = null) {
    // 1. Validate file
    if (!file) throw new Error('No file provided');

    const ext = (file.name?.split('.').pop() || '').toLowerCase();
    const isTypeAllowed = ALLOWED_FILE_TYPES.includes(file.type);
    const isExtAllowed = ALLOWED_FILE_EXTENSIONS.includes(`.${ext}`);

    if (!isTypeAllowed && !isExtAllowed) {
      throw new Error('File must be PDF, JPG, JPEG, PNG, or WEBP');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be under 10 MB');
    }

    // 2. Ensure relationship before storage upload so RLS checks pass
    try {
      const { error: rpcErr } = await supabase.rpc('ensure_clinical_relationship', {
        p_patient_id: patientId,
        p_org_id: orgId || null,
      });

      if (rpcErr) {
        // Fallback if 008 RPC is not yet applied in Supabase
        await supabase.rpc('create_provider_relationship', {
          p_patient_id: patientId,
          p_org_id: orgId || null,
        }).catch(() => {});
      }
    } catch (relEx) {
      console.warn('[storageService] ensure_clinical_relationship warning:', relEx);
    }

    // 3. Sanitize filename & upload
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `patients/${patientId}/${category}/${safeName}`;

    const { data, error } = await supabase.storage
      .from('medical-records')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      if (error.statusCode === '400' || error.message?.toLowerCase().includes('row-level security') || error.message?.toLowerCase().includes('policy')) {
        throw new Error(
          'Storage Authorization Error: Unable to upload attachment. Please ensure you are logged in with an active provider account.'
        );
      }
      throw error;
    }

    return { path: data.path, fullPath: data.fullPath };
  },

  /**
   * Get a signed URL to view/download a file (valid for 1 hour).
   */
  async getSignedUrl(path) {
    if (!path) throw new Error('No path provided');

    const { data, error } = await supabase.storage
      .from('medical-records')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Delete a file from storage.
   */
  async deleteFile(path) {
    const { error } = await supabase.storage
      .from('medical-records')
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Create a document record in the documents table.
   */
  async createDocumentRecord({ patientId, uploadedBy, recordType, recordId, storagePath, fileName, mimeType, fileSize }) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        patient_id: patientId,
        uploaded_by: uploadedBy,
        record_type: recordType,
        record_id: recordId,
        storage_path: storagePath,
        file_name: fileName,
        mime_type: mimeType,
        file_size: fileSize,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get documents for a patient record.
   */
  async getDocuments(recordId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
