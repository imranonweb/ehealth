import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Mail, MapPin, Send, CheckCircle2, User, Globe,
  Code2, ExternalLink, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { ThemeSwitcher } from '../../components/ui/ThemeSwitcher';

function GithubIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      success('Message sent! We will get back to you shortly.');
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="landing-header">
        <div className="container landing-nav">
          <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
            <div className="landing-logo-icon">
              <Activity size={20} color="#FFFFFF" />
            </div>
            <span className="landing-logo-text">E-Health</span>
          </Link>
          <div className="landing-nav-actions">
            <ThemeSwitcher size="sm" />
            <Link to="/" className="btn btn-ghost btn-md">Home</Link>
            <Link to="/login" className="btn btn-primary btn-md">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '60px var(--sp-6) 80px', flex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          <span className="label">Get in Touch</span>
          <h1 className="h1" style={{ margin: '8px 0 12px' }}>Contact E-Health</h1>
          <p className="page-sub">
            Have questions about clinical integrations, technical architecture, or onboarding your institution? Reach out below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.3fr)', gap: 36, alignItems: 'start' }}>
          {/* Project & Lead Developer Card */}
          <div className="card card-elevated" style={{ padding: 'var(--sp-8)' }}>
            <h2 className="h3" style={{ marginBottom: 20 }}>Project Lead & Engineering</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
              {/* Lead Profile */}
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Imran</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Full-Stack Developer & Project Lead</div>
                </div>
              </div>

              {/* GitHub Repo */}
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <GithubIcon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>GitHub Repository</div>
                  <a
                    href="https://github.com/imranonweb/ehealth"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                  >
                    github.com/imranonweb/ehealth <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Location</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={16} color="var(--accent)" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Security Standard</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                E-Health is designed around zero-trust medical record isolation: strictly no client-side role self-elevation, authenticated database RLS, and short-lived signed document URLs.
              </p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="card card-elevated" style={{ padding: 'var(--sp-8)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
                <h3 className="h3" style={{ marginBottom: 8 }}>Inquiry Received</h3>
                <p className="body-sm text-muted" style={{ marginBottom: 24 }}>
                  Thank you for reaching out. We will review your message and reply promptly.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Your Name</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Dr. / Mr. / Ms."
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Email Address</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="name@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Subject</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Institutional Onboarding / Technical Architecture"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Message</label>
                  <textarea
                    className="textarea"
                    placeholder="Describe your query or institutional requirements..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ minHeight: 120 }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                  <Send size={16} /> {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
