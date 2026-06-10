import { Routes, Route } from 'react-router-dom';
import { UsersPage } from './UsersPage';

const UsersModule = () => {
    return (
        <Routes>
            <Route path="/" element={<UsersPage />} />
        </Routes>
    );
};

export default UsersModule;
