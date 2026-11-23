import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const DepartmentsListPage = lazy(() => import('./DepartmentsListPage'));
const DeptHeadDashboard = lazy(() => import('./DeptHeadDashboard'));

export default function DepartmentsModule() {
  return (
    <Routes>
      <Route path="/" element={<DepartmentsListPage />} />
      <Route path="/:deptId" element={<DeptHeadDashboard />} />
    </Routes>
  );
}
