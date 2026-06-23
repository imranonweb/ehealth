import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const userNames = {
  patient: { name: 'John Doe',       role: 'Patient' },
  doctor:  { name: 'Dr. Sarah Smith',role: 'Physician' },
  hospital:{ name: 'Metro Hospital', role: 'Hospital Admin' },
  admin:   { name: 'System Admin',   role: 'Administrator' },
};

export function Navbar({ role }) {
  const [dark, setDark] = useState(false);
  const user = userNames[role] || { name: 'User', role };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  };

  return (
    <header className="navbar">
      {/* Search */}
      <div className="navbar-search">
        <Search size={15} className="navbar-search-icon" />
        <input type="search" placeholder="Search patients, records, reports…" />
      </div>

      <div className="navbar-actions">
        {/* Theme toggle */}
        <button className="navbar-btn" onClick={toggleTheme} title="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="navbar-btn" title="Notifications">
          <Bell size={18} />
          <span className="notif-badge" />
        </button>

        {/* Profile chip */}
        <div className="navbar-profile">
          <div className="avatar avatar-sm avatar-teal">
            {user.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="navbar-profile-info">
            <div className="navbar-profile-name">{user.name}</div>
            <div className="navbar-profile-role">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
