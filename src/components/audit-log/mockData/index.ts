import { AuditEntry } from '../types';

export const mockAuditLogs: AuditEntry[] = [
  { id: '1', action: 'User Login', user: 'John Doe', resource: 'Auth', ip: '192.168.1.42', timestamp: '2026-05-14 10:12:34', severity: 'info' },
  { id: '2', action: 'Invoice Created', user: 'David Kim', resource: 'Finance', ip: '192.168.1.55', timestamp: '2026-05-14 09:45:12', severity: 'info' },
  { id: '3', action: 'Permission Changed', user: 'John Doe', resource: 'Settings', ip: '192.168.1.42', timestamp: '2026-05-14 09:30:00', severity: 'warning' },
  { id: '4', action: 'User Deleted', user: 'John Doe', resource: 'Users', ip: '192.168.1.42', timestamp: '2026-05-13 17:20:45', severity: 'critical' },
  { id: '5', action: 'Project Updated', user: 'Sarah Chen', resource: 'Projects', ip: '192.168.1.67', timestamp: '2026-05-13 16:15:22', severity: 'info' },
  { id: '6', action: 'Password Reset', user: 'Alex Rivera', resource: 'Auth', ip: '192.168.1.89', timestamp: '2026-05-13 14:50:18', severity: 'warning' },
  { id: '7', action: 'Bulk Export', user: 'David Kim', resource: 'Finance', ip: '192.168.1.55', timestamp: '2026-05-13 11:30:05', severity: 'info' },
  { id: '8', action: 'Integration Connected', user: 'Tom Baker', resource: 'Settings', ip: '192.168.1.72', timestamp: '2026-05-13 10:15:33', severity: 'info' },
  { id: '9', action: 'Role Modified', user: 'John Doe', resource: 'Settings', ip: '192.168.1.42', timestamp: '2026-05-12 16:45:00', severity: 'warning' },
  { id: '10', action: 'Data Import', user: 'Sarah Chen', resource: 'Inventory', ip: '192.168.1.67', timestamp: '2026-05-12 09:20:14', severity: 'info' },
];

export const severityConfig: Record<string, { color: string; label: string }> = {
  info: { color: 'blue', label: 'Info' },
  warning: { color: 'gold', label: 'Warning' },
  critical: { color: 'red', label: 'Critical' },
};
