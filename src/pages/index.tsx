import BlogsModule from '@/pages/blogs';
import Dashboard from '@/pages/dashboard/Dashboard';
import EventsModule from '@/pages/events';
import GalleryModule from '@/pages/gallery';
import CareersModule from '@/pages/careers';
import StaffModule from '@/pages/staff';
import AttendanceModule from '@/pages/calendar';
import FinanceModule from '@/pages/finance';
import GrievanceModule from '@/pages/grievances';
import StatsModule from '@/pages/stats';
import GuestPassModule from '@/pages/guest-pass';
import RulebookModule from '@/pages/rulebook';
import SettingsModule from '@/pages/settings';
import Profile from '@/pages/profile/Profile';
import { Route, Routes } from 'react-router-dom';

const AppFeature = () => {
  return (
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
  );
};

export default AppFeature;
