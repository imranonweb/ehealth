import { Link } from 'react-router-dom';

/**
 * A single dashboard metric. `tone` selects the icon well hue and must match
 * what the number means, not what looks good: teal for authorization and
 * activity, blue for prescriptions, purple for diagnostic reports.
 */
export function StatCard({ icon: Icon, label, value, hint, tone = 'teal', to, className = '' }) {
  const body = (
    <>
      {Icon && (
        <div className={`stat-icon-box ${tone}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`stat-card ${className}`}>
        {body}
      </Link>
    );
  }

  return <div className={`stat-card ${className}`}>{body}</div>;
}
