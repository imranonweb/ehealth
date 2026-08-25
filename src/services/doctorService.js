import { supabase } from '../lib/supabase';

export const doctorService = {
  /**
   * Fetches real counts and recent patient activity for Doctor Dashboard.
   * Fully governed by Supabase RLS — only authorized data is returned.
   */
  async getDashboardData(doctorProfileId) {
    let docId = doctorProfileId;
    if (!docId) {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', authUser.user.id)
          .maybeSingle();
        if (prof) docId = prof.id;
      }
    }

    if (!docId) {
      return {
        patientCount: 0,
        prescriptionCount: 0,
        reportCount: 0,
        visitCount: 0,
        recentActivity: [],
      };
    }

    try {
      // 1. Fetch authorized patients count (including relationships and authored prescriptions)
      const patients = await this.getAuthorizedPatients(docId);
      const patientCount = patients.length;

      // 2. Fetch accessible prescriptions count
      const { count: prescriptionCount, error: prErr } = await supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true })
        .or(`doctor_id.eq.${docId},created_by.eq.${docId}`);

      if (prErr) console.warn('Error fetching prescription count:', prErr);

      // 3. Fetch accessible diagnostic reports count
      const { count: reportCount, error: rErr } = await supabase
        .from('diagnostic_reports')
        .select('id', { count: 'exact', head: true });

      if (rErr) console.warn('Error fetching report count:', rErr);

      // 4. Fetch accessible hospital visits count
      const { count: visitCount, error: vErr } = await supabase
        .from('hospital_visits')
        .select('id', { count: 'exact', head: true });

      if (vErr) console.warn('Error fetching visit count:', vErr);

      // 5. Fetch recent patient activity from medical_records
      const { data: records, error: recErr } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          record_type,
          record_reference_id,
          title,
          summary,
          record_date,
          created_at,
          patient:patient_id (
            id,
            full_name,
            email
          )
        `)
        .order('record_date', { ascending: false })
        .limit(6);

      if (recErr) console.warn('Error fetching recent activity:', recErr);

      return {
        patientCount: patientCount ?? 0,
        prescriptionCount: prescriptionCount ?? 0,
        reportCount: reportCount ?? 0,
        visitCount: visitCount ?? 0,
        recentActivity: records ?? [],
      };
    } catch (err) {
      console.error('doctorService.getDashboardData error:', err);
      return {
        patientCount: 0,
        prescriptionCount: 0,
        reportCount: 0,
        visitCount: 0,
        recentActivity: [],
      };
    }
  },

  /**
   * Fetches the list of authorized patients for the authenticated doctor.
   * Aggregates explicit active relationships and clinical encounters.
   */
  async getAuthorizedPatients(doctorProfileId) {
    let docId = doctorProfileId;
    if (!docId) {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', authUser.user.id)
          .maybeSingle();
        if (prof) docId = prof.id;
      }
    }
    if (!docId) return [];

    try {
      const patientMap = new Map();
      const patientIds = [];

      // 1. Fetch active relationships
      const { data: relationships, error: relError } = await supabase
        .from('patient_provider_relationships')
        .select(`
          id,
          status,
          created_at,
          patient_profile_id,
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
        .or(`provider_profile_id.eq.${docId},organization_id.eq.${docId}`)
        .eq('status', 'active');

      if (!relError && relationships && Array.isArray(relationships)) {
        relationships.forEach((rel) => {
          const p = rel.patient;
          const patientId = p?.id || rel.patient_profile_id;
          if (patientId && !patientMap.has(patientId)) {
            patientIds.push(patientId);
            patientMap.set(patientId, {
              id: patientId,
              full_name: p?.full_name || 'Patient',
              email: p?.email || '',
              phone: p?.phone || '',
              gender: p?.gender || '',
              date_of_birth: p?.date_of_birth || null,
              patient_identifier: p?.patient_profiles?.[0]?.patient_identifier || null,
              blood_group: p?.patient_profiles?.[0]?.blood_group || null,
              allergies: p?.patient_profiles?.[0]?.allergies || null,
              relationship_status: rel.status || 'active',
              relationship_since: rel.created_at,
              record_count: 0,
              last_record: null,
              records: [],
            });
          }
        });
      }

      // 2. Also fetch patients from prescriptions authored by this doctor
      try {
        const { data: prescData } = await supabase
          .from('prescriptions')
          .select(`
            id,
            patient_id,
            prescription_date,
            diagnosis,
            patient:patient_id (
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
          .eq('doctor_id', docId)
          .order('prescription_date', { ascending: false });

        if (prescData && Array.isArray(prescData)) {
          prescData.forEach((pr) => {
            const p = pr.patient;
            const pid = pr.patient_id;
            if (pid) {
              if (!patientMap.has(pid)) {
                patientIds.push(pid);
                patientMap.set(pid, {
                  id: pid,
                  full_name: p?.full_name || 'Patient',
                  email: p?.email || '',
                  phone: p?.phone || '',
                  gender: p?.gender || '',
                  date_of_birth: p?.date_of_birth || null,
                  patient_identifier: p?.patient_profiles?.[0]?.patient_identifier || null,
                  blood_group: p?.patient_profiles?.[0]?.blood_group || null,
                  allergies: p?.patient_profiles?.[0]?.allergies || null,
                  relationship_status: 'active',
                  relationship_since: pr.prescription_date,
                  record_count: 0,
                  last_record: {
                    date: pr.prescription_date,
                    type: 'prescription',
                    title: `Prescription — ${pr.diagnosis || 'General'}`,
                  },
                  records: [],
                });
              }
            }
          });
        }
      } catch (e) {
        // Continue
      }

      // 3. Fetch accessible medical records to populate counts and last records
      if (patientIds.length > 0) {
        try {
          const { data: records } = await supabase
            .from('medical_records')
            .select('id, patient_id, record_type, title, record_date')
            .in('patient_id', patientIds)
            .order('record_date', { ascending: false });

          if (records && Array.isArray(records)) {
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
        } catch (e) {
          // Continue
        }
      }

      return Array.from(patientMap.values());
    } catch (err) {
      console.error('doctorService.getAuthorizedPatients error:', err);
      return [];
    }
  },

  /**
   * Fetches detailed clinical data for a patient.
   */
  async getPatientDetail(patientId) {
    if (!patientId) return null;

    try {
      let patient = null;

      // 1. Try fetching profile
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          patient_profiles (*)
        `)
        .eq('id', patientId)
        .maybeSingle();

      if (profile) {
        patient = profile;
      } else {
        // Fallback using searchService
        patient = await searchService.getPatientById(patientId);
      }

      if (!patient) return null;

      // 2. Fetch all accessible records for timeline and tabs
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
        patient,
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
