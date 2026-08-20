import { Routes, Route } from 'react-router-dom';
import { OrganizationPage } from './OrganizationPage';
import { BranchesPage } from './BranchesPage';
import ApprovalPage from './ApprovalPage';

const OrganizationModule = () => {
  return (
    <Routes>
      <Route path="/" element={<OrganizationPage />} />
      <Route path="/branches" element={<BranchesPage />} />
      <Route path="/approvals" element={<ApprovalPage />} />
    </Routes>
  );
};

export default OrganizationModule;
