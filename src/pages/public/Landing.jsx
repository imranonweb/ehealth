import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldCheck, FileText, Pill, FlaskConical, Building2,
  Stethoscope, ArrowRight, CheckCircle2, ChevronRight, Lock, Clock,
  Database, Sparkles, UserCheck, Eye, HeartPulse, User, Calendar,
  ExternalLink, Menu, X, ArrowUpRight
} from 'lucide-react';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';
import './Landing.css';

export function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* 1. Navbar */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container landing-nav">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <Activity size={20} color="#FFFFFF" />
            </div>
            <span className="landing-logo-text">E-Health</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#for-patients">For Patients</a>
            <a href="#for-providers">For Providers</a>
            <a href="#showcase">Product Showcase</a>
            <a href="#ai-assistant">AI Health</a>
            <a href="#security">Security</a>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="landing-nav-actions">
            <ThemeSwitcher size="sm" />
            <Link to="/login" className="btn btn-ghost btn-md hide-mobile">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-md">
              Get Started <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#for-patients" onClick={() => setMobileMenuOpen(false)}>For Patients</a>
            <a href="#for-providers" onClick={() => setMobileMenuOpen(false)}>For Providers</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)}>Product Showcase</a>
            <a href="#ai-assistant" onClick={() => setMobileMenuOpen(false)}>AI Health</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)}>Security</a>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <Link to="/login" className="btn btn-secondary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm w-full" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} color="var(--accent)" />
              <span>Unified Healthcare Records Infrastructure</span>
            </div>
            <h1 className="hero-title">
              Your Health Records.<br />
              <span className="text-accent">Connected.</span>
            </h1>
            <p className="hero-subtitle">
              One secure place for your prescriptions, diagnostic reports, hospital records, and healthcare history — connecting patients, doctors, diagnostic centers, and hospitals seamlessly.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                Explore E-Health
              </a>
            </div>

            {/* Visual ecosystem roles pill bar */}
            <div className="hero-roles-bar">
              <div className="hero-role-pill"><User size={14} color="var(--accent)" /> <span>Patients</span></div>
              <div className="hero-role-pill"><Stethoscope size={14} color="var(--color-blue)" /> <span>Doctors</span></div>
              <div className="hero-role-pill"><FlaskConical size={14} color="var(--color-purple)" /> <span>Diagnostics</span></div>
              <div className="hero-role-pill"><Building2 size={14} color="var(--color-teal)" /> <span>Hospitals</span></div>
            </div>
          </div>

          {/* Hero Live Mockup Visual */}
          <div className="hero-visual">
            <div className="hero-mock-card card card-elevated">
              <div className="mock-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar avatar-sm avatar-teal">RA</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Rafiq Ahmed</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health ID: P-9824F1A2 · Blood: B+</div>
                  </div>
                </div>
                <span className="badge badge-success">Active Patient Vault</span>
              </div>

              <div className="mock-records-list">
                <div className="mock-record-row">
                  <div className="mock-icon blue"><Pill size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Prescription — Hypertension Stage 1</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dr. Sarah Rahman · Green Care Hospital</div>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>Prescription</span>
                </div>

                <div className="mock-record-row">
                  <div className="mock-icon purple"><FlaskConical size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Complete Blood Count (CBC)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Popular Diagnostics · Findings Normal</div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>Lab Report</span>
                </div>

                <div className="mock-record-row">
                  <div className="mock-icon teal"><Building2 size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Cardiology Follow-Up Encounter</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Green Care Hospital · Outpatient Review</div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>Hospital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust / Privacy Strip */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-cell">
              <ShieldCheck size={20} color="var(--accent)" />
              <div>
                <strong>Role-Based Access Control</strong>
                <span>PostgreSQL database row-level security</span>
              </div>
            </div>
            <div className="trust-cell">
              <Lock size={20} color="var(--accent)" />
              <div>
                <strong>Private File Storage</strong>
                <span>Medical documents delivered via short-lived signed URLs</span>
              </div>
            </div>
            <div className="trust-cell">
              <UserCheck size={20} color="var(--accent)" />
              <div>
                <strong>Patient-Centric Access</strong>
                <span>Care providers only view authorized patient charts</span>
              </div>
            </div>
            <div className="trust-cell">
              <Database size={20} color="var(--accent)" />
              <div>
                <strong>Immutable Records</strong>
                <span>Original documents preserved with full provenance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How E-Health Works */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-intro">
            <span className="label">Workflow</span>
            <h2 className="h2">How E-Health Connects Care</h2>
            <p className="text-muted">A privacy-governed loop connecting patients with accredited healthcare providers.</p>
          </div>

          <div className="how-flow-grid">
            <div className="card how-flow-card">
              <div className="flow-step-num">01</div>
              <h3>Provider Creates Record</h3>
              <p>An authorized doctor, diagnostic lab, or hospital issues a structured digital record or uploads a report.</p>
            </div>

            <div className="card how-flow-card">
              <div className="flow-step-num">02</div>
              <h3>Document Securely Stored</h3>
              <p>The original scan or PDF is uploaded to a private encrypted storage bucket with strict access boundaries.</p>
            </div>

            <div className="card how-flow-card">
              <div className="flow-step-num">03</div>
              <h3>Patient Accesses History</h3>
              <p>The patient immediately sees the new record in their chronological medical timeline and health vault.</p>
            </div>

            <div className="card how-flow-card">
              <div className="flow-step-num">04</div>
              <h3>Authorized Continuity</h3>
              <p>Future treating doctors access past diagnoses and test results to make informed clinical decisions.</p>
            </div>

            <div className="card how-flow-card">
              <div className="flow-step-num">05</div>
              <h3>AI Educational Insights</h3>
              <p>Patients can optionally use AI to explain complex medical terms, lab ranges, and medication instructions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Patient Section */}
      <section id="for-patients" className="portal-spotlight-section">
        <div className="container">
          <div className="spotlight-grid">
            <div className="spotlight-content">
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>
                <User size={13} /> Patient Experience
              </span>
              <h2 className="h2" style={{ marginBottom: 14 }}>
                Your complete health history, in one place.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Never lose a paper prescription or repeat expensive diagnostic tests again. E-Health organizes all your clinical events into an accessible lifetime timeline.
              </p>
              <ul className="spotlight-features">
                <li><CheckCircle2 size={16} color="var(--accent)" /> Real-time feed of prescriptions, lab tests, and hospital stays</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> View original clinical scans, PDF reports, and medication schedules</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Share your unique Patient Health ID with authorized clinicians</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Educational AI explanations for complex terms and dosage timings</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-md" style={{ marginTop: 20 }}>
                Explore Patient Experience <ArrowRight size={16} />
              </Link>
            </div>

            <div className="spotlight-preview card card-elevated">
              <div className="preview-header">
                <span className="label">Patient Timeline Preview</span>
                <span className="badge badge-success">Read-Only Vault</span>
              </div>
              <div className="preview-body">
                <div className="mini-timeline-node">
                  <div className="mini-node-icon blue"><Pill size={15} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84375rem' }}>Tab Amlodipine 5mg + Losartan 50mg</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily morning dosage · Issued by Dr. Rahman</div>
                  </div>
                </div>
                <div className="mini-timeline-node">
                  <div className="mini-node-icon purple"><FlaskConical size={15} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84375rem' }}>Lipid Profile & Serum Creatinine</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Popular Diagnostics · Attached PDF Scan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Doctor Section */}
      <section id="for-providers" className="portal-spotlight-section alt-bg">
        <div className="container">
          <div className="spotlight-grid reverse">
            <div className="spotlight-content">
              <span className="badge badge-blue" style={{ marginBottom: 12 }}>
                <Stethoscope size={13} /> Doctor Portal
              </span>
              <h2 className="h2" style={{ marginBottom: 14 }}>
                Better context. Better-informed care.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Access complete longitudinal medical histories when consulting authorized patients. Review past adverse reactions, diagnostic trends, and past prescriptions before issuing care.
              </p>
              <ul className="spotlight-features">
                <li><CheckCircle2 size={16} color="var(--color-blue)" /> Lookup authorized patient charts via unique Health Identifier</li>
                <li><CheckCircle2 size={16} color="var(--color-blue)" /> Create structured digital e-prescriptions with dosage & duration</li>
                <li><CheckCircle2 size={16} color="var(--color-blue)" /> Upload prescription scans directly to private storage</li>
                <li><CheckCircle2 size={16} color="var(--color-blue)" /> Review past diagnostic lab findings across all testing facilities</li>
              </ul>
              <Link to="/register" className="btn btn-secondary btn-md" style={{ marginTop: 20 }}>
                For Doctors <ArrowRight size={16} />
              </Link>
            </div>

            <div className="spotlight-preview card card-elevated">
              <div className="preview-header">
                <span className="label">Doctor Consultation Workspace</span>
                <span className="badge badge-blue">Authorized Access</span>
              </div>
              <div className="preview-body">
                <div className="doctor-mock-header">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Dr. Sarah Rahman, MD (Cardiology)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BMDC Reg: A-48291 · Green Care Hospital</div>
                </div>
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: '0.75rem' }}>
                  ✓ Longitudinal chart access granted for <strong>Rafiq Ahmed (P-9824F1A2)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Diagnostics Section */}
      <section className="portal-spotlight-section">
        <div className="container">
          <div className="spotlight-grid">
            <div className="spotlight-content">
              <span className="badge badge-purple" style={{ marginBottom: 12 }}>
                <FlaskConical size={13} /> Diagnostics Portal
              </span>
              <h2 className="h2" style={{ marginBottom: 14 }}>
                Make every report part of the patient's story.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Seamlessly upload lab results, pathology summaries, and radiology imaging scans directly into the patient's permanent record.
              </p>
              <ul className="spotlight-features">
                <li><CheckCircle2 size={16} color="var(--color-purple)" /> Associate lab findings directly with patient identifiers</li>
                <li><CheckCircle2 size={16} color="var(--color-purple)" /> Attach official PDF reports and diagnostic imaging files</li>
                <li><CheckCircle2 size={16} color="var(--color-purple)" /> Structured test metadata: categories, reference ranges & consultant notes</li>
                <li><CheckCircle2 size={16} color="var(--color-purple)" /> Immutable storage with private signed URL access</li>
              </ul>
              <Link to="/register" className="btn btn-secondary btn-md" style={{ marginTop: 20 }}>
                For Diagnostic Centers <ArrowRight size={16} />
              </Link>
            </div>

            <div className="spotlight-preview card card-elevated">
              <div className="preview-header">
                <span className="label">Diagnostic Center Dispatch</span>
                <span className="badge badge-purple">Lab Upload</span>
              </div>
              <div className="preview-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Popular Diagnostic Centre (Dhanmondi)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded: CBC & Lipid Profile (2 Attachments)</div>
                  <div className="badge badge-success" style={{ alignSelf: 'flex-start', fontSize: '0.6875rem' }}>Delivered to Patient Timeline</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Hospital Section */}
      <section className="portal-spotlight-section alt-bg">
        <div className="container">
          <div className="spotlight-grid reverse">
            <div className="spotlight-content">
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>
                <Building2 size={13} /> Hospital Portal
              </span>
              <h2 className="h2" style={{ marginBottom: 14 }}>
                Connect hospital care with the complete patient history.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Manage inpatient admissions, emergency triage encounters, and surgical discharge summaries without losing cross-institutional continuity.
              </p>
              <ul className="spotlight-features">
                <li><CheckCircle2 size={16} color="var(--accent)" /> Record inpatient admissions, emergency visits, and outpatient follow-ups</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Document admission reasons, diagnosis summaries, and discharge notes</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Issue hospital discharge prescriptions linked to the admission record</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Multi-department continuity across internal medicine, surgery, and cardiology</li>
              </ul>
              <Link to="/register" className="btn btn-secondary btn-md" style={{ marginTop: 20 }}>
                For Hospitals <ArrowRight size={16} />
              </Link>
            </div>

            <div className="spotlight-preview card card-elevated">
              <div className="preview-header">
                <span className="label">Hospital Admission Desk</span>
                <span className="badge badge-primary">Inpatient Ward</span>
              </div>
              <div className="preview-body">
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Green Care Hospital — Dhaka</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Department: Internal Medicine · Admission: 12 Aug 2026</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8, padding: '8px 10px', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                  Discharge Summary: Controlled blood pressure, lifestyle guidance provided.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Medical Timeline Product Showcase */}
      <section id="showcase" className="showcase-section">
        <div className="container">
          <div className="section-intro">
            <span className="label">Signature Feature</span>
            <h2 className="h2">The Unified Medical Timeline</h2>
            <p className="text-muted">
              One chronological stream combining prescriptions, laboratory reports, and hospital encounters across every healthcare facility.
            </p>
          </div>

          <div className="card showcase-timeline-box card-elevated">
            <div className="showcase-item">
              <div className="showcase-date">15 Aug 2026</div>
              <div className="showcase-dot blue"><Pill size={16} /></div>
              <div className="showcase-content">
                <h4>Prescription: Hypertension & Dyslipidemia</h4>
                <p>Dr. Sarah Rahman · Green Care Hospital · Tab Amlodipine 5mg + Rosuvastatin 10mg</p>
              </div>
            </div>

            <div className="showcase-item">
              <div className="showcase-date">10 Aug 2026</div>
              <div className="showcase-dot purple"><FlaskConical size={16} /></div>
              <div className="showcase-content">
                <h4>Diagnostic Lab: Complete Blood Count & Fasting Lipid Profile</h4>
                <p>Popular Diagnostic Centre · Serum Cholesterol: 210 mg/dL · HDL: 45 mg/dL</p>
              </div>
            </div>

            <div className="showcase-item">
              <div className="showcase-date">05 Jul 2026</div>
              <div className="showcase-dot teal"><Building2 size={16} /></div>
              <div className="showcase-content">
                <h4>Hospital Encounter: Internal Medicine Outpatient Review</h4>
                <p>City Medical Hospital · Admission evaluation & baseline ECG test completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Prescription / Document Showcase */}
      <section className="doc-showcase-section alt-bg">
        <div className="container">
          <div className="spotlight-grid">
            <div className="spotlight-content">
              <span className="label">Document Integrity</span>
              <h2 className="h2" style={{ marginBottom: 14 }}>Authoritative Document Vault</h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Every clinical record preserves the original authenticated document — whether a signed physician prescription scan, a high-resolution lab report PDF, or hospital discharge paperwork.
              </p>
              <ul className="spotlight-features">
                <li><CheckCircle2 size={16} color="var(--accent)" /> High-resolution PDF and image previewer with zoom, rotate, and fullscreen</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Immutable storage — original files are never overwritten or altered</li>
                <li><CheckCircle2 size={16} color="var(--accent)" /> Zero public URLs — access granted strictly via short-lived signed URLs</li>
              </ul>
            </div>

            <div className="card doc-card-preview card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Prescription_Scan_2026.pdf</span>
                <span className="badge badge-blue">Verified Scan</span>
              </div>
              <div className="doc-mock-sheet">
                <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-strong)', paddingBottom: 8, marginBottom: 10 }}>
                  <strong style={{ fontSize: '0.875rem' }}>GREEN CARE HOSPITAL</strong>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Department of Cardiology · Clinical Prescription</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Patient: Rafiq Ahmed · Age: 48 · Gender: Male<br />
                  Rx:<br />
                  1. Tab. Amlodipine 5mg — 1+0+0 (30 days)<br />
                  2. Tab. Rosuvastatin 10mg — 0+0+1 (30 days)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. AI-Assisted Understanding Section */}
      <section id="ai-assistant" className="ai-section">
        <div className="container">
          <div className="card ai-feature-box card-elevated">
            <div className="ai-feature-content">
              <div className="ai-badge">
                <Sparkles size={16} color="var(--accent)" />
                <span>AI-Assisted Educational Assistance</span>
              </div>
              <h2 className="h2" style={{ margin: '10px 0 14px' }}>
                Translating complex clinical notes into plain language.
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Patients can use AI to understand medical abbreviations, clarify dosage timings, and learn about standard reference ranges in lab reports.
              </p>

              <div className="ai-capabilities-grid">
                <div className="ai-cap-item">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Medical Terminology</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simplifies Latin terms and diagnoses (e.g. PRN, Dyslipidemia).</div>
                </div>
                <div className="ai-cap-item">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Medication Timing</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explains schedule notes (e.g. 1+0+1 after meals).</div>
                </div>
                <div className="ai-cap-item">
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Lab Findings Breakdown</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Explains normal physiological reference metrics.</div>
                </div>
              </div>

              {/* Crucial Safety Notice */}
              <div className="ai-safety-warning">
                ⚠️ <strong>Educational Assistance Only:</strong> The AI assistant does NOT diagnose conditions, prescribe medications, alter dosages, recommend stopping treatments, or replace healthcare professionals. Always consult your attending doctor.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Privacy & Security Section */}
      <section id="security" className="security-section">
        <div className="container">
          <div className="security-box card card-elevated">
            <span className="label">Security & Architecture</span>
            <h2 className="h2" style={{ margin: '8px 0 16px' }}>
              Designed with privacy and controlled access in mind.
            </h2>
            <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 680 }}>
              E-Health enforces multi-layered authorization safeguards so that medical data remains isolated and protected under strict governance.
            </p>

            <div className="security-checklist">
              <div className="check-item"><CheckCircle2 size={18} color="var(--accent)" /> <span><strong>PostgreSQL Row-Level Security:</strong> Patients only read their own records; providers access authorized patient charts only.</span></div>
              <div className="check-item"><CheckCircle2 size={18} color="var(--accent)" /> <span><strong>No Public Directories:</strong> Patient lookup requires exact Health Identifier matching to prevent unauthorized directory scraping.</span></div>
              <div className="check-item"><CheckCircle2 size={18} color="var(--accent)" /> <span><strong>Private Storage Buckets:</strong> Original scans and PDF reports are stored in private Supabase buckets with signed URLs.</span></div>
              <div className="check-item"><CheckCircle2 size={18} color="var(--accent)" /> <span><strong>Client-Side Role Protection:</strong> Normal users can never self-promote to doctor or hospital roles via client manipulation.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Call To Action (CTA) */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card card card-elevated">
            <h2 className="h2" style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
              Ready to unify your healthcare records?
            </h2>
            <p className="body" style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 24px' }}>
              Join E-Health today as a patient, physician, diagnostic lab, or medical institution.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="landing-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="landing-logo-icon" style={{ width: 32, height: 32 }}>
                <Activity size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>E-Health</span>
            </div>
            <p className="caption" style={{ marginTop: 10, lineHeight: 1.6 }}>
              Centralized digital healthcare platform connecting patients, doctors, diagnostic centers, and hospitals under strict privacy governance.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Navigation</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#for-patients">For Patients</a>
              <a href="#for-providers">For Providers</a>
              <a href="#security">Security</a>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
              <Link to="/forgot-password">Reset Password</Link>
            </div>

            <div className="footer-col">
              <h4>Engineering</h4>
              <Link to="/contact">Contact & Team</Link>
              <a href="https://github.com/imranonweb/ehealth" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p className="caption">© {new Date().getFullYear()} E-Health Platform. All rights reserved. Designed with privacy and controlled access in mind.</p>
        </div>
      </footer>
    </div>
  );
}
