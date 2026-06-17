import { Routes, Route } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { RolesPage } from './RolesPage';
import { IntegrationsPage } from './IntegrationsPage';
import { AuditLogPage } from './AuditLogPage';

const SettingsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingsPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/audit-log" element={<AuditLogPage />} />
    </Routes>
  );
};

export default SettingsModule;
