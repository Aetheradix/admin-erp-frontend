import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const HiringTeamDashboard = lazy(() => import('./HiringTeamDashboard'));
const FormBuilderPage = lazy(() => import('./FormBuilderPage'));

export default function HiringTeamModule() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <i className="pi pi-spin pi-spinner text-xl" />
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Loading hiring team module...
          </span>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HiringTeamDashboard />} />
        <Route path="/form-builder" element={<FormBuilderPage />} />
        <Route path="*" element={<Navigate to="/hiring-team" replace />} />
      </Routes>
    </Suspense>
  );
}
