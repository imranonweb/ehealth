import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PrescriptionForm } from '../../components/forms/PrescriptionForm';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function HospitalNewPrescription() {
  const { profile } = useAuth();
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    async function loadOrg() {
      if (profile?.id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        if (org) setOrgId(org.id);
      }
    }
    loadOrg();
  }, [profile]);

  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <Link
        to="/hospital/prescriptions"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 16 }}
      >
        <ChevronLeft size={16} /> Back to Prescriptions
      </Link>

      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Issue Hospital Prescription</h1>
          <p className="page-sub">
            Create an official hospital medication and discharge prescription order.
          </p>
        </div>
      </div>

      <PrescriptionForm
        defaultDoctorId={null}
        defaultHospitalId={orgId}
        redirectPath="/hospital/prescriptions"
      />
    </div>
  );
}
