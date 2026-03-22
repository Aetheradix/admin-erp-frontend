import { Routes, Route } from 'react-router-dom';
import { CareerList } from './CareerList';

const CareersModule = () => {
  return (
    <Routes>
      <Route path="/" element={<CareerList />} />
      {/* Add detail view or form routes here as needed */}
    </Routes>
  );
};

export default CareersModule;
