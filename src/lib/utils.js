/* ───────────────────────────────────────────────────────────
   Shared utility functions.
   ─────────────────────────────────────────────────────────── */

/**
 * Extract up to two initials from a name string.
 * "John Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a date string to a human-readable format.
 * "2026-08-17" → "Aug 17, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format a date to a relative time string (today / yesterday / date).
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(dateStr);
}

/**
 * Format file size in bytes to human readable.
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i];
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get a greeting based on the current time.
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Debounce a function call.
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Generate a color from a string (for avatars).
 */
const AVATAR_COLORS = [
  '#0F766E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#EF4444', '#6366F1',
];

export function stringToColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str, maxLen = 50) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen) + '…';
}

/**
 * Map record_type to display label.
 */
export const RECORD_TYPE_LABELS = {
  prescription: 'Prescription',
  diagnostic_report: 'Diagnostic Report',
  hospital_visit: 'Hospital Visit',
};

/**
 * Map record_type to color.
 */
export const RECORD_TYPE_COLORS = {
  prescription: '#3B82F6',
  diagnostic_report: '#8B5CF6',
  hospital_visit: '#0F766E',
};

/**
 * Safely parse JSONB medications field.
 */
export function parseMedications(meds) {
  if (!meds) return [];
  if (Array.isArray(meds)) return meds;
  try {
    return JSON.parse(meds);
  } catch {
    return [];
  }
}

/**
 * Generate a readable patient identifier.
 */
export function formatPatientId(id) {
  if (!id) return '—';
  return `P-${id.slice(0, 8).toUpperCase()}`;
}
