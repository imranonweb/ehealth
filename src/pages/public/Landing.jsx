import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, FileText, Pill, FlaskConical, Building2, Stethoscope, ArrowRight, CheckCircle2, ChevronRight, Lock, Clock, Database } from 'lucide-react';
import './Landing.css';

export function Landing() {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="container landing-nav">
          <div className="landing-logo">
            <div className="sidebar-brand-icon">
              <Activity size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>E-Health</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#roles">Portals</a>
            <a href="#security">Security</a>
            <Link to="/contact">Contact & Team</Link>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-md">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-md">Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginRight: 8 }} />
              Centralized Digital Health Records
            </div>
            <h1 className="hero-title">
              One patient.<br />
              One medical history.<br />
              <span className="text-gradient">One trusted record.</span>
            </h1>
            <p className="hero-subtitle">
              Eliminate redundant diagnostic tests and fragmented prescriptions. E-Health connects patients, doctors, labs, and hospitals in a single, privacy-focused medical timeline.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In to Portal
              </Link>
            </div>
          </div>

          <div className="hero-image-wrapper">
            {/* Interactive/Visual Timeline Preview Card */}
            <div className="card" style={{ padding: 'var(--sp-6)', boxShadow: 'var(--shadow-xl)', border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar avatar-sm avatar-teal">RA</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rafiq Ahmed</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>ID: P-9824F1A2 · Blood: B+</div>
                  </div>
                </div>
                <span className="badge badge-success">Active Profile</span>
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Chronological Records
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Prescription — Hypertension</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Dr. Sarah Rahman · Green Care Hospital</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FlaskConical size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Complete Blood Count (CBC)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Popular Diagnostics · All normal</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Hospital Visit — Internal Medicine</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Green Care Hospital · Outpatient Follow-up</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section id="features" className="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Why E-Health Makes a Difference</h2>
            <p className="text-muted">
              Designed specifically to solve medical fragmentation in healthcare systems through strict role boundaries and unified history.
            </p>
          </div>

          <div className="grid-3" style={{ gap: 'var(--sp-6)' }}>
            <div className="feature-card">
              <div className="feature-icon"><Clock size={24} /></div>
              <h3>Save Time & Costs</h3>
              <p>Eliminate repeated diagnostic tests and missing paper files. Doctors immediately view historical reports and medication response.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Lock size={24} /></div>
              <h3>Role-Based Access Control</h3>
              <p>Granular database Row Level Security guarantees patients own their data while doctors and labs only write authenticated clinical entries.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Database size={24} /></div>
              <h3>Immutable Clinical History</h3>
              <p>Authorized medical entries cannot be altered retroactively without full audit trails, protecting clinical integrity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals */}
      <section id="roles" style={{ padding: '80px 0', background: 'var(--surface-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 50px' }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Specialized Portals for Every Role</h2>
            <p className="text-muted">Tailored interfaces for patients and clinical providers.</p>
          </div>

          <div className="grid-4" style={{ gap: 'var(--sp-5)' }}>
            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(15,118,110,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Activity size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Patient Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 16 }}>
                Access lifetime medical records, prescriptions, lab results, and healthcare provider directory.
              </p>
              <Link to="/register" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Join as Patient <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Stethoscope size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Doctor Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 16 }}>
                Look up patient history, issue structured e-prescriptions, and review diagnostic lab results.
              </p>
              <Link to="/register" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3B82F6', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Doctor Registration <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <FlaskConical size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Diagnostics Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 16 }}>
                Upload official test reports, imaging scans, and summaries directly to the patient's record.
              </p>
              <Link to="/register" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#8B5CF6', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Lab Portal <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ padding: 'var(--sp-6)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Building2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Hospital Portal</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 16 }}>
                Record inpatient & outpatient admissions, emergency visits, and hospital-based discharges.
              </p>
              <Link to="/register" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Hospital Sign Up <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>E-Health Platform</span>
          </div>
          <div className="footer-links">
            <Link to="/contact">Contact & Team</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} E-Health. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
