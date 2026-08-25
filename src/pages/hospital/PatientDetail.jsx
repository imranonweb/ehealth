import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BedDouble, Pill, Plus, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard, SkeletonTimeline } from '../../components/ui/Skeleton';
import { formatPatientId, getInitials, formatDate } from '../../lib/utils';

export function HospitalPatientDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadPatientData() {
      try {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*, patient_profiles(*)')
          .eq('id', id)
          .single();

        if (profErr) throw profErr;

        // ── Application-level authorization check ─────────────────────────
        // The Doctor portal does this via doctorService.getPatientDetail which
        // relies on RLS-filtered patient_provider_relationships queries.
        // We mirror that pattern here: confirm an active relationship exists
        // between this hospital's profile and the patient before granting
        // access to the full record. RLS still applies on top of this check.
        if (profile?.id) {
          const { data: rel } = await supabase
            .from('patient_provider_relationships')
            .select('id')
            .eq('patient_profile_id', id)
            .eq('provider_profile_id', profile.id)
            .eq('status', 'active')
            .maybeSingle();

          if (!rel) {
            // No confirmed relationship — deny at the application layer
            setLoading(false);
            return;
          }
          setAuthorized(true);
        }

        setPatient(prof);

        const { data: records, error: recErr } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', id)
          .order('record_date', { ascending: false });

        if (recErr) throw recErr;
        setTimeline(records || []);
      } catch (err) {
        console.error('Error fetching hospital patient record:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadPatientData();
  }, [id]);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SkeletonCard />
        <div style={{ marginTop: 20 }}>
          <SkeletonTimeline count={3} />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-container">
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <ShieldAlert size={40} style={{ color: 'var(--color-danger)', marginBottom: 12 }} />
          <h3>Patient Record Not Accessible</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8, maxWidth: 400, margin: '8px auto' }}>
            {authorized === false
              ? 'This patient has not been seen at your facility or the authorization is no longer active.'
              : 'No matching patient record was found.'}
          </p>
          <Link to="/hospital/patients" className="btn btn-outline btn-md" style={{ marginTop: 16 }}>
            <ChevronLeft size={16} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const patientId = patient.patient_profiles?.[0]?.patient_identifier || patient.id;
  const allergies = patient.patient_profiles?.[0]?.allergies || 'None reported';
  const bloodGroup = patient.blood_group || patient.patient_profiles?.[0]?.blood_group || 'Not set';

  return (
    <div className="dashboard-container">
      <Link to="/hospital/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 }}>
        <ChevronLeft size={16} /> Back to Patients
      </Link>

      {/* Patient Header Card */}
      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar avatar-lg avatar-green">
              {getInitials(patient.full_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {patient.full_name}
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Health ID: <strong style={{ color: 'var(--accent)' }}>{formatPatientId(patientId)}</strong> · Gender: {patient.gender || '—'} · DOB: {formatDate(patient.date_of_birth)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/hospital/visits/new" className="btn btn-primary btn-md">
              <BedDouble size={16} /> Record Admission
            </Link>
          </div>
        </div>

        {/* Clinical Flags */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-danger)', marginTop: 2 }}>{bloodGroup}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Known Allergies</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-warning)', marginTop: 2 }}>{allergies}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Contact</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
              {patient.patient_profiles?.[0]?.emergency_contact || 'None listed'}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Medical Timeline */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Complete Clinical Timeline
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Historical diagnoses, prescriptions, lab results, and hospital visits.
            </p>
          </div>
        </div>

        <MedicalTimeline
          records={timeline}
          loading={false}
          onViewDetail={handleViewDetail}
          emptyMessage="No medical records currently on file for this patient."
        />
      </div>

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
