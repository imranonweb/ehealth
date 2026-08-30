import { supabase } from '../lib/supabase';

/**
 * patientIdentityService
 *
 * Canonical service for all patient identity operations that cross the
 * registered/unregistered boundary. Uses SECURITY DEFINER RPCs to bypass
 * RLS for privileged operations (provider-only, caller validated server-side).
 */
export const patientIdentityService = {
  /**
   * Create a walk-in (unregistered) patient identity.
   * Only callable by authenticated providers (doctor/hospital/diagnostics).
   *
   * If an existing patient is found by exact phone or email, returns their
   * data with is_duplicate = true WITHOUT creating a new record.
   *
   * @param {object} data
   * @param {string} data.fullName           — Required
   * @param {string} [data.gender]           — 'male'|'female'|'other'|'prefer_not_to_say'
   * @param {string} [data.dateOfBirth]      — ISO date string "YYYY-MM-DD"
   * @param {string} [data.phone]            — Used for duplicate detection
   * @param {string} [data.email]            — Used for duplicate detection
   * @param {string} [data.bloodGroup]       — e.g. "A+"
   * @param {string} [data.emergencyContact] — Free text
   *
   * @returns {Promise<{
   *   profileId: string,
   *   patientIdentifier: string,
   *   isDuplicate: boolean,
   *   duplicateId: string|null
   * }>}
   */
  async createPatientIdentity(data) {
    const { data: rows, error } = await supabase.rpc('create_patient_identity', {
      p_full_name:          data.fullName?.trim() || '',
      p_gender:             data.gender || null,
      p_date_of_birth:      data.dateOfBirth || null,
      p_phone:              data.phone?.trim() || null,
      p_email:              data.email?.trim().toLowerCase() || null,
      p_blood_group:        data.bloodGroup?.trim() || null,
      p_emergency_contact:  data.emergencyContact?.trim() || null,
    });

    if (error) {
      console.error('[patientIdentityService] createPatientIdentity error:', error);
      throw new Error(error.message || 'Failed to create patient identity.');
    }

    if (!rows || rows.length === 0) {
      throw new Error('No result returned from create_patient_identity RPC.');
    }

    const row = rows[0];
    return {
      profileId:         row.profile_id,
      patientIdentifier: row.patient_identifier,
      isDuplicate:       row.is_duplicate,
      duplicateId:       row.duplicate_id || null,
    };
  },

  /**
   * Search for patients — works for both registered and unregistered patients.
   * Delegates to searchService.searchPatients which uses the SECURITY DEFINER RPC.
   *
   * Kept here for conceptual grouping; actual implementation in searchService.
   */
  searchPatients: null,  // Assigned after import to avoid circular dependency

  /**
   * Get a patient's full profile by their profile UUID.
   * Works for both registered and unregistered patients (via SECURITY DEFINER
   * path if needed, or direct query if a relationship already exists).
   *
   * @param {string} profileId — profiles.id UUID
   * @returns {Promise<object|null>}
   */
  async getPatientProfile(profileId) {
    if (!profileId) return null;

    // Try direct query (succeeds if relationship already exists via RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        gender,
        date_of_birth,
        auth_user_id,
        patient_profiles (
          patient_identifier,
          blood_group,
          allergies,
          emergency_contact,
          is_registered,
          registered_at
        )
      `)
      .eq('id', profileId)
      .eq('role', 'patient')
      .maybeSingle();

    if (!error && data) {
      const pp = data.patient_profiles?.[0] || data.patient_profiles || null;
      return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        auth_user_id: data.auth_user_id,
        patient_identifier: pp?.patient_identifier || null,
        blood_group: pp?.blood_group || null,
        allergies: pp?.allergies || null,
        emergency_contact: pp?.emergency_contact || null,
        is_registered: pp?.is_registered ?? true,
        registered_at: pp?.registered_at || null,
      };
    }

    // Fallback: try via patient_profiles table directly
    const { data: pp } = await supabase
      .from('patient_profiles')
      .select(`
        patient_identifier,
        blood_group,
        allergies,
        emergency_contact,
        is_registered,
        registered_at,
        profile:profile_id (
          id, full_name, email, phone, gender, date_of_birth, auth_user_id
        )
      `)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (pp?.profile) {
      const p = pp.profile;
      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        gender: p.gender,
        date_of_birth: p.date_of_birth,
        auth_user_id: p.auth_user_id,
        patient_identifier: pp.patient_identifier,
        blood_group: pp.blood_group,
        allergies: pp.allergies,
        emergency_contact: pp.emergency_contact,
        is_registered: pp.is_registered ?? true,
        registered_at: pp.registered_at,
      };
    }

    return null;
  },
};
