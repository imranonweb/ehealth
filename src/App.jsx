import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Pages - Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Pages - Public
import { Landing } from './pages/public/Landing';

// Pages - Patient
import { PatientDashboard } from './pages/patient/Dashboard';

// Pages - Doctor
import { DoctorDashboard } from './pages/doctor/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Patient Portal */}
        <Route path="/patient" element={<MainLayout role="patient" />}>
          <Route index element={<PatientDashboard />} />
          <Route path="records" element={<div>Medical Records (Coming Soon)</div>} />
          <Route path="reports" element={<div>Lab Reports (Coming Soon)</div>} />
          <Route path="prescriptions" element={<div>Prescriptions (Coming Soon)</div>} />
          <Route path="appointments" element={<div>Appointments (Coming Soon)</div>} />
          <Route path="profile" element={<div>Profile Settings (Coming Soon)</div>} />
        </Route>

        {/* Doctor Portal */}
        <Route path="/doctor" element={<MainLayout role="doctor" />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<div>Patients List (Coming Soon)</div>} />
          <Route path="reports" element={<div>Reports Review (Coming Soon)</div>} />
          <Route path="prescriptions" element={<div>Prescriptions (Coming Soon)</div>} />
          <Route path="schedule" element={<div>Schedule (Coming Soon)</div>} />
        </Route>

        {/* Hospital Portal */}
        <Route path="/hospital" element={<MainLayout role="hospital" />}>
          <Route index element={<div>Hospital Dashboard</div>} />
        </Route>

        {/* Admin Portal */}
        <Route path="/admin" element={<MainLayout role="admin" />}>
          <Route index element={<div>Admin Dashboard</div>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
