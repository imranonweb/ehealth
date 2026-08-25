import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { getInitials } from '../../lib/utils';

export function HospitalProfile() {
  const { profile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    licenseNumber: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOrg() {
      if (profile?.id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (org) {
          setForm({
            name: org.name || profile.full_name || '',
            phone: org.phone || profile.phone || '',
            address: org.address || '',
            licenseNumber: org.license_number || '',
          });
        }
      }
    }
    loadOrg();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile?.id) {
        await supabase
          .from('organizations')
          .update({
            name: form.name,
            phone: form.phone,
            address: form.address,
            license_number: form.licenseNumber,
          })
          .eq('profile_id', profile.id);

        await supabase
          .from('profiles')
          .update({ full_name: form.name, phone: form.phone })
          .eq('id', profile.id);

        await refreshProfile();
        success('Hospital organization profile updated.');
      }
    } catch (err) {
      console.error('Failed to update hospital profile:', err);
      toastError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: 840 }}>
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 className="page-title">Hospital Facility Profile</h1>
          <p className="page-sub">
            Manage institutional credentials, healthcare license, and contact details.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div className="avatar avatar-xl avatar-green" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {getInitials(form.name || profile?.full_name)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{form.name || 'Hospital Center'}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
              License: <strong style={{ color: 'var(--text-primary)' }}>{form.licenseNumber || 'Registered'}</strong> · Hospital & Inpatient Facility
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="badge badge-success">Accredited Center</span>
              <span className="badge" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>Role: Hospital</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--sp-6)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label className="field-label">Hospital / Center Name</label>
            <input
              className="input"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Primary Contact Phone</label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Ministry / Authority License No.</label>
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
            <label className="field-label">Hospital Address & Location</label>
            <input
              className="input"
              type="text"
              placeholder="Road, Area, City"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  <Save size={16} /> Save Hospital Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
