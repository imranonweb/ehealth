/**
 * AccessStatusBadge — shows the patient_provider_relationship status
 * as a coloured badge with contextual label.
 *
 * Props:
 *   status — 'active' | 'pending' | 'revoked' | 'none' | null | undefined
 */
export function AccessStatusBadge({ status }) {
  const config = {
    active: {
      label: '✓ ACCESS GRANTED',
      style: {
        background: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        border: '1px solid var(--color-success)',
      },
    },
    pending: {
      label: '⏳ AWAITING APPROVAL',
      style: {
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning)',
        border: '1px solid var(--color-warning)',
      },
    },
    revoked: {
      label: 'ACCESS REVOKED',
      style: {
        background: 'var(--color-danger-bg)',
        color: 'var(--color-danger)',
        border: '1px solid transparent',
      },
    },
  };

  const current = status && config[status] ? config[status] : {
    label: 'NO ACCESS',
    style: {
      background: 'var(--bg-surface-muted)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-default)',
    },
  };

  return (
    <span style={{
      ...current.style,
      display: 'inline-block',
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      padding: '2px 8px',
      borderRadius: 'var(--radius-xs)',
      whiteSpace: 'nowrap',
    }}>
      {current.label}
    </span>
  );
}
