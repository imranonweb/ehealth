import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Pill, FlaskConical, Building2, Calendar, AlertCircle, ArrowRight, ShieldCheck, Heart, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMedicalRecords, usePatientDashboardStats } from '../../hooks/useMedicalRecords';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { getGreeting, formatPatientId } from '../../lib/utils';
import './Dashboard.css';

export function PatientDashboard() {
  const { profile } = useAuth();
  const { records, loading: recordsLoading, error: recordsError } = useMedicalRecords({ perPage: 5 });
  const { stats, loading: statsLoading } = usePatientDashboardStats();
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const patientName = profile?.full_name || 'Patient';
  const patientId = profile?.patient_profile?.patient_identifier || profile?.id;
  const bloodGroup = profile?.blood_group || profile?.patient_profile?.blood_group || 'Not set';
  const allergies = profile?.patient_profile?.allergies || 'No known allergies';

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">{getGreeting()}, {patientName}</h1>
          <p className="page-sub">
            Your centralized medical history and active clinical records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/patient/history" className="btn btn-outline btn-md">
            <Activity size={16} /> View Full Timeline
          </Link>
        </div>
      </div>

      {/* Patient Health Info Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-6)',
      }}>
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Patient ID
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
            {formatPatientId(patientId)}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Blood Group
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--danger)' }}>
            {bloodGroup}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Allergies
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: allergies.includes('known') ? 'var(--text-2)' : 'var(--warning)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {allergies}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Associated Providers
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-1)' }}>
            {statsLoading ? '…' : (stats?.providers || 0)} Providers
          </div>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
        <Link to="/patient/prescriptions" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pill size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Prescriptions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  {statsLoading ? '…' : (stats?.prescriptions || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/reports" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Diagnostic Reports</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  {statsLoading ? '…' : (stats?.reports || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/history" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Hospital Admissions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  {statsLoading ? '…' : (stats?.visits || 0)}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content: Recent Medical Timeline */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Medical Activity</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 2 }}>
              Unified chronological stream of diagnoses, prescriptions, and lab test results.
            </p>
          </div>
          <Link to="/patient/history" className="btn btn-ghost btn-sm">
            View All ({records?.length || 0}) <ArrowRight size={14} />
          </Link>
        </div>

        <MedicalTimeline
          records={records}
          loading={recordsLoading}
          error={recordsError}
          onViewDetail={handleViewDetail}
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
