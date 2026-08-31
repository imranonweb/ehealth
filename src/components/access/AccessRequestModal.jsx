import { useState } from 'react';
import { ShieldCheck, FileText, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * AccessRequestModal — used by hospital and diagnostics providers to submit
 * a consent-based access request for a patient''s medical history.
 *
 * Props:
 *   patient         — { id, full_name, patient_identifier }
 *   orgId           — UUID of the provider''s organization (null for doctors)
 *   isOpen          — boolean
 *   onClose         — () => void
 *   onRequestSent   — (status: string) => void  — called after successful submit
 */
export function AccessRequestModal({ patient, orgId, isOpen, onClose, onRequestSent }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc('request_provider_access', {
        p_patient_id: patient.id,
        p_org_id: orgId || null,
        p_note: note.trim() || null,
      });

      if (rpcErr) throw rpcErr;

      setNote('');
      onRequestSent?.(data);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Failed to send access request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: '100%', maxWidth: 480,
        padding: '0 16px',
      }}>
        <div className="card" style={{
          padding: '32px 28px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-default)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--accent-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShieldCheck size={22} color="var(--accent)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Request Medical History Access
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  For: <strong style={{ color: 'var(--text-secondary)' }}>{patient.full_name}</strong>
                  {patient.patient_identifier && (
                    <span style={{ fontFamily: 'monospace', marginLeft: 6, color: 'var(--accent)' }}>
                      ({patient.patient_identifier})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Info */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-surface-sunken)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: 20,
          }}>
            A consent request will be sent to the patient. They must <strong>approve</strong> before
            you can view their complete medical history. You can still create new clinical records
            once approved.
          </div>

          <form onSubmit={handleSubmit}>
            {/* Optional note */}
            <div className="field" style={{ marginBottom: 20 }}>
              <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> Reason for access request
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8em' }}>(optional)</span>
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Patient referred for cardiac assessment. Requires prior lab history."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                maxLength={500}
                style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={onClose}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={loading}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending Request…</>
                ) : (
                  <><ShieldCheck size={16} /> Send Consent Request</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
