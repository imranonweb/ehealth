import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Pill, Plus, Search, FileText, ArrowRight, Stethoscope,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Eye, Building2, FlaskConical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { formatDate, getInitials, formatPatientId, stringToColor } from '../../lib/utils';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { QuickActionCard } from '../../components/ui/QuickActionCard';
import './DoctorDashboard.css';

export function DoctorDashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState({
    patientCount: 0,
    prescriptionCount: 0,
    reportCount: 0,
    visitCount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getDashboardData(profile.id);
      setData(res);
    } catch (err) {
      console.error('Doctor dashboard load failed:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [profile?.id]);

  const doctorName = profile?.full_name?.replace(/^(Dr\.\s*|Dr\s+)/i, '') || 'Practitioner';
  const specialization = profile?.doctor_profile?.specialization || 'Clinical Specialist';

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <PageHeader
        title={`${getGreeting()}, Dr. ${doctorName}`}
        subtitle="Manage your patients and access their healthcare records securely."
      />

      {/* Quick Actions */}
      <div className="grid-4" style={{ marginBottom: 'var(--sp-6)' }}>
        <QuickActionCard
          to="/doctor/prescriptions/new"
          icon={Plus}
          label="New Prescription"
          description="Write a new e-prescription"
          color="var(--color-blue)"
        />
        <QuickActionCard
          to="/doctor/patients"
          icon={Search}
          label="Find Patient"
          description="Search patient directory"
          color="var(--color-teal)"
        />
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
          <button type="button" onClick={loadDashboard} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {/* Overview Stat Cards — using canonical StatCard component */}
      <div className="grid-4" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <StatCard
          icon={Users}
          label="My Patients"
          value={loading ? '…' : data.patientCount}
          tone="teal"
          to="/doctor/patients"
        />
        <StatCard
          icon={Pill}
          label="Prescriptions"
          value={loading ? '…' : data.prescriptionCount}
          tone="blue"
          to="/doctor/prescriptions"
        />
        <StatCard
          icon={FlaskConical}
          label="Diagnostic Reports"
          value={loading ? '…' : data.reportCount}
          tone="purple"
          to="/doctor/reports"
        />
        <StatCard
          icon={Building2}
          label="Hospital Records"
          value={loading ? '…' : data.visitCount}
          tone="teal"
        />
      </div>

      {/* Recent Patient Activity */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
        }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
              Recent Patient Activity
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
              Recent clinical records from patients you are authorized to access.
            </p>
          </div>
          <Link to="/doctor/patients" className="btn btn-ghost btn-sm">
            View All Patients <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-6)' }}>
            <SkeletonTable rows={4} cols={5} />
          </div>
        ) : data.recentActivity.length === 0 ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <EmptyState
              icon={FileText}
              title="No Recent Patient Activity"
              description="Clinical events from authorized patients will appear here."
              actionLabel="View Patients"
              action={() => navigate('/doctor/patients')}
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Record Type</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Record Summary</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Context / Facility</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Date</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {data.recentActivity.map((rec) => {
                  const isPresc = rec.record_type === 'prescription';
                  const isDiag = rec.record_type === 'diagnostic_report';
                  const isHosp = rec.record_type === 'hospital_visit';

                  const badgeClass = isPresc ? 'badge-blue' : isDiag ? 'badge-purple' : 'badge-primary';
                  const typeLabel = isPresc ? 'Prescription' : isDiag ? 'Diagnostic Report' : 'Hospital Visit';
                  const TypeIcon = isPresc ? Pill : isDiag ? FlaskConical : Building2;
                  const providerContext = rec.metadata?.hospital_name || rec.metadata?.doctor_name || rec.metadata?.diagnostics_name || specialization;
                  const patientName = rec.patient?.full_name || 'Authorized Patient';
                  const initials = getInitials(patientName);

                  return (
                    <tr key={rec.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      {/* Patient Column */}
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
                          }}>
                            {initials}
                          </div>
                          <div>
                            <Link
                              to={`/doctor/patients/${rec.patient_id}`}
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
                              marginTop: 2,
                            }}>
                              {formatPatientId(rec.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span className={`badge ${badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <TypeIcon size={12} />
                          {typeLabel}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          {rec.title}
                        </div>
                        {rec.description && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            maxWidth: 300,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 2,
                          }}>
                            {rec.description}
                          </div>
                        )}
                      </td>

                      {/* Context */}
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        {providerContext}
                      </td>

                      {/* Date */}
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(rec.record_date)}
                      </td>

                      {/* Action */}
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail(rec)}
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
