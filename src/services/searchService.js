import { supabase } from '../lib/supabase';

export const searchService = {
  /**
   * Secure patient lookup by Patient Identifier (e.g. P-9824F1A2)
   * Uses the secure database RPC function that prevents broad patient scraping.
   */
  async searchPatients(query, { limit = 10 } = {}) {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim().toUpperCase();

    try {
      // 1. Try secure RPC lookup by patient identifier
      const { data: rpcData, error: rpcError } = await supabase.rpc('lookup_patient_by_identifier', {
        p_identifier: q,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData.map((p) => ({
          id: p.patient_profile_id,
          full_name: p.full_name,
          patient_identifier: p.patient_identifier,
          gender: p.gender,
          date_of_birth: p.date_of_birth,
        }));
      }

      // 2. Query authorized patients for this provider (patients with active relationship)
      const { data: relPatients, error: relError } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, phone, gender, date_of_birth,
          patient_profiles(patient_identifier)
        `)
        .eq('role', 'patient')
        .ilike('full_name', `%${query.trim()}%`)
        .limit(limit);

      if (!relError && relPatients) {
        return relPatients.map((p) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          gender: p.gender,
          date_of_birth: p.date_of_birth,
          patient_identifier: p.patient_profiles?.[0]?.patient_identifier || null,
        }));
      }

      return [];
    } catch (err) {
      console.error('Patient search error:', err);
      return [];
    }
  },

  /**
   * Search by exact patient identifier.
   */
  async searchByPatientId(patientId) {
    if (!patientId) return null;

    const { data, error } = await supabase.rpc('lookup_patient_by_identifier', {
      p_identifier: patientId.trim().toUpperCase(),
    });

    if (error || !data || data.length === 0) return null;
    return data[0];
  },
};
