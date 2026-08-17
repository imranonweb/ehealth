import { Bell, Search, Sun, Moon, Menu, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';
import './Navbar.css';

export function Navbar({ role, profile, onMenuClick }) {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const userName = profile?.full_name || 'User';
  const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  };

  // Close profile dropdown on outside click
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
    try { await signOut(); navigate('/login'); } catch (e) { console.error(e); }
  };

  return (
    <header className="navbar">
      {/* Mobile menu button */}
      <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="navbar-search">
        <Search size={15} className="navbar-search-icon" />
        <input type="search" placeholder="Search patients, records, reports…" aria-label="Search" />
      </div>

      <div className="navbar-actions">
        {/* Theme toggle */}
        <button className="navbar-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="navbar-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-badge" />
        </button>

        {/* Profile chip with dropdown */}
        <div className="navbar-profile-wrap" ref={profileRef}>
          <div className="navbar-profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="avatar avatar-sm avatar-teal">
              {getInitials(userName)}
            </div>
            <div className="navbar-profile-info">
              <div className="navbar-profile-name">{userName}</div>
              <div className="navbar-profile-role">{roleName}</div>
            </div>
          </div>

          {profileOpen && (
            <div className="navbar-profile-dropdown">
              <button className="navbar-dropdown-item" onClick={() => { navigate(`/${role}/profile`); setProfileOpen(false); }}>
                <User size={15} /> Profile
              </button>
              <div className="navbar-dropdown-divider" />
              <button className="navbar-dropdown-item danger" onClick={handleSignOut}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
