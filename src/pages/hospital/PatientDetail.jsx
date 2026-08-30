import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BedDouble, Pill, Plus, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { searchService } from '../../services/searchService';
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
        setLoading(true);
        if (!id) return;

        // 1. Fetch the hospital's organization ID if logged in
        let orgId = null;
        if (profile?.id) {
          const { data: orgRow } = await supabase
            .from('organizations')
            .select('id')
            .eq('profile_id', profile.id)
            .maybeSingle();
          orgId = orgRow?.id || null;

          // 2. Ensure the provider-patient relationship exists (best-effort RPC)
          try {
            await supabase.rpc('create_provider_relationship', {
              p_patient_id: id,
              p_org_id: orgId,
            });
            setAuthorized(true);
          } catch (relErr) {
            console.warn('[HospitalPatientDetail] create_provider_relationship warning:', relErr);
          }
        }

        // 3. Fetch patient profile
        let patientData = null;
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*, patient_profiles(*)')
          .eq('id', id)
          .maybeSingle();

        if (prof) {
          patientData = prof;
        } else {
          // Fallback via searchService or patientIdentityService
          const fallback = await searchService.getPatientById(id);
          if (fallback) {
            patientData = fallback;
          }
        }

        if (!patientData) {
          setAuthorized(false);
          return;
        }

        setPatient(patientData);
        setAuthorized(true);

        // 4. Fetch accessible medical records
        const { data: records, error: recErr } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', id)
          .order('record_date', { ascending: false });

        if (recErr) console.warn('[HospitalPatientDetail] medical_records error:', recErr);
        setTimeline(records || []);
      } catch (err) {
        console.error('[HospitalPatientDetail] Error fetching patient record:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadPatientData();
  }, [id, profile?.id]);

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

  const patProf = Array.isArray(patient.patient_profiles) ? patient.patient_profiles[0] : (patient.patient_profiles || patient);
  const patientId = patProf?.patient_identifier || patient.patient_identifier || patient.id;
  const allergies = patProf?.allergies || patient.allergies || 'None reported';
  const bloodGroup = patient.blood_group || patProf?.blood_group || 'Not set';

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
            <Link to={`/hospital/visits/new?patientId=${patient.id}`} className="btn btn-primary btn-md">
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
