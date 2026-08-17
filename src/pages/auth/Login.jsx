import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getDefaultRoute } from '../../lib/permissions';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { signIn, profile } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
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
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper (all demo passwords: 1234)
  const fillDemo = (demoEmail, demoPw = '1234') => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0F766E, #14B8A6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>E-Health</span>
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Welcome back</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 24 }}>Sign in to access your secure medical portal</p>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: 'var(--r-md)',
          fontSize: '0.875rem',
          marginBottom: 20
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
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
            <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
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
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
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
              <Loader2 size={16} className="spin" /> Signing In…
            </>
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Demo helper quick fills */}
      <div style={{ marginTop: 24, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-2)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
      </p>
    </div>
  );
}
