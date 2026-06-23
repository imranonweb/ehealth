import { Outlet } from 'react-router-dom';
import { Activity, ShieldCheck, Clock, Users } from 'lucide-react';
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
              Healthcare,<br />reimagined<br />for the digital age.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6 }}>
              Centralized records. Fewer repeated tests. Better care for every patient.
            </p>
          </div>

          {/* Highlights */}
          <div className="auth-highlights">
            {[
              { icon: ShieldCheck, title: 'Bank-grade Security', desc: 'HIPAA compliant, fully encrypted' },
              { icon: Clock,       title: 'Instant Access',      desc: 'Complete patient history in seconds' },
              { icon: Users,       title: 'Trusted by 2,000+',   desc: 'Doctors and hospitals nationwide' },
            ].map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="auth-highlight-item">
                  <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="rgba(255,255,255,0.9)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{h.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{h.desc}</div>
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
