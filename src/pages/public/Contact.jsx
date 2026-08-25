import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';

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
      <PublicNavbar />

      {/* Main Content */}
      <main className="container" style={{ padding: '80px var(--sp-6)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          <span className="label">Institutional Contact</span>
          <h1 className="h1" style={{ margin: '8px 0 12px' }}>Secure Inquiries</h1>
          <p className="page-sub">
            Have questions about clinical integrations, technical architecture, or onboarding your institution? Reach out securely using the form below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 48, width: '100%', maxWidth: 960 }}>
          {/* Institutional Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <MapPin size={20} color="var(--accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Headquarters</h3>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: 32 }}>
                E-Health Foundation<br />
                Dhaka, Bangladesh
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Mail size={20} color="var(--accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Direct Contact</h3>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: 32 }}>
                inquiries@ehealth.org.bd<br />
                +880 (Contact via email preferred)
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 24, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Security Standard</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                E-Health is designed around zero-trust medical record isolation: strictly no client-side role self-elevation, authenticated database RLS, and short-lived signed document URLs.
              </p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="card" style={{ padding: 'var(--sp-8)', backgroundColor: 'var(--bg-surface)' }}>
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
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                  <Send size={16} /> {loading ? 'Sending Request…' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
