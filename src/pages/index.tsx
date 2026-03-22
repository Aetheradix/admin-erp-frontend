import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy loading all feature modules for performance optimization
const BlogsModule = lazy(() => import('@/pages/blogs'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const EventsModule = lazy(() => import('@/pages/events'));
const GalleryModule = lazy(() => import('@/pages/gallery'));
const CareersModule = lazy(() => import('@/pages/careers'));
const StaffModule = lazy(() => import('@/pages/staff'));
const AttendanceModule = lazy(() => import('@/pages/calendar'));
const FinanceModule = lazy(() => import('@/pages/finance'));
const GrievanceModule = lazy(() => import('@/pages/grievances'));
const StatsModule = lazy(() => import('@/pages/stats'));
const GuestPassModule = lazy(() => import('@/pages/guest-pass'));
const RulebookModule = lazy(() => import('@/pages/rulebook'));
const SettingsModule = lazy(() => import('@/pages/settings'));
const Profile = lazy(() => import('@/pages/profile/Profile'));

const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
       <div className="w-16 h-16 rounded-[24px] bg-primary/20 flex items-center justify-center text-primary">
          <i className="pi pi-spin pi-spinner text-3xl" />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Aetheradix Core...</span>
    </div>
  </div>
);

const AppFeature = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blogs/*" element={<BlogsModule />} />
        <Route path="/gallery/*" element={<GalleryModule />} />
        <Route path="/events/*" element={<EventsModule />} />
        <Route path="/careers/*" element={<CareersModule />} />
        <Route path="/staff/*" element={<StaffModule />} />
        <Route path="/calendar/*" element={<AttendanceModule />} />
        <Route path="/finance/*" element={<FinanceModule />} />
        <Route path="/grievances/*" element={<GrievanceModule />} />
        <Route path="/stats/*" element={<StatsModule />} />
        <Route path="/guest-pass/*" element={<GuestPassModule />} />
        <Route path="/rulebook/*" element={<RulebookModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
      </Routes>
    </Suspense>
  );
};

export default AppFeature;
