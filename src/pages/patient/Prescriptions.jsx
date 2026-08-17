import { useState } from 'react';
import { Pill, Calendar, User, Building2, ChevronRight, FileText } from 'lucide-react';
import { usePatientPrescriptions } from '../../hooks/useMedicalRecords';
import { formatDate, parseMedications } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function PatientPrescriptions() {
  const { prescriptions, loading, error } = usePatientPrescriptions();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDetail = (presc) => {
    setSelectedRecord({
      record_type: 'prescription',
      record_reference_id: presc.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-sub">
            Medications, clinical dosages, and treatment instructions issued by your doctors.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions on Record"
          description="Your medical prescriptions will appear here when authorized doctors issue them."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {prescriptions.map((p) => {
            const meds = parseMedications(p.medications);
            return (
              <div
                key={p.id}
                className="card card-hover"
                style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
                onClick={() => handleOpenDetail(p)}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Pill size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                        {p.diagnosis || 'Clinical Prescription'}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={13} /> {formatDate(p.prescription_date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>
                      {p.doctor?.full_name || 'Authorized Practitioner'}
                    </div>
                    {p.hospital?.name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {p.hospital.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Medication Chips / Preview */}
                {meds.length > 0 && (
                  <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginTop: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Prescribed Medicines ({meds.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {meds.map((m, idx) => (
                        <span key={idx} className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '4px 10px' }}>
                          <strong>{m.name}</strong> · {m.dosage} ({m.frequency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                    {p.instructions ? p.instructions.slice(0, 70) + '…' : 'No specific patient notes'}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View Details <ChevronRight size={14} />
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
    </div>
  );
}
