import { Link } from 'react-router-dom';
import { Activity, Shield, Clock, Users, ArrowRight, CheckCircle, Star, Zap, HeartPulse } from 'lucide-react';

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)',
        background: 'rgba(248,250,252,0.85)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15,118,110,0.3)' }}>
              <Activity size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: 'var(--text-1)' }}>E-Health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Features', 'About', 'Contact'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ padding: '8px 14px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)', borderRadius: 'var(--r-md)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.target.style.background = 'var(--surface-3)'; e.target.style.color = 'var(--text-1)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-2)'; }}>
                {l}
              </a>
            ))}
            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>

        {/* Hero */}
        <section style={{ padding: '100px 32px 80px', background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,118,110,0.08) 0%, transparent 70%)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--r-full)', padding: '6px 14px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 24 }} className="animate-up">
              <Zap size={13} /> Trusted by 2,000+ Healthcare Professionals
            </div>
            <h1 className="display animate-up stagger-1" style={{ color: 'var(--text-1)', marginBottom: 24 }}>
              Modern Healthcare Records,<br />
              <span style={{ color: 'var(--primary)' }}>Zero Redundancy</span>
            </h1>
            <p className="body-lg text-muted animate-up stagger-2" style={{ maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7 }}>
              A centralized, secure, and intelligent healthcare management platform. Connect patients, doctors, and hospitals to eliminate repeated tests and improve patient outcomes.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }} className="animate-up stagger-3">
              <Link to="/register" className="btn btn-primary btn-xl">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-xl">
                Access Portal
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }} className="animate-up stagger-4">
              {['HIPAA Compliant', '256-bit Encryption', 'Instant Access', '99.9% Uptime'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-2)', fontWeight: 500 }}>
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} /> {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section id="features" style={{ padding: '80px 32px', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="overline text-primary" style={{ marginBottom: 12 }}>Why E-Health</p>
              <h2 className="h1">Everything your healthcare team needs</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { icon: Shield,     color: '#0F766E', title: 'Enterprise Security',    desc: 'End-to-end encryption and role-based access ensure sensitive medical data remains strictly confidential.' },
                { icon: Clock,      color: '#3B82F6', title: 'Save Time & Costs',      desc: 'Eliminate redundant tests by giving providers instant access to a patient\'s complete medical history.' },
                { icon: Users,      color: '#8B5CF6', title: 'Unified Collaboration',  desc: 'Doctors, hospitals, and patients share diagnoses, prescriptions, and reports in a single workflow.' },
                { icon: HeartPulse, color: '#EC4899', title: 'Real-time Analytics',    desc: 'Beautiful charts and health dashboards give clinicians at-a-glance insights for better decisions.' },
                { icon: Zap,        color: '#F59E0B', title: 'Lightning Fast',         desc: 'Instant record retrieval. No waiting rooms for your data — results and history in under a second.' },
                { icon: Star,       color: '#10B981', title: 'Patient-Centered',       desc: 'Patients own their data. Full transparency with appointment management and prescription tracking.' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} style={{
                    padding: 28, borderRadius: 'var(--r-xl)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)',
                    transition: 'all 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = f.color+'40'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: `${f.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                      <Icon size={22} style={{ color: f.color }} />
                    </div>
                    <h3 className="h4" style={{ marginBottom: 8 }}>{f.title}</h3>
                    <p className="body-sm text-muted">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 32px', background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to transform your practice?</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 36, fontSize: '1.0625rem' }}>Join thousands of healthcare professionals using E-Health every day.</p>
            <Link to="/register" className="btn btn-xl" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--sidebar-bg)', padding: '32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>E-Health</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem' }}>© 2026 E-Health Platform. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
