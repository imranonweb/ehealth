import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Loader2, Clock, ShieldAlert, ShieldX, ShieldCheck, X, AlertTriangle } from 'lucide-react';
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

  // 2. Fetch patient details and verify authorization for a given patient ID
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

      // 3. Fetch patient profile if access is active or minimal identity via search
      if (determinedStatus === 'active') {
        const patientData = await searchService.getPatientById(patientId);
        if (patientData) {
          setSelectedPatient(patientData);
        } else {
          // Fallback via search by identifier
          const fallback = await searchService.searchPatients(patientId, { limit: 1 });
          setSelectedPatient(fallback?.[0] || { id: patientId, full_name: 'Patient Record' });
        }
      } else {
        // If not active, retrieve minimal identity without exposing sensitive data
        const fallback = await searchService.searchPatients(patientId, { limit: 1 });
        setSelectedPatient(fallback?.[0] || { id: patientId, full_name: 'Patient Record' });
      }
    } catch (err) {
      console.warn('[DiagnosticReportForm] loadAndVerifyPatient error:', err);
      setAccessStatus('none');
    } finally {
      setLoadingPatient(false);
    }
  }, [profile?.id, profile?.role, orgId]);

  // Trigger patient load & verification when urlPatientId changes
  useEffect(() => {
    if (urlPatientId) {
      loadAndVerifyPatient(urlPatientId);
    } else {
      setSelectedPatient(null);
      setAccessStatus(null);
    }
  }, [urlPatientId, loadAndVerifyPatient]);

  const handlePatientSelect = (patient) => {
    if (patient?.id) {
      setSearchParams({ patientId: patient.id });
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
      toastError('Please select a patient.');
      return;
    }

    if (accessStatus !== 'active') {
      toastError("You do not currently have authorized access to this patient's medical record.");
      return;
    }

    if (!testName.trim()) {
      toastError('Please provide a test name.');
      return;
    }

    setLoading(true);
    try {
      let documentPath = null;

      if (file) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(file, selectedPatient.id, 'diagnostic_reports');
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
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying patient authorization…
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
              border: `1.5px solid ${
                accessStatus === 'active'
                  ? 'var(--color-success)'
                  : accessStatus === 'pending'
                  ? 'var(--color-warning)'
                  : 'var(--border-default)'
              }`,
              borderRadius: 'var(--radius-lg)',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className={`avatar avatar-md ${accessStatus === 'active' ? 'avatar-teal' : 'avatar-blue'}`}>
                  {getInitials(selectedPatient.full_name)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
                      {selectedPatient.full_name}
                    </span>
                    <AccessStatusBadge status={accessStatus} />
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

            {/* Authorization / Consent Status Banner */}
            {accessStatus === 'pending' ? (
              <div style={{
                marginTop: 12,
                padding: '12px 16px',
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--color-warning)',
                fontSize: '0.875rem',
              }}>
                <Clock size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Awaiting Patient Approval:</strong> You do not currently have authorized access to this patient's medical record. An access request is pending approval.
                </span>
              </div>
            ) : accessStatus === 'revoked' ? (
              <div style={{
                marginTop: 12,
                padding: '12px 16px',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                color: 'var(--color-danger)',
                fontSize: '0.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldX size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Access Revoked:</strong> You do not currently have authorized access to this patient's medical record.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRequestModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ShieldCheck size={14} /> Request Access Again
                </button>
              </div>
            ) : accessStatus === 'none' ? (
              <div style={{
                marginTop: 12,
                padding: '12px 16px',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                fontSize: '0.875rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-danger)' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Unauthorized:</strong> You do not currently have authorized access to this patient's medical record.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRequestModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <ShieldCheck size={14} /> Request Access
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

      {/* 2. Test Details */}
      <div className="card" style={{ padding: 'var(--sp-6)', opacity: accessStatus === 'active' ? 1 : 0.65 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          2. Test Details &amp; Results
        </h3>
        
        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="diagnostic-test-name">Test Name</label>
            <input
              className="input"
              id="diagnostic-test-name"
              type="text"
              placeholder="e.g. Complete Blood Count, Lipid Profile, Chest X-Ray"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              disabled={accessStatus !== 'active' || loading}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="diagnostic-test-category">Test Category</label>
            <select
              className="select"
              id="diagnostic-test-category"
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value)}
              disabled={accessStatus !== 'active' || loading}
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
            disabled={accessStatus !== 'active' || loading}
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
            disabled={accessStatus !== 'active' || loading}
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
            disabled={accessStatus !== 'active' || loading}
            style={{ minHeight: 70 }}
          />
        </div>
      </div>

      {/* 3. Document Attachment */}
      <div className="card" style={{ padding: 'var(--sp-6)', opacity: accessStatus === 'active' ? 1 : 0.65 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          3. Attach Official Report Document (PDF/Image)
        </h3>
        <FileUpload
          file={file}
          onFileSelect={setFile}
          onRemove={() => setFile(null)}
          uploading={uploading}
          disabled={accessStatus !== 'active' || loading}
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
          disabled={loading || !selectedPatient || accessStatus !== 'active'}
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
