import { Stethoscope, Building2, FlaskConical, MapPin, Mail, Phone } from 'lucide-react';
import { usePatientProviders } from '../../hooks/useMedicalRecords';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getInitials } from '../../lib/utils';

export function PatientProviders() {
  const { providers, loading, error } = usePatientProviders();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Hospitals & Care Providers</h1>
          <p className="page-sub">
            Healthcare practitioners, hospitals, and diagnostic labs connected to your medical profile.
          </p>
        </div>
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
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Connected Providers"
          description="Doctors and medical centers will appear here automatically when they issue a prescription, test report, or hospital admission for you."
        />
      ) : (
        <div className="grid-3" style={{ gap: 'var(--sp-5)' }}>
          {providers.map((rel) => {
            const isDoctor = rel.provider_type === 'doctor';
            const isDiag = rel.provider_type === 'diagnostics';
            const isHosp = rel.provider_type === 'hospital';

            const name = rel.provider?.full_name || rel.organization?.name || 'Healthcare Provider';
            const orgName = rel.organization?.name;
            const email = rel.provider?.email || rel.organization?.email;

            return (
              <div key={rel.id} className="card" style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div className={`avatar avatar-md ${isDoctor ? 'avatar-blue' : isDiag ? 'avatar-purple' : 'avatar-teal'}`}>
                    {getInitials(name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                      {name}
                    </h3>
                    <span className="badge" style={{
                      marginTop: 4,
                      background: isDoctor ? 'rgba(59,130,246,0.12)' : isDiag ? 'rgba(139,92,246,0.12)' : 'rgba(15,118,110,0.12)',
                      color: isDoctor ? '#3B82F6' : isDiag ? '#8B5CF6' : '#0F766E',
                    }}>
                      {isDoctor ? 'Doctor / Specialist' : isDiag ? 'Diagnostic Lab' : 'Hospital'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                  {orgName && isDoctor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={14} color="var(--text-3)" />
                      <span>{orgName}</span>
                    </div>
                  )}

                  {email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} color="var(--text-3)" />
                      <span>{email}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <span>Relationship Status: <strong style={{ color: 'var(--success)' }}>Active Access</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
