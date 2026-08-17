import { useState } from 'react';
import { BedDouble, Calendar, Building2, ChevronRight, Search } from 'lucide-react';
import { usePatientVisits } from '../../hooks/useMedicalRecords';
import { formatDate } from '../../lib/utils';
import { RecordDetailDrawer } from '../../components/records/RecordDetailDrawer';
import { SkeletonTimeline } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export function PatientHospitalRecords() {
  const { visits, loading, error, refresh } = usePatientVisits();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleOpenDetail = (visit) => {
    setSelectedRecord({
      record_type: 'hospital_visit',
      record_reference_id: visit.id,
    });
    setDrawerOpen(true);
  };

  const filteredVisits = visits.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchHosp = v.hospital?.name?.toLowerCase().includes(q);
    const matchDept = v.department?.toLowerCase().includes(q);
    const matchReason = v.reason?.toLowerCase().includes(q);
    const matchDiag = v.diagnosis_summary?.toLowerCase().includes(q);
    const matchDoctor = v.doctor?.full_name?.toLowerCase().includes(q);
    return matchHosp || matchDept || matchReason || matchDiag || matchDoctor;
  });

  const getVisitTypeBadge = (type) => {
    switch (type) {
      case 'emergency':
        return <span className="badge badge-danger">EMERGENCY</span>;
      case 'inpatient':
        return <span className="badge badge-primary">INPATIENT ADMISSION</span>;
      case 'outpatient':
        return <span className="badge badge-blue">OUTPATIENT</span>;
      default:
        return <span className="badge" style={{ background: 'var(--bg-surface-muted)', color: 'var(--text-secondary)' }}>{type?.replace('_', ' ').toUpperCase()}</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Hospital Records & Admissions</h1>
          <p className="page-sub">
            Inpatient hospitalizations, emergency triage encounters, and outpatient consultations.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="input has-icon"
            placeholder="Search by hospital name, department, diagnosis, or reason for visit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <p className="text-danger">{error}</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title={search ? "No Hospital Encounters Match Search" : "No Hospital Encounters on Record"}
          description={search ? "Try searching for a different hospital name or diagnosis." : "Hospital admissions and emergency encounters logged by accredited medical facilities will appear here."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              className="card card-hover"
              style={{ padding: 'var(--sp-5)', cursor: 'pointer' }}
              onClick={() => handleOpenDetail(v)}
            >
              {/* Top Meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-teal-bg)', color: 'var(--color-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {v.department || 'Clinical Encounter'}
                      </h3>
                      {getVisitTypeBadge(v.visit_type)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} />
                      <span>Admission: <strong>{formatDate(v.admission_date)}</strong></span>
                      {v.discharge_date && <span>· Discharge: {formatDate(v.discharge_date)}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {v.hospital?.name || 'Hospital Facility'}
                  </div>
                  {v.doctor?.full_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Attending: {v.doctor.full_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason / Diagnosis */}
              <div style={{ background: 'var(--bg-surface-muted)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: '0.84375rem', color: 'var(--text-primary)' }}>
                  <strong>Chief Complaint / Reason:</strong> {v.reason}
                </div>
                {v.diagnosis_summary && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong>Clinical Diagnosis / Outcome:</strong> {v.diagnosis_summary}
                  </div>
                )}
              </div>

              {/* Treatment Notes Snippet */}
              {v.notes && (
                <div style={{ marginTop: 10, fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{v.notes}"
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified hospital record
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Full Encounter Details <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Drawer */}
      <RecordDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
}
