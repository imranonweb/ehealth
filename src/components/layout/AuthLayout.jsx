import { Outlet } from 'react-router-dom';
import { Activity, ShieldCheck, Clock, Users, Lock, HeartPulse } from 'lucide-react';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-panel-inner">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Activity size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#fff', letterSpacing: '-0.02em' }}>E-Health</span>
          </div>

          <div className="auth-panel-headline">
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 16 }}>
              One patient.<br />One medical history.<br />One trusted record.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Centralized digital health platform connecting patients, doctors, diagnostic centers, and hospitals seamlessly.
            </p>
          </div>

          {/* Highlights */}
          <div className="auth-highlights">
            {[
              { icon: ShieldCheck, title: 'Role-Based Access Control', desc: 'Patients, doctors, and hospitals access only authorized clinical records' },
              { icon: HeartPulse,  title: 'Unified Medical Timeline', desc: 'Prescriptions, lab reports, and admissions in one chronological view' },
              { icon: Lock,        title: 'Privacy-First Architecture', desc: 'Secure database row-level security and signed document access' },
            ].map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="auth-highlight-item">
                  <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="rgba(255,255,255,0.9)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{h.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{h.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
