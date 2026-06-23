import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  Users, Activity, Clock, FileText, ChevronRight, TrendingUp,
  Star, ArrowRight, CheckCircle2, AlertCircle, Circle
} from 'lucide-react';

const weeklyPatients = [
  { day: 'Mon', seen: 12, scheduled: 14 },
  { day: 'Tue', seen: 19, scheduled: 20 },
  { day: 'Wed', seen: 15, scheduled: 16 },
  { day: 'Thu', seen: 22, scheduled: 22 },
  { day: 'Fri', seen: 18, scheduled: 19 },
  { day: 'Sat', seen: 8,  scheduled: 10 },
];

const chartTooltipStyle = {
  background: '#1E293B',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.8125rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
};

const statusConfig = {
  'In Progress': { cls: 'badge-info',    dot: 'blue',  icon: Activity },
  'Waiting':     { cls: 'badge-warning', dot: 'amber', icon: Clock },
  'Upcoming':    { cls: 'badge-neutral', dot: null,    icon: Circle },
  'Done':        { cls: 'badge-success', dot: null,    icon: CheckCircle2 },
};

export function DoctorDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page header */}
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="overline text-primary" style={{ marginBottom: '6px' }}>Doctor Dashboard</p>
            <h1 className="h1">Good Morning, Dr. Smith 👋</h1>
            <p className="body text-muted" style={{ marginTop: '6px' }}>You have <strong style={{ color: 'var(--text-1)' }}>8 appointments</strong> today · <strong style={{ color: 'var(--primary)' }}>3 pending reports</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-md"><FileText size={16} />Write Prescription</button>
            <button className="btn btn-primary btn-md"><Users size={16} />Start Round</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 animate-up stagger-1" style={{ gap: '16px' }}>
        {[
          { label: 'Total Patients',    value: '1,248', delta: '+12', up: true,  icon: Users,    color: '#0F766E', bg: 'rgba(15,118,110,0.1)' },
          { label: "Today's Appts",     value: '8',     delta: '5 done', up: null,icon: Clock,   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Pending Reports',   value: '3',     delta: 'Review needed', up: null, icon: AlertCircle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Prescriptions',     value: '47',    delta: '+8 this week', up: true, icon: FileText, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`card animate-up stagger-${i + 1}`}>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-icon-wrap" style={{ background: s.bg }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                  {s.up !== null && (
                    <span className={`stat-delta ${s.up ? 'up' : 'down'}`}>
                      <TrendingUp size={12} />{s.delta}
                    </span>
                  )}
                </div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                </div>
                {s.up === null && (
                  <span className="caption text-muted">{s.delta}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mid grid: Chart + Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }} className="animate-up stagger-2">

        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly Patient Activity</div>
              <div className="card-subtitle">Seen vs Scheduled — this week</div>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              {[{ c: '#0F766E', l: 'Seen' }, { c: '#CBD5E1', l: 'Scheduled' }].map(x => (
                <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: x.c }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyPatients} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="scheduled" fill="#E2E8F0" radius={[5, 5, 0, 0]} barSize={18} name="Scheduled" />
                <Bar dataKey="seen"      fill="#0F766E" radius={[5, 5, 0, 0]} barSize={18} name="Seen" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Schedule</div>
              <div className="card-subtitle">Mon, Jun 23 · 8 appointments</div>
            </div>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { time: '09:00', period: 'AM', name: 'Sarah Johnson',  type: 'Checkup',      status: 'In Progress', avatar: 'SJ', color: '#0F766E' },
                { time: '10:30', period: 'AM', name: 'Michael Chen',   type: 'Follow-up',    status: 'Waiting',     avatar: 'MC', color: '#3B82F6' },
                { time: '11:15', period: 'AM', name: 'Emily Davis',    type: 'Consultation', status: 'Upcoming',    avatar: 'ED', color: '#8B5CF6' },
                { time: '01:00', period: 'PM', name: 'Robert Wilson',  type: 'Lab Review',   status: 'Upcoming',    avatar: 'RW', color: '#F59E0B' },
                { time: '02:30', period: 'PM', name: 'Lisa Martinez',  type: 'New Patient',  status: 'Upcoming',    avatar: 'LM', color: '#EC4899' },
              ].map((apt, i) => {
                const sc = statusConfig[apt.status] || statusConfig['Upcoming'];
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--r-lg)',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: apt.status === 'In Progress' ? `${apt.color}08` : 'var(--surface)',
                    borderColor: apt.status === 'In Progress' ? `${apt.color}30` : 'var(--border)',
                  }}>
                    {/* Time block */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 54,
                      height: 44,
                      background: `${apt.color}14`,
                      borderRadius: 'var(--r-md)',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: apt.color, lineHeight: 1 }}>{apt.time}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: apt.color, opacity: 0.7, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>{apt.period}</span>
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: '50%',
                      background: `${apt.color}20`,
                      color: apt.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.7rem',
                      flexShrink: 0,
                    }}>{apt.avatar}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }} className="truncate">{apt.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '1px' }}>{apt.type}</div>
                    </div>

                    {/* Status */}
                    <span className={`badge ${sc.cls}`} style={{ flexShrink: 0 }}>{apt.status}</span>
                  </div>
                );
              })}
            </div>
            <button style={{
              width: '100%', marginTop: '14px',
              padding: '10px', border: '1.5px dashed var(--border)',
              borderRadius: 'var(--r-lg)', background: 'transparent',
              color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              View Full Schedule <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Patients needing attention */}
      <div className="card animate-up stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">Patients Needing Attention</div>
            <div className="card-subtitle">Review pending cases and lab results</div>
          </div>
          <button className="btn btn-outline btn-sm">View All Patients <ArrowRight size={13} /></button>
        </div>
        <div className="card-body flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Last Visit</th>
                  <th>Condition</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { initials: 'AM', name: 'Alice Morgan',  color: '#0F766E', last: 'Yesterday',    cond: 'Hypertension',    priority: 'High',   status: 'Review Labs' },
                  { initials: 'BJ', name: 'Brian Jones',   color: '#3B82F6', last: 'Jun 20, 2026', cond: 'Type 2 Diabetes', priority: 'Medium', status: 'Rx Renewal' },
                  { initials: 'CR', name: 'Carol Roberts', color: '#8B5CF6', last: 'Jun 18, 2026', cond: 'Asthma',          priority: 'Low',    status: 'Follow-up' },
                  { initials: 'DK', name: 'David Kim',     color: '#F59E0B', last: 'Jun 15, 2026', cond: 'Post-surgery',    priority: 'High',   status: 'Check-in' },
                ].map((p, i) => {
                  const priorityBadge = { High: 'danger', Medium: 'warning', Low: 'info' }[p.priority];
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: `${p.color}18`, color: p.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.7rem',
                          }}>{p.initials}</div>
                          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)' }}>{p.last}</td>
                      <td style={{ color: 'var(--text-2)' }}>{p.cond}</td>
                      <td><span className={`badge badge-${priorityBadge}`}>{p.priority}</span></td>
                      <td><span className="badge badge-neutral">{p.status}</span></td>
                      <td>
                        <button className="btn btn-outline btn-sm">Open Chart</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
