/**
 * Day-level approval record for a WFH or Leave request.
 * One record is created per date in the requested date range.
 */
export interface DayApproval {
  id: string | number;
  leave_request_id: string | number;
  date: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Rejected';
  remark?: string | null; // Manager's remark for this specific day
  approver_id?: string | number | null;
  approver_name?: string | null;
  approver_email?: string | null;
  approved_at?: string | null; // ISO timestamp of decision
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload to approve or reject a single day.
 */
export interface DayApprovalActionPayload {
  leaveRequestId: string | number;
  date: string; // YYYY-MM-DD
  status: 'Approved' | 'Rejected';
  remark?: string;
}

/**
 * Computed overall status for a multi-day request based on its day approvals:
 * - Approved: All days are approved.
 * - Rejected: All days are rejected.
 * - Partially Approved: At least one day is approved and at least one day is rejected (all days processed).
 * - Pending: No decision has been made yet (all days pending).
 * - Partially Processed: Some days have been processed while others are still pending.
 */
export type OverallRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Partially Approved'
  | 'Partially Processed';

/**
 * Compute the overall status from a list of DayApproval records.
 * Single source of truth across frontend and backend.
 */
export function computeOverallStatus(dayApprovals: DayApproval[]): OverallRequestStatus {
  if (!dayApprovals || dayApprovals.length === 0) return 'Pending';

  const total = dayApprovals.length;
  const approved = dayApprovals.filter((d) => d.status === 'Approved').length;
  const rejected = dayApprovals.filter((d) => d.status === 'Rejected').length;
  const pending = dayApprovals.filter((d) => d.status === 'Pending').length;

  if (pending === total) return 'Pending';
  if (approved === total) return 'Approved';
  if (rejected === total) return 'Rejected';

  // Some days have been processed while others are still pending
  if (pending > 0) return 'Partially Processed';

  // All days processed with at least one approved and at least one rejected
  if (approved > 0 && rejected > 0) return 'Partially Approved';

  return 'Partially Processed';
}

/**
 * Generate an array of YYYY-MM-DD date strings (inclusive) between startStr and endStr.
 * Safe from timezone drift -- operates purely on local calendar dates.
 */
export function generateDateRange(startStr: string, endStr?: string | null): string[] {
  if (!startStr) return [];
  const effectiveEnd = endStr || startStr;

  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = effectiveEnd.split('-').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [startStr];

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    const day = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Format a YYYY-MM-DD date string to a readable label like "31 Oct" or "Mon, 31 Oct 2026".
 */
export function formatDayLabel(dateStr: string, includeYear = false): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return dateStr;

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  if (includeYear) {
    return `${dayName}, ${dayNum} ${monthName} ${y}`;
  }
  return `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Format date and day name for table columns:
 * Date: 31 Oct 2026
 * Day: Saturday
 */
export function formatDayComponents(dateStr: string) {
  if (!dateStr) return { dateFormatted: '---', dayName: '---' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return { dateFormatted: dateStr, dayName: '---' };

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  return {
    dateFormatted: `${dayNum} ${monthName} ${y}`,
    dayName,
  };
}
