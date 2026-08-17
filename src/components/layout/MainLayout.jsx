import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { FAB } from '../ui/FAB';
import { useAuth } from '../../contexts/AuthContext';
import './MainLayout.css';

export function MainLayout() {
  const { role, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="main-layout">
      <Sidebar
        role={role}
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-body">
        <Navbar
          role={role}
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="main-scroll">
          <div className="main-content">
            <Outlet />
          </div>
        </div>
      </div>
      <FAB role={role} />
    </div>
  );
}
