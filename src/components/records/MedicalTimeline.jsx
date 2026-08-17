import { Pill, FlaskConical, Building2, ChevronRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonTimeline } from '../ui/Skeleton';

const typeConfig = {
  prescription: {
    icon: Pill,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
    label: 'Prescription',
  },
  diagnostic_report: {
    icon: FlaskConical,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
    label: 'Diagnostic Report',
  },
  hospital_visit: {
    icon: Building2,
    color: '#0F766E',
    bg: 'rgba(15,118,110,0.1)',
    label: 'Hospital Visit',
  },
};

export function MedicalTimeline({ records, loading, error, onViewDetail, emptyMessage }) {
  if (loading) return <SkeletonTimeline count={4} />;

  if (error) return (
    <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
      <p className="text-danger">{error}</p>
    </div>
  );

  if (!records || records.length === 0) {
    return (
      <EmptyState
        icon={Pill}
        title="No medical records yet"
        description={emptyMessage || 'Your medical history will appear here as healthcare providers add records.'}
      />
    );
  }

  return (
    <div className="medical-timeline">
      {records.map((record, index) => {
        const config = typeConfig[record.record_type] || typeConfig.prescription;
        const Icon = config.icon;

        return (
          <div key={record.id || index} className="timeline-item" onClick={() => onViewDetail?.(record)}>
            {/* Timeline connector */}
            <div className="timeline-connector">
              <div className="timeline-dot" style={{ background: config.bg, color: config.color }}>
                <Icon size={16} />
              </div>
              {index < records.length - 1 && <div className="timeline-line" />}
            </div>

            {/* Content */}
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-date">{formatDate(record.record_date)}</span>
                <span className="timeline-type-badge" style={{ background: config.bg, color: config.color }}>
                  {config.label}
                </span>
              </div>
              <h4 className="timeline-title">{record.title}</h4>
              {(record.provider_name || record.organization_name) && (
                <p className="timeline-provider">
                  {record.provider_name}
                  {record.provider_name && record.organization_name && ' · '}
                  {record.organization_name}
                </p>
              )}
              {record.summary && (
                <p className="timeline-summary">{record.summary}</p>
              )}
              <button className="timeline-action" aria-label={`View ${config.label} details`}>
                View details <ChevronRight size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
