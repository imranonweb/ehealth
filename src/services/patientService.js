import { supabase } from '../lib/supabase';

async function getPatientProfileId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  return profile?.id || null;
}

export const patientService = {
  /**
   * Get the current patient's profile with patient-specific details.
   */
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (profileErr) throw profileErr;

    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    return { ...profile, patient_profile: patientProfile };
  },

  /**
   * Update limited personal information.
   */
  async updateProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update patient-specific profile.
   */
  async updatePatientProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update(updates)
      .eq('profile_id', profileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get unified medical history timeline.
   */
  async getMedicalHistory({ page = 1, perPage = 20, type = null, search = '' } = {}) {
    const profileId = await getPatientProfileId();
    if (!profileId) return { records: [], total: 0 };

    let query = supabase
      .from('medical_records')
      .select('*', { count: 'exact' })
      .eq('patient_id', profileId)
      .order('record_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (type) query = query.eq('record_type', type);
    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,provider_name.ilike.%${search}%,organization_name.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { records: data || [], total: count || 0 };
  },

  /**
   * Get prescriptions for the current patient.
   */
  async getPrescriptions({ page = 1, perPage = 20, search = '' } = {}) {
    const profileId = await getPatientProfileId();
    if (!profileId) return { prescriptions: [], total: 0 };

    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctor_id(id, full_name, email),
        hospital:hospital_id(id, name)
      `, { count: 'exact' })
      .eq('patient_id', profileId)
      .order('prescription_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (search) {
      query = query.ilike('diagnosis', `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { prescriptions: data || [], total: count || 0 };
  },

  /**
   * Get diagnostic reports for the current patient.
   */
  async getDiagnosticReports({ page = 1, perPage = 20, search = '' } = {}) {
    const profileId = await getPatientProfileId();
    if (!profileId) return { reports: [], total: 0 };

    let query = supabase
      .from('diagnostic_reports')
      .select(`
        *,
        diagnostics_org:diagnostics_organization_id(id, name),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' })
      .eq('patient_id', profileId)
      .order('report_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (search) {
      query = query.or(`test_name.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { reports: data || [], total: count || 0 };
  },

  /**
   * Get hospital visits for the current patient.
   */
  async getHospitalVisits({ page = 1, perPage = 20, search = '' } = {}) {
    const profileId = await getPatientProfileId();
    if (!profileId) return { visits: [], total: 0 };

    let query = supabase
      .from('hospital_visits')
      .select(`
        *,
        hospital:hospital_id(id, name),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' })
      .eq('patient_id', profileId)
      .order('admission_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (search) {
      query = query.or(`reason.ilike.%${search}%,diagnosis_summary.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { visits: data || [], total: count || 0 };
  },

  /**
   * Get healthcare providers associated with this patient.
   */
  async getProviders() {
    const profileId = await getPatientProfileId();
    if (!profileId) return [];

    const { data, error } = await supabase
      .from('patient_provider_relationships')
      .select(`
        *,
        provider:provider_profile_id(id, full_name, email, role, phone),
        organization:organization_id(id, name, type, address, phone, email)
      `)
      .eq('patient_profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get pending access requests (for the current patient to action).
   */
  async getPendingAccessRequests() {
    const profileId = await getPatientProfileId();
    if (!profileId) return [];

    const { data, error } = await supabase
      .from('patient_provider_relationships')
      .select(`
        *,
        provider:provider_profile_id(id, full_name, email, role, phone),
        organization:organization_id(id, name, type, address, phone, email)
      `)
      .eq('patient_profile_id', profileId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Approve a pending access request (patient approves provider access).
   */
  async approveAccessRequest(relationshipId) {
    const { error } = await supabase.rpc('approve_provider_access', {
      p_relationship_id: relationshipId,
    });
    if (error) throw error;
  },

  /**
   * Reject a pending request OR revoke an existing active relationship.
   */
  async revokeAccess(relationshipId) {
    const { error } = await supabase.rpc('reject_provider_access', {
      p_relationship_id: relationshipId,
    });
    if (error) throw error;
  },

  /**
   * Get a single prescription by ID (with resilient fallback).
   */
  async getPrescriptionById(id) {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor:doctor_id(id, full_name, email),
          hospital:hospital_id(id, name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[patientService] getPrescriptionById error:', e);
    }

    // Fallback: direct simple query
    try {
      const { data } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data || null;
    } catch (fallbackErr) {
      console.warn('[patientService] getPrescriptionById fallback error:', fallbackErr);
      return null;
    }
  },

  /**
   * Get a single diagnostic report by ID (with resilient fallback).
   */
  async getDiagnosticReportById(id) {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('diagnostic_reports')
        .select(`
          *,
          diagnostics_org:diagnostics_organization_id(id, name, address, phone, email),
          doctor:doctor_id(id, full_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[patientService] getDiagnosticReportById error:', e);
    }

    try {
      const { data } = await supabase
        .from('diagnostic_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data || null;
    } catch (fallbackErr) {
      console.warn('[patientService] getDiagnosticReportById fallback error:', fallbackErr);
      return null;
    }
  },

  /**
   * Get a single hospital visit by ID (with resilient fallback).
   */
  async getHospitalVisitById(id) {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('hospital_visits')
        .select(`
          *,
          hospital:hospital_id(id, name),
          doctor:doctor_id(id, full_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[patientService] getHospitalVisitById error:', e);
    }

    try {
      const { data } = await supabase
        .from('hospital_visits')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data || null;
    } catch (fallbackErr) {
      console.warn('[patientService] getHospitalVisitById fallback error:', fallbackErr);
      return null;
    }
  },

  /**
   * Get dashboard metrics and recent clinical items.
   */
  async getDashboardData() {
    const profileId = await getPatientProfileId();
    if (!profileId) {
      return {
        stats: { prescriptions: 0, reports: 0, visits: 0, providers: 0 },
        recentRecords: [],
        latestPrescription: null,
        latestReport: null,
        latestVisit: null,
        providers: [],
      };
    }

    const [
      statsRes,
      recordsRes,
      latestPrescriptionRes,
      latestReportRes,
      latestVisitRes,
      providersRes,
    ] = await Promise.all([
      // Counts
      Promise.all([
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
        supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
        supabase.from('hospital_visits').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
        supabase.from('patient_provider_relationships').select('id', { count: 'exact', head: true }).eq('patient_profile_id', profileId).eq('status', 'active'),
      ]),
      // Recent timeline records
      supabase.from('medical_records').select('*').eq('patient_id', profileId).order('record_date', { ascending: false }).limit(4),
      // Latest prescription
      supabase.from('prescriptions').select('*, doctor:doctor_id(full_name), hospital:hospital_id(name)').eq('patient_id', profileId).order('prescription_date', { ascending: false }).limit(1),
      // Latest report
      supabase.from('diagnostic_reports').select('*, diagnostics_org:diagnostics_organization_id(name)').eq('patient_id', profileId).order('report_date', { ascending: false }).limit(1),
      // Latest hospital visit
      supabase.from('hospital_visits').select('*, hospital:hospital_id(name)').eq('patient_id', profileId).order('admission_date', { ascending: false }).limit(1),
      // Providers
      supabase.from('patient_provider_relationships').select('*, provider:provider_profile_id(full_name), organization:organization_id(name, type)').eq('patient_profile_id', profileId).eq('status', 'active').limit(4),
    ]);

    return {
      stats: {
        prescriptions: statsRes[0].count || 0,
        reports: statsRes[1].count || 0,
        visits: statsRes[2].count || 0,
        providers: statsRes[3].count || 0,
      },
      recentRecords: recordsRes.data || [],
      latestPrescription: latestPrescriptionRes.data?.[0] || null,
      latestReport: latestReportRes.data?.[0] || null,
      latestVisit: latestVisitRes.data?.[0] || null,
      providers: providersRes.data || [],
    };
  },

  /**
   * Get basic dashboard counts.
   */
  async getDashboardStats() {
    const profileId = await getPatientProfileId();
    if (!profileId) return { prescriptions: 0, reports: 0, visits: 0, providers: 0 };

    const [prescriptions, reports, visits, providers] = await Promise.all([
      supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
      supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
      supabase.from('hospital_visits').select('id', { count: 'exact', head: true }).eq('patient_id', profileId),
      supabase.from('patient_provider_relationships').select('id', { count: 'exact', head: true }).eq('patient_profile_id', profileId).eq('status', 'active'),
    ]);

    return {
      prescriptions: prescriptions.count || 0,
      reports: reports.count || 0,
      visits: visits.count || 0,
      providers: providers.count || 0,
    };
  },
};
