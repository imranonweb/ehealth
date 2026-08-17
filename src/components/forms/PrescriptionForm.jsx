import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Save, Loader2, FileText, Calendar, Building2, Upload } from 'lucide-react';
import { PatientSearch } from './PatientSearch';
import { MedicationRows } from './MedicationRows';
import { FileUpload } from '../ui/FileUpload';
import { prescriptionService } from '../../services/prescriptionService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../contexts/ToastContext';

export function PrescriptionForm({ defaultDoctorId, defaultHospitalId, onSuccess, redirectPath = '/doctor/prescriptions' }) {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' }
  ]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toastError('Please select a patient before saving the prescription.');
      return;
    }

    // Filter valid meds
    const validMeds = medications.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0 && !file) {
      toastError('Please add at least one medication or upload a prescription document.');
      return;
    }

    setLoading(true);

    try {
      let documentPath = null;

      // Handle optional file attachment
      if (file) {
        setUploading(true);
        const uploadResult = await storageService.uploadFile(file, selectedPatient.id, 'prescriptions');
        documentPath = uploadResult.path;
        setUploading(false);
      }

      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: defaultDoctorId,
        hospital_id: defaultHospitalId,
        prescription_date: prescriptionDate,
        diagnosis: diagnosis.trim(),
        clinical_notes: clinicalNotes.trim(),
        instructions: instructions.trim(),
        medications: validMeds,
        document_path: documentPath,
      };

      const result = await prescriptionService.createPrescription(payload);
      success('Prescription created and added to patient timeline.');

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Failed to create prescription:', err);
      toastError(err.message || 'Failed to create prescription');
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

      {/* 2. Clinical Diagnosis & Date */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          2. Clinical Diagnosis & Date
        </h3>
        <div className="form-row">
          <div className="field">
            <label className="field-label">Primary Diagnosis / Chief Complaint</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Prescription Date</label>
            <input
              className="input"
              type="date"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label">Clinical Notes / Examination Findings</label>
          <textarea
            className="textarea"
            placeholder="Key clinical observations, vitals, or investigation review..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </div>
      </div>

      {/* 3. Structured Medications */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          3. Medications & Schedule
        </h3>
        <MedicationRows
          medications={medications}
          onChange={setMedications}
        />
      </div>

      {/* 4. Advice & Document Attachment */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          4. Patient Instructions & Document (Optional)
        </h3>
        
        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field-label">General Advice / Follow-up Instructions</label>
          <textarea
            className="textarea"
            placeholder="Dietary precautions, lifestyle advice, next follow-up in X weeks..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="field">
          <label className="field-label">Attach Scanned Paper Prescription (Optional)</label>
          <FileUpload
            file={file}
            onFileSelect={setFile}
            onRemove={() => setFile(null)}
            uploading={uploading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          type="button"
          className="btn btn-ghost btn-md"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading || !selectedPatient}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" /> Issuing Prescription…
            </>
          ) : (
            <>
              <Save size={16} /> Save & Issue Prescription
            </>
          )}
        </button>
      </div>
    </form>
  );
}
