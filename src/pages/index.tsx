import { Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import Profile from './profile/Profile';
import BlogsModule from './blogs';
import GalleryModule from './gallery';
import EventsModule from './events';

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
