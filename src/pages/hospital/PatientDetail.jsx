import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, BedDouble, ChevronLeft, ShieldAlert, ShieldCheck,
  Clock, ShieldX, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { searchService } from '../../services/searchService';
import { AccessRequestModal } from '../../components/access/AccessRequestModal';
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
  const [accessStatus, setAccessStatus] = useState(null); // null | 'active' | 'pending' | 'revoked'
  const [relationshipId, setRelationshipId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true);
        if (!id || !profile?.id) return;

        // 1. Resolve the hospital''s organization ID
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();
        const resolvedOrgId = orgRow?.id || null;
        setOrgId(resolvedOrgId);

        // 2. Check existing relationship status — NO automatic creation
        const { data: relRows } = await supabase
          .from('patient_provider_relationships')
          .select('id, status')
          .eq('patient_profile_id', id)
          .or(
            resolvedOrgId
              ? `provider_profile_id.eq.${profile.id},organization_id.eq.${resolvedOrgId}`
              : `provider_profile_id.eq.${profile.id}`
          )
          .order('created_at', { ascending: false })
          .limit(1);

        const rel = relRows?.[0] ?? null;
        setRelationshipId(rel?.id ?? null);
        setAccessStatus(rel?.status ?? null);

        // 3. Fetch patient identity (available via search RPC — identity only)
        const patientData = await searchService.getPatientById(id);
        setPatient(patientData || null);

        // 4. Fetch medical timeline ONLY if access is active
        if (rel?.status === 'active') {
          const { data: records } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', id)
            .order('record_date', { ascending: false });
          setTimeline(records || []);
        }
      } catch (err) {
        console.error('[HospitalPatientDetail] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id && profile?.id) loadPatientData();
  }, [id, profile?.id]);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const handleRequestSent = (status) => {
    // Optimistically update UI after consent request submitted
    if (status === 'pending' || status === 'already_pending') {
      setAccessStatus('pending');
    } else if (status === 'already_active') {
      setAccessStatus('active');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SkeletonCard />
        <div style={{ marginTop: 20 }}><SkeletonTimeline count={3} /></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-container">
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <ShieldAlert size={40} style={{ color: 'var(--color-danger)', marginBottom: 12 }} />
          <h3>Patient Record Not Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 8 }}>
            No matching patient record was found.
          </p>
          <Link to="/hospital/patients" className="btn btn-outline btn-md" style={{ marginTop: 16 }}>
            <ChevronLeft size={16} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const patProf = Array.isArray(patient.patient_profiles)
    ? patient.patient_profiles[0]
    : (patient.patient_profiles || patient);
  const patientId = patProf?.patient_identifier || patient.patient_identifier || patient.id;
  const allergies = patProf?.allergies || patient.allergies || 'None reported';
  const bloodGroup = patient.blood_group || patProf?.blood_group || 'Not set';

  // ── Render consent-gate panel ─────────────────────────────────────
  const renderAccessPanel = () => {
    if (accessStatus === 'active') return null; // No gate — show data below

    if (accessStatus === 'pending') {
      return (
        <div className="card" style={{
          padding: 'var(--sp-8)', textAlign: 'center',
          borderColor: 'var(--color-warning)', background: 'var(--color-warning-bg)',
        }}>
          <Clock size={36} style={{ color: 'var(--color-warning)', marginBottom: 12 }} />
          <h3 style={{ color: 'var(--color-warning)', marginBottom: 8 }}>Access Request Pending</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto' }}>
            Your request to view this patient''s medical history has been sent.
            Access will be granted once the patient approves.
          </p>
        </div>
      );
    }

    if (accessStatus === 'revoked') {
      return (
        <div className="card" style={{
          padding: 'var(--sp-8)', textAlign: 'center',
          borderColor: 'var(--color-danger)',
        }}>
          <ShieldX size={36} style={{ color: 'var(--color-danger)', marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>Access Revoked</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 16px' }}>
            This patient previously revoked access to their medical history.
            You may submit a new request — the patient will be notified.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setShowRequestModal(true)}
          >
            <ShieldCheck size={16} /> Request Access Again
          </button>
        </div>
      );
    }

    // null — no relationship yet
    return (
      <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
        <ShieldAlert size={36} style={{ color: 'var(--accent)', marginBottom: 12 }} />
        <h3 style={{ marginBottom: 8 }}>Patient Consent Required</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 20px' }}>
          To view this patient''s complete medical history, you must first submit an access request.
          The patient will receive a notification and must approve before records are visible.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setShowRequestModal(true)}
          >
            <ShieldCheck size={16} /> Request Medical History Access
          </button>
          <Link to={`/hospital/visits/new?patientId=${patient.id}`} className="btn btn-secondary btn-md">
            <BedDouble size={16} /> Record Admission (No History Required)
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Link
        to="/hospital/patients"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 }}
      >
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
                Health ID: <strong style={{ color: 'var(--accent)' }}>{formatPatientId(patientId)}</strong>
                {' '}&middot; Gender: {patient.gender || '—'}
                {' '}&middot; DOB: {formatDate(patient.date_of_birth)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {accessStatus === 'active' && (
              <Link to={`/hospital/visits/new?patientId=${patient.id}`} className="btn btn-primary btn-md">
                <BedDouble size={16} /> Record Admission
              </Link>
            )}
          </div>
        </div>

        {/* Clinical Flags — only shown when access is active */}
        {accessStatus === 'active' && (
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
        )}
      </div>

      {/* Consent Gate / Medical Timeline */}
      {accessStatus === 'active' ? (
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
      ) : (
        renderAccessPanel()
      )}

      {/* Record Detail Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />

      {/* Access Request Modal */}
      <AccessRequestModal
        patient={patient}
        orgId={orgId}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestSent={handleRequestSent}
      />
    </div>
  );
}
