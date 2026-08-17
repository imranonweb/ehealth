import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Heart, ShieldCheck, AlertCircle, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { patientService } from '../../services/patientService';
import { formatPatientId, getInitials } from '../../lib/utils';

export function PatientProfile() {
  const { profile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    allergies: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        bloodGroup: profile.blood_group || profile.patient_profile?.blood_group || '',
        address: profile.address || '',
        emergencyContact: profile.patient_profile?.emergency_contact || '',
        allergies: profile.patient_profile?.allergies || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile?.id) {
        // Update main profile
        await patientService.updateProfile(profile.id, {
          full_name: form.fullName,
          phone: form.phone,
          blood_group: form.bloodGroup,
          address: form.address,
        });

        // Update patient profile
        await patientService.updatePatientProfile(profile.id, {
          emergency_contact: form.emergencyContact,
          blood_group: form.bloodGroup,
          allergies: form.allergies,
        });

        await refreshProfile();
        success('Profile information updated successfully.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const patientId = profile?.patient_profile?.patient_identifier || profile?.id;

  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Personal Medical Profile</h1>
          <p className="page-sub">
            Manage your personal contact details, emergency contacts, and blood group.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div className="avatar avatar-xl avatar-teal" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {getInitials(profile?.full_name)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{profile?.full_name || 'Patient'}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: 4 }}>
              Unique Health ID: <strong style={{ color: 'var(--primary)', letterSpacing: '0.04em' }}>{formatPatientId(patientId)}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success">Verified Patient</span>
              <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>Role: Patient</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 10, margin: 0 }}>
            Basic & Contact Details
          </h3>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Full Name</label>
              <input
                className="input"
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="field-label">Phone Number</label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Email Address (Primary)</label>
              <input
                className="input"
                type="email"
                value={profile?.email || ''}
                disabled
                style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="field">
              <label className="field-label">Blood Group</label>
              <select
                className="select"
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Residential Address</label>
            <input
              className="input"
              type="text"
              placeholder="House, Road, Area, City"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 10, margin: '12px 0 0' }}>
            Emergency & Clinical Information
          </h3>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Emergency Contact</label>
              <input
                className="input"
                type="text"
                placeholder="Name, Relationship & Phone Number"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="field-label">Known Allergies</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Penicillin, Sulfa, Peanuts (or None)"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Saving Changes…
                </>
              ) : (
                <>
                  <Save size={16} /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
