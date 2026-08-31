import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, Database, UserCheck, Lock, Pill,
  FlaskConical, BedDouble, ArrowRight, CheckCircle2,
  HeartPulse, Stethoscope, Sparkles, Users, Mail, Eye, KeyRound
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import './Landing.css';

export function Landing() {
  return (
    <div className="landing-page">
      <PublicNavbar />

      <main style={{ flex: 1 }}>
        {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
        <section className="hero-section">
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="hero-badge animate-fade-in">
              <Activity size={14} color="var(--accent)" />
              <span>Unified Healthcare Infrastructure for Bangladesh</span>
            </div>

            <h1 className="hero-title animate-slide-up">
              The Trusted Record for<br />
              <span className="text-accent">Modern Healthcare</span>
            </h1>

            <p className="hero-subtitle animate-slide-up-delayed">
              A secure, consent-driven architecture connecting patients, doctors, diagnostic centers, and hospitals. Every prescription, lab report, and hospital stay—unified into one lifetime record.
            </p>

            <div className="hero-actions animate-slide-up-delayed">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Institutional Integration
              </Link>
            </div>

            {/* Platform Metrics */}
            <div className="hero-metrics">
              <div className="metric-pill">
                <ShieldCheck size={16} color="var(--accent)" />
                <span>100% Patient Consent Governed</span>
              </div>
              <div className="metric-pill">
                <Lock size={16} color="var(--accent)" />
                <span>Zero-Trust Encrypted Storage</span>
              </div>
              <div className="metric-pill">
                <HeartPulse size={16} color="var(--accent)" />
                <span>Multi-Portal Synchronized Care</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Trust & Architecture Strip ─────────────────────────────────── */}
        <section className="trust-strip">
          <div className="container">
            <div className="trust-grid">
              <div className="trust-cell">
                <ShieldCheck size={22} color="var(--accent)" />
                <div>
                  <strong>Role-Based Access</strong>
                  <span>Strictly isolated clinical permissions</span>
                </div>
              </div>
              <div className="trust-cell">
                <Lock size={22} color="var(--accent)" />
                <div>
                  <strong>Encrypted Storage</strong>
                  <span>Time-limited signed URLs for documents</span>
                </div>
              </div>
              <div className="trust-cell">
                <UserCheck size={22} color="var(--accent)" />
                <div>
                  <strong>Patient Ownership</strong>
                  <span>Explicit consent required for history access</span>
                </div>
              </div>
              <div className="trust-cell">
                <Database size={22} color="var(--accent)" />
                <div>
                  <strong>Immutable Records</strong>
                  <span>Digital records preserved with full provenance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. How It Works ──────────────────────────────────────────────── */}
        <section className="how-it-works-section">
          <div className="container">
            <div className="section-heading">
              <span className="label" style={{ color: 'var(--accent)' }}>System Architecture</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>
                How E-Health Unifies Care
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                Three simple steps create a continuous, lifelong medical record across private chambers, diagnostic labs, and multi-specialty hospitals.
              </p>
            </div>

            <div className="steps-grid">
              {/* Step 1 */}
              <div className="step-card">
                <div className="step-number">Step 01</div>
                <div className="step-icon-wrap">
                  <UserCheck size={22} />
                </div>
                <h3 className="h3" style={{ fontSize: '1.125rem', marginBottom: 8 }}>
                  Universal Patient ID
                </h3>
                <p className="body-sm">
                  Patients register once and receive a permanent Health Identifier (e.g. <code>P-9824F1A2</code>). No medical data can be accessed without explicit patient approval.
                </p>
              </div>

              {/* Step 2 */}
              <div className="step-card">
                <div className="step-number">Step 02</div>
                <div className="step-icon-wrap">
                  <Stethoscope size={22} />
                </div>
                <h3 className="h3" style={{ fontSize: '1.125rem', marginBottom: 8 }}>
                  Point-of-Care Digital Entries
                </h3>
                <p className="body-sm">
                  Doctors issue e-prescriptions, diagnostic labs upload certified reports, and hospitals log admissions directly into the patient's record with digital timestamps.
                </p>
              </div>

              {/* Step 3 */}
              <div className="step-card">
                <div className="step-number">Step 03</div>
                <div className="step-icon-wrap">
                  <HeartPulse size={22} />
                </div>
                <h3 className="h3" style={{ fontSize: '1.125rem', marginBottom: 8 }}>
                  Lifelong Clinical Continuity
                </h3>
                <p className="body-sm">
                  Whenever the patient visits a new doctor or hospital, their authorized clinical timeline is accessible immediately, preventing dangerous drug interactions and duplicated tests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Four Tailored User Roles (With Professional Avatars) ───────── */}
        <section className="workflows-section">
          <div className="container">
            <div className="section-heading">
              <span className="label" style={{ color: 'var(--accent)' }}>Tailored Workflows</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>
                One Architecture. Four Specialized Portals.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                Dedicated, role-specific interfaces designed for each healthcare stakeholder in the clinical ecosystem.
              </p>
            </div>

            <div className="roles-grid">
              {/* Doctor Role Card */}
              <div className="role-card">
                <div className="role-avatar-badge doctor">
                  <span className="role-avatar-emoji">👨‍⚕️</span>
                  <div className="role-badge-pill">Doctor Workspace</div>
                </div>
                <h3 className="role-title">Physicians & Consultants</h3>
                <p className="role-desc">
                  Review complete longitudinal patient records, check past prescriptions and drug allergies, and issue structured electronic prescriptions with attached scans.
                </p>
                <div className="role-features">
                  <span>✓ Longitudinal Patient Chart</span>
                  <span>✓ Structured e-Prescribing</span>
                  <span>✓ Instant Patient ID Search</span>
                </div>
                <Link to="/register" className="btn btn-outline btn-sm w-full" style={{ marginTop: 'auto' }}>
                  Doctor Access <ArrowRight size={14} />
                </Link>
              </div>

              {/* Patient Role Card */}
              <div className="role-card">
                <div className="role-avatar-badge patient">
                  <span className="role-avatar-emoji">👩</span>
                  <div className="role-badge-pill">Patient Health Vault</div>
                </div>
                <h3 className="role-title">Patients & Families</h3>
                <p className="role-desc">
                  Access your complete medical history, download verified diagnostic reports and prescriptions, and retain full sovereignty over which providers can view your data.
                </p>
                <div className="role-features">
                  <span>✓ Universal Health Identifier</span>
                  <span>✓ Granular Consent Control</span>
                  <span>✓ AI-Assisted Health Insights</span>
                </div>
                <Link to="/register" className="btn btn-outline btn-sm w-full" style={{ marginTop: 'auto' }}>
                  Patient Portal <ArrowRight size={14} />
                </Link>
              </div>

              {/* Hospital Role Card */}
              <div className="role-card">
                <div className="role-avatar-badge hospital">
                  <span className="role-avatar-emoji">🏥</span>
                  <div className="role-badge-pill">Hospital Desk</div>
                </div>
                <h3 className="role-title">Hospitals & Clinics</h3>
                <p className="role-desc">
                  Coordinate inpatient admissions, outpatient triage encounters, and surgical discharge summaries across all internal medical departments.
                </p>
                <div className="role-features">
                  <span>✓ Admission & Discharge Logs</span>
                  <span>✓ Multi-Department Triage</span>
                  <span>✓ Institutional Staff Management</span>
                </div>
                <Link to="/register" className="btn btn-outline btn-sm w-full" style={{ marginTop: 'auto' }}>
                  Hospital Portal <ArrowRight size={14} />
                </Link>
              </div>

              {/* Diagnostics Role Card */}
              <div className="role-card">
                <div className="role-avatar-badge diagnostics">
                  <span className="role-avatar-emoji">🔬</span>
                  <div className="role-badge-pill">Diagnostics Terminal</div>
                </div>
                <h3 className="role-title">Diagnostic Centers & Labs</h3>
                <p className="role-desc">
                  Upload certified lab reports, pathology summaries, and radiology imaging directly into the authorized patient record with encrypted storage.
                </p>
                <div className="role-features">
                  <span>✓ Direct PDF Report Dispatch</span>
                  <span>✓ Structured Test Parameters</span>
                  <span>✓ Immutable Lab Provenance</span>
                </div>
                <Link to="/register" className="btn btn-outline btn-sm w-full" style={{ marginTop: 'auto' }}>
                  Diagnostics Portal <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Security & Privacy Architecture ───────────────────────────── */}
        <section className="security-section">
          <div className="container">
            <div className="security-box">
              <div className="security-header">
                <ShieldCheck size={32} color="var(--accent)" />
                <div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Enterprise Security & Privacy Architecture
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Engineered from the database layer up to ensure zero unauthorized patient data leakage.
                  </p>
                </div>
              </div>

              <div className="security-grid">
                <div className="security-card">
                  <KeyRound size={20} color="var(--accent)" />
                  <h4>PostgreSQL Row-Level Security</h4>
                  <p>Database queries are evaluated server-side. Providers only query patients where active authorized relationships exist.</p>
                </div>
                <div className="security-card">
                  <Lock size={20} color="var(--accent)" />
                  <h4>Private Encrypted Storage</h4>
                  <p>Prescriptions and lab scans are never stored publicly. Access requires short-lived signed URLs generated only for authorized users.</p>
                </div>
                <div className="security-card">
                  <Eye size={20} color="var(--accent)" />
                  <h4>Explicit Patient Consent</h4>
                  <p>Searching for a patient does not grant access to medical records. Patients must explicitly approve access requests.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Direct Contact & Support ──────────────────────────────────── */}
        <section className="contact-strip-section">
          <div className="container">
            <div className="contact-strip-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="contact-icon-bubble">
                  <Mail size={24} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Institutional Support &amp; Technical Inquiries</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Need help onboarding your clinic, hospital, or diagnostic center? Reach out via our direct email desk.
                  </p>
                </div>
              </div>
              <a href="mailto:inquiries@ehealth.org.bd" className="btn btn-secondary btn-md" style={{ whiteSpace: 'nowrap' }}>
                <Mail size={16} /> inquiries@ehealth.org.bd
              </a>
            </div>
          </div>
        </section>

        {/* ── 7. Call To Action (CTA) ──────────────────────────────────────── */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <h2>Ready for Connected Healthcare?</h2>
              <p>
                Join patients, doctors, hospitals, and diagnostic centers unifying healthcare records across Bangladesh.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Today <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg">
                  Contact Technical Team
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
