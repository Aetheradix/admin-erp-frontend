import { Routes, Route } from 'react-router-dom';
import { AnalyticsOverview } from './OverviewPage';
import { ReportsPage } from './ReportsPage';

const AnalyticsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<AnalyticsOverview />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  );
};

export default AnalyticsModule;
