import { supabase } from '../lib/supabase';

export const doctorService = {
  /**
   * Fetches real counts and recent patient activity for Doctor Dashboard.
   * Fully governed by Supabase RLS — only authorized data is returned.
   */
  async getDashboardData(doctorProfileId) {
    if (!doctorProfileId) {
      return {
        patientCount: 0,
        prescriptionCount: 0,
        reportCount: 0,
        visitCount: 0,
        recentActivity: [],
      };
    }

    try {
      // 1. Fetch authorized patients count
      const { count: patientCount, error: pErr } = await supabase
        .from('patient_provider_relationships')
        .select('id', { count: 'exact', head: true })
        .eq('provider_profile_id', doctorProfileId)
        .eq('status', 'active');

      if (pErr) console.error('Error fetching patient count:', pErr);

      // 2. Fetch accessible prescriptions count
      const { count: prescriptionCount, error: prErr } = await supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true });

      if (prErr) console.error('Error fetching prescription count:', prErr);

      // 3. Fetch accessible diagnostic reports count
      const { count: reportCount, error: rErr } = await supabase
        .from('diagnostic_reports')
        .select('id', { count: 'exact', head: true });

      if (rErr) console.error('Error fetching report count:', rErr);

      // 4. Fetch accessible hospital visits count
      const { count: visitCount, error: vErr } = await supabase
        .from('hospital_visits')
        .select('id', { count: 'exact', head: true });

      if (vErr) console.error('Error fetching visit count:', vErr);

      // 5. Fetch recent patient activity from medical_records
      const { data: records, error: recErr } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          record_type,
          record_reference_id,
          title,
          description,
          record_date,
          metadata,
          created_at,
          patient:patient_id (
            id,
            full_name,
            email
          )
        `)
        .order('record_date', { ascending: false })
        .limit(6);

      if (recErr) console.error('Error fetching recent activity:', recErr);

      return {
        patientCount: patientCount ?? 0,
        prescriptionCount: prescriptionCount ?? 0,
        reportCount: reportCount ?? 0,
        visitCount: visitCount ?? 0,
        recentActivity: records ?? [],
      };
    } catch (err) {
      console.error('doctorService.getDashboardData error:', err);
      throw err;
    }
  },

  /**
   * Fetches the list of authorized patients for the authenticated doctor.
   * Strictly uses the patient_provider_relationships authorization model.
   */
  async getAuthorizedPatients(doctorProfileId) {
    if (!doctorProfileId) return [];

    try {
      // 1. Fetch active relationships
      const { data: relationships, error: relError } = await supabase
        .from('patient_provider_relationships')
        .select(`
          id,
          status,
          created_at,
          patient:patient_profile_id (
            id,
            full_name,
            email,
            phone,
            gender,
            date_of_birth,
            patient_profiles (
              patient_identifier,
              blood_group,
              allergies
            )
          )
        `)
        .eq('provider_profile_id', doctorProfileId)
        .eq('status', 'active');

      if (relError) throw relError;
      if (!relationships || relationships.length === 0) return [];

      // 2. Extract patient IDs
      const patientMap = new Map();
      const patientIds = [];

      relationships.forEach((rel) => {
        if (rel.patient) {
          const p = rel.patient;
          const patientId = p.id;
          if (!patientMap.has(patientId)) {
            patientIds.push(patientId);
            patientMap.set(patientId, {
              id: patientId,
              full_name: p.full_name,
              email: p.email,
              phone: p.phone,
              gender: p.gender,
              date_of_birth: p.date_of_birth,
              patient_identifier: p.patient_profiles?.[0]?.patient_identifier || null,
              blood_group: p.patient_profiles?.[0]?.blood_group || null,
              allergies: p.patient_profiles?.[0]?.allergies || null,
              relationship_status: rel.status,
              relationship_since: rel.created_at,
              record_count: 0,
              last_record: null,
              records: [],
            });
          }
        }
      });

      if (patientIds.length === 0) return [];

      // 3. Fetch accessible medical records for these patients
      const { data: records, error: recError } = await supabase
        .from('medical_records')
        .select('id, patient_id, record_type, title, record_date')
        .in('patient_id', patientIds)
        .order('record_date', { ascending: false });

      if (!recError && records) {
        records.forEach((rec) => {
          const patientData = patientMap.get(rec.patient_id);
          if (patientData) {
            patientData.record_count += 1;
            patientData.records.push(rec);
            if (!patientData.last_record) {
              patientData.last_record = {
                date: rec.record_date,
                type: rec.record_type,
                title: rec.title,
              };
            }
          }
        });
      }

      return Array.from(patientMap.values());
    } catch (err) {
      console.error('doctorService.getAuthorizedPatients error:', err);
      throw err;
    }
  },

  /**
   * Fetches detailed data for an authorized patient.
   * If not authorized by RLS, returns null or errors.
   */
  async getPatientDetail(patientId) {
    if (!patientId) return null;

    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select(`
          *,
          patient_profiles (*)
        `)
        .eq('id', patientId)
        .eq('role', 'patient')
        .single();

      if (profErr || !profile) {
        return null;
      }

      // Fetch all accessible records for timeline and tabs
      const [recRes, prescRes, repRes, visRes] = await Promise.all([
        supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', patientId)
          .order('record_date', { ascending: false }),
        supabase
          .from('prescriptions')
          .select(`*, doctor:doctor_id(id, full_name), hospital:hospital_id(id, name)`)
          .eq('patient_id', patientId)
          .order('prescription_date', { ascending: false }),
        supabase
          .from('diagnostic_reports')
          .select(`*, diagnostics_org:diagnostics_organization_id(id, name)`)
          .eq('patient_id', patientId)
          .order('report_date', { ascending: false }),
        supabase
          .from('hospital_visits')
          .select(`*, hospital:hospital_id(id, name), doctor:doctor_id(id, full_name)`)
          .eq('patient_id', patientId)
          .order('admission_date', { ascending: false }),
      ]);

      return {
        patient: profile,
        timeline: recRes.data || [],
        prescriptions: prescRes.data || [],
        reports: repRes.data || [],
        visits: visRes.data || [],
      };
    } catch (err) {
      console.error('doctorService.getPatientDetail error:', err);
      throw err;
    }
  },
};
