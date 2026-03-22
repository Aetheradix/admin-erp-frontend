import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));
const AppFeature = lazy(() => import('@/pages/index'));

const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
       <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
          <i className="pi pi-spin pi-spinner text-3xl" />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Initializing Aetheradix...</span>
    </div>
  </div>
);

const ProtectedApp = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout />
  );
};

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedApp />}>
          <Route path="/*" element={<AppFeature />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
