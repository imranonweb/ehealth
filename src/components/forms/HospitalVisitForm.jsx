import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BedDouble, Save, Loader2 } from 'lucide-react';
import { PatientSearch } from './PatientSearch';
import { hospitalService } from '../../services/hospitalService';
import { searchService } from '../../services/searchService';
import { useToast } from '../../contexts/ToastContext';

export function HospitalVisitForm({ onSuccess, redirectPath = '/hospital/visits' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get('patientId');
  const { success, error: toastError } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [visitType, setVisitType] = useState('outpatient');
  const [department, setDepartment] = useState('General Medicine');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dischargeDate, setDischargeDate] = useState('');
  const [reason, setReason] = useState('');
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [notes, setNotes] = useState('');
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

    setLoading(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        visit_type: visitType,
        department: department.trim(),
        admission_date: admissionDate,
        discharge_date: dischargeDate || null,
        reason: reason.trim(),
        diagnosis_summary: diagnosisSummary.trim(),
        notes: notes.trim(),
      };

      const result = await hospitalService.createVisit(payload);
      success('Hospital visit record created successfully.');

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Failed to create visit:', err);
      toastError(err.message || 'Failed to create hospital visit record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Patient Lookup */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          1. Select Patient
        </h3>
        {loadingPatient ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Loader2 size={16} className="spin" /> Loading patient details…
          </div>
        ) : (
          <PatientSearch
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            onClear={() => setSelectedPatient(null)}
          />
        )}
      </div>

      {/* 2. Visit Logistics */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          2. Visit Information
        </h3>

        <div className="form-row">
          <div className="field">
            <label className="field-label">Visit / Admission Type</label>
            <select
              className="select"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
            >
              <option value="outpatient">Outpatient Consultation</option>
              <option value="inpatient">Inpatient Admission</option>
              <option value="emergency">Emergency / Acute Care</option>
              <option value="day_care">Day Care Procedure</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Department / Unit</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Cardiology, Surgery, ICU"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="field-label">Admission / Visit Date</label>
            <input
              className="input"
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Discharge Date (Optional)</label>
            <input
              className="input"
              type="date"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Clinical Summary */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
          3. Reason & Diagnosis
        </h3>

        <div className="field">
          <label className="field-label">Primary Reason for Admission / Consultation</label>
          <input
            className="input"
            type="text"
            placeholder="Chief complaint or symptoms on presentation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label">Diagnosis / Discharge Summary</label>
          <textarea
            className="textarea"
            placeholder="Working diagnosis, treatment response, post-discharge instructions..."
            value={diagnosisSummary}
            onChange={(e) => setDiagnosisSummary(e.target.value)}
            style={{ minHeight: 90 }}
          />
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label className="field-label">Internal Hospital Notes (Optional)</label>
          <textarea
            className="textarea"
            placeholder="Attending staff remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ minHeight: 70 }}
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
              <Loader2 size={16} className="spin" /> Creating Visit Record…
            </>
          ) : (
            <>
              <Save size={16} /> Save Visit Record
            </>
          )}
        </button>
      </div>
    </form>
  );
}
