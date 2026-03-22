import { Routes, Route } from 'react-router-dom';
import { StatsPage } from './StatsPage';

const StatsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<StatsPage />} />
    </Routes>
  );
};

export default StatsModule;
