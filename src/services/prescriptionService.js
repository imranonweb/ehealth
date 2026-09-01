import { supabase } from '../lib/supabase';

export const prescriptionService = {
  /**
   * Create a new prescription.
   */
  async createPrescription(prescriptionData) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error('Authentication required. Please sign in to issue prescriptions.');
    }

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profErr || !profile) {
      throw new Error('User profile not found. Please reload the page.');
    }

    const doctorId = prescriptionData.doctor_id || (profile.role === 'doctor' ? profile.id : null);
    const hospitalId = prescriptionData.hospital_id || null;

    if (!doctorId && !hospitalId) {
      throw new Error('A prescription must be linked to an issuing doctor or hospital.');
    }

    // 1. Ensure provider-patient relationship before insert so RLS check succeeds
    try {
      await supabase.rpc('ensure_clinical_relationship', {
        p_patient_id: prescriptionData.patient_id,
        p_org_id: hospitalId || null,
      });
    } catch (rpcEx) {
      await supabase.rpc('create_provider_relationship', {
        p_patient_id: prescriptionData.patient_id,
        p_org_id: hospitalId || null,
      }).catch(() => {});
    }

    const payload = {
      patient_id: prescriptionData.patient_id,
      doctor_id: doctorId,
      hospital_id: hospitalId,
      prescription_date: prescriptionData.prescription_date,
      diagnosis: prescriptionData.diagnosis,
      clinical_notes: prescriptionData.clinical_notes || null,
      instructions: prescriptionData.instructions || null,
      medications: prescriptionData.medications || [],
      document_path: prescriptionData.document_path || null,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security') || error.message?.toLowerCase().includes('policy')) {
        throw new Error(
          'Authorization Required: Unable to issue prescription for this patient. Please verify the patient identifier.'
        );
      }
      throw error;
    }

    // 2. Create unified timeline entry in medical_records
    try {
      await supabase.from('medical_records').insert([{
        patient_id: data.patient_id,
        record_type: 'prescription',
        record_reference_id: data.id,
        record_date: data.prescription_date,
        title: `Prescription — ${data.diagnosis || 'General'}`,
        summary: data.clinical_notes || data.instructions || '',
        provider_name: profile.full_name || '',
        organization_name: prescriptionData.hospital_name || '',
        created_by: profile.id,
      }]);
    } catch (recErr) {
      console.warn('Could not index prescription to timeline:', recErr);
    }

    return data;
  },

  /**
   * Get prescriptions created by the current doctor.
   */
  async getMyPrescriptions({ page = 1, perPage = 20 } = {}) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { prescriptions: [], total: 0 };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!profile) return { prescriptions: [], total: 0 };

    const { data, error, count } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        hospital:hospital_id(id, name)
      `, { count: 'exact' })
      .or(`doctor_id.eq.${profile.id},created_by.eq.${profile.id}`)
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
        doctor:doctor_id(id, full_name, email),
        hospital:hospital_id(id, name),
        patient:patient_id(id, full_name, email, date_of_birth, gender),
        ai_extraction:prescription_ai_extractions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
