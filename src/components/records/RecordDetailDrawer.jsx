import { useState, useEffect } from 'react';
import {
  X, Download, Pill, FlaskConical, Building2, FileText, Calendar,
  User, Stethoscope, Eye, AlertCircle, Sparkles, Loader2, FileCheck
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { EmptyState } from '../ui/EmptyState';
import { formatDate, parseMedications } from '../../lib/utils';
import { patientService } from '../../services/patientService';

export function RecordDetailDrawer({ isOpen, onClose, record }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      loadDetail();
    } else {
      setDetail(null);
    }
  }, [isOpen, record]);

  async function loadDetail() {
    if (!record) {
      setDetail(null);
      return;
    }

    setLoading(true);
    try {
      const targetId = record.record_reference_id || record.id;
      const recType = record.record_type || 'prescription';
      let data = null;

      if (targetId) {
        switch (recType) {
          case 'prescription':
            data = await patientService.getPrescriptionById(targetId);
            break;
          case 'diagnostic_report':
            data = await patientService.getDiagnosticReportById(targetId);
            break;
          case 'hospital_visit':
            data = await patientService.getHospitalVisitById(targetId);
            break;
          default:
            data = null;
        }
      }

      // If backend lookup found the full record, merge any fallback fields from timeline record
      if (data) {
        setDetail({
          ...record,
          ...data,
          document_path: data.document_path || record.document_path || null,
        });
      } else {
        // Fallback: use the timeline summary info directly so the user is never left with an empty state
        setDetail({
          ...record,
          diagnosis: record.title?.replace(/^Prescription\s*[—–-]\s*/i, '') || record.title,
          test_name: record.title?.replace(/^Report\s*[—–-]\s*/i, '') || record.title,
          reason: record.title || 'General Consultation',
          clinical_notes: record.summary,
          summary: record.summary,
          doctor: { full_name: record.provider_name },
          hospital: { name: record.organization_name },
          diagnostics_org: { name: record.organization_name },
          prescription_date: record.record_date,
          report_date: record.record_date,
          admission_date: record.record_date,
        });
      }
    } catch (err) {
      console.error('Error loading clinical record detail:', err);
      // Resilient fallback
      setDetail(record);
    } finally {
      setLoading(false);
    }
  }

  const recordType = record?.record_type || detail?.record_type || 'prescription';

  const typeLabels = {
    prescription: 'Prescription Details',
    diagnostic_report: 'Diagnostic Report Findings',
    hospital_visit: 'Hospital Encounter Record',
  };

  const documentPath = detail?.document_path || record?.document_path;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={typeLabels[recordType] || 'Medical Record Detail'}
        width={620}
      >
        {loading ? (
          <div style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
            <Loader2 size={32} className="spin text-primary" style={{ margin: '0 auto' }} />
            <p className="text-muted" style={{ marginTop: 12, fontSize: '0.875rem' }}>
              Retrieving verified medical record…
            </p>
          </div>
        ) : detail ? (
          <div className="record-detail">
            {/* Header info */}
            <div className="record-detail-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: 12 }}>
              <div className="record-detail-date" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Calendar size={15} color="var(--accent)" />
                <span>Recorded on {formatDate(detail.prescription_date || detail.report_date || detail.admission_date || detail.record_date)}</span>
              </div>
              <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                Immutable Record
              </span>
            </div>

            {/* Prescription detail */}
            {recordType === 'prescription' && (
              <>
                <DetailSection title="Clinical Diagnosis" icon={Stethoscope}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {detail.diagnosis || detail.title || 'Clinical Consultation'}
                  </p>
                  {detail.clinical_notes && (
                    <p style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                      {detail.clinical_notes}
                    </p>
                  )}
                </DetailSection>

                {parseMedications(detail.medications).length > 0 ? (
                  <DetailSection title="Prescribed Medicines & Dosage" icon={Pill}>
                    <div className="medication-list-detail">
                      {parseMedications(detail.medications).map((med, i) => (
                        <div key={i} className="medication-item-detail">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                            <div className="med-name">{med.name}</div>
                            {med.dosage && (
                              <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 600 }}>
                                {med.dosage}
                              </span>
                            )}
                          </div>
                          <div className="med-info" style={{ marginTop: 4 }}>
                            {med.frequency && <span>Schedule: <strong>{med.frequency}</strong></span>}
                            {med.duration && <span> · Duration: <strong>{med.duration}</strong></span>}
                          </div>
                          {med.instructions && (
                            <div className="med-instructions" style={{ marginTop: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              💡 {med.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DetailSection>
                ) : detail.summary ? (
                  <DetailSection title="Prescription Summary" icon={Pill}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {detail.summary}
                    </p>
                  </DetailSection>
                ) : null}

                {detail.instructions && (
                  <DetailSection title="Patient Instructions & Advice" icon={FileText}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{detail.instructions}</p>
                  </DetailSection>
                )}

                <DetailSection title="Authoring Healthcare Provider" icon={User}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {detail.doctor?.full_name || detail.provider_name || 'Healthcare Practitioner'}
                  </div>
                  {(detail.hospital?.name || detail.organization_name) && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Facility: {detail.hospital?.name || detail.organization_name}
                    </div>
                  )}
                </DetailSection>
              </>
            )}

            {/* Diagnostic report detail */}
            {recordType === 'diagnostic_report' && (
              <>
                <DetailSection title="Investigation / Test Name" icon={FlaskConical}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {detail.test_name || detail.title}
                  </p>
                  {detail.test_category && (
                    <span className="badge" style={{ marginTop: 6, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                      Category: {detail.test_category}
                    </span>
                  )}
                </DetailSection>

                <DetailSection title="Results Summary & Findings" icon={FileText}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {detail.summary || 'No summary entered.'}
                  </p>
                </DetailSection>

                {detail.doctor_notes && (
                  <DetailSection title="Pathologist / Consultant Remarks" icon={Stethoscope}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{detail.doctor_notes}</p>
                  </DetailSection>
                )}

                <DetailSection title="Diagnostic Laboratory" icon={Building2}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{detail.diagnostics_org?.name || detail.organization_name || 'Diagnostic Center'}</p>
                  {(detail.doctor?.full_name || detail.provider_name) && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0 0' }}>
                      Consultant: {detail.doctor?.full_name || detail.provider_name}
                    </p>
                  )}
                </DetailSection>
              </>
            )}

            {/* Hospital visit detail */}
            {recordType === 'hospital_visit' && (
              <>
                <DetailSection title="Encounter Logistics" icon={Building2}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: '0.875rem' }}>
                    <div>
                      <span className="text-muted">Type:</span> <strong>{(detail.visit_type || 'Inpatient').replace('_', ' ').toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Department:</span> <strong>{detail.department || 'General'}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Admission:</span> <strong>{formatDate(detail.admission_date || detail.record_date)}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Discharge:</span> <strong>{detail.discharge_date ? formatDate(detail.discharge_date) : 'Active / Same-day'}</strong>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection title="Chief Complaint & Reason" icon={FileText}>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{detail.reason || detail.summary || 'Not specified'}</p>
                </DetailSection>

                {detail.diagnosis_summary && (
                  <DetailSection title="Discharge / Diagnosis Summary" icon={Stethoscope}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{detail.diagnosis_summary}</p>
                  </DetailSection>
                )}

                {detail.notes && (
                  <DetailSection title="Clinical Course & Internal Notes" icon={FileText}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{detail.notes}</p>
                  </DetailSection>
                )}

                <DetailSection title="Hospital Facility" icon={Building2}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{detail.hospital?.name || detail.organization_name || 'Hospital'}</p>
                  {(detail.doctor?.full_name || detail.provider_name) && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0 0' }}>
                      Attending Physician: {detail.doctor?.full_name || detail.provider_name}
                    </p>
                  )}
                </DetailSection>
              </>
            )}

            {/* Document attachment button or empty document notice */}
            <div className="record-detail-document" style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-default)' }}>
              {documentPath ? (
                <button
                  type="button"
                  className="btn btn-primary btn-md w-full"
                  onClick={() => setDocViewerOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700 }}
                >
                  <Eye size={16} /> View Original Document Attachment
                </button>
              ) : (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface-muted)',
                  border: '1px dashed var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  📄 Structured digital record. (No scanned physical paper was attached)
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: 'var(--sp-8) var(--sp-4)' }}>
            <EmptyState
              icon={FileText}
              title="No Details Found"
              description="The requested medical record could not be loaded or contains no additional parameters."
            />
          </div>
        )}
      </Drawer>

      {/* Embedded Reusable Document Viewer Modal */}
      {documentPath && (
        <PdfViewerModal
          isOpen={docViewerOpen}
          onClose={() => setDocViewerOpen(false)}
          filePath={documentPath}
          title={typeLabels[recordType] || 'Medical Document Attachment'}
        />
      )}
    </>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="detail-section">
      <div className="detail-section-header">
        <Icon size={14} color="var(--accent)" />
        <span>{title}</span>
      </div>
      <div className="detail-section-body">{children}</div>
    </div>
  );
}
