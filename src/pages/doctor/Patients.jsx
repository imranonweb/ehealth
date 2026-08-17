import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, ChevronRight, User, AlertCircle, RefreshCw,
  Filter, FileText, Pill, FlaskConical, Building2, CheckCircle2,
  Calendar, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { formatPatientId, getInitials, formatDate } from '../../lib/utils';
import { SkeletonTable, SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import './DoctorPatients.css';

export function DoctorPatients() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // 1. Search query matching
      const matchesSearch =
        !searchQuery.trim() ||
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Category filtering
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Authorized Patients</h1>
          <p className="page-sub">
            Patients who have authorized access for clinical consultations and longitudinal medical history review.
          </p>
        </div>
        <div>
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} /> RLS Authorized Patients Only
          </span>
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
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 460 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input has-icon"
              placeholder="Search authorized patients by name, health ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="filter-pill-bar">
            <button
              type="button"
              className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({patients.length})
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
            Authorized Patient Records {loading ? '' : `(${filteredPatients.length})`}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Access governed by patient consent & provider relationships
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Authorized Patients Found"
            description="No patients are currently associated with your account. When a patient grants you access, their record will appear here."
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Matching Patients"
            description={`No authorized patients matched "${searchQuery}".`}
            actionLabel="Clear Search"
            action={() => { setSearchQuery(''); setActiveFilter('all'); }}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container hide-on-mobile">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-head">Patient</th>
                    <th className="table-head">Last Record</th>
                    <th className="table-head">Accessible Records</th>
                    <th className="table-head">Relationship Status</th>
                    <th className="table-head" style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredPatients.map((p) => {
                    const lastRecType = p.last_record?.type === 'prescription'
                      ? 'Prescription'
                      : p.last_record?.type === 'diagnostic_report'
                      ? 'Lab Report'
                      : p.last_record?.type === 'hospital_visit'
                      ? 'Hospital Visit'
                      : null;

                    return (
                      <tr key={p.id} className="table-row">
                        {/* Patient Column */}
                        <td className="table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="avatar avatar-sm avatar-teal">
                              {getInitials(p.full_name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {p.full_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {p.patient_identifier ? (
                                  <>ID: <strong style={{ color: 'var(--accent)' }}>{formatPatientId(p.patient_identifier)}</strong> · </>
                                ) : null}
                                {p.gender ? <span style={{ textTransform: 'capitalize' }}>{p.gender} · </span> : null}
                                {p.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Last Record Column */}
                        <td className="table-cell">
                          {p.last_record ? (
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                                {formatDate(p.last_record.date)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {lastRecType}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              No records yet
                            </span>
                          )}
                        </td>

                        {/* Records Count Column */}
                        <td className="table-cell">
                          <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {p.record_count} {p.record_count === 1 ? 'record' : 'records'}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="table-cell">
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> Active Relationship
                          </span>
                        </td>

                        {/* Action Column */}
                        <td className="table-cell" style={{ textAlign: 'right' }}>
                          <Link to={`/doctor/patients/${p.id}`} className="btn btn-primary btn-sm">
                            View Patient <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-patient-cards show-on-mobile">
              {filteredPatients.map((p) => {
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
                      <div>Last Activity: <strong>{p.last_record ? `${formatDate(p.last_record.date)} (${lastRecType})` : 'No records yet'}</strong></div>
                      <div>Accessible Records: <strong>{p.record_count}</strong></div>
                    </div>

                    <Link to={`/doctor/patients/${p.id}`} className="btn btn-primary btn-sm w-full">
                      View Patient <ChevronRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
