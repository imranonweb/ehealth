import { useState } from 'react';
import {
  Stethoscope, Building2, FlaskConical, MapPin, Mail,
  ShieldCheck, RefreshCw, CheckCircle2, XCircle, ShieldOff,
  Bell, Clock, Loader2,
} from 'lucide-react';
import { usePatientProviders, usePatientAccessRequests } from '../../hooks/useMedicalRecords';
import { patientService } from '../../services/patientService';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getInitials, formatDate } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';

export function PatientProviders() {
  const { providers, loading: providersLoading, error: providersError, refresh: refreshProviders } = usePatientProviders();
  const { requests, loading: requestsLoading, refresh: refreshRequests } = usePatientAccessRequests();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [acting, setActing] = useState({}); // { [relationshipId]: true } while processing

  const refresh = () => { refreshProviders(); refreshRequests(); };

  const activeProviders = providers.filter((p) => p.status === 'active');
  const doctors = activeProviders.filter((p) => p.provider_type === 'doctor');
  const hospitals = activeProviders.filter((p) => p.provider_type === 'hospital');
  const diagnostics = activeProviders.filter((p) => p.provider_type === 'diagnostics');

  const displayedProviders = activeTab === 'doctors'
    ? doctors
    : activeTab === 'hospitals'
    ? hospitals
    : activeTab === 'diagnostics'
    ? diagnostics
    : activeProviders;

  const handleApprove = async (rel) => {
    setActing((prev) => ({ ...prev, [rel.id]: true }));
    try {
      await patientService.approveAccessRequest(rel.id);
      success(`Access approved for ${rel.organization?.name || rel.provider?.full_name || 'provider'}.`);
      refresh();
    } catch (err) {
      toastError(err.message || 'Failed to approve access.');
    } finally {
      setActing((prev) => ({ ...prev, [rel.id]: false }));
    }
  };

  const handleReject = async (rel, label = 'rejected') => {
    setActing((prev) => ({ ...prev, [rel.id]: true }));
    try {
      await patientService.revokeAccess(rel.id);
      success(`Access ${label} for ${rel.organization?.name || rel.provider?.full_name || 'provider'}.`);
      refresh();
    } catch (err) {
      toastError(err.message || 'Failed to update access.');
    } finally {
      setActing((prev) => ({ ...prev, [rel.id]: false }));
    }
  };

  const getProviderName = (rel) =>
    rel.organization?.name || rel.provider?.full_name || 'Healthcare Provider';

  const getProviderType = (rel) => {
    const t = rel.provider_type || rel.provider?.role;
    if (t === 'doctor') return 'Treating Doctor';
    if (t === 'diagnostics') return 'Diagnostic Lab';
    return 'Hospital Facility';
  };

  const avatarClass = (rel) => {
    const t = rel.provider_type || rel.provider?.role;
    if (t === 'doctor') return 'avatar-blue';
    if (t === 'diagnostics') return 'avatar-purple';
    return 'avatar-teal';
  };

  const badgeClass = (rel) => {
    const t = rel.provider_type || rel.provider?.role;
    if (t === 'doctor') return 'badge-blue';
    if (t === 'diagnostics') return 'badge-purple';
    return 'badge-primary';
  };

  const loading = providersLoading || requestsLoading;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Healthcare Providers &amp; Care Network</h1>
          <p className="page-sub">
            Manage who can view your medical records. Approve or reject access requests below.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Pending Access Requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell size={18} color="var(--color-warning)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Pending Access Requests ({requests.length})
            </h2>
          </div>

          <div className="grid-3" style={{ gap: 'var(--sp-4)' }}>
            {requests.map((rel) => {
              const name = getProviderName(rel);
              const isActing = acting[rel.id];

              return (
                <div key={rel.id} className="card" style={{
                  padding: 'var(--sp-5)',
                  border: '2px solid var(--color-warning)',
                  background: 'var(--color-warning-bg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Clock size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {getProviderType(rel)} &middot; Requested {formatDate(rel.created_at)}
                      </div>
                    </div>
                  </div>

                  {rel.request_note && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 12,
                      borderLeft: '3px solid var(--color-warning)',
                    }}>
                      <strong>Reason:</strong> {rel.request_note}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={isActing}
                      onClick={() => handleApprove(rel)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: 'var(--color-success)', color: '#fff', border: 'none', fontWeight: 700,
                        borderRadius: 'var(--radius-md)', padding: '8px 0', cursor: 'pointer',
                      }}
                    >
                      {isActing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={isActing}
                      onClick={() => handleReject(rel, 'rejected')}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    >
                      {isActing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Info Card */}
      <div className="card" style={{
        padding: '16px 20px', marginBottom: 'var(--sp-6)',
        backgroundColor: 'var(--accent-subtle)', borderColor: 'rgba(13,148,136,0.2)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <ShieldCheck size={26} color="var(--accent)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Access Governance:</strong> Only providers with <strong>ACTIVE ACCESS</strong> can inspect
          your past records or attach new prescriptions and lab results.
          You can revoke access at any time.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border-default)', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All Active (${activeProviders.length})` },
          { key: 'doctors', label: `Doctors (${doctors.length})`, icon: Stethoscope },
          { key: 'hospitals', label: `Hospitals (${hospitals.length})`, icon: Building2 },
          { key: 'diagnostics', label: `Diagnostic Labs (${diagnostics.length})`, icon: FlaskConical },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`btn btn-sm ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(key)}
          >
            {Icon && <Icon size={14} />} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-3" style={{ gap: 'var(--sp-5)' }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : providersError ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{providersError}</p>
        </div>
      ) : displayedProviders.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Active Healthcare Providers"
          description="Healthcare providers you approve will appear here with ACTIVE ACCESS status."
        />
      ) : (
        <div className="grid-3" style={{ gap: 'var(--sp-5)' }}>
          {displayedProviders.map((rel) => {
            const name = getProviderName(rel);
            const orgName = rel.organization?.name;
            const email = rel.provider?.email || rel.organization?.email;
            const address = rel.organization?.address;
            const isActing = acting[rel.id];

            return (
              <div key={rel.id} className="card" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className={`avatar avatar-md ${avatarClass(rel)}`}>{getInitials(name)}</div>
                      <div>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{name}</h3>
                        <span className={`badge ${badgeClass(rel)}`} style={{ marginTop: 4 }}>{getProviderType(rel)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 12 }}>
                    {orgName && rel.provider_type === 'doctor' && (
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

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
                    <span className="badge badge-success">ACTIVE ACCESS</span>
                  </div>
                  {/* Revoke button */}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm w-full"
                    disabled={isActing}
                    onClick={() => handleReject(rel, 'revoked')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--color-danger)', borderColor: 'var(--color-danger)', width: '100%' }}
                  >
                    {isActing
                      ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      : <ShieldOff size={13} />}
                    Revoke Access
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
