import { useState } from 'react';
import { BedDouble, Calendar, Building2, ChevronRight, FileText, Search, User, Eye, Activity } from 'lucide-react';
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
        return <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 700 }}>EMERGENCY</span>;
      case 'inpatient':
        return <span className="badge" style={{ background: 'rgba(15,118,110,0.12)', color: 'var(--primary)', fontWeight: 700 }}>INPATIENT ADMISSION</span>;
      case 'outpatient':
        return <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', fontWeight: 700 }}>OUTPATIENT</span>;
      default:
        return <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>{type?.replace('_', ' ').toUpperCase()}</span>;
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
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
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
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(15,118,110,0.12)', color: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
                        {v.department || 'Clinical Encounter'}
                      </h3>
                      {getVisitTypeBadge(v.visit_type)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} />
                      <span>Admission: <strong>{formatDate(v.admission_date)}</strong></span>
                      {v.discharge_date && <span>· Discharge: {formatDate(v.discharge_date)}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>
                    {v.hospital?.name || 'Hospital Facility'}
                  </div>
                  {v.doctor?.full_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Attending: {v.doctor.full_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason / Diagnosis */}
              <div style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-1)' }}>
                  <strong>Chief Complaint / Reason:</strong> {v.reason}
                </div>
                {v.diagnosis_summary && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    <strong>Clinical Diagnosis / Outcome:</strong> {v.diagnosis_summary}
                  </div>
                )}
              </div>

              {/* Treatment Notes Snippet */}
              {v.notes && (
                <div style={{ marginTop: 10, fontSize: '0.8125rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
                  "{v.notes}"
                </div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                  Verified hospital record
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
