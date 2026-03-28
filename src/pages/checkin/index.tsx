import { Routes, Route } from 'react-router-dom';
import { CheckInPage } from './CheckInPage';

export default function CheckInModule() {
  return (
    <Routes>
      <Route path="/" element={<CheckInPage />} />
    </Routes>
  );
}
