import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Activity, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleConfig } from '../../lib/permissions';
import { getInitials } from '../../lib/utils';
import './Sidebar.css';

export function Sidebar({ role, profile, isOpen, onClose }) {
  const config  = roleConfig[role];
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
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="sidebar-brand-name">E-Health</div>
            <div className="sidebar-brand-sub">{config.label}</div>
          </div>
          {/* Mobile close */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scroll area */}
        <div className="sidebar-scroll">
          <div>
            <div className="sidebar-section-label">Main Menu</div>
            <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
              {config.sidebar.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/${role}`}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="nav-item-icon"><Icon size={17} /></span>
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="sidebar-section-label">Account</div>
            <nav className="sidebar-nav">
              <div className="nav-item" onClick={handleSignOut} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSignOut()}>
                <span className="nav-item-icon"><LogOut size={17} /></span>
                <span>Sign Out</span>
              </div>
            </nav>
          </div>
        </div>

        {/* User card */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => { navigate(`/${role}/profile`); onClose?.(); }}>
            <div className="avatar avatar-sm avatar-teal" style={{ flexShrink: 0 }}>
              {getInitials(userName)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name truncate">{userName}</div>
              <div className="sidebar-user-role">{role?.charAt(0).toUpperCase() + role?.slice(1)}</div>
            </div>
            <ChevronRight size={14} className="sidebar-user-action" />
          </div>
        </div>
      </aside>
    </>
  );
}
