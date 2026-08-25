import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity, Pill, Plus, ChevronLeft, Calendar, ShieldCheck, Lock,
  Building2, FlaskConical, Eye
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard, SkeletonTimeline } from '../../components/ui/Skeleton';
import { formatPatientId, getInitials, formatDate, parseMedications } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';

export function DoctorPatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadPatient = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getPatientDetail(id);
      setData(res);
    } catch (err) {
      console.error('Error fetching patient clinical record:', err);
      setError('Unable to load patient records. You may not have an active authorization relationship.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [id]);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SkeletonCard />
        <div style={{ marginTop: 20 }}>
          <SkeletonTimeline count={3} />
        </div>
      </div>
    );
  }

  // Unauthorized or not found state
  if (!data || !data.patient) {
    return (
      <div className="dashboard-container">
        <Link
          to="/doctor/patients"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 16,
          }}
        >
          <ChevronLeft size={16} /> Back to Authorized Patients
        </Link>

        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Patient Not Accessible
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 20px', fontSize: '0.875rem' }}>
            {error || 'You do not have an active relationship authorization to access this patient’s medical records under healthcare privacy governance.'}
          </p>
          <Link to="/doctor/patients" className="btn btn-primary btn-md">
            Return to Authorized Patient Directory
          </Link>
        </div>
      </div>
    );
  }

  const patient = data.patient;
  const patientId = patient.patient_profiles?.[0]?.patient_identifier || patient.id;
  const allergies = patient.patient_profiles?.[0]?.allergies || 'None reported';
  const bloodGroup = patient.blood_group || patient.patient_profiles?.[0]?.blood_group || 'Not specified';
  const emergencyContact = patient.patient_profiles?.[0]?.emergency_contact || 'None listed';

  return (
    <div className="dashboard-container">
      {/* Back button */}
      <Link
        to="/doctor/patients"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <ChevronLeft size={16} /> Back to Authorized Patients
      </Link>

      {/* Patient Header Card */}
      <div className="card patient-context-ribbon" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar avatar-lg avatar-teal">
              {getInitials(patient.full_name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {patient.full_name}
                </h1>
                <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                  <ShieldCheck size={12} /> Authorized Access
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Health ID: <strong style={{ color: 'var(--accent)' }}>{formatPatientId(patientId)}</strong> · Gender: <span style={{ textTransform: 'capitalize' }}>{patient.gender || '—'}</span> · DOB: {formatDate(patient.date_of_birth)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-md">
              <Plus size={16} /> Issue Prescription
            </Link>
          </div>
        </div>

        {/* Clinical Flags Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 18,
          paddingTop: 16,
          borderTop: '1px solid var(--border-default)',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Blood Group
            </div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: 2 }}>
              {bloodGroup}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Known Allergies
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-warning)', marginTop: 2 }}>
              {allergies}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Contact Phone
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {patient.phone || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Emergency Contact
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>
              {emergencyContact}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-default)',
        marginBottom: 'var(--sp-6)',
        gap: 8,
        overflowX: 'auto',
      }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('overview')}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Activity size={14} /> Overview
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('timeline')}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Calendar size={14} /> Medical History ({data.timeline.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('prescriptions')}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Pill size={14} /> Prescriptions ({data.prescriptions.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('reports')}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <FlaskConical size={14} /> Diagnostic Reports ({data.reports.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'visits' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('visits')}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
        >
          <Building2 size={14} /> Hospital Records ({data.visits.length})
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* Quick Metrics */}
          <div className="grid-3" style={{ gap: 'var(--sp-4)' }}>
            <div className="card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Prescriptions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {data.prescriptions.length}
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lab Reports on File</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {data.reports.length}
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Hospital Encounters</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                {data.visits.length}
              </div>
            </div>
          </div>

          {/* Longitudinal Clinical Timeline Preview */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--sp-4)',
              borderBottom: '1px solid var(--border-default)',
              paddingBottom: 'var(--sp-4)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
                  Recent Medical Timeline
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Most recent clinical events in the patient's record.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('timeline')}
              >
                View Full Timeline ({data.timeline.length})
              </button>
            </div>

            <MedicalTimeline
              records={data.timeline.slice(0, 4)}
              loading={false}
              onViewDetail={handleViewDetail}
              emptyMessage="No medical records currently on file for this patient."
            />
          </div>
        </div>
      )}

      {/* Tab Content: Medical History Timeline */}
      {activeTab === 'timeline' && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--sp-6)',
            borderBottom: '1px solid var(--border-default)',
            paddingBottom: 'var(--sp-4)',
          }}>
            <div>
              <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Longitudinal Clinical Timeline
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Complete historical record of prescriptions, lab investigations, and hospital admissions.
              </p>
            </div>
          </div>

          <MedicalTimeline
            records={data.timeline}
            loading={false}
            onViewDetail={handleViewDetail}
            emptyMessage="No medical records currently on file for this patient."
          />
        </div>
      )}

      {/* Tab Content: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--sp-4)',
            borderBottom: '1px solid var(--border-default)',
            paddingBottom: 'var(--sp-4)',
          }}>
            <div>
              <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Prescription History
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Prescriptions issued across all healthcare providers.
              </p>
            </div>
            <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New Prescription
            </Link>
          </div>

          {data.prescriptions.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No Prescriptions on File"
              description="No prescriptions have been recorded for this patient yet."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.prescriptions.map((p) => {
                const meds = parseMedications(p.medications);
                return (
                  <div
                    key={p.id}
                    className="card card-hover"
                    style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
                    onClick={() => handleViewDetail({ record_type: 'prescription', record_reference_id: p.id })}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {p.diagnosis || 'Prescription'}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatDate(p.prescription_date)} · {p.doctor?.full_name || 'Practitioner'} · {p.hospital?.name || 'Private Chamber'}
                        </div>
                      </div>
                      <span className="badge badge-blue">Prescription</span>
                    </div>

                    {meds.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {meds.map((m, idx) => (
                          <span key={idx} className="badge" style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-default)' }}>
                            {m.name} ({m.dosage})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Diagnostic Reports */}
      {activeTab === 'reports' && (
        <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
          }}>
            <h2 className="card-title" style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
              Diagnostic Reports & Lab Tests
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
              Laboratory investigations, pathology reports, and imaging tests on file.
            </p>
          </div>

          {data.reports.length === 0 ? (
            <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
              <EmptyState
                icon={FlaskConical}
                title="No Diagnostic Reports on File"
                description="No diagnostic reports or lab investigations recorded for this patient."
              />
            </div>
          ) : (
            <div className="table-container card-table-wrap">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className="table-header">
                  <tr>
                    <th className="table-head" style={{ padding: '14px 24px' }}>Date</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Investigation</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Category</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Facility</th>
                    <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {data.reports.map((r) => (
                    <tr key={r.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      <td className="table-cell" style={{ padding: '18px 24px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(r.report_date)}
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{r.test_name}</strong>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <FlaskConical size={12} />
                          {r.test_category || 'Lab'}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>
                        {r.diagnostics_org?.name || 'Diagnostic Lab'}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail({ record_type: 'diagnostic_report', record_reference_id: r.id })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Hospital Records */}
      {activeTab === 'visits' && (
        <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
          }}>
            <h2 className="card-title" style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>
              Hospital Encounters & Admissions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
              Hospitalization admissions, discharge summaries, and emergency visits.
            </p>
          </div>

          {data.visits.length === 0 ? (
            <div style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
              <EmptyState
                icon={Building2}
                title="No Hospital Encounters on File"
                description="No hospital visits or inpatient admissions recorded for this patient."
              />
            </div>
          ) : (
            <div className="table-container card-table-wrap">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className="table-header">
                  <tr>
                    <th className="table-head" style={{ padding: '14px 24px' }}>Date</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Type</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Department</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Hospital</th>
                    <th className="table-head" style={{ padding: '14px 20px' }}>Summary / Diagnosis</th>
                    <th className="table-head" style={{ textAlign: 'right', padding: '14px 24px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {data.visits.map((v) => (
                    <tr key={v.id} className="table-row" style={{ transition: 'background-color 0.15s ease' }}>
                      <td className="table-cell" style={{ padding: '18px 24px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(v.admission_date)}
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                          {v.visit_type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cell" style={{ padding: '18px 20px', color: 'var(--text-secondary)' }}>{v.department || 'General'}</td>
                      <td className="table-cell" style={{ padding: '18px 20px', fontWeight: 500 }}>{v.hospital?.name || 'Hospital'}</td>
                      <td className="table-cell" style={{ padding: '18px 20px' }}>
                        <div style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {v.diagnosis_summary || v.reason || '—'}
                        </div>
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', padding: '18px 24px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail({ record_type: 'hospital_visit', record_reference_id: v.id })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
