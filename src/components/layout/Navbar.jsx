import { Bell, Search, Menu, LogOut, User, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../lib/utils';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import './Navbar.css';

export function Navbar({ role, profile, onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isDark } = useTheme();

  const userName = profile?.full_name || 'User';
  const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <header className="navbar">
      {/* Mobile menu trigger */}
      <button type="button" className="navbar-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>

      {/* Global Quick Search */}
      <div className="navbar-search">
        <Search size={15} className="navbar-search-icon" />
        <input
          type="search"
          placeholder="Search diagnoses, medical records, doctors, or reports…"
          aria-label="Search records"
        />
      </div>

      {/* Right Action Bar */}
      <div className="navbar-actions">
        {/* Security badge pill */}
        <div className="navbar-security-pill hide-mobile">
          <ShieldCheck size={14} color="var(--accent)" />
          <span>RLS Protected</span>
        </div>

        {/* Theme Switcher in header */}
        <div className="hide-mobile">
          <ThemeSwitcher size="sm" />
        </div>

        {/* User Profile dropdown */}
        <div className="navbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="navbar-profile"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
          >
            <div className="avatar avatar-sm avatar-teal">
              {getInitials(userName)}
            </div>
            <div className="navbar-profile-info hide-mobile">
              <div className="navbar-profile-name">{userName}</div>
              <div className="navbar-profile-role">{roleName}</div>
            </div>
          </button>

          {profileOpen && (
            <div className="navbar-profile-dropdown" role="menu">
              <div className="navbar-dropdown-header">
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{userName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{profile?.email || 'Authenticated User'}</div>
              </div>
              <div className="navbar-dropdown-divider" />
              <button
                type="button"
                className="navbar-dropdown-item"
                onClick={() => { navigate(`/${role}/profile`); setProfileOpen(false); }}
              >
                <User size={15} /> Personal Profile
              </button>
              <div className="navbar-dropdown-divider" />
              <button
                type="button"
                className="navbar-dropdown-item danger"
                onClick={handleSignOut}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
