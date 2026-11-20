import { Routes, Route } from 'react-router-dom';
import { ProjectsListPage } from './ProjectsListPage';
import { ProjectDetailPage } from './ProjectDetailPage';
import ProjectMonitoringDashboard from './ProjectMonitoringDashboard';

export default function ProjectsModule() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsListPage />} />
      <Route path="/monitoring" element={<ProjectMonitoringDashboard />} />
      <Route path="/:id/*" element={<ProjectDetailPage />} />
    </Routes>
  );
}
