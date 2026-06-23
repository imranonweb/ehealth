import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, Calendar, FileText, Pill, TrendingUp,
  TrendingDown, ArrowRight, Heart, Droplets, Thermometer, Wind
} from 'lucide-react';

const vitalsHistory = [
  { month: 'Jan', bp: 128, hr: 75 },
  { month: 'Feb', bp: 122, hr: 71 },
  { month: 'Mar', bp: 126, hr: 73 },
  { month: 'Apr', bp: 118, hr: 69 },
  { month: 'May', bp: 121, hr: 72 },
  { month: 'Jun', bp: 115, hr: 68 },
];

const chartTooltipStyle = {
  background: '#1E293B',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.8125rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
};

export function PatientDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page header */}
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="overline text-primary" style={{ marginBottom: '6px' }}>Patient Dashboard</p>
            <h1 className="h1">Good Morning, John 👋</h1>
            <p className="body text-muted" style={{ marginTop: '6px' }}>Here's your health overview for today.</p>
          </div>
          <button className="btn btn-primary btn-md">
            <Calendar size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Vital signs row */}
      <div className="grid grid-cols-4 animate-up stagger-1" style={{ gap: '16px' }}>
        {[
          { label: 'Blood Pressure', value: '115/75', unit: 'mmHg', icon: Heart, status: 'Normal', statusType: 'success', color: '#0F766E', bg: 'rgba(15,118,110,0.1)', trend: 'down' },
          { label: 'Heart Rate',     value: '68',     unit: 'bpm',  icon: Activity, status: 'Resting', statusType: 'info', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', trend: 'down' },
          { label: 'Blood Sugar',    value: '92',     unit: 'mg/dL',icon: Droplets,  status: 'Fasting', statusType: 'success', color: '#10B981', bg: 'rgba(16,185,129,0.1)', trend: 'up' },
          { label: 'Temperature',    value: '98.6',   unit: '°F',   icon: Thermometer, status: 'Normal', statusType: 'success', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', trend: null },
        ].map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} className={`card animate-up stagger-${i + 1}`}>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-icon-wrap" style={{ background: v.bg }}>
                    <Icon size={20} style={{ color: v.color }} />
                  </div>
                  {v.trend && (
                    <span className={`stat-delta ${v.trend}`}>
                      {v.trend === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {v.trend === 'down' ? '-3%' : '+2%'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="stat-label">{v.label}</div>
                  <div className="stat-number" style={{ color: v.color }}>{v.value} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-3)' }}>{v.unit}</span></div>
                </div>
                <span className={`badge badge-${v.statusType}`}>{v.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="animate-up stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>

        {/* Chart card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Health Metrics History</div>
              <div className="card-subtitle">Blood pressure & heart rate — last 6 months</div>
            </div>
            <select style={{ fontSize: '0.8125rem', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '5px 10px', background: 'var(--surface-2)', color: 'var(--text-1)', outline: 'none' }}>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={vitalsHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gbp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ghr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 0" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="bp" stroke="#0F766E" strokeWidth={2.5} fill="url(#gbp)" dot={false} name="Blood Pressure" />
                <Area type="monotone" dataKey="hr" stroke="#3B82F6" strokeWidth={2.5} fill="url(#ghr)" dot={false} name="Heart Rate" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
              {[{ c: '#0F766E', l: 'Blood Pressure' }, { c: '#3B82F6', l: 'Heart Rate' }].map(x => (
                <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: x.c }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active Medications</div>
              <div className="card-subtitle">2 of 2 taken today</div>
            </div>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Lisinopril', dose: '10mg', freq: 'Once daily', time: '8:00 AM', taken: true, color: '#0F766E' },
                { name: 'Atorvastatin', dose: '20mg', freq: 'Once daily', time: '8:00 PM', taken: false, color: '#3B82F6' },
                { name: 'Metformin', dose: '500mg', freq: 'Twice daily', time: '12:00 PM', taken: true, color: '#10B981' },
              ].map((med, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px', borderRadius: 'var(--r-lg)',
                  border: '1.5px solid var(--border)',
                  background: med.taken ? 'var(--surface-2)' : 'var(--surface)',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: `${med.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pill size={18} style={{ color: med.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{med.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>{med.dose} · {med.freq}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>{med.time}</div>
                    <span className={`badge badge-${med.taken ? 'success' : 'warning'}`} style={{ marginTop: '4px' }}>
                      {med.taken ? 'Taken' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lab Reports table */}
      <div className="card animate-up stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Lab Reports</div>
            <div className="card-subtitle">Your latest test results</div>
          </div>
          <button className="btn btn-outline btn-sm">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Date</th>
                  <th>Laboratory</th>
                  <th>Ordered By</th>
                  <th>Result</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { test: 'Complete Blood Count', date: 'Jun 18, 2026', lab: 'City General Lab', dr: 'Dr. Smith', result: 'Normal' },
                  { test: 'Lipid Panel', date: 'Jun 10, 2026', lab: 'City General Lab', dr: 'Dr. Smith', result: 'Review' },
                  { test: 'HbA1c', date: 'May 28, 2026', lab: 'Apex Diagnostics', dr: 'Dr. Lee', result: 'Normal' },
                  { test: 'Thyroid Function', date: 'May 15, 2026', lab: 'Apex Diagnostics', dr: 'Dr. Patel', result: 'Normal' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.test}</td>
                    <td style={{ color: 'var(--text-2)' }}>{r.date}</td>
                    <td style={{ color: 'var(--text-2)' }}>{r.lab}</td>
                    <td style={{ color: 'var(--text-2)' }}>{r.dr}</td>
                    <td>
                      <span className={`badge badge-${r.result === 'Normal' ? 'success' : 'warning'}`}>
                        {r.result}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="animate-up stagger-4">

        {/* Upcoming appointments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Appointments</div>
            <button className="btn btn-primary btn-sm"><Calendar size={14} /> Schedule</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { date: 'Jun 26', day: 'Thu', time: '10:30 AM', doctor: 'Dr. Sarah Smith', type: 'General Checkup', avatar: 'SS', color: '#0F766E' },
                { date: 'Jul 3',  day: 'Thu', time: '2:00 PM',  doctor: 'Dr. James Lee', type: 'Cardiology Review', avatar: 'JL', color: '#3B82F6' },
              ].map((apt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: `${apt.color}12`, borderRadius: 'var(--r-md)', flexShrink: 0 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: apt.color, lineHeight: 1 }}>{apt.date.split(' ')[1]}</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: apt.color, letterSpacing: '0.05em', marginTop: '2px' }}>{apt.date.split(' ')[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.doctor}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>{apt.type} · {apt.time}</div>
                  </div>
                  <span className="badge badge-primary">{apt.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health summary */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', border: 'none' }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <div>
              <div className="card-title" style={{ color: '#fff' }}>Health Score</div>
              <div className="card-subtitle" style={{ color: 'rgba(255,255,255,0.65)' }}>Based on recent vitals & history</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '5rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>87</div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginTop: '8px', fontWeight: 500 }}>Very Good</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              {[
                { l: 'Diet', v: '78%' },
                { l: 'Activity', v: '65%' },
                { l: 'Sleep', v: '90%' },
                { l: 'Stress', v: '55%' },
              ].map(s => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
