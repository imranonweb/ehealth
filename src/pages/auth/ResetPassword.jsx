import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { updatePassword } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccessState(true);
      success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Password update failed:', err);
      const msg = err?.message || 'Failed to update password. Reset link may have expired.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Set New Password</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 24 }}>
        Enter a new secure password for your account.
      </p>

      {successState ? (
        <div style={{
          padding: '24px',
          background: 'var(--color-success-bg)',
          border: '1.5px solid var(--color-success)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Password updated!
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            Redirecting you to the sign-in page…
          </p>
          <Link to="/login" className="btn btn-primary btn-md w-full">
            Sign In Now
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
            <label className="field-label">New Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                className="input has-icon"
                type={showPw ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
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

          <div className="field">
            <label className="field-label">Confirm New Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                className="input has-icon"
                type={showPw ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            loadingLabel="Updating Password…"
            style={{ marginTop: 8 }}
          >
            Update Password <ArrowRight size={16} />
          </Button>
        </form>
      )}
    </div>
  );
}
