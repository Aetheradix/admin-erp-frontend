import { Routes, Route } from 'react-router-dom';
import { GuestPassPage } from './GuestPassPage';

const GuestPassModule = () => {
  return (
    <Routes>
      <Route path="/" element={<GuestPassPage />} />
    </Routes>
  );
};

export default GuestPassModule;
