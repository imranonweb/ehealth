import { useState, useEffect } from 'react';
import {
  X, Download, Pill, FlaskConical, Building2, FileText, Calendar,
  User, Stethoscope, Eye, AlertCircle, Sparkles, Loader2
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
    setLoading(true);
    try {
      let data;
      switch (record.record_type) {
        case 'prescription':
          data = await patientService.getPrescriptionById(record.record_reference_id);
          break;
        case 'diagnostic_report':
          data = await patientService.getDiagnosticReportById(record.record_reference_id);
          break;
        case 'hospital_visit':
          data = await patientService.getHospitalVisitById(record.record_reference_id);
          break;
        default:
          data = null;
      }
      setDetail(data);
    } catch (err) {
      console.error('Error loading clinical record detail:', err);
    } finally {
      setLoading(false);
    }
  }

  const typeLabels = {
    prescription: 'Prescription Details',
    diagnostic_report: 'Diagnostic Report Findings',
    hospital_visit: 'Hospital Encounter Record',
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={typeLabels[record?.record_type] || 'Medical Record Detail'}
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
                <span>Recorded on {formatDate(detail.prescription_date || detail.report_date || detail.admission_date)}</span>
              </div>
              <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                Immutable Record
              </span>
            </div>

            {/* Prescription detail */}
            {record.record_type === 'prescription' && (
              <>
                <DetailSection title="Clinical Diagnosis" icon={Stethoscope}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {detail.diagnosis || 'Clinical Diagnosis'}
                  </p>
                  {detail.clinical_notes && (
                    <p style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                      {detail.clinical_notes}
                    </p>
                  )}
                </DetailSection>

                {parseMedications(detail.medications).length > 0 && (
                  <DetailSection title="Prescribed Medicines & Dosage" icon={Pill}>
                    <div className="medication-list-detail">
                      {parseMedications(detail.medications).map((med, i) => (
                        <div key={i} className="medication-item-detail">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                            <div className="med-name">{med.name}</div>
                            <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 600 }}>
                              {med.dosage}
                            </span>
                          </div>
                          <div className="med-info" style={{ marginTop: 4 }}>
                            Schedule: <strong>{med.frequency}</strong> · Duration: {med.duration}
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
                )}

                {detail.instructions && (
                  <DetailSection title="Patient Instructions & Advice" icon={FileText}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{detail.instructions}</p>
                  </DetailSection>
                )}

                <DetailSection title="Authoring Healthcare Provider" icon={User}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {detail.doctor?.full_name || 'Practitioner'}
                  </div>
                  {detail.hospital?.name && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Affiliated Hospital: {detail.hospital.name}
                    </div>
                  )}
                </DetailSection>

                {/* AI-assisted summary disclaimer */}
                {detail.ai_extraction?.length > 0 && (
                  <DetailSection title="AI-Extracted Clinical Summary" icon={Sparkles}>
                    <div className="ai-disclaimer">
                      ⚠️ AI-generated summary for educational preview only. Verify against original prescription.
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {detail.ai_extraction[0].summary}
                    </p>
                  </DetailSection>
                )}
              </>
            )}

            {/* Diagnostic report detail */}
            {record.record_type === 'diagnostic_report' && (
              <>
                <DetailSection title="Investigation / Test Name" icon={FlaskConical}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {detail.test_name}
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
                  <p style={{ fontWeight: 600, margin: 0 }}>{detail.diagnostics_org?.name || 'Diagnostic Center'}</p>
                  {detail.doctor && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0 0' }}>
                      Referring Doctor: {detail.doctor.full_name}
                    </p>
                  )}
                </DetailSection>
              </>
            )}

            {/* Hospital visit detail */}
            {record.record_type === 'hospital_visit' && (
              <>
                <DetailSection title="Encounter Logistics" icon={Building2}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: '0.875rem' }}>
                    <div>
                      <span className="text-muted">Type:</span> <strong>{detail.visit_type?.replace('_', ' ').toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Department:</span> <strong>{detail.department || 'General'}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Admission:</span> <strong>{formatDate(detail.admission_date)}</strong>
                    </div>
                    <div>
                      <span className="text-muted">Discharge:</span> <strong>{detail.discharge_date ? formatDate(detail.discharge_date) : 'Active / Same-day'}</strong>
                    </div>
                  </div>
                </DetailSection>

                <DetailSection title="Chief Complaint & Reason" icon={FileText}>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{detail.reason || 'Not specified'}</p>
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
                  <p style={{ fontWeight: 600, margin: 0 }}>{detail.hospital?.name || 'Hospital'}</p>
                  {detail.doctor && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, margin: '2px 0 0 0' }}>
                      Attending Physician: {detail.doctor.full_name}
                    </p>
                  )}
                </DetailSection>
              </>
            )}

            {/* Document attachment button or empty document notice */}
            <div className="record-detail-document" style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-default)' }}>
              {detail.document_path ? (
                <button
                  type="button"
                  className="btn btn-primary btn-md w-full"
                  onClick={() => setDocViewerOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
      {detail?.document_path && (
        <PdfViewerModal
          isOpen={docViewerOpen}
          onClose={() => setDocViewerOpen(false)}
          filePath={detail.document_path}
          title={typeLabels[record?.record_type] || 'Medical Document'}
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
