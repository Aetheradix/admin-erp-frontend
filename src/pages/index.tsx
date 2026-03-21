import BlogsModule from '@/pages/blogs';
import Dashboard from '@/pages/dashboard/Dashboard';
import EventsModule from '@/pages/events';
import GalleryModule from '@/pages/gallery';
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

    </Routes>
  );
};

export default AppFeature;
