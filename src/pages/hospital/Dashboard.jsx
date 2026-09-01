import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Pill, Plus, Users, Eye, AlertCircle, Activity, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { QuickActionCard } from '../../components/ui/QuickActionCard';

export function HospitalDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({ totalVisits: 0, totalPrescriptions: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [visitRes, statRes] = await Promise.all([
          hospitalService.getVisits({ perPage: 6 }),
          hospitalService.getDashboardStats(),
        ]);
        setVisits(visitRes.visits || []);
        setStats(statRes);
      } catch (err) {
        console.error('Hospital dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const hospitalName = profile?.full_name || 'Hospital Center';

  const handleViewDetail = (v) => {
    setSelectedRecord({
      record_type: 'hospital_visit',
      record_reference_id: v.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <PageHeader
        title={hospitalName}
        subtitle="Hospital Operations & Clinical Encounters Dashboard"
      />

      {/* Quick Actions — 2 actions, so use grid-2 */}
      <div className="grid-2" style={{ marginBottom: 'var(--sp-5)' }}>
        <QuickActionCard
          to="/hospital/visits/new"
          icon={Plus}
          label="New Patient Visit"
          description="Record an inpatient or emergency visit"
          color="var(--color-blue)"
        />
        <QuickActionCard
          to="/hospital/patients"
          icon={Users}
          label="Patient Central Index"
          description="Search hospital records"
          color="var(--color-teal)"
        />
      </div>

      {/* Stats Ribbon */}
      <div className="grid-2" style={{ gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
        <StatCard
          icon={BedDouble}
          label="Total Recorded Admissions"
          value={loading ? '…' : stats.totalVisits}
          tone="teal"
        />
        <StatCard
          icon={Pill}
          label="Hospital Prescriptions"
          value={loading ? '…' : stats.totalPrescriptions}
          tone="blue"
        />
      </div>

      {/* Recent Admissions & Encounters */}
      <div className="card" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 28px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Recent Patient Encounters &amp; Admissions
              </h2>
              {visits.length > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  {visits.length} Encounters
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, margin: '4px 0 0 0' }}>
              Real-time log of inpatient admissions, emergency cases, and clinical discharge summaries.
            </p>
          </div>
          <Link to="/hospital/visits" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            View Full Registry <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={4} cols={6} />
          </div>
        ) : visits.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={BedDouble}
              title="No Patient Visits Recorded"
              description="Log inpatient admissions, emergency care, or discharge summaries for patients."
              actionLabel="Record Patient Visit"
              action={() => navigate('/hospital/visits/new')}
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Encounter Type</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Department</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Dates &amp; Timeline</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Diagnosis &amp; Reason</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Status</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {visits.map((v) => {
                  const isOpen = !v.discharge_date;
                  const patientName = v.patient?.full_name || 'Patient';
                  const initials = getInitials(patientName);
                  const isEmergency = v.visit_type === 'emergency';
                  const isInpatient = v.visit_type === 'inpatient' || v.visit_type === 'admission';

                  return (
                    <tr key={v.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      {/* Patient Info with Avatar */}
                      <td className="table-cell" style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: stringToColor(patientName),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            flexShrink: 0,
                            letterSpacing: '0.02em',
                          }}>
                            {initials}
                          </div>
                          <div>
                            <Link
                              to={`/hospital/patients/${v.patient_id}`}
                              style={{
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                display: 'block',
                                fontSize: '0.9375rem',
                              }}
                            >
                              {patientName}
                            </Link>
                            <span style={{
                              fontSize: '0.6875rem',
                              color: 'var(--text-muted)',
                              fontFamily: 'monospace',
                              backgroundColor: 'var(--bg-surface-muted)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-xs)',
                              display: 'inline-block',
                              marginTop: 3,
                            }}>
                              {formatPatientId(v.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Visit Type Badge */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: isEmergency ? 'var(--color-danger-bg)' : isInpatient ? 'var(--color-blue-bg)' : 'var(--color-teal-bg)', color: isEmergency ? 'var(--color-danger)' : isInpatient ? 'var(--color-blue)' : 'var(--color-teal)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {isEmergency ? <AlertCircle size={13} /> : isInpatient ? <BedDouble size={13} /> : <Activity size={13} />}
                          <span>{v.visit_type?.replace('_', ' ') || 'General Visit'}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {v.department || 'General Medicine'}
                        </div>
                        {v.doctor_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Dr. {v.doctor_name}
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          Admitted: <span style={{ fontWeight: 600 }}>{formatDate(v.admission_date)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {v.discharge_date ? `Discharged: ${formatDate(v.discharge_date)}` : 'Currently Admitted'}
                        </div>
                      </td>

                      {/* Diagnosis & Summary */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          maxWidth: 260,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {v.diagnosis_summary || v.reason || 'Routine Encounter'}
                        </div>
                        {v.notes && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            maxWidth: 260,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 2,
                          }}>
                            {v.notes}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isOpen ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                          color: isOpen ? 'var(--color-warning)' : 'var(--color-success)',
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: isOpen ? 'var(--color-warning)' : 'var(--color-success)',
                          }} />
                          {isOpen ? 'Active Case' : 'Completed'}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail(v)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
