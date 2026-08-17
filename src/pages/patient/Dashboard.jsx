import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Pill, FlaskConical, BedDouble, Calendar, ArrowRight,
  ShieldCheck, Heart, User, Sparkles, Building2, ChevronRight, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getGreeting, formatPatientId, formatDate, parseMedications } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

export function PatientDashboard() {
  const { profile } = useAuth();
  const { info } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await patientService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
        setError(err.message || 'Unable to retrieve clinical records.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const handleOpenHighlight = (type, id) => {
    setSelectedRecord({
      record_type: type,
      record_reference_id: id,
    });
    setDrawerOpen(true);
  };

  const patientName = profile?.full_name || 'Patient';
  const patientId = profile?.patient_profile?.patient_identifier || profile?.id;
  const bloodGroup = profile?.blood_group || profile?.patient_profile?.blood_group || 'Not set';
  const allergies = profile?.patient_profile?.allergies || 'No known allergies';
  const emergencyContact = profile?.patient_profile?.emergency_contact || 'None listed';

  const copyPatientId = () => {
    if (!patientId) return;
    navigator.clipboard.writeText(formatPatientId(patientId));
    setCopied(true);
    info('Patient ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
              <ShieldCheck size={13} style={{ marginRight: 4 }} /> Patient Health Vault
            </span>
            <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
              Read-Only Access
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {getGreeting()}, {patientName}
          </h1>
          <p className="page-sub">
            Your centralized medical history, active prescriptions, and diagnostic reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/patient/ai-assistant" className="btn btn-outline btn-md" style={{ borderColor: 'var(--secondary)' }}>
            <Sparkles size={16} color="var(--secondary)" /> AI Health Assistant
          </Link>
          <Link to="/patient/history" className="btn btn-primary btn-md">
            <Activity size={16} /> Full Timeline
          </Link>
        </div>
      </div>

      {/* Patient Health Info Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-6)',
      }}>
        {/* Health ID */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Patient Health ID
            </span>
            <button
              type="button"
              onClick={copyPatientId}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}
              title="Copy Health ID"
            >
              {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
            </button>
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
            {formatPatientId(patientId)}
          </div>
        </div>

        {/* Blood Group */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Blood Group
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Heart size={16} fill="var(--danger)" /> {bloodGroup}
          </div>
        </div>

        {/* Known Allergies */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Known Allergies
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: allergies.toLowerCase().includes('known') ? 'var(--text-2)' : 'var(--warning)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {allergies}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Emergency Contact
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {emergencyContact}
          </div>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid-4" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
        <Link to="/patient/prescriptions" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 600 }}>Prescriptions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1 }}>
                  {loading ? '…' : (dashboardData?.stats?.prescriptions || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/reports" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 600 }}>Diagnostic Lab Reports</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1 }}>
                  {loading ? '…' : (dashboardData?.stats?.reports || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/hospital-records" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BedDouble size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 600 }}>Hospital Admissions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1 }}>
                  {loading ? '…' : (dashboardData?.stats?.visits || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/providers" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 600 }}>Care Providers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.1 }}>
                  {loading ? '…' : (dashboardData?.stats?.providers || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 3 Key Clinical Highlights Section */}
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
          Latest Clinical Highlights
        </h2>

        <div className="grid-3" style={{ gap: 'var(--sp-4)' }}>
          {/* Latest Prescription Card */}
          <div className="card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                  <Pill size={13} style={{ marginRight: 4 }} /> Latest Prescription
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {dashboardData?.latestPrescription ? formatDate(dashboardData.latestPrescription.prescription_date) : ''}
                </span>
              </div>

              {dashboardData?.latestPrescription ? (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                    {dashboardData.latestPrescription.diagnosis}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 10 }}>
                    {dashboardData.latestPrescription.doctor?.full_name || 'Practitioner'} · {dashboardData.latestPrescription.hospital?.name || 'Chamber'}
                  </div>

                  {parseMedications(dashboardData.latestPrescription.medications).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {parseMedications(dashboardData.latestPrescription.medications).slice(0, 2).map((m, idx) => (
                        <span key={idx} className="badge" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                          {m.name} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.875rem', margin: '16px 0' }}>No prescriptions issued yet.</p>
              )}
            </div>

            {dashboardData?.latestPrescription && (
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={() => handleOpenHighlight('prescription', dashboardData.latestPrescription.id)}
              >
                View Prescription Details <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Latest Diagnostic Report Card */}
          <div className="card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                  <FlaskConical size={13} style={{ marginRight: 4 }} /> Latest Lab Report
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {dashboardData?.latestReport ? formatDate(dashboardData.latestReport.report_date) : ''}
                </span>
              </div>

              {dashboardData?.latestReport ? (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                    {dashboardData.latestReport.test_name}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 8 }}>
                    {dashboardData.latestReport.diagnostics_org?.name || 'Diagnostic Center'}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dashboardData.latestReport.summary}
                  </p>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.875rem', margin: '16px 0' }}>No lab reports uploaded yet.</p>
              )}
            </div>

            {dashboardData?.latestReport && (
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={() => handleOpenHighlight('diagnostic_report', dashboardData.latestReport.id)}
              >
                View Lab Findings <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Latest Hospital Encounter Card */}
          <div className="card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge" style={{ background: 'rgba(15,118,110,0.12)', color: '#0F766E' }}>
                  <BedDouble size={13} style={{ marginRight: 4 }} /> Latest Hospitalization
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  {dashboardData?.latestVisit ? formatDate(dashboardData.latestVisit.admission_date) : ''}
                </span>
              </div>

              {dashboardData?.latestVisit ? (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
                    {dashboardData.latestVisit.department || 'Clinical Encounter'}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginBottom: 8 }}>
                    {dashboardData.latestVisit.hospital?.name || 'Hospital Facility'} · {dashboardData.latestVisit.visit_type?.replace('_', ' ').toUpperCase()}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dashboardData.latestVisit.diagnosis_summary || dashboardData.latestVisit.reason}
                  </p>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.875rem', margin: '16px 0' }}>No hospital visits on record.</p>
              )}
            </div>

            {dashboardData?.latestVisit && (
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={() => handleOpenHighlight('hospital_visit', dashboardData.latestVisit.id)}
              >
                View Admission Details <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Medical Activity & AI Assistant Feature Callout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Recent Medical Timeline */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)' }}>
            <div>
              <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Recent Medical Activity
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 2 }}>
                Chronological feed of clinical records.
              </p>
            </div>
            <Link to="/patient/history" className="btn btn-ghost btn-sm">
              View All History <ArrowRight size={14} />
            </Link>
          </div>

          <MedicalTimeline
            records={dashboardData?.recentRecords || []}
            loading={loading}
            error={error}
            onViewDetail={handleViewDetail}
            emptyMessage="No clinical records have been linked to your patient profile yet."
          />
        </div>

        {/* Right Sidebar: AI Assistant Callout & Care Providers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* AI Health Assistant Box */}
          <div className="card" style={{
            padding: 'var(--sp-6)',
            background: 'linear-gradient(135deg, rgba(15,118,110,0.06), rgba(20,184,166,0.12))',
            border: '1.5px solid rgba(20,184,166,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>
                  AI Health Assistant
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Medical Explanations & Summaries
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 14 }}>
              Have complex medical terms in your prescription or diagnostic report? Use the AI assistant to simplify terminology and understand your care instructions.
            </p>

            <div style={{
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.7rem',
              color: 'var(--text-3)',
              lineHeight: 1.4,
              marginBottom: 14,
              border: '1px solid var(--border)',
            }}>
              ⚠️ Educational guidance only. Always consult your attending doctor.
            </div>

            <Link to="/patient/ai-assistant" className="btn btn-primary btn-md w-full">
              <Sparkles size={15} /> Open AI Health Assistant
            </Link>
          </div>

          {/* Connected Providers Summary */}
          <div className="card" style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Authorized Providers ({dashboardData?.providers?.length || 0})
              </h3>
              <Link to="/patient/providers" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                Manage →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 40 }} />
                <div className="skeleton" style={{ height: 40 }} />
              </div>
            ) : dashboardData?.providers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dashboardData.providers.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {p.provider?.full_name || p.organization?.name || 'Care Provider'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>
                        {p.provider_type} {p.organization?.name ? `· ${p.organization.name}` : ''}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.8125rem' }}>No active provider relationships.</p>
            )}
          </div>
        </div>
      </div>

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
