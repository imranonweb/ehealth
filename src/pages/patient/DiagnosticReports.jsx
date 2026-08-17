import { useState } from 'react';
import { FlaskConical, Calendar, Building2, ChevronRight, FileText, Download } from 'lucide-react';
import { usePatientReports } from '../../hooks/useMedicalRecords';
import { formatDate } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function PatientDiagnosticReports() {
  const { reports, loading, error } = usePatientReports();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <h1 className="page-title">Diagnostic Reports</h1>
          <p className="page-sub">
            Laboratory test findings, pathology summaries, and imaging results.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No Diagnostic Reports Found"
          description="Test reports and lab findings uploaded by authorized diagnostics centers will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {reports.map((r) => (
            <div
              key={r.id}
              className="card card-hover"
              style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
              onClick={() => handleOpenDetail(r)}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                      {r.test_name}
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Calendar size={13} /> {formatDate(r.report_date)}
                      {r.test_category && (
                        <span>· Category: <strong style={{ color: 'var(--text-2)' }}>{r.test_category}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    {r.diagnostics_org?.name || 'Diagnostic Center'}
                  </div>
                  {r.doctor?.full_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Ref: {r.doctor.full_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary snippet */}
              {r.summary && (
                <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, marginTop: 8 }}>
                  <strong>Key Findings:</strong> {r.summary}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {r.document_path ? '📎 Official Document Attached' : 'Structured Data Report'}
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View Full Report <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
