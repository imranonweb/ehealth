import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import './PublicLayout.css';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className="caption" style={{ marginTop: 12, lineHeight: 1.6 }}>
            Centralized digital healthcare platform connecting patients, doctors, diagnostic centers, and hospitals under strict privacy governance.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/">How It Works</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <a href="#security">Security</a>
          </div>

          <div className="footer-col">
            <h4>Portals</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/forgot-password">Reset Password</Link>
          </div>

          <div className="footer-col">
            <h4>Engineering</h4>
            <a href="https://github.com/imranonweb/ehealth" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="caption">© {new Date().getFullYear()} E-Health Platform. All rights reserved.</p>
        <p className="caption">Designed with privacy and controlled access in mind.</p>
      </div>
    </footer>
  );
}
