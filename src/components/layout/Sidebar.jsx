import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Calendar, Settings,
  LogOut, Activity, Pill, ClipboardList, ChevronRight,
  Building2, BarChart3, Shield, Bell, Stethoscope
} from 'lucide-react';
import './Sidebar.css';

const getConfig = (role) => ({
  patient: {
    label: 'Patient Portal',
    color: 'teal',
    nav: [
      { label: 'Dashboard',       path: '/patient',              icon: LayoutDashboard },
      { label: 'Medical Records', path: '/patient/records',      icon: FileText },
      { label: 'Lab Reports',     path: '/patient/reports',      icon: Activity, badge: 2 },
      { label: 'Prescriptions',   path: '/patient/prescriptions',icon: Pill },
      { label: 'Appointments',    path: '/patient/appointments', icon: Calendar },
      { label: 'Profile',         path: '/patient/profile',      icon: Settings },
    ],
  },
  doctor: {
    label: 'Doctor Portal',
    color: 'blue',
    nav: [
      { label: 'Dashboard',    path: '/doctor',              icon: LayoutDashboard },
      { label: 'My Patients',  path: '/doctor/patients',     icon: Users },
      { label: 'Reports',      path: '/doctor/reports',      icon: ClipboardList, badge: 5 },
      { label: 'Prescriptions',path: '/doctor/prescriptions',icon: Pill },
      { label: 'Schedule',     path: '/doctor/schedule',     icon: Calendar },
    ],
  },
  hospital: {
    label: 'Hospital Portal',
    color: 'green',
    nav: [
      { label: 'Dashboard',   path: '/hospital',          icon: LayoutDashboard },
      { label: 'Patients',    path: '/hospital/patients', icon: Users },
      { label: 'Doctors',     path: '/hospital/doctors',  icon: Stethoscope },
      { label: 'Appointments',path: '/hospital/appointments', icon: Calendar },
      { label: 'Analytics',   path: '/hospital/analytics',icon: BarChart3 },
    ],
  },
  admin: {
    label: 'Admin Portal',
    color: 'purple',
    nav: [
      { label: 'Overview',     path: '/admin',        icon: LayoutDashboard },
      { label: 'Users',        path: '/admin/users',  icon: Users },
      { label: 'Hospitals',    path: '/admin/hospitals', icon: Building2 },
      { label: 'Analytics',    path: '/admin/analytics', icon: BarChart3 },
      { label: 'Security',     path: '/admin/security',  icon: Shield },
    ],
  },
}[role]);

const userNames = {
  patient: 'John Doe',
  doctor:  'Dr. Sarah Smith',
  hospital:'Metro Hospital',
  admin:   'System Admin',
};

export function Sidebar({ role }) {
  const config    = getConfig(role);
  const navigate  = useNavigate();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Activity size={18} color="#fff" />
        </div>
        <div>
          <div className="sidebar-brand-name">E-Health</div>
          <div className="sidebar-brand-sub">{config.label}</div>
        </div>
      </div>

      {/* Scroll area */}
      <div className="sidebar-scroll">
        <div>
          <div className="sidebar-section-label">Main Menu</div>
          <nav className="sidebar-nav">
            {config.nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/${role}`}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
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
            <div className="nav-item" onClick={() => navigate('/login')}>
              <span className="nav-item-icon"><LogOut size={17} /></span>
              <span>Sign Out</span>
            </div>
          </nav>
        </div>
      </div>

      {/* User card */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar-sm avatar-teal" style={{ flexShrink: 0 }}>
            {userNames[role].split(' ').map(w => w[0]).join('').slice(0,2)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name truncate">{userNames[role]}</div>
            <div className="sidebar-user-role">{role.charAt(0).toUpperCase()+role.slice(1)}</div>
          </div>
          <ChevronRight size={14} className="sidebar-user-action" />
        </div>
      </div>
    </aside>
  );
}
