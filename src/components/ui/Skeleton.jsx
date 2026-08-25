export function Skeleton({ width, height = 16, radius = 'var(--radius-sm)', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 'var(--sp-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Skeleton width={44} height={44} radius="var(--radius-lg)" />
        <div style={{ flex: 1 }}>
          <Skeleton height={14} width="60%" style={{ marginBottom: 8 }} />
          <Skeleton height={24} width="40%" />
        </div>
      </div>
      <Skeleton height={12} style={{ marginBottom: 6 }} />
      <Skeleton height={12} width="80%" />
    </div>
  );
}

export function SkeletonTimeline({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Skeleton width={42} height={42} radius="var(--radius-md)" />
            <div style={{ flex: 1 }}>
              <Skeleton height={10} width="30%" style={{ marginBottom: 8 }} />
              <Skeleton height={16} width="70%" style={{ marginBottom: 8 }} />
              <Skeleton height={12} width="50%" style={{ marginBottom: 6 }} />
              <Skeleton height={12} width="90%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border-default)' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={14} width={c === 0 ? '30%' : '18%'} />
          ))}
        </div>
      ))}
    </div>
  );
}
