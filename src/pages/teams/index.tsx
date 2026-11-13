import { Routes, Route } from 'react-router-dom';
import { TeamsPage } from './TeamsPage';
import { TeamDetailPage } from './TeamDetailPage';

const TeamsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<TeamsPage />} />
      <Route path="/:id" element={<TeamDetailPage />} />
    </Routes>
  );
};

export default TeamsModule;
