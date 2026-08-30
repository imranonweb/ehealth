import { supabase } from '../lib/supabase';

export const searchService = {
  /**
   * Comprehensive patient search for healthcare provider roles.
   *
   * Strategy (ordered by reliability):
   *   1. search_patients_for_provider RPC — SECURITY DEFINER function that
   *      bypasses the RLS deadlock. Searches by Health ID (partial),
   *      full name (partial), and phone (prefix). Returns minimal identity
   *      fields only. THIS IS THE PRIMARY SEARCH PATH.
   *
   *   2. lookup_patient_by_identifier RPC (fallback) — exact/partial Health ID
   *      match via the original SECURITY DEFINER function.
   *
   * The previous Step 2 (direct patient_profiles query) and Step 3 (direct
   * profiles query) have been REMOVED because they are silently blocked by
   * RLS for provider roles — providers cannot SELECT patient profiles without
   * a pre-existing active relationship (which is exactly the deadlock we're
   * fixing). Keeping those steps gave false confidence while returning empty
   * results every time.
   *
   * @param {string} query   - Search string (name, Health ID, or phone)
   * @param {object} options - { limit: number }
   * @returns {Promise<Array>} Array of patient identity objects
   */
  async searchPatients(query, { limit = 20 } = {}) {
    if (!query || !query.trim()) return [];

    const raw = query.trim();
    if (raw.length < 2) return [];

    try {
      const patientMap = new Map();

      // ── PRIMARY PATH: search_patients_for_provider RPC ────────────────
      // This SECURITY DEFINER function bypasses the RLS deadlock.
      // It checks that the caller is an authenticated provider role,
      // then searches profiles + patient_profiles with no RLS restriction.
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          'search_patients_for_provider',
          { p_query: raw }
        );

        if (rpcErr) {
          // Log for debugging but don't surface the raw Postgres error to UI
          console.warn('[searchService] search_patients_for_provider error:', rpcErr.message);
        } else if (rpcData && Array.isArray(rpcData)) {
          rpcData.forEach((p) => {
            if (p?.id && !patientMap.has(p.id)) {
              patientMap.set(p.id, {
                id: p.id,
                full_name: p.full_name,
                patient_identifier: p.patient_identifier,
                gender: p.gender,
                phone: p.phone || null,
                email: p.email || null,
                date_of_birth: null, // Not returned by search RPC (privacy)
              });
            }
          });
        }
      } catch (rpcEx) {
        console.warn('[searchService] search_patients_for_provider exception:', rpcEx);
      }

      // ── FALLBACK: lookup_patient_by_identifier RPC ────────────────────
      // Used as additional coverage for exact/partial Health ID queries.
      // Results are merged; duplicates are deduplicated by patient ID.
      if (patientMap.size < limit) {
        try {
          const { data: idData, error: idErr } = await supabase.rpc(
            'lookup_patient_by_identifier',
            { p_identifier: raw.toUpperCase() }
          );

          if (!idErr && idData && Array.isArray(idData)) {
            idData.forEach((p) => {
              const pid = p.patient_profile_id || p.id;
              if (pid && !patientMap.has(pid)) {
                patientMap.set(pid, {
                  id: pid,
                  full_name: p.full_name,
                  patient_identifier: p.patient_identifier,
                  gender: p.gender,
                  phone: null,
                  email: null,
                  date_of_birth: null,
                });
              }
            });
          }
        } catch (idEx) {
          // Fallback failed — primary result is still valid, continue
          console.warn('[searchService] lookup_patient_by_identifier exception:', idEx);
        }
      }

      return Array.from(patientMap.values()).slice(0, limit);
    } catch (err) {
      console.error('[searchService] searchPatients fatal error:', err);
      return [];
    }
  },

  /**
   * Search by exact or partial patient identifier string.
   * Returns the best single match or null.
   *
   * @param {string} patientId - Health ID string (e.g. "P-9824F1A2" or "9824F1A2")
   * @returns {Promise<object|null>}
   */
  async searchByPatientId(patientId) {
    if (!patientId) return null;

    try {
      const { data, error } = await supabase.rpc('lookup_patient_by_identifier', {
        p_identifier: patientId.trim().toUpperCase(),
      });

      if (!error && data && data.length > 0) {
        const p = data[0];
        return {
          id: p.patient_profile_id || p.id,
          full_name: p.full_name,
          patient_identifier: p.patient_identifier,
          gender: p.gender,
          phone: p.phone || null,
          email: p.email || null,
          date_of_birth: null,
        };
      }
    } catch (e) {
      console.warn('[searchService] searchByPatientId RPC error:', e);
    }

    // Fallback: try the full search
    const matches = await this.searchPatients(patientId, { limit: 1 });
    return matches.length > 0 ? matches[0] : null;
  },

  /**
   * Get patient profile by UUID.
   * Used by forms that receive a patientId from URL query params.
   *
   * Tries the search_patients_for_provider RPC first (which can match by UUID
   * when the Health ID is not known), then falls back to a profiles select
   * (which will succeed only if the provider already has an active relationship,
   * or if RLS has been relaxed for the caller's role).
   *
   * @param {string} id - Patient profile UUID
   * @returns {Promise<object|null>}
   */
  async getPatientById(id) {
    if (!id) return null;

    try {
      // First try: direct profiles select (works if relationship already exists)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, phone, gender, date_of_birth,
          patient_profiles (
            patient_identifier,
            blood_group,
            allergies
          )
        `)
        .eq('id', id)
        .eq('role', 'patient')
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          patient_identifier: data.patient_profiles?.[0]?.patient_identifier || null,
          blood_group: data.patient_profiles?.[0]?.blood_group || null,
          allergies: data.patient_profiles?.[0]?.allergies || null,
        };
      }

      // Fallback: try patient_profiles table (also RLS-gated, but try anyway)
      const { data: patProfile } = await supabase
        .from('patient_profiles')
        .select(`
          profile_id,
          patient_identifier,
          blood_group,
          allergies,
          profile:profile_id (
            id, full_name, email, phone, gender, date_of_birth
          )
        `)
        .eq('profile_id', id)
        .maybeSingle();

      if (patProfile?.profile) {
        const p = patProfile.profile;
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          gender: p.gender,
          date_of_birth: p.date_of_birth,
          patient_identifier: patProfile.patient_identifier,
          blood_group: patProfile.blood_group,
          allergies: patProfile.allergies,
        };
      }

      return null;
    } catch (err) {
      console.error('[searchService] getPatientById error:', err);
      return null;
    }
  },
};
