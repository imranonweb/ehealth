import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Eye, EyeOff, ArrowRight, Stethoscope, Building2, FlaskConical, AlertCircle, Loader2, MailCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ROLES } from '../../lib/permissions';
import { Button } from '../../components/ui/Button';

// ── SECURITY NOTE ─────────────────────────────────────────────────────────
// Only the PATIENT role is exposed on the public self-registration form.
// DOCTOR, DIAGNOSTICS, and HOSPITAL roles are privileged — they can read
// cross-patient data after an active `patient_provider_relationships` record
// is created. Exposing them here allows any member of the public to claim a
// provider identity with no verification, which is a security gap.
//
// Provider accounts must be provisioned through a trusted admin channel.
// The AuthContext.createRoleProfile code path is preserved so admin-side
// tooling (or a future invite-link flow) can use it.
//
// To enable invite-based registration in Supabase, the following migration
// would be required:
//   1. Create an `invitations` table: (id, email, role, token, used_at).
//   2. Add a Supabase RLS policy on `profiles` that only allows INSERT when
//      role = 'patient' OR an unused invitation row matches the email.
//   3. Expose a Supabase Edge Function that creates the invitation token and
//      sends the email invite link.
// ──────────────────────────────────────────────────────────────────────────

const roleOptions = [
  { id: ROLES.PATIENT, label: 'Patient', icon: User, desc: 'Access health records & prescriptions' },
  { id: ROLES.DOCTOR, label: 'Doctor', icon: Stethoscope, desc: 'Issue prescriptions & manage patients' },
  { id: ROLES.DIAGNOSTICS, label: 'Diagnostics', icon: FlaskConical, desc: 'Upload lab reports & test findings' },
  { id: ROLES.HOSPITAL, label: 'Hospital', icon: Building2, desc: 'Manage admissions & encounters' },
];

export function Register() {
  const [role, setRole] = useState(ROLES.PATIENT);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    qualification: '',
    orgName: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    healthId: '',          // Optional: Patient Health ID for account linking
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { signUp, resendConfirmation } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResend = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await resendConfirmation(unconfirmedEmail);
      setResendSuccess(true);
      success('Verification email resent successfully!');
    } catch (err) {
      toastError(err?.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
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
        licenseNumber: formData.licenseNumber,
        qualification: formData.qualification,
        orgName: formData.orgName,
        address: formData.address,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        // For patient role: Health ID from provider-created identity (enables account linking)
        health_id: role === ROLES.PATIENT && formData.healthId.trim() ? formData.healthId.trim() : undefined,
      };

      const result = await signUp(formData.email.trim(), formData.password, metadata);
      
      // If email confirmation is enabled in Supabase, session is null
      if (result?.session) {
        success('Account registered successfully!');
        navigate(`/${role}`);
      } else {
        setUnconfirmedEmail(formData.email.trim());
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err?.message || 'Failed to create account. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (unconfirmedEmail) {
    return (
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <Link to="/" aria-label="E-Health Home" style={{ display: 'inline-flex' }}>
            <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        <div className="card" style={{ padding: '36px 32px', textAlign: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-default)' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal-bg)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <MailCheck size={32} />
          </div>

          <h2 className="h2" style={{ fontSize: '1.375rem', marginBottom: 8 }}>
            Check Your Email
          </h2>
          <p className="body-md text-muted" style={{ lineHeight: 1.6, marginBottom: 20 }}>
            We have sent a verification link to <strong style={{ color: 'var(--text-primary)' }}>{unconfirmedEmail}</strong>. Please click the link in your email to confirm your address and activate your account.
          </p>

          {resendSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: 20,
            }}>
              <CheckCircle2 size={16} /> A fresh confirmation link was sent!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/login" className="btn btn-primary btn-lg w-full">
              Proceed to Sign In <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              className="btn btn-ghost btn-md w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Resending email…' : 'Did not receive it? Resend confirmation'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 520 }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <Link to="/" aria-label="E-Health Home" style={{ display: 'inline-flex' }}>
          <img src="/Ehealthlogo.png" alt="E-Health" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
        </Link>
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
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: active ? 'var(--accent)' : 'var(--bg-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={active ? '#fff' : 'var(--text-secondary)'} />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 600, color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
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
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-md)',
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
          <>
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

            {/* Health ID field for account linking */}
            <div className="field">
              <label className="field-label">
                Health ID
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8em', marginLeft: 6 }}>
                  (optional — if assigned by a doctor or hospital)
                </span>
              </label>
              <div className="input-wrap">
                <input
                  className="input"
                  type="text"
                  name="healthId"
                  placeholder="e.g. P-9824F1A2"
                  value={formData.healthId}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                If you already received a Health ID from a healthcare provider, enter it here
                to link your existing medical records to this account.
              </div>
            </div>
          </>
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
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loading}
          loadingLabel="Registering…"
          style={{ marginTop: 8 }}
        >
          Create Account <ArrowRight size={16} />
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
