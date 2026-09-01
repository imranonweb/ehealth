import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Upload, UserPlus, Clock, ShieldX, ShieldCheck } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { CreatePatientForm } from '../../components/forms/CreatePatientForm';
import { AccessRequestModal } from '../../components/access/AccessRequestModal';
import { AccessStatusBadge } from '../../components/access/AccessStatusBadge';
import { formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function DiagnosticsPatients() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { query, results, loading, search } = usePatientSearch();
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [orgId, setOrgId] = useState(null);

  // Map of patient profile UUID -> relationship { id, status }
  const [relMap, setRelMap] = useState({});
  const [relLoading, setRelLoading] = useState(false);

  // Selected patient for access request modal
  const [requestTarget, setRequestTarget] = useState(null);

  // Resolve organization ID for currently logged-in diagnostics account
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) setOrgId(data.id);
      });
  }, [profile?.id]);

  // Fetch relationships specifically belonging to THIS organization
  const fetchRelationships = useCallback(async (patientIds) => {
    if (!patientIds || !patientIds.length || !profile?.id) return;
    setRelLoading(true);
    try {
      // Ensure we have the current organization ID
      let currentOrgId = orgId;
      if (!currentOrgId && (profile.role === 'diagnostics' || profile.role === 'hospital')) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();
        currentOrgId = orgData?.id || null;
        if (currentOrgId) setOrgId(currentOrgId);
      }

      let queryBuilder = supabase
        .from('patient_provider_relationships')
        .select('id, patient_profile_id, status, organization_id, provider_profile_id')
        .in('patient_profile_id', patientIds);

      // Filter by organization_id if available, otherwise by provider_profile_id
      if (currentOrgId) {
        queryBuilder = queryBuilder.or(`organization_id.eq.${currentOrgId},provider_profile_id.eq.${profile.id}`);
      } else {
        queryBuilder = queryBuilder.eq('provider_profile_id', profile.id);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });
      if (error) {
        console.warn('[DiagnosticsPatients] fetchRelationships warning:', error.message);
      }

      const map = {};
      const rank = { active: 3, pending: 2, revoked: 1, expired: 0 };
      (data || []).forEach((rel) => {
        // Enforce strict organization scoping: ignore relationships of other orgs
        const belongsToThisOrg = currentOrgId && rel.organization_id === currentOrgId;
        const belongsToThisProvider = rel.provider_profile_id === profile.id;
        if (!belongsToThisOrg && !belongsToThisProvider) return;

        const prev = map[rel.patient_profile_id];
        if (!prev || (rank[rel.status] ?? 0) > (rank[prev.status] ?? 0)) {
          map[rel.patient_profile_id] = { id: rel.id, status: rel.status };
        }
      });
      setRelMap(map);
    } catch (err) {
      console.warn('[DiagnosticsPatients] fetchRelationships error:', err);
    } finally {
      setRelLoading(false);
    }
  }, [profile?.id, profile?.role, orgId]);

  useEffect(() => {
    if (results.length > 0) {
      fetchRelationships(results.map((p) => p.id));
    } else {
      setRelMap({});
    }
  }, [results, fetchRelationships]);

  const handleRequestSent = (patientId, status) => {
    setRelMap((prev) => ({
      ...prev,
      [patientId]: {
        id: prev[patientId]?.id,
        status: status === 'already_active' ? 'active' : 'pending',
      },
    }));
  };

  const handleUploadReport = (patient) => {
    navigate(`/diagnostics/upload-report?patientId=${encodeURIComponent(patient.id)}`);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Patient Directory &amp; Test Linking</h1>
          <p className="body-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Search patients by name, Health ID, or phone. Patient consent is required before linking lab reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setShowCreatePatient(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <UserPlus size={16} /> Add New Patient
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)', boxShadow: 'var(--shadow-sm)' }}>
        <label className="field-label" style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>
          Search Patient Registry
        </label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Type patient name, health ID (e.g. P-12345678), email, or phone number..."
            value={query}
            onChange={(e) => search(e.target.value)}
            style={{ fontSize: '0.9375rem', height: 46 }}
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {loading || relLoading ? 'Searching Registry…' : results.length > 0 ? `Matched Patients (${results.length})` : 'Search Results'}
          </div>
        </div>

        {results.length === 0 && !loading && (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={Users}
              title={query.length >= 2 ? 'No Patients Found' : 'Type to Search Patients'}
              description={query.length >= 2 ? 'No patient matched your search query. Check the details or add a new patient.' : 'Search by name, Health ID, or phone to find patient.'}
              actionLabel="Add New Patient"
              action={() => setShowCreatePatient(true)}
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Health ID</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Contact</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Access Status</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {results.map((p) => {
                  const initials = getInitials(p.full_name);
                  const rel = relMap[p.id];
                  const status = rel?.status ?? null;

                  return (
                    <tr key={p.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      <td className="table-cell" style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: stringToColor(p.full_name), color: '#FFFFFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', display: 'block' }}>
                              {p.full_name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700,
                          color: 'var(--accent)', backgroundColor: 'var(--bg-surface-muted)',
                          padding: '2px 8px', borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-default)',
                        }}>
                          {formatPatientId(p.patient_identifier || p.id)}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.phone || 'No phone recorded'}</div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <AccessStatusBadge status={status} />
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUploadReport(p)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                          >
                            <Upload size={14} /> Upload Report
                          </button>

                          {status === 'pending' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                              <Clock size={14} /> Awaiting Approval
                            </div>
                          ) : status === 'revoked' ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setRequestTarget(p)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <ShieldX size={14} /> Request Access Again
                            </button>
                          ) : status !== 'active' ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setRequestTarget(p)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <ShieldCheck size={14} /> Request Access
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreatePatientForm
        isOpen={showCreatePatient}
        onClose={() => setShowCreatePatient(false)}
        onPatientCreated={(patient) => {
          setShowCreatePatient(false);
          if (patient?.id) {
            navigate(`/diagnostics/upload-report?patientId=${encodeURIComponent(patient.id)}`);
          }
        }}
        onDuplicateSelected={(patient) => {
          setShowCreatePatient(false);
          const targetId = patient?.profileId || patient?.id;
          if (targetId) {
            navigate(`/diagnostics/upload-report?patientId=${encodeURIComponent(targetId)}`);
          }
        }}
      />

      <AccessRequestModal
        patient={requestTarget}
        orgId={orgId}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onRequestSent={(status) => {
          if (requestTarget) handleRequestSent(requestTarget.id, status);
          setRequestTarget(null);
        }}
      />
    </div>
  );
}
