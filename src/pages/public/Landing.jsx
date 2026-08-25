import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, Database, UserCheck, Lock, Pill,
  FlaskConical, BedDouble, ArrowRight, Code, CheckCircle2,
  HeartPulse, Stethoscope, Sparkles, Users
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
            <div className="hero-badge">
              <Activity size={14} color="var(--accent)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Unified Healthcare Infrastructure for Bangladesh
              </span>
            </div>
            
            <h1 className="hero-title" style={{ maxWidth: 840, margin: '0 auto 24px' }}>
              The Trusted Record for<br />
              <span className="text-accent">Modern Healthcare</span>
            </h1>
            
            <p className="hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 40px' }}>
              A single, secure architecture connecting patients, doctors, diagnostic centers, and hospitals. Every prescription, lab report, and hospital stay—unified into one lifetime record.
            </p>
            
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                Institutional Integration
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. Trust Strip ───────────────────────────────────────────────── */}
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
                  <span>Signed URLs for medical documents</span>
                </div>
              </div>
              <div className="trust-cell">
                <UserCheck size={22} color="var(--accent)" />
                <div>
                  <strong>Patient Ownership</strong>
                  <span>Zero unsolicited data access</span>
                </div>
              </div>
              <div className="trust-cell">
                <Database size={22} color="var(--accent)" />
                <div>
                  <strong>Immutable Records</strong>
                  <span>Original files preserved with provenance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. How It Works ──────────────────────────────────────────────── */}
        <section className="how-it-works-section">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
              <span className="label" style={{ color: 'var(--accent)' }}>System Architecture</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>
                How E-Health Unifies Care
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                Three simple steps create a continuous, lifelong medical record across private chambers, diagnostics, and multi-specialty hospitals.
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
                  Patients register once and receive a secure Health Identifier (e.g. <code>P-9824F1A2</code>). No medical data can be accessed without explicit patient authorization.
                </p>
              </div>

              {/* Step 2 */}
              <div className="step-card">
                <div className="step-number">Step 02</div>
                <div className="step-icon-wrap">
                  <Stethoscope size={22} />
                </div>
                <h3 className="h3" style={{ fontSize: '1.125rem', marginBottom: 8 }}>
                  Point-of-Care Entries
                </h3>
                <p className="body-sm">
                  Doctors issue e-prescriptions, diagnostic centers upload certified lab reports, and hospitals log admissions directly into the patient's record with digital signatures.
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
                  Whenever the patient visits a new doctor or hospital, their complete historical timeline is accessible immediately, preventing dangerous drug interactions and duplicated tests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Core Portals (Four Workflows) ──────────────────────────────── */}
        <section className="workflows-section">
          <div className="container">
            <div style={{ marginBottom: 48 }}>
              <span className="label" style={{ color: 'var(--accent)' }}>Tailored Interfaces</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>
                One Architecture. Four Workflows.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                A cohesive system specifically designed for each healthcare stakeholder in the clinical ecosystem.
              </p>
            </div>

            <div className="ledger-grid">
              {/* Patient Ledger */}
              <div className="ledger-row">
                <div className="ledger-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}>
                  <Activity size={20} />
                </div>
                <div className="ledger-content">
                  <h3 className="h3" style={{ marginBottom: 4 }}>Patient Vault</h3>
                  <p className="body-sm">
                    A lifetime chronological timeline of prescriptions, lab findings, and hospital stays. Educational AI assists in understanding complex medical terminology and dosage timings without compromising data security.
                  </p>
                </div>
                <div className="ledger-action">
                  <Link to="/register" className="btn btn-outline btn-sm">For Patients</Link>
                </div>
              </div>

              {/* Doctor Ledger */}
              <div className="ledger-row">
                <div className="ledger-icon blue">
                  <Pill size={20} />
                </div>
                <div className="ledger-content">
                  <h3 className="h3" style={{ marginBottom: 4 }}>Physician Workspace</h3>
                  <p className="body-sm">
                    Review complete longitudinal medical histories when consulting authorized patients. Issue structured e-prescriptions with automatic dosage schedules and attach digital scans for permanent record keeping.
                  </p>
                </div>
                <div className="ledger-action">
                  <Link to="/register" className="btn btn-outline btn-sm">For Doctors</Link>
                </div>
              </div>

              {/* Diagnostics Ledger */}
              <div className="ledger-row">
                <div className="ledger-icon purple">
                  <FlaskConical size={20} />
                </div>
                <div className="ledger-content">
                  <h3 className="h3" style={{ marginBottom: 4 }}>Diagnostics Terminal</h3>
                  <p className="body-sm">
                    Dispatch lab results, pathology summaries, and radiology imaging directly into the patient's record. Every report carries institutional provenance and cannot be altered once delivered.
                  </p>
                </div>
                <div className="ledger-action">
                  <Link to="/register" className="btn btn-outline btn-sm">For Labs</Link>
                </div>
              </div>

              {/* Hospital Ledger */}
              <div className="ledger-row">
                <div className="ledger-icon teal">
                  <BedDouble size={20} />
                </div>
                <div className="ledger-content">
                  <h3 className="h3" style={{ marginBottom: 4 }}>Hospital Desk</h3>
                  <p className="body-sm">
                    Manage inpatient admissions, triage encounters, and surgical discharge summaries. Ensure multi-department continuity across internal medicine, surgery, and out-patient follow-ups.
                  </p>
                </div>
                <div className="ledger-action">
                  <Link to="/register" className="btn btn-outline btn-sm">For Hospitals</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. The Engineering Team Section ──────────────────────────────── */}
        <section className="team-section">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
              <span className="label" style={{ color: 'var(--accent)' }}>Leadership & Development</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>
                The Engineering Team
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                The core developers, system architects, and designers building Bangladesh's unified digital healthcare infrastructure.
              </p>
            </div>

            <div className="team-grid">
              {/* Profile 1: Md. Al Imran Emon */}
              <div className="team-card card-hover">
                <div className="team-avatar-wrap">
                  <div className="team-avatar-frame">
                    <img
                      src="/Al-Imran-Emon.png"
                      alt="Md. Al Imran Emon"
                      className="team-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="avatar avatar-xl avatar-teal" style={{ display: 'none', width: '100%', height: '100%', fontSize: '1.5rem', borderRadius: '50%' }}>
                      AE
                    </div>
                  </div>
                </div>
                <h3 className="team-name">Md. Al Imran Emon</h3>
                <div className="team-role">Lead Developer & Systems Architect</div>
                <p className="team-bio">
                  Architected the core PostgreSQL Row-Level Security (RLS) governance model, private encrypted storage pipeline, and longitudinal timeline engine.
                </p>
                <div className="team-skills">
                  <span className="team-skill-tag">System Architecture</span>
                  <span className="team-skill-tag">PostgreSQL RLS</span>
                  <span className="team-skill-tag">Supabase</span>
                  <span className="team-skill-tag">API Security</span>
                </div>
              </div>

              {/* Profile 2: Mashuk Rahman */}
              <div className="team-card card-hover">
                <div className="team-avatar-wrap">
                  <div className="team-avatar-frame">
                    <img
                      src="/Mashuk.jpeg"
                      alt="Mashuk Rahman"
                      className="team-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="avatar avatar-xl avatar-blue" style={{ display: 'none', width: '100%', height: '100%', fontSize: '1.5rem', borderRadius: '50%' }}>
                      MR
                    </div>
                  </div>
                </div>
                <h3 className="team-name">Mashuk Rahman</h3>
                <div className="team-role">Frontend Developer</div>
                <p className="team-bio">
                  Engineered the responsive physician prescribing interface, multi-portal state synchronization, patient search indexing, and real-time medical timeline views.
                </p>
                <div className="team-skills">
                  <span className="team-skill-tag">React 19</span>
                  <span className="team-skill-tag">Clinical UI</span>
                  <span className="team-skill-tag">State Management</span>
                  <span className="team-skill-tag">Performance</span>
                </div>
              </div>

              {/* Profile 3: Sinthia Akter */}
              <div className="team-card card-hover">
                <div className="team-avatar-wrap">
                  <div className="team-avatar-frame">
                    <img
                      src="/Sinthia.png"
                      alt="Sinthia Akter"
                      className="team-avatar-img team-avatar-sinthia"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="avatar avatar-xl avatar-purple" style={{ display: 'none', width: '100%', height: '100%', fontSize: '1.5rem', borderRadius: '50%' }}>
                      SA
                    </div>
                  </div>
                </div>
                <h3 className="team-name">Sinthia Akter</h3>
                <div className="team-role">UI/UX Designer</div>
                <p className="team-bio">
                  Formulated the design system tokens, clinical typography contrast rules, dark/light theme dynamics, and patient-first accessible interaction patterns.
                </p>
                <div className="team-skills">
                  <span className="team-skill-tag">UI/UX Design</span>
                  <span className="team-skill-tag">Design Systems</span>
                  <span className="team-skill-tag">WCAG Standards</span>
                  <span className="team-skill-tag">User Research</span>
                </div>
              </div>
            </div>

            {/* Engineering Standards Banner */}
            <div className="team-badge-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Engineering Excellence & Privacy by Design
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    100% Client-Isolated RLS Policies · Zero Plaintext Exits · FHIR-Aligned Record Structures
                  </div>
                </div>
              </div>
              <Link to="/about" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                Learn More About Us <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 6. Call To Action (CTA) ──────────────────────────────────────── */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-box">
              <h2>Ready for Connected Healthcare?</h2>
              <p>
                Join thousands of patients, doctors, and medical institutions already unifying healthcare records across Bangladesh.
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
