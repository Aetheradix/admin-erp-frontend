import { Routes, Route } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';

const SettingsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingsPage />} />
    </Routes>
  );
};

export default SettingsModule;
