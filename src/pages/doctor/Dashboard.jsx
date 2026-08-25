import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Pill, Plus, Search, FileText, ArrowRight, Stethoscope,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Eye, Building2, FlaskConical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import { formatDate, getInitials, formatPatientId } from '../../lib/utils';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
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
        actions={
          <>
            <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-md">
              <Plus size={16} /> New Prescription
            </Link>
            <Link to="/doctor/patients" className="btn btn-secondary btn-md">
              <Users size={16} /> Patient Directory
            </Link>
          </>
        }
      />

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
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--sp-4)',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--sp-4)',
        }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Patient Activity
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Recent clinical records from patients you are authorized to access.
            </p>
          </div>
          <Link to="/doctor/patients" className="btn btn-ghost btn-sm">
            View All Patients <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : data.recentActivity.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Recent Patient Activity"
            description="Clinical events from authorized patients will appear here."
            actionLabel="View Patients"
            action={() => navigate('/doctor/patients')}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Record Type</th>
                  <th className="table-head">Record Title / Summary</th>
                  <th className="table-head">Context / Provider</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {data.recentActivity.map((rec) => {
                  const isPresc = rec.record_type === 'prescription';
                  const isDiag = rec.record_type === 'diagnostic_report';
                  const isHosp = rec.record_type === 'hospital_visit';

                  const badgeClass = isPresc ? 'badge-blue' : isDiag ? 'badge-purple' : 'badge-primary';
                  const typeLabel = isPresc ? 'Prescription' : isDiag ? 'Diagnostic Report' : 'Hospital Visit';
                  const providerContext = rec.metadata?.hospital_name || rec.metadata?.doctor_name || rec.metadata?.diagnostics_name || specialization;

                  return (
                    <tr key={rec.id} className="table-row">
                      <td className="table-cell" style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(rec.record_date)}
                      </td>
                      <td className="table-cell">
                        <Link
                          to={`/doctor/patients/${rec.patient_id}`}
                          style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                        >
                          {rec.patient?.full_name || 'Authorized Patient'}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {rec.patient?.email}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${badgeClass}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {rec.title}
                        </div>
                        {rec.description && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            maxWidth: 260,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {rec.description}
                          </div>
                        )}
                      </td>
                      <td className="table-cell" style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {providerContext}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenDetail(rec)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
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
