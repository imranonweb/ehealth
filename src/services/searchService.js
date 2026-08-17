import { supabase } from '../lib/supabase';

export const searchService = {
  /**
   * Search for patients by ID, email, or phone.
   * Returns minimal information to protect privacy.
   */
  async searchPatients(query, { limit = 10 } = {}) {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim();

    // Search by patient identifier, email, or phone
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, phone, gender, date_of_birth,
        patient_profiles!inner(patient_identifier)
      `)
      .eq('role', 'patient')
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(limit);

    if (error) throw error;
    return (data || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      gender: p.gender,
      date_of_birth: p.date_of_birth,
      patient_identifier: p.patient_profiles?.patient_identifier || null,
    }));
  },

  /**
   * Search by exact patient identifier.
   */
  async searchByPatientId(patientId) {
    if (!patientId) return null;

    const { data, error } = await supabase
      .from('patient_profiles')
      .select(`
        *,
        profile:profile_id(id, full_name, email, phone, gender, date_of_birth, blood_group)
      `)
      .eq('patient_identifier', patientId.trim())
      .single();

    if (error) return null;
    return data;
  },
};
