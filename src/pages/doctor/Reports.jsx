import { useState, useEffect } from 'react';
import { FlaskConical, Search, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatPatientId } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function DoctorReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from('diagnostic_reports')
          .select(`
            *,
            patient:patient_id(id, full_name, email),
            diagnostics_org:diagnostics_organization_id(id, name)
          `)
          .order('report_date', { ascending: false })
          .limit(50);

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports for doctor:', err);
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
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Diagnostic Reports & Lab Findings</h1>
          <p className="page-sub">
            Review lab investigations, pathology summaries, and radiology reports for patients.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No Lab Reports Available"
            description="Diagnostic test results uploaded by testing facilities will appear here."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Test / Panel</th>
                  <th className="table-head">Category</th>
                  <th className="table-head">Testing Facility</th>
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
                      <strong style={{ color: 'var(--text-primary)' }}>{r.test_name}</strong>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                        {r.test_category || 'General'}
                      </span>
                    </td>
                    <td className="table-cell">{r.diagnostics_org?.name || 'Lab'}</td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenDetail(r)}
                      >
                        View Report <ChevronRight size={13} />
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
