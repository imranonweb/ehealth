import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessRoute, getDefaultRoute } from '../../lib/permissions';
import { AppLoadingScreen } from './AppLoadingScreen';

/**
 * Route guard that checks auth state and role permissions.
 * Wraps children with authentication and authorization checks.
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  /* Show loading screen during auth initialization */
  if (loading) {
    return <AppLoadingScreen message="Loading your workspace…" />;
  }

  /* Not authenticated → redirect to login */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Check role-based access */
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  /* Check route permission via config */
  if (!canAccessRoute(role, location.pathname)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
}

/**
 * Route guard that redirects authenticated users away from auth pages.
 */
export function PublicOnlyRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen message="Checking authentication…" />;
  }

  if (user && role) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
}
