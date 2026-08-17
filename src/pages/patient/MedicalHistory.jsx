import { useState } from 'react';
import { Activity, Search, Pill, FlaskConical, BedDouble, RefreshCw } from 'lucide-react';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { MedicalTimeline } from '../../components/records/MedicalTimeline';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';

export function MedicalHistory() {
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { records, total, loading, error, refresh } = useMedicalRecords({
    type: filterType || null,
    search: search || '',
    page,
    perPage: 30,
  });

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Medical History Timeline</h1>
          <p className="page-sub">
            Your unified, lifetime clinical history across all treating doctors, labs, and hospitals.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={refresh}
          disabled={loading}
          title="Refresh timeline records"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Timeline
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input has-icon"
              placeholder="Search diagnoses, doctors, hospital departments, or lab tests..."
              value={search}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterType === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('')}
            >
              All Records
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'prescription' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('prescription')}
            >
              <Pill size={14} /> Prescriptions
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'diagnostic_report' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('diagnostic_report')}
            >
              <FlaskConical size={14} /> Lab Reports
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'hospital_visit' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange('hospital_visit')}
            >
              <BedDouble size={14} /> Hospital Encounters
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing {records.length} {filterType ? filterType.replace('_', ' ') : 'clinical'} record(s)
          </div>
        </div>

        <MedicalTimeline
          records={records}
          loading={loading}
          error={error}
          onViewDetail={handleViewDetail}
          emptyMessage="No clinical records match your current filter or search criteria."
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
