import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Plus, Calendar, ChevronRight } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function HospitalVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadVisits() {
      try {
        const res = await hospitalService.getVisits({ perPage: 50 });
        setVisits(res.visits || []);
      } catch (err) {
        console.error('Error fetching hospital visits:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVisits();
  }, []);

  const handleOpenDetail = (v) => {
    setSelectedRecord({
      record_type: 'hospital_visit',
      record_reference_id: v.id,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Patient Admissions & Encounters</h1>
          <p className="page-sub">
            All inpatient, outpatient, and emergency visits recorded at this hospital facility.
          </p>
        </div>
        <Link to="/hospital/visits/new" className="btn btn-primary btn-md">
          <Plus size={16} /> Record Patient Visit
        </Link>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No Patient Encounters Recorded"
            description="Record inpatient admissions, emergency care, or outpatient consults."
            actionLabel="Record Patient Visit"
            action={() => navigate('/hospital/visits/new')}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Admission Date</th>
                  <th className="table-head">Discharge Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Department</th>
                  <th className="table-head">Diagnosis / Reason</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {visits.map((v) => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell">{formatDate(v.admission_date)}</td>
                    <td className="table-cell">{formatDate(v.discharge_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {v.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {formatPatientId(v.patient_id)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{
                        background: v.visit_type === 'emergency' ? 'var(--color-danger-bg)' : 'var(--bg-surface-sunken)',
                        color: v.visit_type === 'emergency' ? 'var(--color-danger)' : 'var(--text-primary)',
                        textTransform: 'capitalize'
                      }}>
                        {v.visit_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">{v.department || 'General'}</td>
                    <td className="table-cell">
                      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.diagnosis_summary || v.reason || '—'}
                      </div>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenDetail(v)}
                      >
                        Details <ChevronRight size={13} />
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
