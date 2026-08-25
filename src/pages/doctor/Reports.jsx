import { useState, useEffect } from 'react';
import { FlaskConical, Search, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
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

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={4} cols={5} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={FlaskConical}
              title="No Lab Reports Available"
              description="Diagnostic test results uploaded by testing facilities will appear here."
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Test / Panel</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Category</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Date Issued</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Testing Facility</th>
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
                            width: 36,
                            height: 36,
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
                          {r.test_category || 'General Lab'}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(r.report_date)}
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        {r.diagnostics_org?.name || 'Authorized Diagnostic Center'}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(r)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          View Report <ChevronRight size={13} />
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
