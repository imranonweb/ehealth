import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, BedDouble, Pill, Plus, Users, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';

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
        subtitle="Hospital Operations &amp; Clinical Encounters Dashboard"
        actions={
          <Link to="/hospital/visits/new" className="btn btn-primary btn-md">
            <Plus size={16} /> New Patient Visit
          </Link>
        }
      />

      {/* Stats Ribbon — canonical StatCard components */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
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
        <StatCard
          icon={Users}
          label="Patient Central Index"
          hint="Search Patient Records →"
          value=""
          tone="green"
          to="/hospital/patients"
        />
      </div>

      {/* Recent Admissions & Encounters */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Patient Encounters &amp; Admissions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Hospitalization records, emergency care, and outpatient consultations.
            </p>
          </div>
          <Link to="/hospital/visits" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No Patient Visits Recorded"
            description="Log inpatient admissions, emergency care, or discharge summaries for patients."
            actionLabel="Record Patient Visit"
            action={() => navigate('/hospital/visits/new')}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Visit Type</th>
                  <th className="table-head">Department</th>
                  <th className="table-head">Primary Reason / Diagnosis</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {visits.map((v) => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell">{formatDate(v.admission_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {v.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {formatPatientId(v.patient_id)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{
                        background: v.visit_type === 'emergency' ? 'var(--color-danger-bg)' : 'var(--bg-surface-sunken)',
                        color: v.visit_type === 'emergency' ? 'var(--color-danger)' : 'var(--text-primary)',
                        textTransform: 'capitalize'
                      }}>
                        {v.visit_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">{v.department || 'General'}</td>
                    <td className="table-cell">
                      <div style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.diagnosis_summary || v.reason || '—'}
                      </div>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      {/* Open RecordDetailDrawer for this specific visit */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleViewDetail(v)}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
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
