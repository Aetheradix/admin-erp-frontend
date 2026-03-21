import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/dashboard/Dashboard';
import Profile from '@/pages/profile/Profile';
import BlogsModule from '@/pages/blogs';
import GalleryModule from '@/pages/gallery';
import EventsModule from '@/pages/events';
import ComponentLibrary from '@/pages/ComponentLibrary';

const AppFeature = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/blogs/*" element={<BlogsModule />} />
      <Route path="/gallery/*" element={<GalleryModule />} />
      <Route path="/events/*" element={<EventsModule />} />
      <Route path="/ui" element={<ComponentLibrary />} />
    </Routes>
  );
};

export default AppFeature;
