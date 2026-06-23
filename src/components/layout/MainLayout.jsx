import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import './MainLayout.css';

export function MainLayout({ role }) {
  return (
    <div className="main-layout">
      <Sidebar role={role} />
      <div className="main-body">
        <Navbar role={role} />
        <div className="main-scroll">
          <div className="main-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
