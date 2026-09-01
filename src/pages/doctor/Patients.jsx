import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, ChevronRight, User, AlertCircle, RefreshCw,
  Filter, FileText, Pill, FlaskConical, Building2, CheckCircle2,
  Calendar, ShieldCheck, Plus, UserPlus, Loader2, Clock, ShieldX
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { doctorService } from '../../services/doctorService';
import { searchService } from '../../services/searchService';
import { CreatePatientForm } from '../../components/forms/CreatePatientForm';
import { AccessRequestModal } from '../../components/access/AccessRequestModal';
import { AccessStatusBadge } from '../../components/access/AccessStatusBadge';
import { formatPatientId, getInitials, formatDate, stringToColor, debounce } from '../../lib/utils';
import { SkeletonTable, SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../contexts/ToastContext';
import './DoctorPatients.css';

export function DoctorPatients() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  // Live registry search state
  const [registryResults, setRegistryResults] = useState([]);
  const [searchingRegistry, setSearchingRegistry] = useState(false);
  const [relMap, setRelMap] = useState({}); // patientId -> status
  const [requestTarget, setRequestTarget] = useState(null);

  const loadPatients = async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await doctorService.getAuthorizedPatients(profile.id);
      setPatients(list);
    } catch (err) {
      console.error('Failed to load authorized patients:', err);
      setError('Unable to load your patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [profile?.id]);

  // Fetch relationships for registry results
  const fetchRelationships = useCallback(async (patientIds) => {
    if (!patientIds || !patientIds.length || !profile?.id) return;
    try {
      const { data } = await supabase
        .from('patient_provider_relationships')
        .select('id, patient_profile_id, status')
        .eq('provider_profile_id', profile.id)
        .in('patient_profile_id', patientIds);

      const map = {};
      (data || []).forEach((r) => {
        map[r.patient_profile_id] = r.status;
      });
      setRelMap((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.warn('[DoctorPatients] fetchRelationships error:', err);
    }
  }, [profile?.id]);

  // Debounced registry search
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setRegistryResults([]);
        setSearchingRegistry(false);
        return;
      }
      setSearchingRegistry(true);
      try {
        const results = await searchService.searchPatients(query);
        setRegistryResults(results);
        if (results.length > 0) {
          fetchRelationships(results.map((r) => r.id));
        }
      } catch (err) {
        console.warn('Registry search failed:', err);
        setRegistryResults([]);
      } finally {
        setSearchingRegistry(false);
      }
    }, 300)
  ).current;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    debouncedSearch(val);
  };

  // Filter local patients
  const filteredLocalPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'prescriptions') {
        return p.records?.some((r) => r.record_type === 'prescription');
      }
      if (activeFilter === 'reports') {
        return p.records?.some((r) => r.record_type === 'diagnostic_report');
      }
      if (activeFilter === 'visits') {
        return p.records?.some((r) => r.record_type === 'hospital_visit');
      }
      if (activeFilter === 'recent') {
        return p.record_count > 0;
      }
      return true;
    });
  }, [patients, searchQuery, activeFilter]);

  // Merge registry results not in local patients when searching
  const combinedSearchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return filteredLocalPatients;
    }

    const localIds = new Set(filteredLocalPatients.map((p) => p.id));
    const extraRegistry = registryResults.filter((p) => !localIds.has(p.id)).map((p) => ({
      ...p,
      isRegistrySearch: true,
      record_count: 0,
      last_record: null,
      relationship_status: relMap[p.id] || 'none',
    }));

    return [...filteredLocalPatients, ...extraRegistry];
  }, [filteredLocalPatients, registryResults, searchQuery, relMap]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Patient Directory &amp; Consultations</h1>
          <p className="page-sub">
            Search patient records, review medical histories, and issue official e-prescriptions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => setShowCreatePatient(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <UserPlus size={16} /> Register Patient
          </button>
          <Link
            to="/doctor/prescriptions/new"
            className="btn btn-primary btn-md"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> New Prescription
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 260 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input has-icon"
              placeholder="Search by patient name, Health ID (e.g. P-1234), email, phone..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchingRegistry && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <Loader2 size={16} className="spin text-primary" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              type="button"
              className={`btn btn-xs ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({patients.length})
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeFilter === 'prescriptions' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('prescriptions')}
            >
              <Pill size={12} /> Prescriptions
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeFilter === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('reports')}
            >
              <FlaskConical size={12} /> Lab Reports
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeFilter === 'visits' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('visits')}
            >
              <Building2 size={12} /> Hospital Visits
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Directory List */}
      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-6)' }}>
            <SkeletonTable rows={5} />
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
            <AlertCircle size={36} className="text-danger" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 6px' }}>Failed to Load Patients</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '0.875rem' }}>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadPatients}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : combinedSearchResults.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'No Matching Patients Found' : 'No Authorized Patients Yet'}
            description={
              searchQuery
                ? `No patients found matching "${searchQuery}". Use the Register Patient button above to create a new patient.`
                : 'Patients you prescribe medications for or who have active authorizations with you will appear here.'
            }
            actionLabel="Register New Patient"
            onAction={() => setShowCreatePatient(true)}
          />
        ) : (
          <>
            <div className="table-responsive hide-on-mobile">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr className="table-header">
                    <th className="table-head" style={{ padding: '14px 24px' }}>Patient Identity</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Health ID / Contact</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Last Activity</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Authorization Status</th>
                    <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {combinedSearchResults.map((p) => {
                    const lastRecType = p.last_record?.type === 'prescription'
                      ? 'Prescription'
                      : p.last_record?.type === 'diagnostic_report'
                      ? 'Lab Report'
                      : p.last_record?.type === 'hospital_visit'
                      ? 'Hospital Visit'
                      : null;

                    const initials = getInitials(p.full_name);
                    const status = p.isRegistrySearch ? (relMap[p.id] || 'none') : (p.relationship_status || 'active');

                    return (
                      <tr key={p.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                        {/* Patient Column */}
                        <td className="table-cell" style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: stringToColor(p.full_name),
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                              flexShrink: 0,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <Link
                                to={`/doctor/patients/${p.id}`}
                                style={{
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  textDecoration: 'none',
                                  display: 'block',
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {p.full_name}
                              </Link>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {p.gender && <span style={{ textTransform: 'capitalize' }}>{p.gender} · </span>}
                                {p.date_of_birth ? `DOB: ${formatDate(p.date_of_birth)}` : p.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Health ID Column */}
                        <td className="table-cell" style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{
                              fontFamily: 'monospace',
                              backgroundColor: 'var(--bg-surface-muted)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-xs)',
                              color: 'var(--accent)',
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                              border: '1px solid var(--border-default)',
                              display: 'inline-block',
                              width: 'fit-content',
                            }}>
                              {formatPatientId(p.patient_identifier || p.id)}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.phone || p.email || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Last Record Column */}
                        <td className="table-cell" style={{ padding: '16px 20px' }}>
                          {p.last_record ? (
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.84375rem', color: 'var(--text-primary)' }}>
                                {formatDate(p.last_record.date)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {lastRecType}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              No records on file
                            </span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="table-cell" style={{ padding: '16px 20px' }}>
                          <AccessStatusBadge status={status} />
                        </td>

                        {/* Action Column */}
                        <td className="table-cell" style={{ textAlign: 'right', padding: '16px 24px' }}>
                          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                            <Link
                              to={`/doctor/prescriptions/new?patientId=${p.id}`}
                              state={{ patient: p }}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Plus size={13} /> Prescribe
                            </Link>

                            {status === 'active' ? (
                              <Link to={`/doctor/patients/${p.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                View <ChevronRight size={13} />
                              </Link>
                            ) : status === 'pending' ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                                <Clock size={13} /> Pending
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setRequestTarget(p)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
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

            {/* Mobile Cards View */}
            <div className="mobile-patient-cards show-on-mobile">
              {combinedSearchResults.map((p) => {
                const lastRecType = p.last_record?.type === 'prescription'
                  ? 'Prescription'
                  : p.last_record?.type === 'diagnostic_report'
                  ? 'Lab Report'
                  : p.last_record?.type === 'hospital_visit'
                  ? 'Hospital Visit'
                  : 'None';

                const status = p.isRegistrySearch ? (relMap[p.id] || 'none') : (p.relationship_status || 'active');

                return (
                  <div key={p.id} className="mobile-patient-card card card-hover">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm avatar-teal">
                          {getInitials(p.full_name)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{p.full_name}</h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: <strong>{formatPatientId(p.patient_identifier || p.id)}</strong>
                          </div>
                        </div>
                      </div>
                      <AccessStatusBadge status={status} />
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      <div>Phone: <strong>{p.phone || p.email || '—'}</strong></div>
                      <div>Last Activity: <strong>{p.last_record ? `${formatDate(p.last_record.date)} (${lastRecType})` : 'No records yet'}</strong></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Link to={`/doctor/prescriptions/new?patientId=${p.id}`} state={{ patient: p }} className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                        <Plus size={14} /> Prescribe
                      </Link>
                      <Link to={`/doctor/patients/${p.id}`} className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
                        View File <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <CreatePatientForm
        isOpen={showCreatePatient}
        onClose={() => setShowCreatePatient(false)}
        onPatientCreated={(patient) => {
          setShowCreatePatient(false);
          loadPatients();
          if (patient?.id) {
            navigate(`/doctor/patients/${patient.id}`);
          }
        }}
        onDuplicateSelected={(patient) => {
          setShowCreatePatient(false);
          loadPatients();
          const targetId = patient?.profileId || patient?.id;
          if (targetId) {
            navigate(`/doctor/patients/${targetId}`);
          }
        }}
      />

      <AccessRequestModal
        patient={requestTarget}
        orgId={null}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onRequestSent={(newStatus) => {
          if (requestTarget?.id) {
            setRelMap((prev) => ({ ...prev, [requestTarget.id]: newStatus === 'already_active' ? 'active' : 'pending' }));
          }
          setRequestTarget(null);
          success('Consent request sent to patient. They can approve it in their portal.');
        }}
      />
    </div>
  );
}
