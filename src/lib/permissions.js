import {
  LayoutDashboard, Users, FileText, Pill, Activity,
  ClipboardList, Building2, Stethoscope, Settings, User,
  FlaskConical, BedDouble, Upload, Plus, UserCircle, Sparkles,
} from 'lucide-react';

/* ───────────────────────────────────────────────────────────
   Central role-permission configuration.
   Controls sidebar navigation, route access, FAB actions,
   and quick-action availability from a single source.
   ─────────────────────────────────────────────────────────── */

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  DIAGNOSTICS: 'diagnostics',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
};

export const roleConfig = {
  /* ── Patient ─────────────────────────────────────────── */
  [ROLES.PATIENT]: {
    label: 'Patient Portal',
    color: 'teal',
    sidebar: [
      { label: 'Dashboard',           path: '/patient',                  icon: LayoutDashboard },
      { label: 'Medical History',     path: '/patient/history',          icon: Activity },
      { label: 'Prescriptions',       path: '/patient/prescriptions',    icon: Pill },
      { label: 'Diagnostic Reports',  path: '/patient/reports',          icon: FlaskConical },
      { label: 'Hospital Records',    path: '/patient/hospital-records', icon: BedDouble },
      { label: 'Healthcare Providers',path: '/patient/providers',        icon: Building2 },
      { label: 'AI Health Assistant', path: '/patient/ai-assistant',     icon: Sparkles },
      { label: 'Profile',            path: '/patient/profile',          icon: UserCircle },
    ],
    routes: [
      '/patient',
      '/patient/history',
      '/patient/prescriptions',
      '/patient/reports',
      '/patient/hospital-records',
      '/patient/providers',
      '/patient/ai-assistant',
      '/patient/profile',
    ],
    fab: null,  // Read-only role: patients cannot create clinical records
  },

  /* ── Doctor ──────────────────────────────────────────── */
  [ROLES.DOCTOR]: {
    label: 'Doctor Portal',
    color: 'blue',
    sidebar: [
      { label: 'Overview',      path: '/doctor',               icon: LayoutDashboard },
      { label: 'Patients',      path: '/doctor/patients',      icon: Users },
      { label: 'Prescriptions', path: '/doctor/prescriptions',  icon: Pill },
      { label: 'Reports',       path: '/doctor/reports',        icon: ClipboardList },
      { label: 'Profile',       path: '/doctor/profile',        icon: UserCircle },
    ],
    routes: [
      '/doctor', '/doctor/patients', '/doctor/prescriptions',
      '/doctor/prescriptions/new', '/doctor/reports', '/doctor/profile',
    ],
    fab: null,
  },

  /* ── Diagnostics ─────────────────────────────────────── */
  [ROLES.DIAGNOSTICS]: {
    label: 'Diagnostics Portal',
    color: 'purple',
    sidebar: [
      { label: 'Overview',  path: '/diagnostics',            icon: LayoutDashboard },
      { label: 'Patients',  path: '/diagnostics/patients',   icon: Users },
      { label: 'Reports',   path: '/diagnostics/reports',     icon: FlaskConical },
      { label: 'Profile',   path: '/diagnostics/profile',     icon: UserCircle },
    ],
    routes: [
      '/diagnostics', '/diagnostics/patients', '/diagnostics/reports',
      '/diagnostics/reports/new', '/diagnostics/profile',
    ],
    fab: null,
  },

  /* ── Hospital ────────────────────────────────────────── */
  [ROLES.HOSPITAL]: {
    label: 'Hospital Portal',
    color: 'green',
    sidebar: [
      { label: 'Overview',      path: '/hospital',               icon: LayoutDashboard },
      { label: 'Patients',      path: '/hospital/patients',      icon: Users },
      { label: 'Visits',        path: '/hospital/visits',         icon: BedDouble },
      { label: 'Prescriptions', path: '/hospital/prescriptions',  icon: Pill },
      { label: 'Profile',       path: '/hospital/profile',        icon: UserCircle },
    ],
    routes: [
      '/hospital', '/hospital/patients', '/hospital/visits',
      '/hospital/visits/new', '/hospital/prescriptions',
      '/hospital/prescriptions/new', '/hospital/profile',
    ],
    fab: null,
  },

  /* ── Admin (minimal) ────────────────────────────────── */
  [ROLES.ADMIN]: {
    label: 'Admin Portal',
    color: 'amber',
    sidebar: [
      { label: 'Overview',       path: '/admin',              icon: LayoutDashboard },
      { label: 'Users',          path: '/admin/users',        icon: Users },
      { label: 'Organizations',  path: '/admin/organizations', icon: Building2 },
    ],
    routes: ['/admin', '/admin/users', '/admin/organizations'],
    fab: null,
  },
};

/**
 * Check whether a role is permitted to access a given path.
 */
export function canAccessRoute(role, path) {
  const config = roleConfig[role];
  if (!config) return false;
  return config.routes.some((r) => path === r || path.startsWith(r + '/'));
}

/**
 * Return the default landing route for a given role.
 */
export function getDefaultRoute(role) {
  switch (role) {
    case ROLES.PATIENT:     return '/patient';
    case ROLES.DOCTOR:      return '/doctor';
    case ROLES.DIAGNOSTICS: return '/diagnostics';
    case ROLES.HOSPITAL:    return '/hospital';
    case ROLES.ADMIN:       return '/admin';
    default:                return '/login';
  }
}
