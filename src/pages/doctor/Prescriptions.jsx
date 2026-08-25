import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Plus, Calendar, ChevronRight, User } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate, parseMedications, formatPatientId } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const res = await prescriptionService.getMyPrescriptions({ perPage: 50 });
        setPrescriptions(res.prescriptions || []);
      } catch (err) {
        console.error('Failed to load doctor prescriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, []);

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
          <h1 className="page-title">Authored Prescriptions</h1>
          <p className="page-sub">
            Complete list of prescriptions issued by you across private chamber and affiliated hospitals.
          </p>
        </div>
        <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-md">
          <Plus size={16} /> New Prescription
        </Link>
      </div>

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Issued"
          description="Create digital e-prescriptions with structured dosages and instructions for your patients."
          actionLabel="Create Prescription"
          action={() => navigate('/doctor/prescriptions/new')}
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
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Pill size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {p.diagnosis || 'Prescription'}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Calendar size={13} /> {formatDate(p.prescription_date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.patient?.full_name || 'Patient'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {formatPatientId(p.patient_id)}
                    </div>
                  </div>
                </div>

                {meds.length > 0 && (
                  <div style={{ background: 'var(--bg-surface-muted)', padding: '8px 12px', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {meds.map((m, idx) => (
                      <span key={idx} className="badge" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                        {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {p.hospital?.name || 'Private Chamber'}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View Full Prescription <ChevronRight size={14} />
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
