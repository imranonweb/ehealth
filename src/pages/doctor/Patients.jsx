import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, ChevronRight, User, AlertCircle, RefreshCw,
  Filter, FileText, Pill, FlaskConical, Building2, CheckCircle2,
  Calendar, ShieldCheck, Plus, UserPlus, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { searchService } from '../../services/searchService';
import { CreatePatientForm } from '../../components/forms/CreatePatientForm';
import { formatPatientId, getInitials, formatDate, stringToColor, debounce } from '../../lib/utils';
import { SkeletonTable, SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import './DoctorPatients.css';

export function DoctorPatients() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  // Live registry search state
  const [registryResults, setRegistryResults] = useState([]);
  const [searchingRegistry, setSearchingRegistry] = useState(false);

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
      relationship_status: 'registry',
    }));

    return [...filteredLocalPatients, ...extraRegistry];
  }, [filteredLocalPatients, registryResults, searchQuery]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Patient Directory & Consultations</h1>
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
            <UserPlus size={16} /> Add New Patient
          </button>
          <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-md">
            <Plus size={16} /> New Prescription
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="card" style={{
          padding: 'var(--sp-4)',
          marginBottom: 'var(--sp-6)',
          backgroundColor: 'var(--color-danger-bg)',
          borderColor: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
          </div>
          <button type="button" onClick={loadPatients} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {/* Controls Card (Search + Filter Tabs) */}
      <div className="card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 340px', maxWidth: 520 }}>
            {searchingRegistry ? (
              <Loader2 size={16} className="input-icon spin" style={{ color: 'var(--accent)' }} />
            ) : (
              <Search size={16} className="input-icon" />
            )}
            <input
              type="text"
              className="input has-icon"
              placeholder="Search patients by name, Health ID (e.g. P-9824F1A2), phone, or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ height: 42, fontSize: '0.9375rem' }}
            />
          </div>

          {/* Filter Pills */}
          <div className="filter-pill-bar">
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Patients ({searchQuery.trim() ? combinedSearchResults.length : patients.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveFilter('recent')}
            >
              Has Activity
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveFilter('prescriptions')}
            >
              Prescriptions
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveFilter('reports')}
            >
              Lab Reports
            </button>
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'visits' ? 'active' : ''}`}
              onClick={() => setActiveFilter('visits')}
            >
              Hospital Records
            </button>
          </div>
        </div>
      </div>

      {/* Patient List Content */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--sp-4)',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--sp-4)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            {searchQuery.trim() ? `Search Results (${combinedSearchResults.length})` : `Active Consultations (${patients.length})`}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Centralized National Health Registry
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : combinedSearchResults.length === 0 ? (
          <div style={{ padding: 'var(--sp-8) 0' }}>
            <EmptyState
              icon={Users}
              title={searchQuery ? "No Matching Patients Found" : "No Patients Yet"}
              description={
                searchQuery
                  ? `No patient matched "${searchQuery}". Check the Health ID or name, or add a new patient.`
                  : 'Search for a patient using their Health ID, name, or phone number above to review their history or write a prescription.'
              }
              actionLabel="Add New Patient"
              action={() => setShowCreatePatient(true)}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container card-table-wrap hide-on-mobile">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className="table-header">
                  <tr>
                    <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Health ID / Contact</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Last Clinical Record</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Status</th>
                    <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Action</th>
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
                          {p.isRegistrySearch ? (
                            <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-secondary)' }}>
                              Registry Profile
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <CheckCircle2 size={12} /> Active
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="table-cell" style={{ textAlign: 'right', padding: '16px 24px' }}>
                          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                            <Link to={`/doctor/prescriptions/new?patientId=${p.id}`} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                              <Plus size={13} /> Prescribe
                            </Link>
                            <Link to={`/doctor/patients/${p.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                              View <ChevronRight size={13} />
                            </Link>
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
                      <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>Active</span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      <div>Phone: <strong>{p.phone || p.email || '—'}</strong></div>
                      <div>Last Activity: <strong>{p.last_record ? `${formatDate(p.last_record.date)} (${lastRecType})` : 'No records yet'}</strong></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Link to={`/doctor/prescriptions/new?patientId=${p.id}`} className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
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
    </div>
  );
}

