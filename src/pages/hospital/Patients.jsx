import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, ChevronRight, BedDouble, UserPlus, Clock, ShieldX, ShieldCheck } from 'lucide-react';
import { usePatientSearch } from '../../hooks/usePatientSearch';
import { CreatePatientForm } from '../../components/forms/CreatePatientForm';
import { AccessRequestModal } from '../../components/access/AccessRequestModal';
import { AccessStatusBadge } from '../../components/access/AccessStatusBadge';
import { formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function HospitalPatients() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { query, results, loading, search } = usePatientSearch();
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [orgId, setOrgId] = useState(null);

  // Map of patient profile UUID → relationship { id, status }
  const [relMap, setRelMap] = useState({});
  const [relLoading, setRelLoading] = useState(false);

  // Selected patient for access request modal
  const [requestTarget, setRequestTarget] = useState(null);

  // Resolve org ID once
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle()
      .then(({ data }) => setOrgId(data?.id ?? null));
  }, [profile?.id]);

  // Fetch relationships for the current search result set
  const fetchRelationships = useCallback(async (patientIds) => {
    if (!patientIds.length || !profile?.id) return;
    setRelLoading(true);
    try {
      const orClause = orgId
        ? `provider_profile_id.eq.${profile.id},organization_id.eq.${orgId}`
        : `provider_profile_id.eq.${profile.id}`;

      const { data } = await supabase
        .from('patient_provider_relationships')
        .select('id, patient_profile_id, status')
        .in('patient_profile_id', patientIds)
        .or(orClause)
        .order('created_at', { ascending: false });

      const map = {};
      (data || []).forEach((rel) => {
        // Keep the most-privileged status per patient
        const prev = map[rel.patient_profile_id];
        const rank = { active: 3, pending: 2, revoked: 1 };
        if (!prev || (rank[rel.status] ?? 0) > (rank[prev.status] ?? 0)) {
          map[rel.patient_profile_id] = { id: rel.id, status: rel.status };
        }
      });
      setRelMap(map);
    } finally {
      setRelLoading(false);
    }
  }, [profile?.id, orgId]);

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
      [patientId]: { id: prev[patientId]?.id, status: status === 'already_active' ? 'active' : 'pending' },
    }));
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Hospital Patient Lookup</h1>
          <p className="page-sub">
            Search patients by name, Health ID, or phone. Request consent to view medical history.
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

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <label className="field-label" style={{ marginBottom: 8 }}>Find Patient</label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Type patient name, health ID (e.g. P-12345678), email, or phone number..."
            value={query}
            onChange={(e) => search(e.target.value)}
            style={{ fontSize: '1rem', height: 46 }}
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
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
                            backgroundColor: stringToColor(p.full_name),
                            color: '#FFFFFF',
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
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.phone || '—'}</div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <AccessStatusBadge status={status} />
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          {status === 'active' ? (
                            <>
                              <Link to={`/hospital/visits/new?patientId=${p.id}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <BedDouble size={13} /> New Visit
                              </Link>
                              <Link to={`/hospital/patients/${p.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                View Medical File <ChevronRight size={14} />
                              </Link>
                            </>
                          ) : status === 'pending' ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                              <Clock size={14} /> Awaiting Patient Approval
                            </div>
                          ) : status === 'revoked' ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setRequestTarget(p)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <ShieldX size={13} /> Request Access Again
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => setRequestTarget(p)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <ShieldCheck size={13} /> Request Access
                            </button>
                          )}
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
          if (patient?.id) navigate(`/hospital/patients/${patient.id}`);
        }}
        onDuplicateSelected={(patient) => {
          setShowCreatePatient(false);
          const targetId = patient?.profileId || patient?.id;
          if (targetId) navigate(`/hospital/patients/${targetId}`);
        }}
      />

      <AccessRequestModal
        patient={requestTarget}
        orgId={orgId}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onRequestSent={(status) => {
          if (requestTarget) {
            handleRequestSent(requestTarget.id, status);
          }
          setRequestTarget(null);
        }}
      />
    </div>
  );
}
