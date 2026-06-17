import { Routes, Route } from 'react-router-dom';
import { TeamsPage } from './TeamsPage';

const TeamsModule = () => {
    return (
        <Routes>
            <Route path="/" element={<TeamsPage />} />
        </Routes>
    );
};

export default TeamsModule;
