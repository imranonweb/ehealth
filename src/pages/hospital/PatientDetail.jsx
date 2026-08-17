import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BedDouble, Pill, Plus, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard, SkeletonTimeline } from '../../components/ui/Skeleton';
import { formatPatientId, getInitials, formatDate } from '../../lib/utils';

export function HospitalPatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <h3>Patient Record Not Found</h3>
          <Link to="/hospital/patients" className="btn btn-outline btn-md" style={{ marginTop: 12 }}>
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
      <Link to="/hospital/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 16 }}>
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
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 4 }}>
                Health ID: <strong style={{ color: 'var(--primary)' }}>{formatPatientId(patientId)}</strong> · Gender: {patient.gender || '—'} · DOB: {formatDate(patient.date_of_birth)}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', marginTop: 2 }}>{bloodGroup}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600 }}>Known Allergies</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--warning)', marginTop: 2 }}>{allergies}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Contact</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>
              {patient.patient_profiles?.[0]?.emergency_contact || 'None listed'}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Medical Timeline */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Complete Clinical Timeline
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 2 }}>
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
