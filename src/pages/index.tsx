import { lazy, Suspense, useMemo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGetMyPermissionsQuery } from '@/store/api/permissionSlice';

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

const ContentLoadingFallback = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
      <i className="pi pi-spin pi-spinner text-xl" />
    </div>
    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
      Loading page...
    </span>
  </div>
);

const AppFeature = () => {
  const { user } = useAuth();
  const { isLoading } = useGetMyPermissionsQuery(undefined, { skip: !user });

  // Memoize permissions check to prevent blocking synchronous JSON.parse on every navigation
  const allowedMap = useMemo(() => {
    const map: Record<string, boolean> = {};

    let visibleSections: Record<string, boolean> = {};
    const savedConfig = localStorage.getItem('erp_sections_config');
    if (savedConfig) {
      try {
        visibleSections = JSON.parse(savedConfig).visibleSections || {};
      } catch {
        // ignore
      }
    }

    let erpRoles: any[] = [];
    const savedRoles = localStorage.getItem('erp_roles');
    if (savedRoles) {
      try {
        erpRoles = JSON.parse(savedRoles);
      } catch {
        // ignore
      }
    }

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

    const check = (feature: string) => {
      if (visibleSections[feature] === false) return false;

      const lower = feature.toLowerCase();
      let permKey: string | null = null;
      if (lower === 'organization' || lower === 'teams' || lower === 'team') permKey = 'users';
      else if (lower === 'tasks') permKey = 'projects';
      else if (lower === 'finance') permKey = 'finance';
      else if (lower === 'inventory') permKey = 'inventory';
      else if (lower === 'settings') permKey = 'settings';
      else if (lower === 'analytics') permKey = 'reports';

      if (permKey && roleObj && roleObj.permissions && roleObj.permissions[permKey] === false) {
        return false;
      }
      return true;
    };

    const features = ['Blogs', 'Gallery', 'Events', 'Careers', 'Attendance', 'Finance', 'Grievances', 'Guest Pass'];
    for (const f of features) {
      map[f] = check(f);
    }
    return map;
  }, [user]);

  if (isLoading) return <ContentLoadingFallback />;

  return (
    <Suspense fallback={<ContentLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/org/*" element={<OrganizationModule />} />
        <Route path="/teams/*" element={<TeamsModule />} />
        <Route path="/users/*" element={<UsersModule />} />
        <Route path="/tasks/*" element={<TasksModule />} />
        <Route path="/inventory/*" element={<InventoryModule />} />
        <Route
          path="/blogs/*"
          element={allowedMap['Blogs'] ? <BlogsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/gallery/*"
          element={allowedMap['Gallery'] ? <GalleryModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/events/*"
          element={allowedMap['Events'] ? <EventsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/careers/*"
          element={allowedMap['Careers'] ? <CareersModule /> : <Navigate to="/" replace />}
        />
        <Route path="/staff/*" element={<StaffModule />} />
        <Route path="/checkin/*" element={<CheckInModule />} />
        <Route
          path="/calendar/*"
          element={allowedMap['Attendance'] ? <AttendanceModule /> : <Navigate to="/" replace />}
        />
        <Route path="/finance/*" element={<FinanceModule />} />
        <Route
          path="/grievances/*"
          element={allowedMap['Grievances'] ? <GrievanceModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/analytics/*"
          element={user?.role === 'Admin' ? <AnalyticsModule /> : <Navigate to="/" replace />}
        />
        <Route
          path="/guest-pass/*"
          element={allowedMap['Guest Pass'] ? <GuestPassModule /> : <Navigate to="/" replace />}
        />
        <Route path="/rulebook/*" element={<RulebookModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
      </Routes>
    </Suspense>
  );
};

export default AppFeature;
