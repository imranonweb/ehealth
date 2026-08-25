import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, BedDouble, Pill, Plus, Users, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hospitalService } from '../../services/hospitalService';
import { formatDate, formatPatientId } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function HospitalDashboard() {
  const { profile } = useAuth();
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({ totalVisits: 0, totalPrescriptions: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [visitRes, statRes] = await Promise.all([
          hospitalService.getVisits({ perPage: 6 }),
          hospitalService.getDashboardStats(),
        ]);
        setVisits(visitRes.visits || []);
        setStats(statRes);
      } catch (err) {
        console.error('Hospital dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const hospitalName = profile?.full_name || 'Hospital Center';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">{hospitalName}</h1>
          <p className="page-sub">
            Hospital Operations & Clinical Encounters Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/hospital/visits/new" className="btn btn-primary btn-md">
            <Plus size={16} /> New Patient Visit
          </Link>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Recorded Admissions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {loading ? '…' : stats.totalVisits}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Hospital Prescriptions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {loading ? '…' : stats.totalPrescriptions}
              </div>
            </div>
          </div>
        </div>

        <Link to="/hospital/patients" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Patient Central Index</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981', marginTop: 4 }}>
                  Search Patient Records →
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Admissions & Encounters */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Patient Encounters & Admissions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Hospitalization records, emergency care, and outpatient consultations.
            </p>
          </div>
          <Link to="/hospital/visits" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No Patient Visits Recorded"
            description="Log inpatient admissions, emergency care, or discharge summaries for patients."
            actionLabel="Record Patient Visit"
            action={() => window.location.href = '/hospital/visits/new'}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Visit Type</th>
                  <th className="table-head">Department</th>
                  <th className="table-head">Primary Reason / Diagnosis</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {visits.map((v) => (
                  <tr key={v.id} className="table-row">
                    <td className="table-cell">{formatDate(v.admission_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {v.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {formatPatientId(v.patient_id)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{
                        background: v.visit_type === 'emergency' ? 'var(--color-danger-bg)' : 'var(--bg-surface-sunken)',
                        color: v.visit_type === 'emergency' ? 'var(--color-danger)' : 'var(--text-primary)',
                        textTransform: 'capitalize'
                      }}>
                        {v.visit_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">{v.department || 'General'}</td>
                    <td className="table-cell">
                      <div style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.diagnosis_summary || v.reason || '—'}
                      </div>
                    </td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <Link to="/hospital/visits" className="btn btn-ghost btn-sm">
                        Details <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
