import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { GuestLayout } from '@/components/layout/GuestLayout';
import { ROLE_HOME_ROUTES } from '@/lib/constants';
import { lazy, Suspense } from 'react';
import { DemoTools } from '@/components/ui/DemoTools';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

// Common
const LoginPage      = lazy(() => import('@/features/auth/LoginPage'));
const SelectRolePage = lazy(() => import('@/features/auth/SelectRolePage'));

// Org Admin
const OrgSetupPage      = lazy(() => import('@/features/admin/OrgSetupPage'));
const PropertySetupPage = lazy(() => import('@/features/admin/PropertySetupPage'));
const LayoutSetupPage   = lazy(() => import('@/features/admin/LayoutSetupPage'));
const GuestAccessPage   = lazy(() => import('@/features/admin/GuestAccessPage'));
const DrillConsolePage  = lazy(() => import('@/features/admin/DrillConsolePage'));

// Manager
const ManagerDashboard    = lazy(() => import('@/features/manager/ManagerDashboard'));
const CreateIncidentPage  = lazy(() => import('@/features/manager/CreateIncidentPage'));
const ReviewIncidentPage  = lazy(() => import('@/features/manager/ReviewIncidentPage'));
const BroadcastPage       = lazy(() => import('@/features/manager/BroadcastPage'));
const LiveResponseBoard   = lazy(() => import('@/features/manager/LiveResponseBoard'));
const HandoffPage         = lazy(() => import('@/features/manager/HandoffPage'));
const ResolveIncidentPage = lazy(() => import('@/features/manager/ResolveIncidentPage'));

// Staff
const StaffHomePage   = lazy(() => import('@/features/staff/StaffHomePage'));
const StaffReportPage = lazy(() => import('@/features/staff/StaffReportPage'));
const ChecklistPage   = lazy(() => import('@/features/staff/ChecklistPage'));
const StaffUpdatePage = lazy(() => import('@/features/staff/StaffUpdatePage'));

// Guest
const GuestJoinPage   = lazy(() => import('@/features/guest/GuestJoinPage'));
const GuestHomePage   = lazy(() => import('@/features/guest/GuestHomePage'));
const AlertDetailPage = lazy(() => import('@/features/guest/AlertDetailPage'));
const CheckInPage     = lazy(() => import('@/features/guest/CheckInPage'));

// Responder
const ResponderViewPage = lazy(() => import('@/features/responder/ResponderViewPage'));

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME_ROUTES[user.role]} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: '12px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
          }}
        />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-role" element={<SelectRolePage />} />

            {/* Admin — wrapped in AdminLayout */}
            <Route element={<ProtectedRoute allowedRoles={['org_admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/setup/organization" element={<OrgSetupPage />} />
                <Route path="/admin/setup/property"     element={<PropertySetupPage />} />
                <Route path="/admin/setup/layout"       element={<LayoutSetupPage />} />
                <Route path="/admin/setup/guest-access" element={<GuestAccessPage />} />
                <Route path="/admin/drill"              element={<DrillConsolePage />} />
              </Route>
            </Route>

            {/* Manager — wrapped in ManagerLayout */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route element={<ManagerLayout />}>
                <Route path="/manager/dashboard"                element={<ManagerDashboard />} />
                <Route path="/manager/incidents/new"            element={<CreateIncidentPage />} />
                <Route path="/manager/incidents/:id/review"     element={<ReviewIncidentPage />} />
                <Route path="/manager/incidents/:id/broadcast"  element={<BroadcastPage />} />
                <Route path="/manager/incidents/:id/live"       element={<LiveResponseBoard />} />
                <Route path="/manager/incidents/:id/handoff"    element={<HandoffPage />} />
                <Route path="/manager/incidents/:id/resolve"    element={<ResolveIncidentPage />} />
              </Route>
            </Route>

            {/* Staff — wrapped in StaffLayout */}
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route element={<StaffLayout />}>
                <Route path="/staff/home"                       element={<StaffHomePage />} />
                <Route path="/staff/report"                     element={<StaffReportPage />} />
                <Route path="/staff/incidents/:id/checklist"    element={<ChecklistPage />} />
                <Route path="/staff/incidents/:id/update"       element={<StaffUpdatePage />} />
              </Route>
            </Route>

            {/* Guest — /guest/join is public, rest wrapped */}
            <Route path="/guest/join" element={<GuestJoinPage />} />
            <Route element={<ProtectedRoute allowedRoles={['guest']} />}>
              <Route element={<GuestLayout />}>
                <Route path="/guest/home"                       element={<GuestHomePage />} />
                <Route path="/guest/incidents/:id/alert"        element={<AlertDetailPage />} />
                <Route path="/guest/incidents/:id/check-in"     element={<CheckInPage />} />
              </Route>
            </Route>

            {/* Responder — public read-only */}
            <Route path="/responder/incidents/:id/view" element={<ResponderViewPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <OfflineBanner />
        <DemoTools />
      </AuthProvider>
    </BrowserRouter>
  );
}
