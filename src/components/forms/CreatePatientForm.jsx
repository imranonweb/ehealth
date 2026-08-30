import { useState } from 'react';
import {
  User, Phone, Mail, Calendar, AlertTriangle, CheckCircle2,
  Loader2, UserPlus, X, Heart, AlertCircle
} from 'lucide-react';
import { patientIdentityService } from '../../services/patientIdentityService';
import { formatPatientId } from '../../lib/utils';

/**
 * CreatePatientForm
 *
 * Modal form that allows providers (Doctor/Hospital/Diagnostics) to create
 * a walk-in patient identity without requiring the patient to have a
 * Supabase Auth account.
 *
 * Workflow:
 *   1. Provider fills in patient details (name, gender, DOB, phone, email)
 *   2. System checks for duplicates by phone/email
 *   3a. If duplicate found → show warning, let provider select existing patient
 *   3b. If no duplicate → create new identity, generate Health ID
 *   4. On success, `onPatientCreated(patient)` is called with the new patient
 *      so the parent page can navigate or pre-fill forms
 *
 * Props:
 *   @param {boolean}  isOpen           — Controls modal visibility
 *   @param {function} onClose          — Called when modal is dismissed
 *   @param {function} onPatientCreated — Called with new patient object after creation
 *   @param {function} [onDuplicateSelected] — Called when provider picks an existing patient
 */
export function CreatePatientForm({ isOpen, onClose, onPatientCreated, onDuplicateSelected }) {
  const [step, setStep] = useState('form'); // 'form' | 'duplicate' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicatePatient, setDuplicatePatient] = useState(null);
  const [createdPatient, setCreatedPatient] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    bloodGroup: '',
    emergencyContact: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await patientIdentityService.createPatientIdentity({
        fullName:          formData.fullName,
        gender:            formData.gender || null,
        dateOfBirth:       formData.dateOfBirth || null,
        phone:             formData.phone || null,
        email:             formData.email || null,
        bloodGroup:        formData.bloodGroup || null,
        emergencyContact:  formData.emergencyContact || null,
      });

      if (result.isDuplicate) {
        // Existing patient found — prompt provider to select or override
        setDuplicatePatient({
          id:                result.duplicateId,
          profileId:         result.profileId,
          patientIdentifier: result.patientIdentifier,
        });
        setStep('duplicate');
      } else {
        // New patient created
        const newPatient = {
          id:                result.profileId,
          full_name:         formData.fullName,
          patient_identifier: result.patientIdentifier,
          gender:            formData.gender || null,
          phone:             formData.phone || null,
          email:             formData.email || null,
          is_registered:     false,
        };
        setCreatedPatient(newPatient);
        setStep('success');
      }
    } catch (err) {
      setError(err.message || 'Failed to create patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDuplicate = () => {
    if (onDuplicateSelected && duplicatePatient) {
      onDuplicateSelected(duplicatePatient);
    } else if (onPatientCreated && duplicatePatient) {
      onPatientCreated({
        id:                duplicatePatient.profileId,
        full_name:         formData.fullName,
        patient_identifier: duplicatePatient.patientIdentifier,
        is_registered:     true,
      });
    }
    handleClose();
  };

  const handleContinueCreating = async () => {
    // Provider wants to force-create despite duplicate warning
    // This is intentionally blocked for now — name-only duplicates
    // are too risky to merge. Provider should select the existing patient.
    setStep('form');
    setDuplicatePatient(null);
    setError('A patient with this phone/email already exists. Please select the existing patient to avoid duplicate records.');
  };

  const handleSuccessAction = () => {
    if (onPatientCreated && createdPatient) {
      onPatientCreated(createdPatient);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setError(null);
    setDuplicatePatient(null);
    setCreatedPatient(null);
    setFormData({
      fullName: '', gender: '', dateOfBirth: '',
      phone: '', email: '', bloodGroup: '', emergencyContact: '',
    });
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'var(--accent-subtle)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {step === 'success' ? 'Patient Identity Created' :
                 step === 'duplicate' ? 'Existing Patient Found' :
                 'Register New Walk-in Patient'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {step === 'form' && 'No E-Health account required — creates a patient identity'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)', borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', marginBottom: 20,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="field-label">Full Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input
                  className="input has-icon"
                  type="text"
                  name="fullName"
                  placeholder="Patient's full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Gender + DOB */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="field">
                <label className="field-label">Gender</label>
                <select
                  className="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Date of Birth</label>
                <div className="input-wrap">
                  <Calendar size={16} className="input-icon" />
                  <input
                    className="input has-icon"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Phone + Email */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="field">
                <label className="field-label">Phone Number</label>
                <div className="input-wrap">
                  <Phone size={16} className="input-icon" />
                  <input
                    className="input has-icon"
                    type="tel"
                    name="phone"
                    placeholder="+880 1711..."
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Used for duplicate detection
                </div>
              </div>
              <div className="field">
                <label className="field-label">Email (optional)</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    className="input has-icon"
                    type="email"
                    name="email"
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Blood Group + Emergency Contact */}
            <div className="form-row" style={{ marginBottom: 24 }}>
              <div className="field">
                <label className="field-label">Blood Group</label>
                <div className="input-wrap">
                  <Heart size={16} className="input-icon" />
                  <input
                    className="input has-icon"
                    type="text"
                    name="bloodGroup"
                    placeholder="e.g. A+, O-, AB+"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Emergency Contact</label>
                <input
                  className="input"
                  type="text"
                  name="emergencyContact"
                  placeholder="Name & phone"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Info note */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-info-bg, var(--accent-subtle))',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}>
              A unique <strong>Health ID</strong> will be generated automatically. The patient can later
              create an E-Health account and use this Health ID to access their complete history.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={handleClose}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-md"
                disabled={loading || !formData.fullName.trim()}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
                {loading ? 'Creating…' : 'Create Patient Identity'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP: DUPLICATE FOUND ── */}
        {step === 'duplicate' && duplicatePatient && (
          <div style={{ padding: '24px' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '16px', background: 'var(--color-warning-bg)',
              borderRadius: 'var(--radius-md)', marginBottom: 20,
              border: '1px solid var(--color-warning)',
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 4 }}>
                  Existing Patient Found
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  A patient with this phone number or email already exists in the registry.
                  To avoid duplicate records, please select the existing patient.
                </div>
              </div>
            </div>

            {/* Existing patient card */}
            <div style={{
              padding: '14px 16px',
              background: 'var(--bg-surface-muted)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Existing Record
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                {formData.fullName}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700,
                color: 'var(--accent)', marginTop: 6,
                backgroundColor: 'var(--accent-subtle)', padding: '2px 8px',
                borderRadius: 'var(--radius-xs)', display: 'inline-block',
              }}>
                {formatPatientId(duplicatePatient.patientIdentifier)}
              </div>
              {formData.phone && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Phone: {formData.phone}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => { setStep('form'); setDuplicatePatient(null); }}
                style={{ flex: 1 }}
              >
                ← Go Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleSelectDuplicate}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <CheckCircle2 size={16} /> Use Existing Patient
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && createdPatient && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>
              Patient Identity Created!
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              A unique Health ID has been assigned. Share it with the patient so they can
              create an E-Health account and access their medical history.
            </p>

            {/* Health ID display */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--accent-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 24,
              border: '1px solid var(--accent)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Patient Health ID
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800,
                color: 'var(--accent)', letterSpacing: 2,
              }}>
                {formatPatientId(createdPatient.patient_identifier)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {createdPatient.full_name}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={handleClose}
                style={{ flex: 1 }}
              >
                Done
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={handleSuccessAction}
                style={{ flex: 2 }}
              >
                Continue to Patient →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
