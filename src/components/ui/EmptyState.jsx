export function EmptyState({ icon: Icon, title, description, action, actionLabel, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={40} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && actionLabel && (
        <button className="btn btn-primary btn-md" onClick={action} style={{ marginTop: 16 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
