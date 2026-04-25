// ============================================================
// Crisis OS — Protected Route Guard
// Wraps role-based routes. Redirects unauthenticated users
// to /login, and unauthorized roles to their home route.
// ============================================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/lib/types';
import { ROLE_HOME_ROUTES } from '@/lib/constants';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // Not authenticated → send to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → send to their own home
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTES[user.role]} replace />;
  }

  return <Outlet />;
}
