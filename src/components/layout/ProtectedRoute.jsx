import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessRoute, getDefaultRoute } from '../../lib/permissions';

/**
 * Route guard that checks auth state and role permissions.
 * Wraps children with authentication and authorization checks.
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  /* Show loading spinner during auth initialization */
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p className="auth-loading-text">Loading your session…</p>
      </div>
    );
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
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (user && role) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return children;
}
