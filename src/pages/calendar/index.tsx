import { Routes, Route } from 'react-router-dom';
import { AttendancePage } from './AttendancePage';

const AttendanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<AttendancePage />} />
    </Routes>
  );
};

export default AttendanceModule;
