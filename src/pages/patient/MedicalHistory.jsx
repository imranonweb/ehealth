import { useState } from 'react';
import { Activity, Search, Filter, Pill, FlaskConical, Building2 } from 'lucide-react';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';

export function MedicalHistory() {
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { records, total, loading, error, refresh } = useMedicalRecords({
    type: filterType || null,
    search: search || '',
    perPage: 50,
  });

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Medical History Timeline</h1>
          <p className="page-sub">
            Your comprehensive, lifetime medical record across all healthcare providers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              type="text"
              className="input has-icon"
              placeholder="Search diagnoses, doctors, tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${filterType === '' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType('')}
            >
              All Records
            </button>
            <button
              className={`btn btn-sm ${filterType === 'prescription' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType('prescription')}
            >
              <Pill size={14} /> Prescriptions
            </button>
            <button
              className={`btn btn-sm ${filterType === 'diagnostic_report' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType('diagnostic_report')}
            >
              <FlaskConical size={14} /> Reports
            </button>
            <button
              className={`btn btn-sm ${filterType === 'hospital_visit' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType('hospital_visit')}
            >
              <Building2 size={14} /> Hospital Visits
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          Showing {records.length} {filterType ? filterType.replace('_', ' ') : 'total'} record(s)
        </div>

        <MedicalTimeline
          records={records}
          loading={loading}
          error={error}
          onViewDetail={handleViewDetail}
          emptyMessage="No medical records match the selected filter criteria."
        />
      </div>

      {/* Record Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
