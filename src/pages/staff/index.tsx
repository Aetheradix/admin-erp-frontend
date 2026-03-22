import { Routes, Route } from 'react-router-dom';
import { StaffList } from './StaffList';

const StaffModule = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffList />} />
    </Routes>
  );
};

export default StaffModule;
