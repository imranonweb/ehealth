import { useNavigate } from 'react-router-dom';
import { roleConfig } from '../../lib/permissions';

export function FAB({ role }) {
  const navigate = useNavigate();
  const config = roleConfig[role];
  const fab = config?.fab;

  if (!fab) return null;

  const Icon = fab.icon;

  return (
    <button
      className="fab"
      onClick={() => navigate(fab.path)}
      title={fab.label}
      aria-label={fab.label}
    >
      <Icon size={22} />
      <span className="fab-label">{fab.label}</span>
    </button>
  );
}
