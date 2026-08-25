import { Link } from 'react-router-dom';
import './QuickActionCard.css';

export function QuickActionCard({ to, icon: Icon, label, description, color = 'var(--accent)' }) {
  // Use a subtle background based on the provided color, or default to a generic one
  return (
    <Link to={to} className="quick-action-card">
      <div className="quick-action-icon-wrap" style={{ color: color, backgroundColor: `${color}1A` }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="quick-action-content">
        <h3 className="quick-action-label">{label}</h3>
        {description && <p className="quick-action-desc">{description}</p>}
      </div>
    </Link>
  );
}
