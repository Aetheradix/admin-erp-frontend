import { Route, Routes } from 'react-router-dom';
import ApprovalPage from './ApprovalPage';
import { OrganizationPage } from './OrganizationPage';

const OrganizationModule = () => {
  return (
    <Routes>
      <Route path="/" element={<OrganizationPage />} />
      {/* <Route path="/branches" element={<BranchesPage />} /> */}
      <Route path="/approvals" element={<ApprovalPage />} />
    </Routes>
  );
};

export default OrganizationModule;
