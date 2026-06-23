import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function Register() {
  const [showPw, setShowPw] = useState(false);
  const navigate            = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/patient');
  };

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0F766E, #14B8A6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>E-Health</span>
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Create your account</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 28 }}>Join E-Health and manage your healthcare</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label className="field-label">First name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input className="input has-icon" type="text" placeholder="John" required />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Last name</label>
            <input className="input" type="text" placeholder="Doe" required />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Email address</label>
          <div className="input-wrap">
            <Mail size={16} className="input-icon" />
            <input className="input has-icon" type="email" placeholder="john@example.com" required />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <div className="input-wrap">
            <Lock size={16} className="input-icon" />
            <input className="input has-icon" type={showPw ? 'text' : 'password'} placeholder="Create a strong password" required style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="field-hint">Minimum 8 characters with a number and symbol</p>
        </div>

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginTop: 4 }}>
          <input type="checkbox" required style={{ marginTop: 2, accentColor: 'var(--primary)', width: 15, height: 15, flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>
            I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</a>
          </span>
        </label>

        <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }}>
          Create Account <ArrowRight size={16} />
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
      </p>

      <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 18, textAlign: 'center' }}>
        <p className="body-sm text-muted">Healthcare professional?</p>
        <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Register as Doctor or Hospital →</a>
      </div>
    </div>
  );
}
