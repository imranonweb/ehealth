import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';
import { ROLES } from './lib/permissions';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Public Pages
import { Landing } from './pages/public/Landing';
import { Contact } from './pages/public/Contact';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Patient Pages
import { PatientDashboard } from './pages/patient/Dashboard';
import { MedicalHistory } from './pages/patient/MedicalHistory';
import { PatientPrescriptions } from './pages/patient/Prescriptions';
import { PatientDiagnosticReports } from './pages/patient/DiagnosticReports';
import { PatientHospitalRecords } from './pages/patient/HospitalRecords';
import { PatientProviders } from './pages/patient/Providers';
import { PatientAiAssistant } from './pages/patient/AiAssistant';
import { PatientProfile } from './pages/patient/Profile';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorPatients } from './pages/doctor/Patients';
import { DoctorPatientDetail } from './pages/doctor/PatientDetail';
import { DoctorPrescriptions } from './pages/doctor/Prescriptions';
import { DoctorNewPrescription } from './pages/doctor/NewPrescription';
import { DoctorReports } from './pages/doctor/Reports';
import { DoctorProfile } from './pages/doctor/Profile';

// Diagnostics Pages
import { DiagnosticsDashboard } from './pages/diagnostics/Dashboard';
import { DiagnosticsPatients } from './pages/diagnostics/Patients';
import { DiagnosticsReports } from './pages/diagnostics/Reports';
import { DiagnosticsNewReport } from './pages/diagnostics/NewReport';
import { DiagnosticsProfile } from './pages/diagnostics/Profile';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/Dashboard';
import { HospitalPatients } from './pages/hospital/Patients';
import { HospitalPatientDetail } from './pages/hospital/PatientDetail';
import { HospitalVisits } from './pages/hospital/Visits';
import { HospitalNewVisit } from './pages/hospital/NewVisit';
import { HospitalPrescriptions } from './pages/hospital/Prescriptions';
import { HospitalNewPrescription } from './pages/hospital/NewPrescription';
import { HospitalProfile } from './pages/hospital/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Patient Portal */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="history" element={<MedicalHistory />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
              <Route path="reports" element={<PatientDiagnosticReports />} />
              <Route path="hospital-records" element={<PatientHospitalRecords />} />
              <Route path="providers" element={<PatientProviders />} />
              <Route path="ai-assistant" element={<PatientAiAssistant />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor Portal */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDashboard />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="patients/:id" element={<DoctorPatientDetail />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="prescriptions/new" element={<DoctorNewPrescription />} />
              <Route path="reports" element={<DoctorReports />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>

            {/* Diagnostics Portal */}
            <Route
              path="/diagnostics"
              element={
                <ProtectedRoute allowedRoles={[ROLES.DIAGNOSTICS]}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DiagnosticsDashboard />} />
              <Route path="patients" element={<DiagnosticsPatients />} />
              <Route path="reports" element={<DiagnosticsReports />} />
              <Route path="reports/new" element={<DiagnosticsNewReport />} />
              <Route path="profile" element={<DiagnosticsProfile />} />
            </Route>

            {/* Hospital Portal */}
            <Route
              path="/hospital"
              element={
                <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HospitalDashboard />} />
              <Route path="patients" element={<HospitalPatients />} />
              <Route path="patients/:id" element={<HospitalPatientDetail />} />
              <Route path="visits" element={<HospitalVisits />} />
              <Route path="visits/new" element={<HospitalNewVisit />} />
              <Route path="prescriptions" element={<HospitalPrescriptions />} />
              <Route path="prescriptions/new" element={<HospitalNewPrescription />} />
              <Route path="profile" element={<HospitalProfile />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
