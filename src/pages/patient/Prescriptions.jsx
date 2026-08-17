import { useState } from 'react';
import { Pill, Calendar, User, Building2, ChevronRight, FileText, Search, Eye, Download } from 'lucide-react';
import { usePatientPrescriptions } from '../../hooks/useMedicalRecords';
import { formatDate, parseMedications } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { DocumentViewer } from '../../components/documents/DocumentViewer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function PatientPrescriptions() {
  const { prescriptions, loading, error, refresh } = usePatientPrescriptions();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewerPath, setViewerPath] = useState(null);
  const [viewerTitle, setViewerTitle] = useState('');
  const [search, setSearch] = useState('');

  const handleOpenDetail = (presc) => {
    setSelectedRecord({
      record_type: 'prescription',
      record_reference_id: presc.id,
    });
    setDrawerOpen(true);
  };

  const handleViewDoc = (e, presc) => {
    e.stopPropagation();
    if (presc.document_path) {
      setViewerPath(presc.document_path);
      setViewerTitle(`Prescription — ${presc.diagnosis}`);
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchDiag = p.diagnosis?.toLowerCase().includes(q);
    const matchDoctor = p.doctor?.full_name?.toLowerCase().includes(q);
    const matchHospital = p.hospital?.name?.toLowerCase().includes(q);
    const matchMeds = JSON.stringify(p.medications || []).toLowerCase().includes(q);
    return matchDiag || matchDoctor || matchHospital || matchMeds;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-sub">
            Medications, clinical dosages, and treatment schedules issued by your doctors.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            className="input has-icon"
            placeholder="Search by diagnosis, medicine name, or doctor..."
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
      ) : filteredPrescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={search ? "No Prescriptions Match Search" : "No Prescriptions on Record"}
          description={search ? "Try searching with a different diagnosis or doctor name." : "Your digital medical prescriptions will appear here when authorized doctors issue them."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredPrescriptions.map((p) => {
            const meds = parseMedications(p.medications);
            return (
              <div
                key={p.id}
                className="card card-hover"
                style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
                onClick={() => handleOpenDetail(p)}
              >
                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Pill size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                        {p.diagnosis || 'Clinical Prescription'}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={13} /> {formatDate(p.prescription_date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                      {p.doctor?.full_name || 'Authorized Practitioner'}
                    </div>
                    {p.hospital?.name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {p.hospital.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Medication Breakdown Chips */}
                {meds.length > 0 && (
                  <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginTop: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                      Prescribed Medications ({meds.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {meds.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                          <div>
                            <strong style={{ fontSize: '0.875rem', color: 'var(--text-1)' }}>{m.name}</strong>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginLeft: 8, fontWeight: 600 }}>{m.dosage}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            {m.frequency} · {m.duration}
                            {m.instructions ? ` · (${m.instructions})` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions snippet */}
                {p.instructions && (
                  <div style={{ marginTop: 10, fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    <strong>Doctor's Advice:</strong> {p.instructions}
                  </div>
                )}

                {/* Footer action bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', gap: 10 }}>
                  <div>
                    {p.document_path ? (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={(e) => handleViewDoc(e, p)}
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        <Eye size={13} /> View Attached Prescription Scan
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        Structured digital record
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Full Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
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
