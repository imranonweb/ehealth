import { supabase } from '../lib/supabase';

export const diagnosticsService = {
  /**
   * Upload/create a new diagnostic report.
   */
  async createReport(reportData) {
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
      ...reportData,
      diagnostics_organization_id: org.id,
      created_by: profile.id,
    };

    const { data, error } = await supabase
      .from('diagnostic_reports')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Create timeline entry
    await supabase.from('medical_records').insert([{
      patient_id: data.patient_id,
      record_type: 'diagnostic_report',
      record_reference_id: data.id,
      record_date: data.report_date,
      title: data.test_name,
      summary: data.summary,
      provider_name: reportData.doctor_name || '',
      organization_name: org.name,
    }]);

    // Ensure relationship
    await ensureRelationship(data.patient_id, profile.id, 'diagnostics', org.id);

    return data;
  },

  /**
   * Get reports created by this diagnostics org.
   */
  async getOrgReports({ page = 1, perPage = 20 } = {}) {
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

    if (!org) return { reports: [], total: 0 };

    const { data, error, count } = await supabase
      .from('diagnostic_reports')
      .select(`
        *,
        patient:patient_id(id, full_name, email),
        doctor:doctor_id(id, full_name)
      `, { count: 'exact' })
      .eq('diagnostics_organization_id', org.id)
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
        diagnostics_org:diagnostics_organization_id(id, name),
        doctor:doctor_id(id, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get dashboard stats for the diagnostics org.
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

    if (!org) return { totalReports: 0, thisMonth: 0, patients: 0 };

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [total, monthly] = await Promise.all([
      supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true }).eq('diagnostics_organization_id', org.id),
      supabase.from('diagnostic_reports').select('id', { count: 'exact', head: true }).eq('diagnostics_organization_id', org.id).gte('created_at', firstOfMonth),
    ]);

    return {
      totalReports: total.count || 0,
      thisMonth: monthly.count || 0,
    };
  },
};

/**
 * Ensures an active provider-patient relationship exists.
 *
 * Uses the create_provider_relationship SECURITY DEFINER RPC instead of a
 * direct INSERT with status='active', which was rejected by RLS.
 */
async function ensureRelationship(patientId, _providerId, _providerType, orgId = null) {
  const { error } = await supabase.rpc('create_provider_relationship', {
    p_patient_id: patientId,
    p_org_id: orgId || null,
  });

  if (error) {
    // Non-fatal: log but don't throw. The clinical record was already created.
    console.warn('[diagnosticsService] create_provider_relationship error:', error.message);
  }
}
