import { Routes, Route } from 'react-router-dom';
import { ProjectsListPage } from './ProjectsListPage';
import { ProjectDetailPage } from './ProjectDetailPage';
import ProjectMonitoringDashboard from './ProjectMonitoringDashboard';
import { MyTimePage } from './MyTimePage';
import { ApprovalsPage } from './ApprovalsPage';
import { DocTemplatesPage } from './DocTemplatesPage';

export default function ProjectsModule() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsListPage />} />
      <Route path="/monitoring" element={<ProjectMonitoringDashboard />} />
      <Route path="/my-time" element={<MyTimePage />} />
      <Route path="/approvals" element={<ApprovalsPage />} />
      <Route path="/doc-templates" element={<DocTemplatesPage />} />
      <Route path="/:id/*" element={<ProjectDetailPage />} />
    </Routes>
  );
}
