import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Plus, Calendar, ChevronRight } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, parseMedications, formatPatientId } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function HospitalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <h1 className="page-title">Hospital-Issued Prescriptions</h1>
          <p className="page-sub">
            Prescriptions issued by attending physicians at this hospital.
          </p>
        </div>
        <Link to="/hospital/prescriptions/new" className="btn btn-primary btn-md">
          <Plus size={16} /> New Prescription
        </Link>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No Prescriptions Issued"
            description="Create hospital discharge or outpatient medication orders."
            actionLabel="Create Prescription"
            action={() => window.location.href = '/hospital/prescriptions/new'}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Diagnosis</th>
                  <th className="table-head">Attending Doctor</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {prescriptions.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">{formatDate(p.prescription_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        {p.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        ID: {formatPatientId(p.patient_id)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <strong style={{ color: 'var(--text-1)' }}>{p.diagnosis || 'General'}</strong>
                    </td>
                    <td className="table-cell">{p.doctor?.full_name || 'Hospital Practitioner'}</td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenDetail(p)}
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
