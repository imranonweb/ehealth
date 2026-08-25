import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { resetPassword } = useAuth();
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
      success('Password reset link sent to your email.');
    } catch (err) {
      console.error('Password reset failed:', err);
      const msg = err?.message || 'Failed to send reset link. Please verify your email.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0F766E, #14B8A6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>E-Health</span>
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Reset Password</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 24 }}>
        Enter your registered email address to receive password reset instructions.
      </p>

      {submitted ? (
        <div style={{
          padding: '24px',
          background: 'var(--color-success-bg)',
          border: '1.5px solid var(--color-success)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Check your inbox
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            We've sent a secure password recovery link to <strong>{email}</strong>.
          </p>
          <Link to="/login" className="btn btn-outline btn-md w-full">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="field">
            <label className="field-label">Email address</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                className="input has-icon"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Sending link…
              </>
            ) : (
              <>
                Send Reset Link <ArrowRight size={16} />
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to login</Link>
          </p>
        </form>
      )}
    </div>
  );
}
