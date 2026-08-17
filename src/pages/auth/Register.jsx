import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Eye, EyeOff, ArrowRight, Stethoscope, Building2, FlaskConical, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ROLES } from '../../lib/permissions';

const roleOptions = [
  { id: ROLES.PATIENT,     label: 'Patient',      icon: User,         desc: 'Access your health records & prescriptions' },
  { id: ROLES.DOCTOR,      label: 'Doctor',       icon: Stethoscope,  desc: 'Issue digital prescriptions & review tests' },
  { id: ROLES.DIAGNOSTICS, label: 'Diagnostics',  icon: FlaskConical, desc: 'Upload lab & imaging test reports' },
  { id: ROLES.HOSPITAL,    label: 'Hospital',     icon: Building2,    desc: 'Manage patient visits, admissions & records' },
];

export function Register() {
  const [role, setRole] = useState(ROLES.PATIENT);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    // Doctor specific
    specialization: '',
    licenseNumber: '',
    qualification: '',
    // Hospital / Diagnostics specific
    orgName: '',
    address: '',
    // Patient specific
    gender: 'male',
    dateOfBirth: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { signUp } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const metadata = {
        role,
        full_name: role === ROLES.HOSPITAL || role === ROLES.DIAGNOSTICS ? (formData.orgName || formData.fullName) : formData.fullName,
        phone: formData.phone,
        specialization: formData.specialization,
        license_number: formData.licenseNumber,
        qualification: formData.qualification,
        org_name: formData.orgName,
        address: formData.address,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
      };

      await signUp(formData.email.trim(), formData.password, metadata);
      success('Account registered successfully!');
      navigate(`/${role}`);
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err?.message || 'Failed to create account. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0F766E, #14B8A6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>E-Health</span>
      </div>

      <h1 className="h2" style={{ marginBottom: 6 }}>Create an Account</h1>
      <p className="body-sm text-muted" style={{ marginBottom: 20 }}>Select your role to get started</p>

      {/* Role selector cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {roleOptions.map((opt) => {
          const Icon = opt.icon;
          const active = role === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 6,
                padding: '12px 14px',
                textAlign: 'left',
                border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                background: active ? 'var(--primary-light)' : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? 'var(--primary)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={active ? '#fff' : 'var(--text-2)'} />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 600, color: active ? 'var(--primary)' : 'var(--text-1)' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.2 }}>
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: 'var(--r-md)',
          fontSize: '0.875rem',
          marginBottom: 20
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dynamic Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Name / Org Name */}
        {(role === ROLES.PATIENT || role === ROLES.DOCTOR) ? (
          <div className="field">
            <label className="field-label">Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input
                className="input has-icon"
                type="text"
                name="fullName"
                placeholder={role === ROLES.DOCTOR ? 'Dr. John Doe' : 'John Doe'}
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="field">
            <label className="field-label">Organization Name</label>
            <div className="input-wrap">
              <Building2 size={16} className="input-icon" />
              <input
                className="input has-icon"
                type="text"
                name="orgName"
                placeholder={role === ROLES.HOSPITAL ? 'Central City Hospital' : 'Apex Diagnostic Center'}
                value={formData.orgName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Email & Phone */}
        <div className="form-row">
          <div className="field">
            <label className="field-label">Email Address</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                className="input has-icon"
                type="email"
                name="email"
                placeholder="contact@ehealth.org"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Phone Number</label>
            <input
              className="input"
              type="tel"
              name="phone"
              placeholder="+880 1711..."
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Doctor Specific Fields */}
        {role === ROLES.DOCTOR && (
          <div className="form-row">
            <div className="field">
              <label className="field-label">Specialization</label>
              <input
                className="input"
                type="text"
                name="specialization"
                placeholder="e.g. Cardiology, Internal Medicine"
                value={formData.specialization}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="field">
              <label className="field-label">BMDC / License No.</label>
              <input
                className="input"
                type="text"
                name="licenseNumber"
                placeholder="e.g. BMDC-A-12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Diagnostic / Hospital Specific Fields */}
        {(role === ROLES.DIAGNOSTICS || role === ROLES.HOSPITAL) && (
          <div className="form-row">
            <div className="field">
              <label className="field-label">Health Authority License No.</label>
              <input
                className="input"
                type="text"
                name="licenseNumber"
                placeholder="License registration no."
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="field">
              <label className="field-label">Address / Location</label>
              <input
                className="input"
                type="text"
                name="address"
                placeholder="City / Area"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Patient Specific Fields */}
        {role === ROLES.PATIENT && (
          <div className="form-row">
            <div className="field">
              <label className="field-label">Date of Birth</label>
              <input
                className="input"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="field">
              <label className="field-label">Gender</label>
              <select
                className="select"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="field">
          <label className="field-label">Password</label>
          <div className="input-wrap">
            <Lock size={16} className="input-icon" />
            <input
              className="input has-icon"
              type={showPw ? 'text' : 'password'}
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" /> Registering…
            </>
          ) : (
            <>
              Create Account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
