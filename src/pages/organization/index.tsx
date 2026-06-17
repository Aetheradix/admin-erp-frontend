import { Routes, Route } from 'react-router-dom';
import { OrganizationPage } from './OrganizationPage';
import { BranchesPage } from './BranchesPage';

const OrganizationModule = () => {
    return (
        <Routes>
            <Route path="/" element={<OrganizationPage />} />
            <Route path="/branches" element={<BranchesPage />} />
        </Routes>
    );
};

export default OrganizationModule;
