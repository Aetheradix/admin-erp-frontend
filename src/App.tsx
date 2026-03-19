import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin, App as AntdApp } from 'antd';
import Layout from '@/components/layout/Layout';


const Dashboard = lazy(() => import('@/features/dashboard'));
const BlogsList = lazy(() => import('@/features/blogs/BlogsList'));
const GalleryList = lazy(() => import('@/features/gallery/GalleryList'));
const EventsList = lazy(() => import('@/features/events/EventsList'));
const CareersList = lazy(() => import('@/features/careers/CareersList'));
const UsersList = lazy(() => import('@/features/users/UsersList'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));


const Login = lazy(() => import('@/pages/Login'));
const SignUp = lazy(() => import('@/pages/SignUp'));
// const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#0a0f1a]">
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <AntdApp>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

          {/* Protected Admin Routes */}
          {/* <Route element={<ProtectedRoute allowedRoles={['admin']} />}> */}
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<BlogsList />} />
              <Route path="gallery" element={<GalleryList />} />
              <Route path="events" element={<EventsList />} />
              <Route path="careers" element={<CareersList />} />
              <Route path="users" element={<UsersList />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />
            </Route>
          {/* </Route> */}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </AntdApp>
  );
}

export default App;