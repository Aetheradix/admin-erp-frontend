import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const BlogsModule = lazy(() => import('@/pages/blogs'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const EventsModule = lazy(() => import('@/pages/events'));
const GalleryModule = lazy(() => import('@/pages/gallery'));
const CareersModule = lazy(() => import('@/pages/careers'));
const StaffModule = lazy(() => import('@/pages/staff'));
const CheckInModule = lazy(() => import('@/pages/checkin'));
const AttendanceModule = lazy(() => import('@/pages/calendar'));
const FinanceModule = lazy(() => import('@/pages/finance'));
const GrievanceModule = lazy(() => import('@/pages/grievances'));
const AnalyticsModule = lazy(() => import('@/pages/analytics'));
const GuestPassModule = lazy(() => import('@/pages/guest-pass'));
const RulebookModule = lazy(() => import('@/pages/rulebook'));
const SettingsModule = lazy(() => import('@/pages/settings'));
const Profile = lazy(() => import('@/pages/profile/Profile'));

// New Modules
const OrganizationModule = lazy(() => import('@/pages/organization'));
const TeamsModule = lazy(() => import('@/pages/teams'));
const UsersModule = lazy(() => import('@/pages/users'));
const TasksModule = lazy(() => import('@/pages/tasks'));
const InventoryModule = lazy(() => import('@/pages/inventory'));

import { useAuth } from '../hooks/useAuth';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';
import { Navigate } from 'react-router-dom';

const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
        <i className="pi pi-spin pi-spinner text-3xl" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
        Loading Aetheradix Core...
      </span>
    </div>
  </div>
);

const AppFeature = () => {
  const { user } = useAuth();
  const { isLoading } = useGetMyPermissionsQuery(undefined, { skip: !user });

  if (isLoading) return <LoadingScreen />;

  const isAllowed = (feature: string) => {
    // 1. Load section config
    const savedConfig = localStorage.getItem('erp_sections_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.visibleSections && config.visibleSections[feature] === false) {
          return false;
        }
      } catch {
        // fall through
      }
    }

    // 2. Load role config
    const labelToPermissionKey = (label: string): string | null => {
      const lower = label.toLowerCase();
      if (lower === 'organization' || lower === 'teams' || lower === 'team') return 'users';
      if (lower === 'tasks') return 'projects';
      if (lower === 'finance') return 'finance';
      if (lower === 'inventory') return 'inventory';
      if (lower === 'settings') return 'settings';
      if (lower === 'analytics') return 'reports';
      return null;
    };

    const permKey = labelToPermissionKey(feature);
    if (permKey) {
      const savedRoles = localStorage.getItem('erp_roles');
      if (savedRoles) {
        try {
          const erpRoles = JSON.parse(savedRoles) as any[];
          const currentUserRoleName = (() => {
            if (!user) return 'Viewer';
            const desc = user.designation?.toLowerCase() || '';
            if (desc.includes('super admin')) return 'Super Admin';
            if (desc.includes('admin')) return 'Admin';
            if (desc.includes('manager')) return 'Manager';
            if (desc.includes('developer') || desc.includes('engineer')) return 'Developer';

            if (user.role === 'Admin') return 'Admin';
            return 'Viewer';
          })();
          const roleObj = erpRoles.find((r) => r.name === currentUserRoleName);
          if (roleObj && roleObj.permissions[permKey] === false) {
            return false;
          }
        } catch {
          // fall through
        }
      }
    }

    return true;
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        {/* Permission-Controlled Routes */}
        <Route path="/org/*" element={<OrganizationModule />} />
        <Route path="/teams/*" element={<TeamsModule />} />
        <Route path="/users/*" element={<UsersModule />} />
        <Route path="/tasks/*" element={<TasksModule />} />
        <Route path="/inventory/*" element={<InventoryModule />} />
        <Route
          path="/blogs/*"
          element={isAllowed('Blogs') ? <BlogsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/gallery/*"
          element={isAllowed('Gallery') ? <GalleryModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/events/*"
          element={isAllowed('Events') ? <EventsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/careers/*"
          element={isAllowed('Careers') ? <CareersModule /> : <Navigate to="/" replace />}
        />
        <Route path="/staff/*" element={<StaffModule />} /> {/* Usually admin only anyway */}
        <Route path="/checkin/*" element={<CheckInModule />} />
        <Route
          path="/calendar/*"
          element={isAllowed('Attendance') ? <AttendanceModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/finance/*"
          // element={isAllowed('Finance') ? <FinanceModule /> : <Navigate to="/" replace />}
          element={<FinanceModule />}
        />
        <Route
          path="/grievances/*"
          element={isAllowed('Grievances') ? <GrievanceModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/analytics/*"
          element={user?.role === 'Admin' ? <AnalyticsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/guest-pass/*"
          element={isAllowed('Guest Pass') ? <GuestPassModule /> : <Navigate to="/" replace />}
        />
        <Route path="/rulebook/*" element={<RulebookModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
      </Routes>
    </Suspense>
  );
};

export default AppFeature;
