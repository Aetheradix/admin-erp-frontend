export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  resource: string;
  ip: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}
