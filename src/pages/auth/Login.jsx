import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, MailCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getDefaultRoute } from '../../lib/permissions';
import { Button } from '../../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { signIn, resendConfirmation } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleResend = async () => {
    if (!email.trim()) {
      toastError('Please enter your email address first.');
      return;
    }
    setResending(true);
    setResendSuccess(false);
    try {
      await resendConfirmation(email.trim());
      setResendSuccess(true);
      success('Verification email resent! Check your inbox.');
    } catch (err) {
      toastError(err?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsUnconfirmed(false);
    setResendSuccess(false);
    setLoading(true);

    try {
      const data = await signIn(email.trim(), password);
      success('Logged in successfully!');
      
      // Determine redirection based on authenticated profile role
      const destination = location.state?.from?.pathname;
      if (destination) {
        navigate(destination, { replace: true });
      } else {
        const userRole = data?.role || 'patient';
        navigate(getDefaultRoute(userRole), { replace: true });
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      const msg = err?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
        setIsUnconfirmed(true);
      }
      
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper (all demo passwords: 1234)
  const fillDemo = (demoEmail, demoPw = '1234') => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setErrorMsg(null);
    setIsUnconfirmed(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Welcome back</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 24 }}>Sign in to access your secure medical portal</p>

      {location.state?.verified && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: 20,
          border: '1px solid var(--color-success)',
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>Email verified successfully! You can now sign in.</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '14px 16px',
          background: isUnconfirmed ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)',
          color: isUnconfirmed ? 'var(--color-warning)' : 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: 20,
          border: `1px solid ${isUnconfirmed ? 'var(--color-warning)' : 'transparent'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {isUnconfirmed ? <MailCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{errorMsg}</div>
              {isUnconfirmed && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: '0.8125rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Your email has not been activated yet. Please click the link sent to your inbox, or request a new confirmation link:
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleResend}
                    disabled={resending}
                    style={{ fontWeight: 600 }}
                  >
                    {resending ? 'Sending link…' : 'Resend Confirmation Email'}
                  </button>
                  {resendSuccess && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginLeft: 10, fontWeight: 600 }}>
                      ✓ Email sent!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label className="field-label">Email address</label>
          <div className="input-wrap">
            <Mail size={16} className="input-icon" />
            <input
              className="input has-icon"
              type="email"
              placeholder="name@ehealth.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="field-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <div className="input-wrap">
            <Lock size={16} className="input-icon" />
            <input
              className="input has-icon"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          loadingLabel="Signing In…"
          style={{ marginTop: 8 }}
        >
          Sign In <ArrowRight size={16} />
        </Button>
      </form>

      {/* Demo helper quick fills */}
      <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--bg-surface-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Demo Accounts (Password: 1234)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('patient1@ehealth.demo', '1234')}>Patient 1 (Rafiq)</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('patient2@ehealth.demo', '1234')}>Patient 2 (Fatima)</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('dr.rahman@ehealth.demo', '1234')}>Doctor (Dr. Rahman)</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('populardiag@ehealth.demo', '1234')}>Diagnostics (Popular)</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('greencare@ehealth.demo', '1234')}>Hospital (Green Care)</button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}
