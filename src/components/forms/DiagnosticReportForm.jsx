import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Loader2, Clock, ShieldAlert, ShieldX, ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';
import { PatientSearch } from './PatientSearch';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { AccessRequestModal } from '../access/AccessRequestModal';
import { AccessStatusBadge } from '../access/AccessStatusBadge';
import { diagnosticsService } from '../../services/diagnosticsService';
import { storageService } from '../../services/storageService';
import { searchService } from '../../services/searchService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { formatPatientId, getInitials } from '../../lib/utils';

export function DiagnosticReportForm({ onSuccess, redirectPath = '/diagnostics/reports' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPatientId = searchParams.get('patientId');
  const { profile } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Access status for the selected patient: 'active' | 'pending' | 'revoked' | 'none' | null
  const [accessStatus, setAccessStatus] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form fields
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState('Hematology');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Resolve organization ID for current diagnostics account
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('organizations')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) setOrgId(data.id);
      });
  }, [profile?.id]);

  // 2. Fetch patient details and check authorization for a given patient ID
  const loadAndVerifyPatient = useCallback(async (patientId) => {
    if (!patientId || !profile?.id) {
      setSelectedPatient(null);
      setAccessStatus(null);
      return;
    }

    setLoadingPatient(true);
    try {
      // 1. Resolve organization ID
      let currentOrgId = orgId;
      if (!currentOrgId && (profile.role === 'diagnostics' || profile.role === 'hospital')) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('profile_id', profile.id)
          .maybeSingle();
        currentOrgId = orgData?.id || null;
        if (currentOrgId) setOrgId(currentOrgId);
      }

      // 2. Check relationship specifically for this organization
      let queryBuilder = supabase
        .from('patient_provider_relationships')
        .select('id, status, organization_id, provider_profile_id')
        .eq('patient_profile_id', patientId);

      if (currentOrgId) {
        queryBuilder = queryBuilder.or(`organization_id.eq.${currentOrgId},provider_profile_id.eq.${profile.id}`);
      } else {
        queryBuilder = queryBuilder.eq('provider_profile_id', profile.id);
      }

      const { data: relRows } = await queryBuilder.order('created_at', { ascending: false });

      const match = (relRows || []).find((rel) => {
        const belongsToThisOrg = currentOrgId && rel.organization_id === currentOrgId;
        const belongsToThisProvider = rel.provider_profile_id === profile.id;
        return belongsToThisOrg || belongsToThisProvider;
      });

      const determinedStatus = match?.status || 'none';
      setAccessStatus(determinedStatus);

      // 3. Fetch patient identity
      const patientData = await searchService.getPatientById(patientId);
      setSelectedPatient(patientData || null);
    } catch (err) {
      console.warn('[DiagnosticReportForm] loadAndVerifyPatient error:', err);
    } finally {
      setLoadingPatient(false);
    }
  }, [profile?.id, profile?.role, orgId]);

  // Pre-populate if patientId was passed in the URL query string
  useEffect(() => {
    if (urlPatientId) {
      loadAndVerifyPatient(urlPatientId);
    }
  }, [urlPatientId, loadAndVerifyPatient]);

  const handlePatientSelect = (patient) => {
    if (patient?.id) {
      setSearchParams({ patientId: patient.id }, { replace: true });
      loadAndVerifyPatient(patient.id);
    }
  };

  const handleChangePatient = () => {
    setSelectedPatient(null);
    setAccessStatus(null);
    setSearchParams({}, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toastError('Please select a patient before uploading a report.');
      return;
    }

    if (!testName.trim()) {
      toastError('Please enter the investigation or test name.');
      return;
    }

    setLoading(true);
    try {
      let documentPath = null;

      if (file) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(file, selectedPatient.id, 'diagnostic_reports', orgId);
        documentPath = uploadResult.path;
        setUploading(false);
      }

      const payload = {
        patient_id: selectedPatient.id,
        test_name: testName.trim(),
        test_category: testCategory,
        report_date: reportDate,
        summary: summary.trim(),
        doctor_notes: doctorNotes.trim(),
        document_path: documentPath,
      };

      const result = await diagnosticsService.createReport(payload);
      success('Diagnostic report uploaded and linked to patient record.');

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Failed to create diagnostic report:', err);
      toastError(err.message || 'Failed to upload report');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Patient Lookup / Selected Patient Summary Card */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          1. Selected Patient
        </h3>

        {loadingPatient ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', color: 'var(--text-muted)' }}>
            <Loader2 size={18} className="spin" /> Loading patient details…
          </div>
        ) : selectedPatient && urlPatientId ? (
          <div>
            {/* Patient Summary Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar avatar-md avatar-teal">
                  {getInitials(selectedPatient.full_name)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
                      {selectedPatient.full_name}
                    </span>
                    <AccessStatusBadge status={accessStatus === 'none' ? 'active' : accessStatus} />
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Patient ID: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {formatPatientId(selectedPatient.patient_identifier || selectedPatient.id)}
                    </strong>
                    {selectedPatient.phone && ` · Phone: ${selectedPatient.phone}`}
                    {selectedPatient.email && ` · Email: ${selectedPatient.email}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleChangePatient}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                aria-label="Change patient"
              >
                <X size={15} /> Change Patient
              </button>
            </div>

            {/* Optional Consent Info Banner */}
            {accessStatus === 'pending' ? (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--color-warning)',
                fontSize: '0.8125rem',
              }}>
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>
                  Consent request pending for historical records. Uploading this new report will link it directly to the patient's record.
                </span>
              </div>
            ) : accessStatus === 'revoked' ? (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                fontSize: '0.8125rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <ShieldX size={16} style={{ flexShrink: 0, color: 'var(--color-danger)' }} />
                  <span>Historical file access is revoked. New test reports can still be submitted for the patient.</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRequestModal(true)}
                >
                  <ShieldCheck size={13} /> Request History Access
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <PatientSearch
            selectedPatient={selectedPatient}
            onSelectPatient={handlePatientSelect}
            onClear={handleChangePatient}
          />
        )}
      </div>

      {/* 2. Investigation Details */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          2. Test Findings &amp; Clinical Parameters
        </h3>

        <div className="grid-2" style={{ gap: 16 }}>
          <div className="field">
            <label className="field-label" htmlFor="diagnostic-test-name">Test / Investigation Name</label>
            <input
              className="input"
              id="diagnostic-test-name"
              type="text"
              placeholder="e.g. Complete Blood Count (CBC), Lipid Profile..."
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="diagnostic-test-category">Department / Category</label>
            <select
              className="input select"
              id="diagnostic-test-category"
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              disabled={loading}
            >
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Immunology">Immunology</option>
              <option value="Radiology & Imaging">Radiology &amp; Imaging</option>
              <option value="Pathology">Pathology</option>
              <option value="Cardiology">Cardiology / ECG</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label" htmlFor="diagnostic-report-date">Report Date</label>
          <input
            className="input"
            id="diagnostic-report-date"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label" htmlFor="diagnostic-summary">Key Findings &amp; Values Summary</label>
          <textarea
            className="textarea"
            id="diagnostic-summary"
            placeholder="Summarize key parameter values, normal/abnormal flags..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
            required
            style={{ minHeight: 90 }}
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label" htmlFor="diagnostic-notes">Pathologist / Lab Consultant Remarks (Optional)</label>
          <textarea
            className="textarea"
            id="diagnostic-notes"
            placeholder="Clinical interpretations or remarks..."
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            disabled={loading}
            style={{ minHeight: 70 }}
          />
        </div>
      </div>

      {/* 3. Document Attachment */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          3. Attach Official Report Document (PDF/Image)
        </h3>
        <FileUpload
          file={file}
          onFileSelect={setFile}
          onRemove={() => setFile(null)}
          uploading={uploading}
          disabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading || !selectedPatient}
          isLoading={loading}
          loadingLabel="Uploading Report…"
        >
          <Save size={16} /> Save &amp; Upload Report
        </Button>
      </div>

      {/* Access Request Modal */}
      <AccessRequestModal
        patient={selectedPatient}
        orgId={orgId}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestSent={(newStatus) => {
          setAccessStatus(newStatus === 'already_active' ? 'active' : 'pending');
          setShowRequestModal(false);
          success('Access request submitted. Awaiting patient approval.');
        }}
      />
    </form>
  );
}
