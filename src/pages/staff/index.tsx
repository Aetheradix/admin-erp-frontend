import { Routes, Route } from 'react-router-dom';
import { StaffList } from './StaffList';
import { Approvals } from './Approvals';
import { ApprovalHistory } from './ApprovalHistory';
import { FeatureControl } from './FeatureControl';
import AdminRequestsPage from './AdminRequestsPage';

const StaffModule = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffList />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/history" element={<ApprovalHistory />} />
      <Route path="/feature-control" element={<FeatureControl />} />
      <Route path="/elevation-requests" element={<AdminRequestsPage />} />
    </Routes>
  );
};

export default StaffModule;
