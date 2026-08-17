import { useState } from 'react';
import {
  Stethoscope, Building2, FlaskConical, MapPin, Mail, Phone,
  ShieldCheck, RefreshCw
} from 'lucide-react';
import { usePatientProviders } from '../../hooks/useMedicalRecords';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getInitials } from '../../lib/utils';

export function PatientProviders() {
  const { providers, loading, error, refresh } = usePatientProviders();
  const [activeTab, setActiveTab] = useState('all');

  const doctors = providers.filter((p) => p.provider_type === 'doctor');
  const hospitals = providers.filter((p) => p.provider_type === 'hospital');
  const diagnostics = providers.filter((p) => p.provider_type === 'diagnostics');

  const displayedProviders = activeTab === 'doctors'
    ? doctors
    : activeTab === 'hospitals'
    ? hospitals
    : activeTab === 'diagnostics'
    ? diagnostics
    : providers;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">ACTIVE ACCESS</span>;
      case 'pending':
        return <span className="badge badge-warning">PENDING APPROVAL</span>;
      case 'revoked':
        return <span className="badge badge-danger">REVOKED</span>;
      default:
        return <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-muted)' }}>{status?.toUpperCase()}</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Healthcare Providers & Care Network</h1>
          <p className="page-sub">
            Practitioners, hospitals, and diagnostic facilities authorized to view and add clinical records to your profile.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Network
        </button>
      </div>

      {/* Security Info Card */}
      <div className="card" style={{
        padding: '16px 20px',
        marginBottom: 'var(--sp-6)',
        backgroundColor: 'var(--accent-subtle)',
        borderColor: 'rgba(13,148,136,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <ShieldCheck size={26} color="var(--accent)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Access Governance:</strong> Under the E-Health Row Level Security framework, only providers listed with <strong>ACTIVE ACCESS</strong> can inspect your past records or attach new prescriptions/lab results.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border-default)', paddingBottom: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('all')}
        >
          All Providers ({providers.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={14} /> Doctors ({doctors.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'hospitals' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('hospitals')}
        >
          <Building2 size={14} /> Hospitals ({hospitals.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'diagnostics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('diagnostics')}
        >
          <FlaskConical size={14} /> Diagnostic Labs ({diagnostics.length})
        </button>
      </div>

      {loading ? (
        <div className="grid-3" style={{ gap: 'var(--sp-5)' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : displayedProviders.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Connected Healthcare Providers"
          description="Healthcare practitioners and clinical centers will appear here when relationships are established."
        />
      ) : (
        <div className="grid-3" style={{ gap: 'var(--sp-5)' }}>
          {displayedProviders.map((rel) => {
            const isDoctor = rel.provider_type === 'doctor';
            const isDiag = rel.provider_type === 'diagnostics';

            const name = rel.provider?.full_name || rel.organization?.name || 'Healthcare Provider';
            const orgName = rel.organization?.name;
            const email = rel.provider?.email || rel.organization?.email;
            const address = rel.organization?.address;

            return (
              <div key={rel.id} className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className={`avatar avatar-md ${isDoctor ? 'avatar-blue' : isDiag ? 'avatar-purple' : 'avatar-teal'}`}>
                        {getInitials(name)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {name}
                        </h3>
                        <span className={`badge ${isDoctor ? 'badge-blue' : isDiag ? 'badge-purple' : 'badge-primary'}`} style={{ marginTop: 4 }}>
                          {isDoctor ? 'Treating Doctor' : isDiag ? 'Diagnostic Lab' : 'Hospital Facility'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 12 }}>
                    {orgName && isDoctor && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building2 size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span>Chamber / Hospital: <strong>{orgName}</strong></span>
                      </div>
                    )}

                    {address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem' }}>{address}</span>
                      </div>
                    )}

                    {email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem' }}>{email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Access Status:</span>
                  {getStatusBadge(rel.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
