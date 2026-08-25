import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { PatientSearch } from './PatientSearch';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { diagnosticsService } from '../../services/diagnosticsService';
import { storageService } from '../../services/storageService';
import { searchService } from '../../services/searchService';
import { useToast } from '../../contexts/ToastContext';

export function DiagnosticReportForm({ onSuccess, redirectPath = '/diagnostics/reports' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get('patientId');
  const { success, error: toastError } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [testName, setTestName] = useState('');
  const [testCategory, setTestCategory] = useState('Hematology');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlPatientId && !selectedPatient) {
      setLoadingPatient(true);
      searchService.getPatientById(urlPatientId)
        .then((p) => {
          if (p) setSelectedPatient(p);
        })
        .finally(() => {
          setLoadingPatient(false);
        });
    }
  }, [urlPatientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toastError('Please select a patient.');
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
      {/* 1. Patient Lookup */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          1. Select Patient
        </h3>
        <PatientSearch
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          onClear={() => setSelectedPatient(null)}
        />
      </div>

      {/* 2. Test Details */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          2. Test Details & Results
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
            >
              <option value="Hematology">Hematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Immunology">Immunology</option>
              <option value="Radiology & Imaging">Radiology & Imaging</option>
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
            required
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label" htmlFor="diagnostic-summary">Key Findings & Values Summary</label>
          <textarea
            className="textarea"
            id="diagnostic-summary"
            placeholder="Summarize key parameter values, normal/abnormal flags..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
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
          <Save size={16} /> Save & Upload Report
        </Button>
      </div>
    </form>
  );
}
