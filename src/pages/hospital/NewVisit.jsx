import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { HospitalVisitForm } from '../../components/forms/HospitalVisitForm';

export function HospitalNewVisit() {
  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <Link
        to="/hospital/visits"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeft size={16} /> Back to Visits
      </Link>

      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Record Patient Hospitalization / Visit</h1>
          <p className="page-sub">
            Log inpatient admissions, outpatient consultations, and emergency room visits.
          </p>
        </div>
      </div>

      <HospitalVisitForm redirectPath="/hospital/visits" />
    </div>
  );
}
