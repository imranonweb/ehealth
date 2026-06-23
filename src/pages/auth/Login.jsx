import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, User, Stethoscope, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

const roles = [
  { id: 'patient',  label: 'Patient',  icon: User,        color: '#0F766E', desc: 'View records & appointments' },
  { id: 'doctor',   label: 'Doctor',   icon: Stethoscope, color: '#3B82F6', desc: 'Manage patients & prescriptions' },
  { id: 'hospital', label: 'Hospital', icon: Building2,   color: '#8B5CF6', desc: 'Hospital management portal' },
  { id: 'admin',    label: 'Admin',    icon: ShieldCheck, color: '#F59E0B', desc: 'System administration' },
];

export function Login() {
  const [role, setRole]     = useState('patient');
  const [showPw, setShowPw] = useState(false);
  const navigate            = useNavigate();
  const selected            = roles.find(r => r.id === role);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/${role}`);
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

      <h1 className="h2" style={{ marginBottom: 6 }}>Welcome back</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 28 }}>Sign in to your healthcare portal</p>

      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        {roles.map(r => {
          const Icon = r.icon;
          const active = role === r.id;
          return (
            <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 6, padding: '14px', textAlign: 'left',
              border: `2px solid ${active ? r.color : 'var(--border)'}`,
              borderRadius: 'var(--r-lg)',
              background: active ? `${r.color}0a` : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? `${r.color}18` : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: active ? r.color : 'var(--text-3)' }} />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500, color: active ? r.color : 'var(--text-1)' }}>{r.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.3 }}>{r.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label className="field-label">Email address</label>
          <div className="input-wrap">
            <Mail size={16} className="input-icon" />
            <input className="input has-icon" type="email" placeholder={`${role}@hospital.com`} required />
          </div>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="field-label">Password</label>
            <a href="#" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
          </div>
          <div className="input-wrap">
            <Lock size={16} className="input-icon" />
            <input className="input has-icon" type={showPw ? 'text' : 'password'} placeholder="Enter your password" required style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }}>
          Sign in as {selected?.label} <ArrowRight size={16} />
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-2)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
      </p>
    </div>
  );
}
