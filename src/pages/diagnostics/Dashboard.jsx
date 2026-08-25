import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Upload, Users, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { diagnosticsService } from '../../services/diagnosticsService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';

export function DiagnosticsDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, statRes] = await Promise.all([
          diagnosticsService.getOrgReports({ perPage: 6 }),
          diagnosticsService.getDashboardStats(),
        ]);
        setReports(repRes.reports || []);
        setStats(statRes);
      } catch (err) {
        console.error('Diagnostics dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const orgName = profile?.full_name || 'Diagnostic Center';

  const handleViewDetail = (r) => {
    setSelectedRecord({
      record_type: 'diagnostic_report',
      record_reference_id: r.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <PageHeader
        title={orgName}
        subtitle="Diagnostics Center & Pathology Lab Portal"
        actions={
          <Link to="/diagnostics/reports/new" className="btn btn-primary btn-md">
            <Upload size={16} /> Upload Test Report
          </Link>
        }
      />

      {/* Stats Ribbon — canonical StatCard components */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <StatCard
          icon={FlaskConical}
          label="Total Reports Issued"
          value={loading ? '…' : stats.totalReports}
          tone="purple"
        />
        <StatCard
          icon={FlaskConical}
          label="Uploaded This Month"
          value={loading ? '…' : stats.thisMonth}
          tone="teal"
        />
        <StatCard
          icon={Users}
          label="Patient Index"
          hint="Find Patient by ID →"
          value=""
          tone="blue"
          to="/diagnostics/patients"
        />
      </div>

      {/* Recent Diagnostic Reports */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Lab Reports
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Reports recently uploaded to the centralized health timeline.
            </p>
          </div>
          <Link to="/diagnostics/reports" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={4} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No Reports Uploaded Yet"
            description="Upload official laboratory reports and link them to patient medical IDs."
            actionLabel="Upload First Report"
            action={() => navigate('/diagnostics/reports/new')}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Test Investigation</th>
                  <th className="table-head">Category</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {reports.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell">{formatDate(r.report_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {formatPatientId(r.patient_id)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <strong>{r.test_name}</strong>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                        {r.test_category || 'General'}
                      </span>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      {/* Open the RecordDetailDrawer for this specific report */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleViewDetail(r)}
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
