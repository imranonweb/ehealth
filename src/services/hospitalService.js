import { supabase } from '../lib/supabase';

export const hospitalService = {
  /**
   * Create a hospital visit record.
   */
  async createVisit(visitData) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('profile_id', profile.id)
      .single();

    if (!org) throw new Error('Organization not found for this user');

    const payload = {
      ...visitData,
      hospital_id: org.id,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('hospital_visits')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Create timeline entry
    await supabase.from('medical_records').insert([{
      patient_id: data.patient_id,
      record_type: 'hospital_visit',
      record_reference_id: data.id,
      record_date: data.admission_date,
      title: `Hospital Visit — ${data.department || 'General'}`,
      summary: data.diagnosis_summary || data.reason,
      provider_name: visitData.doctor_name || '',
      organization_name: org.name,
    }]);

    // Ensure relationship
    await ensureRelationship(data.patient_id, profile.id, 'hospital', org.id);

    return data;
  },

  /**
   * Create a hospital-based prescription.
   */
  async createPrescription(prescriptionData) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('profile_id', profile.id)
      .single();

    if (!org) throw new Error('Organization not found');

    const payload = {
      ...prescriptionData,
      hospital_id: org.id,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Create timeline entry
    await supabase.from('medical_records').insert([{
      patient_id: data.patient_id,
      record_type: 'prescription',
      record_reference_id: data.id,
      record_date: data.prescription_date,
      title: `Prescription — ${data.diagnosis || 'General'}`,
      summary: data.clinical_notes || data.instructions,
      provider_name: prescriptionData.doctor_name || '',
      organization_name: org.name,
    }]);

    return data;
  },

  /**
   * Get hospital visits for this hospital.
   */
  async getVisits({ page = 1, perPage = 20 } = {}) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!org) return { visits: [], total: 0 };

    const { data, error, count } = await supabase
      .from('hospital_visits')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' })
      .eq('hospital_id', org.id)
      .order('admission_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { visits: data || [], total: count || 0 };
  },

  /**
   * Get hospital prescriptions.
   */
  async getPrescriptions({ page = 1, perPage = 20 } = {}) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!org) return { prescriptions: [], total: 0 };

    const { data, error, count } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' })
      .eq('hospital_id', org.id)
      .order('prescription_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { prescriptions: data || [], total: count || 0 };
  },

  /**
   * Get dashboard stats for the hospital.
   */
  async getDashboardStats() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user.id)
      .single();

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!org) return { totalVisits: 0, totalPrescriptions: 0, thisMonth: 0 };

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [visits, prescriptions, monthlyVisits] = await Promise.all([
      supabase.from('hospital_visits').select('id', { count: 'exact', head: true }).eq('hospital_id', org.id),
      supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('hospital_id', org.id),
      supabase.from('hospital_visits').select('id', { count: 'exact', head: true }).eq('hospital_id', org.id).gte('created_at', firstOfMonth),
    ]);

    return {
      totalVisits: visits.count || 0,
      totalPrescriptions: prescriptions.count || 0,
      thisMonth: monthlyVisits.count || 0,
    };
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
