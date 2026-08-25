import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Upload, Users, Eye, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { diagnosticsService } from '../../services/diagnosticsService';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { QuickActionCard } from '../../components/ui/QuickActionCard';

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
        subtitle="Diagnostics Center &amp; Pathology Lab Portal"
      />

      {/* Quick Actions */}
      <div className="grid-4" style={{ marginBottom: 'var(--sp-6)' }}>
        <QuickActionCard
          to="/diagnostics/reports/new"
          icon={Upload}
          label="Upload Report"
          description="Submit a new lab report"
          color="var(--color-purple)"
        />
        <QuickActionCard
          to="/diagnostics/patients"
          icon={Users}
          label="Patient Index"
          description="Find a patient record"
          color="var(--color-blue)"
        />
      </div>

      {/* Stats Ribbon — canonical StatCard components */}
      <div className="grid-2" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
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
      </div>

      {/* Recent Diagnostic Reports */}
      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
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
                Recent Lab Reports &amp; Diagnostic Studies
              </h2>
              {reports.length > 0 && (
                <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  {reports.length} Reports
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, margin: '4px 0 0 0' }}>
              Laboratory investigations, pathology tests, and imaging records uploaded to the centralized health timeline.
            </p>
          </div>
          <Link to="/diagnostics/reports" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            View All Reports <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={4} cols={5} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={FlaskConical}
              title="No Reports Uploaded Yet"
              description="Upload official laboratory reports and link them to patient medical IDs."
              actionLabel="Upload First Report"
              action={() => navigate('/diagnostics/reports/new')}
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Test Investigation</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Category</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Date Issued</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Status</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {reports.map((r) => {
                  const patientName = r.patient?.full_name || 'Patient';
                  const initials = getInitials(patientName);

                  return (
                    <tr key={r.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
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
                              to={`/diagnostics/patients`}
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
                              {formatPatientId(r.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Test Name */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          {r.test_name}
                        </div>
                        {r.lab_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {r.lab_name}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-purple-bg)',
                          color: 'var(--color-purple)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          <FlaskConical size={13} />
                          <span>{r.test_category || 'General Lab'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {formatDate(r.report_date)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                        }}>
                          <CheckCircle2 size={12} />
                          <span>Uploaded</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail(r)}
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
