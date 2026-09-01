import { supabase } from '../lib/supabase';

async function ensureClinicalRelationship(patientId, orgId) {
  try {
    await supabase.rpc('ensure_clinical_relationship', {
      p_patient_id: patientId,
      p_org_id: orgId || null,
    });
  } catch (rpcEx) {
    await supabase.rpc('create_provider_relationship', {
      p_patient_id: patientId,
      p_org_id: orgId || null,
    }).catch(() => {});
  }
}

export const diagnosticsService = {
  /**
   * Upload/create a new diagnostic report.
   */
  async createReport(reportData) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error('Authentication required. Please sign in.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('profile_id', profile.id)
      .maybeSingle();

    const orgId = org?.id || null;
    const orgName = org?.name || 'Diagnostic Center';

    // 1. Ensure provider-patient relationship before insert
    await ensureClinicalRelationship(reportData.patient_id, orgId);

    const payload = {
      ...reportData,
      diagnostics_organization_id: orgId,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('diagnostic_reports')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // 2. Create timeline entry
    try {
      await supabase.from('medical_records').insert([{
        patient_id: data.patient_id,
        record_type: 'diagnostic_report',
        record_reference_id: data.id,
        record_date: data.report_date,
        title: data.test_name,
        summary: data.summary,
        provider_name: reportData.doctor_name || '',
        organization_name: orgName,
        created_by: profile.id,
      }]);
    } catch (recErr) {
      console.warn('[diagnosticsService] timeline index warning:', recErr);
    }

    return data;
  },

  /**
   * Get reports created by this diagnostics org.
   */
  async getOrgReports({ page = 1, perPage = 20 } = {}) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { reports: [], total: 0 };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!profile) return { reports: [], total: 0 };

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle();

    let query = supabase
      .from('diagnostic_reports')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' });

    if (org?.id) {
      query = query.or(`diagnostics_organization_id.eq.${org.id},created_by.eq.${profile.id}`);
    } else {
      query = query.eq('created_by', profile.id);
    }

    const { data, error, count } = await query
      .order('report_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { reports: data || [], total: count || 0 };
  },

  /**
   * Get a single report by ID.
   */
  async getReportById(id) {
    const { data, error } = await supabase
      .from('diagnostic_reports')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name),
        diagnostics_org:diagnostics_organization_id(id, name, address, phone, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get reports for a specific patient.
   */
  async getPatientReports(patientId, { page = 1, perPage = 20 } = {}) {
    const { data, error, count } = await supabase
      .from('diagnostic_reports')
      .select(`
        *,
        doctor:doctor_id(id, full_name),
        diagnostics_org:diagnostics_organization_id(id, name)
      `, { count: 'exact' })
      .eq('patient_id', patientId)
      .order('report_date', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;
    return { reports: data || [], total: count || 0 };
  },

  /**
   * Get dashboard stats for diagnostics org.
   */
  async getDashboardStats() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { totalReports: 0, todayReports: 0, pendingRequests: 0 };

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!profile) return { totalReports: 0, todayReports: 0, pendingRequests: 0 };

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];

    let totalQuery = supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true });
    let todayQuery = supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true }).eq('report_date', today);

    if (org?.id) {
      totalQuery = totalQuery.or(`diagnostics_organization_id.eq.${org.id},created_by.eq.${profile.id}`);
      todayQuery = todayQuery.or(`diagnostics_organization_id.eq.${org.id},created_by.eq.${profile.id}`);
    } else {
      totalQuery = totalQuery.eq('created_by', profile.id);
      todayQuery = todayQuery.eq('created_by', profile.id);
    }

    const [total, todayRes] = await Promise.all([
      totalQuery,
      todayQuery,
    ]);

    return {
      totalReports: total.count || 0,
      todayReports: todayRes.count || 0,
      pendingRequests: 0,
    };
  },
};
