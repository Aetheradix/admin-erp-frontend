import { Routes, Route } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { RolesPage } from './RolesPage';
import { IntegrationsPage } from './IntegrationsPage';
import { AuditLogPage } from './AuditLogPage';
import AssignmentPermissionsPage from './AssignmentPermissionsPage';
import { RoutePermissionGuard } from '@/components/auth/RoutePermissionGuard';

const SettingsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingsPage />} />
      <Route
        path="/roles"
        element={
          <RoutePermissionGuard permission="role:view">
            <RolesPage />
          </RoutePermissionGuard>
        }
      />
      <Route path="/assignment-permissions" element={<AssignmentPermissionsPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/audit-log" element={<AuditLogPage />} />
    </Routes>
  );
};

export default SettingsModule;
