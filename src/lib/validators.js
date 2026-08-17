/* ───────────────────────────────────────────────────────────
   Client-side validators.
   Security validation must ALSO happen on the server / via RLS.
   ─────────────────────────────────────────────────────────── */

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) return 'Please enter a valid phone number';
  if (!/^\+?\d+$/.test(cleaned)) return 'Phone number can only contain digits';
  return null;
}

export function validateDate(dateStr, fieldName = 'Date') {
  if (!dateStr) return `${fieldName} is required`;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return `Please enter a valid ${fieldName.toLowerCase()}`;
  return null;
}

export function validateDateNotFuture(dateStr, fieldName = 'Date') {
  const base = validateDate(dateStr, fieldName);
  if (base) return base;
  if (new Date(dateStr) > new Date()) return `${fieldName} cannot be in the future`;
  return null;
}

export function validateFile(file) {
  if (!file) return 'Please select a file';
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'File must be PDF, JPG, or PNG';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be under ${formatFileSize(MAX_FILE_SIZE)}`;
  }
  return null;
}

export function validateMedicationRow(med) {
  const errors = {};
  if (!med.name?.trim()) errors.name = 'Medicine name is required';
  if (!med.dosage?.trim()) errors.dosage = 'Dosage is required';
  if (!med.frequency?.trim()) errors.frequency = 'Frequency is required';
  if (!med.duration?.trim()) errors.duration = 'Duration is required';
  return Object.keys(errors).length ? errors : null;
}

export function validateForm(fields) {
  const errors = {};
  for (const [key, { value, validators }] of Object.entries(fields)) {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[key] = error;
        break;
      }
    }
  }
  return Object.keys(errors).length ? errors : null;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
