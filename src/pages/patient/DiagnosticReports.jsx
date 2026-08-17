import { useState } from 'react';
import { FlaskConical, Calendar, Building2, ChevronRight, FileText, Search, Eye, Download } from 'lucide-react';
import { usePatientReports } from '../../hooks/useMedicalRecords';
import { formatDate } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { DocumentViewer } from '../../components/documents/DocumentViewer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function PatientDiagnosticReports() {
  const { reports, loading, error, refresh } = usePatientReports();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewerPath, setViewerPath] = useState(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const [search, setSearch] = useState('');

  const handleOpenDetail = (rep) => {
    setSelectedRecord({
      record_type: 'diagnostic_report',
      record_reference_id: rep.id,
    });
    setDrawerOpen(true);
  };

  const handleViewDoc = (e, rep) => {
    e.stopPropagation();
    if (rep.document_path) {
      setViewerPath(rep.document_path);
      setViewerTitle(`Diagnostic Report — ${rep.test_name}`);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = r.test_name?.toLowerCase().includes(q);
    const matchCat = r.test_category?.toLowerCase().includes(q);
    const matchOrg = r.diagnostics_org?.name?.toLowerCase().includes(q);
    const matchSummary = r.summary?.toLowerCase().includes(q);
    return matchName || matchCat || matchOrg || matchSummary;
  });

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

      {/* Search Input */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Search test name, category, findings, or testing facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={search ? "No Reports Match Search" : "No Diagnostic Reports Found"}
          description={search ? "Try searching for a different test or laboratory name." : "Test reports and lab findings uploaded by authorized diagnostics centers will appear here."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="card card-hover"
              style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
              onClick={() => handleOpenDetail(r)}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FlaskConical size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
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
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                    {r.diagnostics_org?.name || 'Diagnostic Center'}
                  </div>
                  {r.doctor?.full_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Ref: {r.doctor.full_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Findings Summary */}
              {r.summary && (
                <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-1)', lineHeight: 1.6, marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4, letterSpacing: '0.04em' }}>
                    Results & Clinical Findings
                  </span>
                  {r.summary}
                </div>
              )}

              {/* Consultant Notes */}
              {r.doctor_notes && (
                <div style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                  <strong>Consultant Remarks:</strong> {r.doctor_notes}
                </div>
              )}

              {/* Footer action bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', gap: 10 }}>
                <div>
                  {r.document_path ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={(e) => handleViewDoc(e, r)}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      <Eye size={13} /> View Attached Lab Report
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Structured digital results
                    </span>
                  )}
                </div>

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

      {/* Document Viewer Modal */}
      {viewerPath && (
        <DocumentViewer
          isOpen={Boolean(viewerPath)}
          onClose={() => setViewerPath(null)}
          documentPath={viewerPath}
          title={viewerTitle}
        />
      )}
    </div>
  );
}
