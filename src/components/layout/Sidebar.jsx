import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Activity, X, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleConfig } from '../../lib/permissions';
import { getInitials } from '../../lib/utils';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import './Sidebar.css';

export function Sidebar({ role, profile, isOpen, onClose }) {
  const config = roleConfig[role];
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (!config) return null;

  const userName = profile?.full_name || 'User';

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Link to="/" aria-label="E-Health Home" style={{ display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none' }}>
            <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
            <div className="sidebar-brand-role">{config.label}</div>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-scroll">
          <div className="sidebar-group">
            <div className="sidebar-group-label">Navigation</div>
            <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
              {config.sidebar.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/${role}`}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="sidebar-link-icon"><Icon size={18} /></span>
                    <span className="sidebar-link-text">{item.label}</span>
                    {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Area: Theme Switcher + User Profile */}
        <div className="sidebar-footer">
          {/* Theme switcher bar */}
          <div className="sidebar-theme-bar">
            <span className="sidebar-theme-label">Theme</span>
            <ThemeSwitcher size="sm" />
          </div>

          {/* User profile card */}
          <div className="sidebar-user" onClick={() => { navigate(`/${role}/profile`); onClose?.(); }}>
            <div className="avatar avatar-sm avatar-teal" style={{ flexShrink: 0 }}>
              {getInitials(userName)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{userName}</div>
              <div className="sidebar-user-role">{role?.charAt(0).toUpperCase() + role?.slice(1)} Account</div>
            </div>
            <ChevronRight size={14} className="sidebar-user-arrow" />
          </div>

          {/* Sign out link */}
          <button type="button" className="sidebar-signout-btn" onClick={handleSignOut}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
