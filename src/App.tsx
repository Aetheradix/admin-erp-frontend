import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from '@/components/ui/composed/ErrorBoundary';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const AdminApproval = lazy(() => import('@/pages/auth/AdminApproval'));
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));
const AppFeature = lazy(() => import('@/pages/index'));

const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
        <i className="pi pi-spin pi-spinner text-3xl" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
        Initializing AetherERP...
      </span>
    </div>
  </div>
);

const ProtectedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <AppLayout />;
};

function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error Encountered">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/approve-admin" element={<AdminApproval />} />

          {/* Redirects for convenience */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
          <Route
            path="/forgot-password"
            element={<Navigate to="/auth/forgot-password" replace />}
          />

          <Route element={<ProtectedApp />}>
            <Route path="/*" element={<AppFeature />} />
          </Route>

          {/* Catch-all: redirect any unresolved route back to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
