import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Pill, Plus, Search, FileText, ArrowRight, Stethoscope, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionService } from '../../services/prescriptionService';
import { formatDate, getInitials, formatPatientId } from '../../lib/utils';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import './DoctorDashboard.css';

export function DoctorDashboard() {
  const { profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await prescriptionService.getMyPrescriptions({ perPage: 6 });
        setPrescriptions(res.prescriptions || []);
      } catch (err) {
        console.error('Doctor dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const doctorName = profile?.full_name || 'Doctor';
  const specialization = profile?.doctor_profile?.specialization || 'Clinical Specialist';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Welcome, {doctorName}</h1>
          <p className="page-sub">
            {specialization} · Clinical Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/doctor/prescriptions/new" className="btn btn-primary btn-md">
            <Plus size={16} /> New Prescription
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-3" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Prescriptions Issued</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)' }}>
                {loading ? '…' : prescriptions.length}
              </div>
            </div>
          </div>
        </div>

        <Link to="/doctor/patients" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Patient Directory</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                  Search & Review Records →
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/reports" style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', fontWeight: 500 }}>Diagnostic Lab Results</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8B5CF6', marginTop: 4 }}>
                  View Reports →
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Prescriptions Table */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Prescriptions
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: 2 }}>
              Prescriptions you recently issued to patients.
            </p>
          </div>
          <Link to="/doctor/prescriptions" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={4} />
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No Prescriptions Issued Yet"
            description="Start by creating your first e-prescription for a patient."
            actionLabel="Create Prescription"
            action={() => window.location.href = '/doctor/prescriptions/new'}
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Date</th>
                  <th className="table-head">Patient Name</th>
                  <th className="table-head">Diagnosis</th>
                  <th className="table-head">Hospital / Center</th>
                  <th className="table-head" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {prescriptions.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell">{formatDate(p.prescription_date)}</td>
                    <td className="table-cell">
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        {p.patient?.full_name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {p.patient?.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}>
                        {p.diagnosis || 'General'}
                      </span>
                    </td>
                    <td className="table-cell">{p.hospital?.name || 'Private Chamber'}</td>
                    <td className="table-cell" style={{ textAlign: 'right' }}>
                      <Link to="/doctor/prescriptions" className="btn btn-ghost btn-sm">
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
