import { supabase } from '../lib/supabase';

export const prescriptionService = {
  /**
   * Create a new prescription.
   */
  async createPrescription(prescriptionData) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const payload = {
      ...prescriptionData,
      doctor_id: prescriptionData.doctor_id || profile.id,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Create unified timeline entry
    await supabase.from('medical_records').insert([{
      patient_id: data.patient_id,
      record_type: 'prescription',
      record_reference_id: data.id,
      record_date: data.prescription_date,
      title: `Prescription — ${data.diagnosis || 'General'}`,
      summary: data.clinical_notes || data.instructions,
      provider_name: profile.full_name || '',
      organization_name: prescriptionData.hospital_name || '',
    }]);

    // Ensure provider-patient relationship
    await ensureRelationship(data.patient_id, profile.id, 'doctor', prescriptionData.hospital_id);

    return data;
  },

  /**
   * Get prescriptions created by the current doctor.
   */
  async getMyPrescriptions({ page = 1, perPage = 20 } = {}) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data, error, count } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        hospital:hospital_id(id, name)
      `, { count: 'exact' })
      .eq('doctor_id', profile.id)
      .order('prescription_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { prescriptions: data || [], total: count || 0 };
  },

  /**
   * Get prescriptions for a specific patient.
   */
  async getPatientPrescriptions(patientId, { page = 1, perPage = 20 } = {}) {
    const { data, error, count } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctor_id(id, full_name),
        hospital:hospital_id(id, name)
      `, { count: 'exact' })
      .eq('patient_id', patientId)
      .order('prescription_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { prescriptions: data || [], total: count || 0 };
  },

  /**
   * Get a single prescription by ID.
   */
  async getPrescriptionById(id) {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name, email),
        hospital:hospital_id(id, name),
        ai_extraction:prescription_ai_extractions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

async function ensureRelationship(patientId, providerId, providerType, orgId = null) {
  const { data: existing } = await supabase
    .from('patient_provider_relationships')
    .select('id')
    .eq('patient_profile_id', patientId)
    .eq('provider_profile_id', providerId)
    .single();

  if (!existing) {
    await supabase.from('patient_provider_relationships').insert([{
      patient_profile_id: patientId,
      provider_profile_id: providerId,
      provider_type: providerType,
      organization_id: orgId,
      status: 'active',
    }]);
  }
}
