import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity, Pill, Plus, ChevronLeft, Calendar, ShieldCheck, Lock,
  Building2, FlaskConical, Eye, Clock, ShieldX, ShieldAlert, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { doctorService } from '../../services/doctorService';
import { searchService } from '../../services/searchService';
import { AccessRequestModal } from '../../components/access/AccessRequestModal';
import { AccessStatusBadge } from '../../components/access/AccessStatusBadge';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard, SkeletonTimeline } from '../../components/ui/Skeleton';
import { formatPatientId, getInitials, formatDate, parseMedications } from '../../lib/utils';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../contexts/ToastContext';

export function DoctorPatientDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { success, error: toastError } = useToast();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null); // 'active' | 'pending' | 'revoked' | 'none'
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadPatientData = useCallback(async () => {
    if (!id || !profile?.id) return;
    setLoading(true);

    try {
      // 1. Check existing relationship status between this doctor and the patient
      const { data: relRows } = await supabase
        .from('patient_provider_relationships')
        .select('id, status')
        .eq('patient_profile_id', id)
        .eq('provider_profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const rel = relRows?.[0] ?? null;
      const status = rel?.status ?? 'none';
      setAccessStatus(status);

      // 2. Fetch patient identity (available via secure search RPC)
      const patientData = await searchService.getPatientById(id);
      setPatient(patientData || null);

      // 3. Fetch full clinical records ONLY if access is active
      if (status === 'active') {
        const [recRes, prescRes, repRes, visRes] = await Promise.all([
          supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', id)
            .order('record_date', { ascending: false }),
          supabase
            .from('prescriptions')
            .select(`*, doctor:doctor_id(id, full_name), hospital:hospital_id(id, name)`)
            .eq('patient_id', id)
            .order('prescription_date', { ascending: false }),
          supabase
            .from('diagnostic_reports')
            .select(`*, diagnostics_org:diagnostics_organization_id(id, name)`)
            .eq('patient_id', id)
            .order('report_date', { ascending: false }),
          supabase
            .from('hospital_visits')
            .select(`*, hospital:hospital_id(id, name), doctor:doctor_id(id, full_name)`)
            .eq('patient_id', id)
            .order('admission_date', { ascending: false }),
        ]);

        setTimeline(recRes.data || []);
        setPrescriptions(prescRes.data || []);
        setReports(repRes.data || []);
        setVisits(visRes.data || []);
      } else {
        setTimeline([]);
        setPrescriptions([]);
        setReports([]);
        setVisits([]);
      }
    } catch (err) {
      console.error('DoctorPatientDetail load error:', err);
    } finally {
      setLoading(false);
    }
  }, [id, profile?.id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

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

  // Not found state
  if (!patient) {
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
          <ChevronLeft size={16} /> Back to Patient Directory
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
            Patient Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 20px', fontSize: '0.875rem' }}>
            The requested patient profile could not be located in the healthcare registry.
          </p>
          <Link to="/doctor/patients" className="btn btn-primary btn-md">
            Return to Patient Directory
          </Link>
        </div>
      </div>
    );
  }

  const patientId = patient.patient_identifier || patient.id;
  const allergies = patient.allergies || 'None reported';
  const bloodGroup = patient.blood_group || 'Not specified';
  const isAuthorized = accessStatus === 'active';

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
        <ChevronLeft size={16} /> Back to Patient Directory
      </Link>

      {/* Patient Header Card */}
      <div className="card patient-context-ribbon" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar avatar-lg avatar-teal">
              {getInitials(patient.full_name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {patient.full_name}
                </h1>
                <AccessStatusBadge status={accessStatus} />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Health ID: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{formatPatientId(patientId)}</strong> · Gender: <span style={{ textTransform: 'capitalize' }}>{patient.gender || '—'}</span> {patient.date_of_birth && `· DOB: ${formatDate(patient.date_of_birth)}`}
              </div>
            </div>
          </div>

          {/* Action Buttons: Doctor can ALWAYS issue a prescription! */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isAuthorized && accessStatus !== 'pending' && (
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => setShowRequestModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldCheck size={16} /> Request Medical History Access
              </button>
            )}

            <Link
              to={`/doctor/prescriptions/new?patientId=${patient.id}`}
              state={{ patient }}
              className="btn btn-primary btn-md"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Plus size={16} /> Issue Prescription
            </Link>
          </div>
        </div>

        {/* Clinical Flags Bar (Shown when authorized or available) */}
        {isAuthorized && (
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
                Email
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>
                {patient.email || '—'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Panel Content ── */}
      {!isAuthorized ? (
        /* Consent Gate State */
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          {accessStatus === 'pending' ? (
            <div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Clock size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Consent Request Awaiting Approval
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                You have requested access to view <strong>{patient.full_name}</strong>'s past medical history.
                The patient must approve the request in their portal before historical records can be unlocked.
              </p>
              <div style={{
                padding: '12px 18px', background: 'var(--bg-surface-sunken)',
                borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: 10,
                fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20
              }}>
                <span>💡 You can still author new e-prescriptions for this patient anytime using the button above.</span>
              </div>
            </div>
          ) : accessStatus === 'revoked' ? (
            <div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ShieldX size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Medical History Access Revoked
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 20px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                The patient has explicitly revoked access to their historical records. Under medical privacy governance, you cannot view past history unless the patient grants access again.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => setShowRequestModal(true)}
                >
                  <ShieldCheck size={16} /> Request Access Again
                </button>
                <Link to={`/doctor/prescriptions/new?patientId=${patient.id}`} state={{ patient }} className="btn btn-primary btn-md">
                  <Plus size={16} /> Issue New Prescription
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--accent-subtle)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ShieldAlert size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Patient Consent Required for Medical History
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                To protect patient privacy, past clinical history, prior diagnostic reports, and medications from other facilities are protected. You can request consent from the patient to view their complete history.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  onClick={() => setShowRequestModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <ShieldCheck size={16} /> Request Medical History Access
                </button>
                <Link
                  to={`/doctor/prescriptions/new?patientId=${patient.id}`}
                  state={{ patient }}
                  className="btn btn-secondary btn-md"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} /> Issue Prescription Directly
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full Authorized Clinical History */
        <>
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
              <Calendar size={14} /> Medical History ({timeline.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('prescriptions')}
              style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
            >
              <Pill size={14} /> Prescriptions ({prescriptions.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('reports')}
              style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
            >
              <FlaskConical size={14} /> Diagnostic Reports ({reports.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'visits' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('visits')}
              style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
            >
              <Building2 size={14} /> Hospital Visits ({visits.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Latest Active Medications */}
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill size={18} color="var(--accent)" /> Current / Recent Medications
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From latest prescriptions</span>
                </div>

                {prescriptions.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No recorded prescriptions for this patient yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {parseMedications(prescriptions[0]?.medications).slice(0, 6).map((med, i) => (
                      <div key={i} style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface-sunken)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {med.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {med.dosage} · {med.frequency} · {med.duration}
                        </div>
                        {med.instructions && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                            {med.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Timeline Records */}
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} color="var(--accent)" /> Recent Medical Encounters
                </h3>
                <MedicalTimeline records={timeline.slice(0, 5)} onViewDetail={handleViewDetail} />
              </div>
            </div>
          )}

          {/* Tab 2: Medical Timeline */}
          {activeTab === 'timeline' && (
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <MedicalTimeline records={timeline} onViewDetail={handleViewDetail} />
            </div>
          )}

          {/* Tab 3: Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              {prescriptions.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title="No Prescriptions on File"
                  description="This patient has not been issued any digital prescriptions yet."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {prescriptions.map((p) => (
                    <div key={p.id} className="card card-hover" style={{ padding: '16px 20px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {p.diagnosis || 'Prescription'}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {formatDate(p.prescription_date)} · Prescribed by: <strong>{p.doctor?.full_name || 'Doctor'}</strong> {p.hospital?.name && `(${p.hospital.name})`}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail({ record_type: 'prescription', record_reference_id: p.id })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Diagnostic Reports */}
          {activeTab === 'reports' && (
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              {reports.length === 0 ? (
                <EmptyState
                  icon={FlaskConical}
                  title="No Diagnostic Reports"
                  description="No laboratory or diagnostic imaging reports recorded for this patient."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reports.map((r) => (
                    <div key={r.id} className="card card-hover" style={{ padding: '16px 20px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {r.test_name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {formatDate(r.report_date)} · Category: <strong>{r.test_category}</strong> {r.diagnostics_org?.name && `· Lab: ${r.diagnostics_org.name}`}
                          </div>
                          {r.summary && (
                            <div style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                              {r.summary}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail({ record_type: 'diagnostic_report', record_reference_id: r.id })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <Eye size={14} /> View Findings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Hospital Visits */}
          {activeTab === 'visits' && (
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              {visits.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No Hospital Encounters"
                  description="No recorded inpatient admissions or emergency visits on file."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {visits.map((v) => (
                    <div key={v.id} className="card card-hover" style={{ padding: '16px 20px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            Hospital Visit — {v.department || 'General'}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Admission: {formatDate(v.admission_date)} {v.discharge_date && `· Discharged: ${formatDate(v.discharge_date)}`} · Facility: <strong>{v.hospital?.name || 'Hospital'}</strong>
                          </div>
                          {v.reason && (
                            <div style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                              Reason: {v.reason}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail({ record_type: 'hospital_visit', record_reference_id: v.id })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <Eye size={14} /> View Record
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />

      {/* Access Request Modal */}
      <AccessRequestModal
        patient={patient}
        orgId={null}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestSent={(newStatus) => {
          setAccessStatus(newStatus === 'already_active' ? 'active' : 'pending');
          setShowRequestModal(false);
          success('Consent request sent to patient. They can approve it in their portal.');
          loadPatientData();
        }}
      />
    </div>
  );
}
