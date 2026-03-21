import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AppLayout from './layouts/AppLayout';
import AppFeature from './pages/index';
import { useAuth } from './context/AuthContext';

const ProtectedApp = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout />
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedApp />}>
        <Route path="/*" element={<AppFeature />} />
      </Route>
    </Routes>
  );
}

export default App;
