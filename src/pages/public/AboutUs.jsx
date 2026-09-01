import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Lock } from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

/* ─── team data ──────────────────────────────────────────────────────────── */
const team = [
  {
    name: 'Md. Al Imran Emon',
    role: 'Lead Developer & Systems Architect',
    img: '/Al-Imran-Emon.png',
    initials: 'AE',
    avatarColor: 'avatar-teal',
    description:
      'Architected the core PostgreSQL Row-Level Security (RLS) governance engine, private storage encryption pipeline, and medical record aggregation.',
    badges: ['PostgreSQL RLS', 'System Architecture', 'API Security'],
  },
  {
    name: 'Mashuk Rahman',
    role: 'Frontend Developer',
    img: '/Mashuk.jpeg',
    initials: 'MR',
    avatarColor: 'avatar-blue',
    description:
      'Engineered the physician prescribing workspace, responsive clinical drawer components, client-side state management, and timeline rendering.',
    badges: ['React 19', 'Clinical UI', 'Performance'],
    imgStyle: {},
  },
  {
    name: 'Sinthia Akter',
    role: 'UI/UX Designer',
    img: '/Sinthia.png',
    initials: 'SA',
    avatarColor: 'avatar-purple',
    description:
      'Formulated the design system tokens, clinical typography hierarchy, dark/light theme dynamics, and frictionless healthcare UX flows.',
    badges: ['UI/UX Design', 'Design Systems', 'Accessibility'],
    imgStyle: { objectPosition: 'center 8%', transform: 'scale(1.45) translateY(6%)' },
  },
];

/* ─── reusable team card ─────────────────────────────────────────────────── */
function TeamCard({ member }) {
  return (
    <div className="card card-hover" style={{
      padding: 'clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Avatar container */}
      <div style={{
        position: 'relative',
        marginBottom: 18,
        width: 88,
        height: 88,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid var(--accent)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}>
        <img
          src={member.img}
          alt={member.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            ...(member.imgStyle || {}),
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback initials avatar */}
        <div
          className={`avatar ${member.avatarColor}`}
          style={{ display: 'none', width: '100%', height: '100%', fontSize: '1.5rem', borderRadius: '50%' }}
        >
          {member.initials}
        </div>
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        {member.name}
      </h3>

      {/* Role */}
      <div style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: 12,
      }}>
        {member.role}
      </div>

      {/* Description */}
      <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        {member.description}
      </p>

      {/* Skill badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 'auto' }}>
        {member.badges.map((b) => (
          <span key={b} className="badge">{b}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export function AboutUs() {
  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflowX: 'hidden',
    }}>
      <PublicNavbar />

      <main style={{ flex: 1 }}>

        {/* ── Mission Hero ─────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(48px, 8vw, 96px) 0 clamp(36px, 6vw, 72px)',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
        }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 840 }}>
            <span className="label" style={{ color: 'var(--accent)' }}>Our Mission</span>
            <h1 className="h1" style={{
              margin: '14px 0 20px',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '-0.035em',
            }}>
              One Patient. One Record.<br />
              <span style={{ color: 'var(--accent)' }}>Trusted Everywhere.</span>
            </h1>
            <p className="body-lg" style={{
              color: 'var(--text-secondary)',
              margin: '0 auto',
              maxWidth: 680,
              lineHeight: 1.7,
            }}>
              E-Health was built on a vital premise: a patient's medical history should travel with them
              seamlessly. By centralising prescriptions, diagnostic reports, and hospital records under a
              single, secure architecture, we empower clinicians to make fully informed decisions and give
              patients true ownership of their health data.
            </p>
          </div>
        </section>

        {/* ── Pillars / Values ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(44px, 6vw, 80px) 0',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div className="container">
            <div className="grid-3" style={{ gap: 'clamp(14px, 2.5vw, 24px)' }}>

              <div className="card" style={{ padding: 'clamp(20px, 3.5vw, 28px) clamp(16px, 3vw, 24px)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-subtle)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <Lock size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Patient Privacy First</h3>
                <p className="body-sm">
                  We believe health data belongs solely to the individual. No healthcare provider or third
                  party can view records without explicit relationship authorisation.
                </p>
              </div>

              <div className="card" style={{ padding: 'clamp(20px, 3.5vw, 28px) clamp(16px, 3vw, 24px)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-blue-bg)', color: 'var(--color-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <Database size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Cryptographic Provenance</h3>
                <p className="body-sm">
                  Every uploaded report and issued prescription maintains an unalterable audit trail,
                  preserving clinical integrity and eliminating document forgery.
                </p>
              </div>

              <div className="card" style={{ padding: 'clamp(20px, 3.5vw, 28px) clamp(16px, 3vw, 24px)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-purple-bg)', color: 'var(--color-purple)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <ShieldCheck size={22} />
                </div>
                <h3 className="h3" style={{ marginBottom: 8 }}>Clinical Reliability</h3>
                <p className="body-sm">
                  Tailored specifically to the realities of healthcare in Bangladesh, supporting instant
                  emergency lookups, offline-friendly PDF backups, and multi-facility synchronisation.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Engineering Team ─────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(48px, 8vw, 96px) 0',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div className="container">

            {/* Section heading */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 52px)' }}>
              <span className="label" style={{ color: 'var(--accent)' }}>Leadership &amp; Builders</span>
              <h2 className="h2" style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
                margin: '10px 0 12px',
              }}>
                The Engineering Team
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
                The core developers and designers building the E-Health platform.
              </p>
            </div>

            {/* Team cards — 3-col desktop, 2-col tablet, 1-col mobile */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: 'clamp(16px, 2.5vw, 28px)',
            }}>
              {team.map((m) => <TeamCard key={m.name} member={m} />)}
            </div>

          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(40px, 6vw, 72px) 0' }}>
          <div className="container">
            <div style={{
              background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(37,99,235,0.07))',
              border: '1.5px solid var(--accent)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(28px, 5vw, 52px) clamp(20px, 4vw, 48px)',
              textAlign: 'center',
            }}>
              <h2 className="h2" style={{
                fontSize: 'clamp(1.375rem, 3vw, 2rem)',
                marginBottom: 12,
              }}>
                Want to integrate with E-Health?
              </h2>
              <p className="body" style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 520, margin: '0 auto 28px' }}>
                Reach out to the engineering team for institutional integration, API access, or technical partnership.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary btn-lg">Contact the Team</Link>
                <Link to="/register" className="btn btn-secondary btn-lg">Get Started Free</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
