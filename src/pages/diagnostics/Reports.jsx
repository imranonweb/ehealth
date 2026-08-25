import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Upload, Calendar, ChevronRight, FileText, CheckCircle2, Eye } from 'lucide-react';
import { diagnosticsService } from '../../services/diagnosticsService';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function DiagnosticsReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await diagnosticsService.getOrgReports({ perPage: 50 });
        setReports(res.reports || []);
      } catch (err) {
        console.error('Error fetching org reports:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const handleOpenDetail = (r) => {
    setSelectedRecord({
      record_type: 'diagnostic_report',
      record_reference_id: r.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Laboratory Reports &amp; Diagnostic Registry</h1>
          <p className="body-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Complete archive of patient test results, imaging, and pathology reports.
          </p>
        </div>
        <Link to="/diagnostics/reports/new" className="btn btn-primary btn-md">
          <Upload size={16} /> Upload New Report
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={5} cols={5} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={FlaskConical}
              title="No Reports Uploaded"
              description="Upload test results to synchronize with patient timelines."
              actionLabel="Upload Report"
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
                  <th className="table-head" style={{ padding: '14px 20px' }}>Document Status</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {reports.map((r) => {
                  const patientName = r.patient?.full_name || 'Patient';
                  const initials = getInitials(patientName);

                  return (
                    <tr key={r.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
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
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                              {patientName}
                            </div>
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
                              {formatPatientId(r.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{r.test_name}</strong>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <FlaskConical size={12} />
                          {r.test_category || 'General'}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(r.report_date)}
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        {r.document_path ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <FileText size={12} /> PDF Report Attached
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-muted)' }}>
                            Structured Findings
                          </span>
                        )}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(r)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          <Eye size={14} /> View Details
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

      {/* Record Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
