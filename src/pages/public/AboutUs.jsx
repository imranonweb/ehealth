import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Code, Database, Lock } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

export function AboutUs() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      <main style={{ flex: 1 }}>
        {/* Mission Hero */}
        <section style={{ padding: 'clamp(64px, 8vw, 96px) 0 clamp(48px, 6vw, 72px)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 840 }}>
            <span className="label" style={{ color: 'var(--accent)' }}>Our Mission</span>
            <h1 className="h1" style={{ margin: '16px 0 24px', fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.035em' }}>
              One Patient. One Record.<br />
              <span style={{ color: 'var(--accent)' }}>Trusted Everywhere.</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--text-secondary)', margin: '0 auto', maxWidth: 680 }}>
              E-Health was built on a vital premise: a patient's medical history should travel with them seamlessly. By centralizing prescriptions, diagnostic reports, and hospital records under a single, secure architecture, we empower clinicians to make fully informed decisions and give patients true ownership of their health data.
            </p>
          </div>
        </section>

        {/* Pillars / Values */}
        <section style={{ padding: 'clamp(56px, 6vw, 80px) 0', borderBottom: '1px solid var(--border-default)' }}>
          <div className="container">
            <div className="grid-3" style={{ gap: 24 }}>
              <div className="card" style={{ padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Lock size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Patient Privacy First</h3>
                <p className="body-sm">
                  We believe health data belongs solely to the individual. No healthcare provider or third party can view records without explicit relationship authorization.
                </p>
              </div>

              <div className="card" style={{ padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-blue-bg)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Database size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Cryptographic Provenance</h3>
                <p className="body-sm">
                  Every uploaded report and issued prescription maintains an unalterable audit trail, preserving clinical integrity and eliminating document forgery.
                </p>
              </div>

              <div className="card" style={{ padding: '28px 24px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-purple-bg)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Clinical Reliability</h3>
                <p className="body-sm">
                  Tailored specifically to the realities of healthcare in Bangladesh, supporting instant emergency lookups, offline-friendly PDF backups, and multi-facility synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Engineering Team */}
        <section style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span className="label" style={{ color: 'var(--accent)' }}>Leadership & Builders</span>
              <h2 className="h2" style={{ fontSize: '2rem', margin: '8px 0 12px' }}>The Engineering Team</h2>
              <p className="body" style={{ color: 'var(--text-secondary)' }}>
                The core developers and designers building the E-Health platform.
              </p>
            </div>

            <div className="grid-3" style={{ gap: 24 }}>
              {/* Profile: Imran */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 18 }}>
                  <img
                    src="/Al-Imran-Emon.png"
                    alt="Md. Al Imran Emon"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      border: '3px solid var(--accent)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar avatar-xl avatar-teal" style={{ display: 'none', width: 88, height: 88, fontSize: '1.5rem' }}>AE</div>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Md. Al Imran Emon</h3>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Lead Developer & Systems Architect</div>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Architected the core PostgreSQL Row-Level Security (RLS) governance engine, private storage encryption pipeline, and medical record aggregation.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  <span className="badge">PostgreSQL RLS</span>
                  <span className="badge">System Architecture</span>
                  <span className="badge">API Security</span>
                </div>
              </div>

              {/* Profile: Mashuk */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', marginBottom: 18 }}>
                  <img
                    src="/Mashuk.jpeg"
                    alt="Mashuk Rahman"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      border: '3px solid var(--accent)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar avatar-xl avatar-blue" style={{ display: 'none', width: 88, height: 88, fontSize: '1.5rem' }}>MR</div>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Mashuk Rahman</h3>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Frontend Developer</div>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Engineered the physician prescribing workspace, responsive clinical drawer components, client-side state management, and timeline rendering.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  <span className="badge">React 19</span>
                  <span className="badge">Clinical UI</span>
                  <span className="badge">Performance</span>
                </div>
              </div>

              {/* Profile: Sinthia */}
              <div className="card card-hover" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  marginBottom: 18,
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid var(--accent)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src="/Sinthia.png"
                    alt="Sinthia Akter"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 8%',
                      transform: 'scale(1.45) translateY(6%)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar avatar-xl avatar-purple" style={{ display: 'none', width: '100%', height: '100%', fontSize: '1.5rem' }}>SA</div>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Sinthia Akter</h3>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>UI/UX Designer</div>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Formulated the design system tokens, clinical typography hierarchy, dark/light theme dynamics, and frictionless healthcare UX flows.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                  <span className="badge">UI/UX Design</span>
                  <span className="badge">Design Systems</span>
                  <span className="badge">Accessibility</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
