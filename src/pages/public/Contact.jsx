import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Send, CheckCircle2, User, Globe } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! We will get back to you shortly.');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="landing-header">
        <div className="container landing-nav">
          <Link to="/" className="landing-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="sidebar-brand-icon">
              <Activity size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>E-Health</span>
          </Link>
          <div className="landing-nav-actions">
            <Link to="/" className="btn btn-ghost btn-md">Home</Link>
            <Link to="/login" className="btn btn-primary btn-md">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: '60px 0 80px', flex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          <h1 className="h1" style={{ marginBottom: 12 }}>Get in Touch</h1>
          <p className="text-muted">
            Have questions about integrating E-Health with your hospital or diagnostic lab? Reach out to our lead team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 36, alignItems: 'start' }}>
          {/* Info Card */}
          <div className="card" style={{ padding: 'var(--sp-8)' }}>
            <h2 className="h3" style={{ marginBottom: 20 }}>Project & Engineering</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Lead Engineer: Imran</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>Full-Stack & UX Architecture</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Location</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>Dhaka, Bangladesh</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Repository</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>github.com/imranonweb/ehealth</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>About the Platform</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                E-Health provides centralized, lifetime medical health records to prevent duplicate testing, enable safe clinical handovers, and provide patient-first data transparency.
              </p>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="card" style={{ padding: 'var(--sp-8)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                <h3 className="h3" style={{ marginBottom: 8 }}>Thank You!</h3>
                <p className="text-muted" style={{ marginBottom: 24 }}>Your inquiry has been recorded. We will get back to you shortly.</p>
                <button className="btn btn-outline btn-md" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send another message
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
                    <label className="field-label">Your Email</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="you@domain.com"
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
                    placeholder="Institutional Onboarding / Technical Query"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Message</label>
                  <textarea
                    className="textarea"
                    placeholder="How can we assist you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
                  <Send size={16} /> Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
