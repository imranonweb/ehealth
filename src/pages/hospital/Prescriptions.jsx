import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Plus, ChevronRight, Eye, Calendar, User } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function HospitalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const res = await hospitalService.getPrescriptions({ perPage: 50 });
        setPrescriptions(res.prescriptions || []);
      } catch (err) {
        console.error('Error fetching hospital prescriptions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, []);

  const handleOpenDetail = (p) => {
    setSelectedRecord({
      record_type: 'prescription',
      record_reference_id: p.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Hospital-Issued Prescriptions</h1>
          <p className="body-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Medical prescriptions issued by attending physicians and clinical departments at this hospital.
          </p>
        </div>
        <Link to="/hospital/prescriptions/new" className="btn btn-primary btn-md">
          <Plus size={16} /> New Prescription
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={5} cols={5} />
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={Pill}
              title="No Prescriptions Issued"
              description="Create hospital discharge or outpatient medication orders."
              actionLabel="Create Prescription"
              action={() => navigate('/hospital/prescriptions/new')}
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Diagnosis</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Prescription Date</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Attending Physician</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {prescriptions.map((p) => {
                  const patientName = p.patient?.full_name || 'Patient';
                  const initials = getInitials(patientName);

                  return (
                    <tr key={p.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
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
                              {formatPatientId(p.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Pill size={12} />
                            {p.diagnosis || 'Clinical Rx'}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(p.prescription_date)}
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: 'var(--text-primary)' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          Dr. {p.doctor?.full_name || 'Hospital Practitioner'}
                        </div>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(p)}
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
