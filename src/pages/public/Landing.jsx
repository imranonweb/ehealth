import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Database, UserCheck, Lock, Pill, FlaskConical, BedDouble, Building2, ArrowRight } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import './Landing.css';

export function Landing() {
  return (
    <div className="landing-page">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="hero-badge" style={{ marginBottom: 24 }}>
            <Activity size={14} color="var(--accent)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Unified Healthcare Infrastructure</span>
          </div>
          
          <h1 className="hero-title" style={{ maxWidth: 800, margin: '0 auto 24px' }}>
            The Trusted Record for<br />
            <span className="text-accent">Modern Healthcare</span>
          </h1>
          
          <p className="hero-subtitle" style={{ maxWidth: 600, margin: '0 auto 40px' }}>
            A single, secure architecture connecting patients, doctors, diagnostic centers, and hospitals. Every prescription, lab report, and admission—unified.
          </p>
          
          <div className="hero-actions" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Account <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Institutional Integration
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-cell">
              <ShieldCheck size={20} color="var(--accent)" />
              <div>
                <strong>Role-Based Access</strong>
                <span>Strictly isolated clinical permissions</span>
              </div>
            </div>
            <div className="trust-cell">
              <Lock size={20} color="var(--accent)" />
              <div>
                <strong>Encrypted Storage</strong>
                <span>Signed URLs for medical documents</span>
              </div>
            </div>
            <div className="trust-cell">
              <UserCheck size={20} color="var(--accent)" />
              <div>
                <strong>Patient Ownership</strong>
                <span>Zero unsolicited data access</span>
              </div>
            </div>
            <div className="trust-cell">
              <Database size={20} color="var(--accent)" />
              <div>
                <strong>Immutable Log</strong>
                <span>Original files preserved with provenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Portals / Features (Ledger-like layout) */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-app)' }}>
        <div className="container">
          <div style={{ marginBottom: 64 }}>
            <h2 className="h2" style={{ marginBottom: 8 }}>One Architecture. Four Workflows.</h2>
            <p className="body" style={{ color: 'var(--text-secondary)' }}>
              A cohesive system designed for the specific needs of each healthcare stakeholder.
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
                  Review complete longitudinal medical histories when consulting authorized patients. Issue e-prescriptions with structured dosage instructions and instantly attach PDF scans for permanent reference.
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

      <PublicFooter />
    </div>
  );
}
