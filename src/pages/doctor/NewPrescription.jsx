import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PrescriptionForm } from '../../components/forms/PrescriptionForm';
import { useAuth } from '../../contexts/AuthContext';

export function DoctorNewPrescription() {
  const { profile } = useAuth();

  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <Link
        to="/doctor/prescriptions"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeft size={16} /> Back to Prescriptions
      </Link>

      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Issue New Prescription</h1>
          <p className="page-sub">
            Create an official electronic prescription linked to the patient's centralized health record.
          </p>
        </div>
      </div>

      <PrescriptionForm
        defaultDoctorId={profile?.id}
        defaultHospitalId={null}
        redirectPath="/doctor/prescriptions"
      />
    </div>
  );
}
