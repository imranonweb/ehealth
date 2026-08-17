import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Pill, FlaskConical, BedDouble, Calendar, ArrowRight,
  ShieldCheck, Heart, User, Sparkles, Building2, ChevronRight, Copy, Check,
  Stethoscope, Clock, FileText, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard, SkeletonTimeline } from '../../components/ui/Skeleton';
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
        console.error('Failed to load patient dashboard data:', err);
        setError('Unable to load clinical records from the secure server.');
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
  const bloodGroup = profile?.blood_group || profile?.patient_profile?.blood_group || 'Not specified';
  const allergies = profile?.patient_profile?.allergies || 'None recorded';
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
      {/* 1. Header Section */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary">
              <ShieldCheck size={13} /> Patient Health Vault
            </span>
            <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>
              Read-Only Access
            </span>
          </div>
          <h1 className="page-title">
            {getGreeting()}, {patientName}
          </h1>
          <p className="page-sub">
            Here's an overview of your healthcare records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/patient/ai-assistant" className="btn btn-secondary btn-md">
            <Sparkles size={16} color="var(--accent)" /> AI Health Assistant
          </Link>
          <Link to="/patient/history" className="btn btn-primary btn-md">
            <Activity size={16} /> Full Medical History
          </Link>
        </div>
      </div>

      {/* 2. Patient Identity & Clinical Summary Ribbon */}
      <div className="patient-identity-ribbon">
        <div className="card identity-card">
          <div className="identity-label">
            <span>Patient Health ID</span>
            <button
              type="button"
              onClick={copyPatientId}
              className="copy-btn"
              title="Copy Unique Health ID"
            >
              {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
            </button>
          </div>
          <div className="identity-value highlight">
            {formatPatientId(patientId)}
          </div>
        </div>

        <div className="card identity-card">
          <div className="identity-label">Blood Group</div>
          <div className="identity-value danger-text">
            <Heart size={16} fill="var(--color-danger)" color="var(--color-danger)" /> {bloodGroup}
          </div>
        </div>

        <div className="card identity-card">
          <div className="identity-label">Known Allergies</div>
          <div className="identity-value" style={{ fontSize: '0.875rem' }}>
            {allergies}
          </div>
        </div>

        <div className="card identity-card">
          <div className="identity-label">Emergency Contact</div>
          <div className="identity-value" style={{ fontSize: '0.875rem' }}>
            {emergencyContact}
          </div>
        </div>
      </div>

      {/* 3. Subtle & Informative Overview Cards */}
      <div className="dashboard-stats-grid">
        <Link to="/patient/prescriptions" className="stat-card-link">
          <div className="card card-hover stat-card">
            <div className="stat-icon-wrap blue">
              <Pill size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Active Prescriptions</div>
              <div className="stat-number">
                {loading ? '…' : (dashboardData?.stats?.prescriptions || 0)}
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/reports" className="stat-card-link">
          <div className="card card-hover stat-card">
            <div className="stat-icon-wrap purple">
              <FlaskConical size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Diagnostic Reports</div>
              <div className="stat-number">
                {loading ? '…' : (dashboardData?.stats?.reports || 0)}
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/hospital-records" className="stat-card-link">
          <div className="card card-hover stat-card">
            <div className="stat-icon-wrap teal">
              <BedDouble size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Hospital Visits</div>
              <div className="stat-number">
                {loading ? '…' : (dashboardData?.stats?.visits || 0)}
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/providers" className="stat-card-link">
          <div className="card card-hover stat-card">
            <div className="stat-icon-wrap green">
              <Building2 size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Authorized Providers</div>
              <div className="stat-number">
                {loading ? '…' : (dashboardData?.stats?.providers || 0)}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 4. Latest Clinical Highlights Grid */}
      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
          <h2 className="section-title">Latest Clinical Highlights</h2>
          <span className="caption">Verified provider records</span>
        </div>

        <div className="grid-3">
          {/* Latest Prescription */}
          <div className="card highlight-box">
            <div>
              <div className="highlight-header">
                <span className="badge badge-blue">
                  <Pill size={13} /> Latest Prescription
                </span>
                <span className="highlight-date">
                  {dashboardData?.latestPrescription ? formatDate(dashboardData.latestPrescription.prescription_date) : ''}
                </span>
              </div>

              {dashboardData?.latestPrescription ? (
                <div style={{ marginTop: 8 }}>
                  <h3 className="highlight-title">
                    {dashboardData.latestPrescription.diagnosis}
                  </h3>
                  <div className="highlight-sub">
                    {dashboardData.latestPrescription.doctor?.full_name || 'Doctor'} · {dashboardData.latestPrescription.hospital?.name || 'Clinic'}
                  </div>

                  {parseMedications(dashboardData.latestPrescription.medications).length > 0 && (
                    <div className="med-pills-wrap">
                      {parseMedications(dashboardData.latestPrescription.medications).slice(0, 2).map((m, idx) => (
                        <span key={idx} className="med-pill-tag">
                          {m.name} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.84375rem', margin: '14px 0' }}>No prescriptions recorded yet.</p>
              )}
            </div>

            {dashboardData?.latestPrescription && (
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => handleOpenHighlight('prescription', dashboardData.latestPrescription.id)}
              >
                View Prescription Details <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Latest Diagnostic Report */}
          <div className="card highlight-box">
            <div>
              <div className="highlight-header">
                <span className="badge badge-purple">
                  <FlaskConical size={13} /> Latest Lab Report
                </span>
                <span className="highlight-date">
                  {dashboardData?.latestReport ? formatDate(dashboardData.latestReport.report_date) : ''}
                </span>
              </div>

              {dashboardData?.latestReport ? (
                <div style={{ marginTop: 8 }}>
                  <h3 className="highlight-title">
                    {dashboardData.latestReport.test_name}
                  </h3>
                  <div className="highlight-sub">
                    {dashboardData.latestReport.diagnostics_org?.name || 'Diagnostic Center'}
                  </div>
                  <p className="highlight-desc">
                    {dashboardData.latestReport.summary}
                  </p>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.84375rem', margin: '14px 0' }}>No lab reports uploaded yet.</p>
              )}
            </div>

            {dashboardData?.latestReport && (
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => handleOpenHighlight('diagnostic_report', dashboardData.latestReport.id)}
              >
                View Report Findings <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Latest Hospital Encounter */}
          <div className="card highlight-box">
            <div>
              <div className="highlight-header">
                <span className="badge badge-primary">
                  <BedDouble size={13} /> Latest Hospital Visit
                </span>
                <span className="highlight-date">
                  {dashboardData?.latestVisit ? formatDate(dashboardData.latestVisit.admission_date) : ''}
                </span>
              </div>

              {dashboardData?.latestVisit ? (
                <div style={{ marginTop: 8 }}>
                  <h3 className="highlight-title">
                    {dashboardData.latestVisit.department || 'Encounter'}
                  </h3>
                  <div className="highlight-sub">
                    {dashboardData.latestVisit.hospital?.name || 'Hospital'} · {dashboardData.latestVisit.visit_type?.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="highlight-desc">
                    {dashboardData.latestVisit.diagnosis_summary || dashboardData.latestVisit.reason}
                  </p>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.84375rem', margin: '14px 0' }}>No hospital visits on record.</p>
              )}
            </div>

            {dashboardData?.latestVisit && (
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => handleOpenHighlight('hospital_visit', dashboardData.latestVisit.id)}
              >
                View Encounter Record <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Content: Signature Medical History Timeline */}
      <div className="dashboard-main-split">
        {/* Timeline Column */}
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div className="timeline-header-wrap">
            <div>
              <h2 className="card-title" style={{ fontSize: '1.0625rem' }}>
                Recent Medical History
              </h2>
              <p className="caption" style={{ marginTop: 2 }}>
                Chronological lifetime record feed.
              </p>
            </div>
            <Link to="/patient/history" className="btn btn-ghost btn-sm">
              View Full Timeline <ArrowRight size={14} />
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

        {/* Right Sidebar: AI Assistant Card & Care Providers */}
        <div className="dashboard-side-col">
          {/* AI Health Assistant Box */}
          <div className="card ai-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="ai-icon-wrap">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  AI Health Assistant
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                  Plain-Language Explanations
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
              Have complex medical terms in your prescription or diagnostic report? Use the AI assistant to simplify terminology and understand your care instructions.
            </p>

            <div className="ai-disclaimer-pill">
              ⚠️ Educational guidance only. Always consult your attending doctor.
            </div>

            <Link to="/patient/ai-assistant" className="btn btn-primary btn-md w-full">
              <Sparkles size={15} /> Open AI Health Assistant
            </Link>
          </div>

          {/* Connected Providers Summary */}
          <div className="card" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid var(--border-default)', paddingBottom: 10 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                Authorized Providers ({dashboardData?.providers?.length || 0})
              </h3>
              <Link to="/patient/providers" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 42 }} />
                <div className="skeleton" style={{ height: 42 }} />
              </div>
            ) : dashboardData?.providers?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dashboardData.providers.map((p) => (
                  <div key={p.id} className="provider-mini-chip">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {p.provider?.full_name || p.organization?.name || 'Care Provider'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {p.provider_type} {p.organization?.name ? `· ${p.organization.name}` : ''}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
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
