import { X, Download, Pill, FlaskConical, Building2, FileText, Calendar, User, Stethoscope } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { formatDate, parseMedications } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { storageService } from '../../services/storageService';

export function RecordDetailDrawer({ isOpen, onClose, record }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

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
      }
      setDetail(data);
    } catch (err) {
      console.error('Error loading detail:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!detail?.document_path) return;
    try {
      const url = await storageService.getSignedUrl(detail.document_path);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  const typeLabels = {
    prescription: 'Prescription',
    diagnostic_report: 'Diagnostic Report',
    hospital_visit: 'Hospital Visit',
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={typeLabels[record?.record_type] || 'Record Detail'}>
      {loading ? (
        <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
          <div className="auth-loading-spinner" />
          <p className="text-muted" style={{ marginTop: 12 }}>Loading record details…</p>
        </div>
      ) : detail ? (
        <div className="record-detail">
          {/* Header info */}
          <div className="record-detail-header">
            <div className="record-detail-date">
              <Calendar size={14} />
              {formatDate(detail.prescription_date || detail.report_date || detail.admission_date)}
            </div>
          </div>

          {/* Prescription detail */}
          {record.record_type === 'prescription' && (
            <>
              <DetailSection title="Diagnosis" icon={Stethoscope}>
                <p>{detail.diagnosis || 'Not specified'}</p>
              </DetailSection>

              <DetailSection title="Clinical Notes" icon={FileText}>
                <p>{detail.clinical_notes || 'No notes'}</p>
              </DetailSection>

              {parseMedications(detail.medications).length > 0 && (
                <DetailSection title="Medications" icon={Pill}>
                  <div className="medication-list-detail">
                    {parseMedications(detail.medications).map((med, i) => (
                      <div key={i} className="medication-item-detail">
                        <div className="med-name">{med.name}</div>
                        <div className="med-info">{med.dosage} · {med.frequency} · {med.duration}</div>
                        {med.instructions && <div className="med-instructions">{med.instructions}</div>}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {detail.instructions && (
                <DetailSection title="Instructions" icon={FileText}>
                  <p>{detail.instructions}</p>
                </DetailSection>
              )}

              <DetailSection title="Prescribed By" icon={User}>
                <p>{detail.doctor?.full_name || 'Unknown'}</p>
                {detail.hospital?.name && <p className="text-muted body-sm">{detail.hospital.name}</p>}
              </DetailSection>

              {/* AI Extraction */}
              {detail.ai_extraction?.length > 0 && (
                <DetailSection title="AI-Extracted Summary" icon={FileText}>
                  <div className="ai-disclaimer">
                    ⚠️ AI-generated information. Please verify against the original prescription.
                  </div>
                  <p>{detail.ai_extraction[0].summary}</p>
                </DetailSection>
              )}
            </>
          )}

          {/* Diagnostic report detail */}
          {record.record_type === 'diagnostic_report' && (
            <>
              <DetailSection title="Test" icon={FlaskConical}>
                <p><strong>{detail.test_name}</strong></p>
                {detail.test_category && <p className="text-muted body-sm">Category: {detail.test_category}</p>}
              </DetailSection>

              <DetailSection title="Summary" icon={FileText}>
                <p>{detail.summary || 'No summary available'}</p>
              </DetailSection>

              {detail.doctor_notes && (
                <DetailSection title="Doctor's Notes" icon={Stethoscope}>
                  <p>{detail.doctor_notes}</p>
                </DetailSection>
              )}

              <DetailSection title="Lab" icon={Building2}>
                <p>{detail.diagnostics_org?.name || 'Unknown'}</p>
              </DetailSection>

              {detail.doctor && (
                <DetailSection title="Referring Doctor" icon={User}>
                  <p>{detail.doctor.full_name}</p>
                </DetailSection>
              )}
            </>
          )}

          {/* Hospital visit detail */}
          {record.record_type === 'hospital_visit' && (
            <>
              <DetailSection title="Visit Details" icon={Building2}>
                <p><strong>Type:</strong> {detail.visit_type?.replace('_', ' ')}</p>
                {detail.department && <p><strong>Department:</strong> {detail.department}</p>}
                <p><strong>Admission:</strong> {formatDate(detail.admission_date)}</p>
                {detail.discharge_date && <p><strong>Discharge:</strong> {formatDate(detail.discharge_date)}</p>}
              </DetailSection>

              <DetailSection title="Reason" icon={FileText}>
                <p>{detail.reason || 'Not specified'}</p>
              </DetailSection>

              {detail.diagnosis_summary && (
                <DetailSection title="Diagnosis" icon={Stethoscope}>
                  <p>{detail.diagnosis_summary}</p>
                </DetailSection>
              )}

              {detail.notes && (
                <DetailSection title="Notes" icon={FileText}>
                  <p>{detail.notes}</p>
                </DetailSection>
              )}

              <DetailSection title="Hospital" icon={Building2}>
                <p>{detail.hospital?.name || 'Unknown'}</p>
              </DetailSection>

              {detail.doctor && (
                <DetailSection title="Attending Doctor" icon={User}>
                  <p>{detail.doctor.full_name}</p>
                </DetailSection>
              )}
            </>
          )}

          {/* Document attachment */}
          {detail.document_path && (
            <div className="record-detail-document">
              <button className="btn btn-outline btn-md w-full" onClick={handleDownload}>
                <Download size={16} /> View / Download Document
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
          <p className="text-muted">No details available</p>
        </div>
      )}
    </Drawer>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="detail-section">
      <div className="detail-section-header">
        <Icon size={14} />
        <span>{title}</span>
      </div>
      <div className="detail-section-body">{children}</div>
    </div>
  );
}
