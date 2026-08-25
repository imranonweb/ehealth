import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BedDouble, Plus, ChevronRight, AlertCircle, Activity, Eye, ArrowRight } from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId, getInitials, stringToColor } from '../../lib/utils';
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
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Hospital Patient Registry &amp; Visits</h1>
          <p className="body-sm text-muted" style={{ margin: '4px 0 0 0' }}>
            Comprehensive directory of all inpatient admissions, emergency care, and outpatient encounters.
          </p>
        </div>
        <Link to="/hospital/visits/new" className="btn btn-primary btn-md">
          <Plus size={16} /> New Patient Visit
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
        {loading ? (
          <div style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : visits.length === 0 ? (
          <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
            <EmptyState
              icon={BedDouble}
              title="No Patient Encounters Recorded"
              description="Record inpatient admissions, emergency care, or outpatient consults."
              actionLabel="Record Patient Visit"
              action={() => navigate('/hospital/visits/new')}
            />
          </div>
        ) : (
          <div className="table-container card-table-wrap">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="table-header">
                <tr>
                  <th className="table-head" style={{ padding: '14px 24px' }}>Patient</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Encounter Type</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Department</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Dates &amp; Timeline</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Diagnosis &amp; Reason</th>
                  <th className="table-head" style={{ padding: '14px 20px' }}>Status</th>
                  <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {visits.map((v) => {
                  const isOpen = !v.discharge_date;
                  const patientName = v.patient?.full_name || 'Patient';
                  const initials = getInitials(patientName);
                  const isEmergency = v.visit_type === 'emergency';
                  const isInpatient = v.visit_type === 'inpatient' || v.visit_type === 'admission';

                  return (
                    <tr key={v.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
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
                            <Link
                              to={`/hospital/patients/${v.patient_id}`}
                              style={{
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                display: 'block',
                                fontSize: '0.9375rem',
                              }}
                            >
                              {patientName}
                            </Link>
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
                              {formatPatientId(v.patient_id)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: isEmergency ? 'var(--color-danger-bg)' : isInpatient ? 'var(--color-blue-bg)' : 'var(--color-teal-bg)', color: isEmergency ? 'var(--color-danger)' : isInpatient ? 'var(--color-blue)' : 'var(--color-teal)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {isEmergency ? <AlertCircle size={13} /> : isInpatient ? <BedDouble size={13} /> : <Activity size={13} />}
                          <span>{v.visit_type?.replace('_', ' ') || 'General Visit'}</span>
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>{v.department || 'General'}</td>
                      <td className="table-cell" style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          Admitted: <span style={{ fontWeight: 600 }}>{formatDate(v.admission_date)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {v.discharge_date ? `Discharged: ${formatDate(v.discharge_date)}` : 'Currently Admitted'}
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {v.diagnosis_summary || v.reason || '—'}
                        </div>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span className={`badge ${isOpen ? 'badge-warning' : 'badge-success'}`}>
                          {isOpen ? 'Open Encounter' : 'Completed'}
                        </span>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDetail(v)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          <Eye size={14} /> Details
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
