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

import { useAuth } from '@/context/AuthContext';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';
import { Navigate } from 'react-router-dom';

const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
       <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
          <i className="pi pi-spin pi-spinner text-3xl" />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Aetheradix Core...</span>
    </div>
  </div>
);

const AppFeature = () => {
  const { user } = useAuth();
  const { data: permissions = {}, isLoading } = useGetMyPermissionsQuery(undefined, { skip: !user });

  if (isLoading) return <LoadingScreen />;

  const isAllowed = (feature: string) => {
    if (user?.role === 'admin') return true;
    return permissions[feature] !== false;
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Permission-Controlled Routes */}
        <Route path="/blogs/*" element={isAllowed('Blogs') ? <BlogsModule /> : <Navigate to="/" replace />} />
        <Route path="/gallery/*" element={isAllowed('Gallery') ? <GalleryModule /> : <Navigate to="/" replace />} />
        <Route path="/events/*" element={isAllowed('Events') ? <EventsModule /> : <Navigate to="/" replace />} />
        <Route path="/careers/*" element={isAllowed('Careers') ? <CareersModule /> : <Navigate to="/" replace />} />
        <Route path="/staff/*" element={<StaffModule />} /> {/* Usually admin only anyway */}
        <Route path="/calendar/*" element={isAllowed('Attendance') ? <AttendanceModule /> : <Navigate to="/" replace />} />
        <Route path="/finance/*" element={isAllowed('Finance') ? <FinanceModule /> : <Navigate to="/" replace />} />
        <Route path="/grievances/*" element={isAllowed('Grievances') ? <GrievanceModule /> : <Navigate to="/" replace />} />
        <Route path="/stats/*" element={user?.role === 'admin' ? <StatsModule /> : <Navigate to="/" replace />} />
        <Route path="/guest-pass/*" element={isAllowed('Guest Pass') ? <GuestPassModule /> : <Navigate to="/" replace />} />
        <Route path="/rulebook/*" element={<RulebookModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
      </Routes>
    </Suspense>
  );
};


export default AppFeature;
