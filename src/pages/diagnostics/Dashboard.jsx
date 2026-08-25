import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Upload, Users, FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { diagnosticsService } from '../../services/diagnosticsService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function DiagnosticsDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">{orgName}</h1>
          <p className="page-sub">
            Diagnostics Center & Pathology Lab Portal
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/diagnostics/reports/new" className="btn btn-primary btn-md">
            <Upload size={16} /> Upload Test Report
          </Link>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Reports Issued</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {loading ? '…' : stats.totalReports}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Uploaded This Month</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {loading ? '…' : stats.thisMonth}
              </div>
            </div>
          </div>
        </div>

        <Link to="/diagnostics/patients" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Patient Index</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
                  Find Patient by ID →
                </div>
              </div>
            </div>
          </div>
        </Link>
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
            View All <ArrowRight size={14} />
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
            action={() => window.location.href = '/diagnostics/reports/new'}
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
                      <Link to="/diagnostics/reports" className="btn btn-ghost btn-sm">
                        Details <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
