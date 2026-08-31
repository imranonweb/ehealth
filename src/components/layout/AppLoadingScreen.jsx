import { Activity } from 'lucide-react';
import './AppLoadingScreen.css';

export function AppLoadingScreen({ message = 'Loading your secure workspace…' }) {
  return (
    <div className="app-loading-screen" role="status" aria-live="polite">
      <div className="app-loading-card">
        <div className="app-loading-logo-wrap">
          <div className="app-loading-logo-pulse" />
          <img
            src="/Ehealthlogo.png"
            alt="eHealthBD"
            style={{ width: 44, height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="app-loading-spinner-ring" />
          <div>
            <h2 className="app-loading-title">eHealthBD</h2>
            <p className="app-loading-sub">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
