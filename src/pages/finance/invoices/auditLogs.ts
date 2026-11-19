import { filterLogsByRetention } from '@/utils/auditExport';
import type { BackendInvoiceAuditLogRecord, InvoiceAuditLog } from './types';

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord =>
  value !== null && typeof value === 'object' ? (value as AnyRecord) : {};

export function isSalarySlipLog(item: BackendInvoiceAuditLogRecord): boolean {
  const action = String(item.action || '').toUpperCase();
  const description = String(item.description || item.details || '').toLowerCase();
  const category = String(item.category || '').toLowerCase();

  return (
    category === 'salary_slip' ||
    category === 'payroll' ||
    action.includes('SALARY_SLIP') ||
    action.includes('PAYSLIP') ||
    action.includes('PAYROLL') ||
    description.includes('salary slip') ||
    description.includes('payslip') ||
    description.includes('payroll')
  );
}

function normalizeAuditLog(item: BackendInvoiceAuditLogRecord): InvoiceAuditLog {
  return {
    id: String(item.id || item._id || Math.random()),
    action: String(item.action || 'INVOICE_ACTION'),
    description: String(item.description || item.details || 'Invoice transaction recorded.'),
    username: String(item.username || item.user || 'System'),
    createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
  };
}

export function extractBackendAuditLogs(payload: unknown): BackendInvoiceAuditLogRecord[] {
  const data = asRecord(payload).data;
  const list = Array.isArray(data) ? data : Array.isArray(payload) ? payload : [];
  return list.map((entry) => asRecord(entry) as BackendInvoiceAuditLogRecord);
}

/** Merges local + backend logs, de-duplicates, sorts descending and applies 3-month retention. */
export function mergeAuditLogs(
  localLogs: InvoiceAuditLog[],
  backendPayload: unknown
): InvoiceAuditLog[] {
  const backendLogs = extractBackendAuditLogs(backendPayload)
    .filter((item) => !isSalarySlipLog(item))
    .map(normalizeAuditLog);

  const existingIds = new Set(localLogs.map((log) => log.id));
  const uniqueBackend = backendLogs.filter((log) => !existingIds.has(log.id));

  const merged = [...localLogs, ...uniqueBackend];
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return filterLogsByRetention(merged);
}

export function createLocalAuditLog(
  action: string,
  description: string,
  username: string
): InvoiceAuditLog {
  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    description,
    username,
    createdAt: new Date().toISOString(),
  };
}

export function filterLogsForMonth(
  logs: InvoiceAuditLog[],
  month: number,
  year: number
): InvoiceAuditLog[] {
  return logs.filter((log) => {
    const date = new Date(log.createdAt);
    if (isNaN(date.getTime())) return true;
    return !(date.getMonth() + 1 === month && date.getFullYear() === year);
  });
}
