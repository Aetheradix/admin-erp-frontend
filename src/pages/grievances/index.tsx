import { Routes, Route } from 'react-router-dom';
import { GrievancePage } from './GrievancePage';

const GrievanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<GrievancePage />} />
    </Routes>
  );
};

export default GrievanceModule;
