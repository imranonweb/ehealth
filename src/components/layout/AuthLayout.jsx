import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Lock } from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Left Medical SaaS Brand Panel */}
      <div className="auth-panel">
        <div className="auth-panel-inner">
          {/* Logo Header */}
          <div className="auth-panel-brand">
            <Link to="/" aria-label="E-Health Home" style={{ display: 'inline-flex' }}>
              <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Core Value Proposition */}
          <div className="auth-panel-headline">
            <h2>
              One Patient.<br />
              One Medical History.<br />
              One Connected Record.
            </h2>
            <p>
              A unified digital healthcare infrastructure connecting patients, doctors, diagnostic centers, and hospitals under strict privacy governance.
            </p>
          </div>

          {/* Healthcare Platform Safeguards */}
          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="auth-highlight-title">Strict Role Isolation (RLS)</div>
                <div className="auth-highlight-sub">Providers only access authorized patient charts via active relationships.</div>
              </div>
            </div>

            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <HeartPulse size={18} />
              </div>
              <div>
                <div className="auth-highlight-title">Unified Medical Timeline</div>
                <div className="auth-highlight-sub">Prescriptions, diagnostic findings, and hospitalizations in a single record.</div>
              </div>
            </div>

            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <Lock size={18} />
              </div>
              <div>
                <div className="auth-highlight-title">Encrypted Storage Architecture</div>
                <div className="auth-highlight-sub">Private bucket objects accessible strictly via short-lived signed URLs.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        {/* Top Header Theme Toggle */}
        <div className="auth-top-actions">
          <ThemeSwitcher size="sm" />
        </div>

        <div className="auth-form-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
