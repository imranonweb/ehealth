import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Upload, Calendar, ChevronRight } from 'lucide-react';
import { diagnosticsService } from '../../services/diagnosticsService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function DiagnosticsReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleOpenDetail = (rep) => {
    setSelectedRecord({
      record_type: 'diagnostic_report',
      record_reference_id: rep.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Diagnostic Test Reports</h1>
          <p className="page-sub">
            All investigation reports and pathology findings issued by your facility.
          </p>
        </div>
        <Link to="/diagnostics/reports/new" className="btn btn-primary btn-md">
          <Upload size={16} /> Upload New Report
        </Link>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No Reports Uploaded"
            description="Upload test results to synchronize with patient timelines."
            actionLabel="Upload Report"
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
                  <th className="table-head">Document Status</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
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
                    <td className="table-cell">
                      {r.document_path ? (
                        <span className="badge badge-success">PDF Attached</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-muted)' }}>Structured Only</span>
                      )}
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenDetail(r)}
                      >
                        View <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
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
