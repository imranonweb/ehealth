import { useState, useEffect } from 'react';
import { Stethoscope, User, Mail, Phone, Building2, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { getInitials } from '../../lib/utils';

export function DoctorProfile() {
  const { profile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    qualification: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        specialization: profile.doctor_profile?.specialization || '',
        licenseNumber: profile.doctor_profile?.license_number || '',
        qualification: profile.doctor_profile?.qualification || '',
        bio: profile.doctor_profile?.bio || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ full_name: form.fullName, phone: form.phone })
          .eq('id', profile.id);

        await supabase
          .from('doctor_profiles')
          .update({
            specialization: form.specialization,
            license_number: form.licenseNumber,
            qualification: form.qualification,
            bio: form.bio,
          })
          .eq('profile_id', profile.id);

        await refreshProfile();
        success('Doctor profile updated successfully.');
      }
    } catch (err) {
      console.error('Failed to update doctor profile:', err);
      toastError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Doctor Practitioner Profile</h1>
          <p className="page-sub">
            Manage your medical credentials, specialization, and chamber contact details.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div className="avatar avatar-xl avatar-blue" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {getInitials(profile?.full_name)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{profile?.full_name || 'Doctor'}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
              License / BMDC: <strong style={{ color: 'var(--text-primary)' }}>{form.licenseNumber || 'Verified'}</strong> · {form.specialization || 'Clinical Specialist'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success">Registered Practitioner</span>
              <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>Role: Doctor</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-row">
            <div className="field">
              <label className="field-label">Full Name & Title</label>
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
              <label className="field-label">Medical Specialization</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Cardiology, Pediatrics"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="field-label">Registration / License Number</label>
              <input
                className="input"
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Academic Degrees & Qualifications</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. MBBS, FCPS (Medicine), MD"
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field-label">Professional Biography</label>
            <textarea
              className="textarea"
              placeholder="Summary of experience, clinical interests, chamber hours..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ minHeight: 90 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="submit" className="btn btn-primary btn-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Updating…
                </>
              ) : (
                <>
                  <Save size={16} /> Save Doctor Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
