/**
 * Utility functions for payroll and salary slip generation.
 */

/**
 * Formats an employee code to preserve and clean its actual identifier (e.g. 'EMP1', 'X001').
 * - Preserves letter prefixes like 'EMP' or 'X' (e.g., 'EMP1', 'X001', 'EMP001').
 * - Strips old legacy wrapper prefixes like 'SLIP-'.
 * - Removes internal hyphens/spaces/underscores (e.g., 'EMP-1' -> 'EMP1', 'EMP-001' -> 'EMP001', 'X-001' -> 'X001').
 * - If purely numeric digits (e.g. '1', '2', '001'), prefixes with 'EMP' (e.g., 1 -> 'EMP1', '001' -> 'EMP001').
 */
export const formatEmployeeCode = (employeeCode?: string | number | null): string => {
  if (employeeCode === undefined || employeeCode === null) return '';
  const str = String(employeeCode).trim();
  if (!str) return '';

  // 1. Remove old legacy prefixes like 'SLIP-'
  let cleaned = str.replace(/^SLIP[-_]?/i, '').trim();

  // 2. Remove internal hyphens, underscores, or spaces (e.g. 'EMP-1' -> 'EMP1', 'X-001' -> 'X001')
  cleaned = cleaned.replace(/[-_\s]+/g, '');

  // 3. If purely numeric, prefix with 'EMP'
  if (/^\d+$/.test(cleaned)) {
    return `EMP${cleaned}`;
  }

  return cleaned.toUpperCase();
};

/**
 * Parses a payslip number formatted as <EMPLOYEE_CODE><MM><YY><SLIP_NO>
 * e.g., 'EMP10926001' -> { employeeCode: 'EMP1', month: '09', year: '26', slipNo: '001', sequence: 1 }
 * e.g., 'X0010725001' -> { employeeCode: 'X001', month: '07', year: '25', slipNo: '001', sequence: 1 }
 * Also supports optional separator formats (e.g. 'EMP1-0926001', 'E002-0926001') and legacy 'SLIP-...'
 */
export const parseSlipNumber = (
  slipNumber?: string | null
): { employeeCode: string; month: string; year: string; slipNo: string; sequence: number } | null => {
  if (!slipNumber) return null;
  const trimmed = String(slipNumber).trim();
  if (!trimmed) return null;

  // 1. Hyphen or underscore separated format: e.g. 'EMP1-0926001', 'X001-0926001', 'E002-0926001'
  const separatorMatch = trimmed.match(/^([A-Za-z0-9_-]+)[-_](\d{2})(\d{2})(\d{3,})$/);
  if (separatorMatch) {
    return {
      employeeCode: formatEmployeeCode(separatorMatch[1]),
      month: separatorMatch[2],
      year: separatorMatch[3],
      slipNo: separatorMatch[4],
      sequence: parseInt(separatorMatch[4], 10),
    };
  }

  // 2. Direct concatenated format without separator:
  // e.g. 'EMP10926001', 'X0010926001'
  // Suffix is MM (2 digits) + YY (2 digits) + SSS (3 digits) = 7 digits at the end
  const directMatch = trimmed.match(/^([A-Za-z0-9]+?)(\d{2})(\d{2})(\d{3})$/);
  if (directMatch) {
    return {
      employeeCode: formatEmployeeCode(directMatch[1]),
      month: directMatch[2],
      year: directMatch[3],
      slipNo: directMatch[4],
      sequence: parseInt(directMatch[4], 10),
    };
  }

  // 3. Fallback for legacy format: SLIP-<EMP_CODE>-<YYYY><MM>
  const legacyMatch = trimmed.match(/^SLIP[-_]?([A-Za-z0-9_-]+)[-_](\d{4})(\d{2})$/i);
  if (legacyMatch) {
    return {
      employeeCode: formatEmployeeCode(legacyMatch[1]),
      month: legacyMatch[3],
      year: legacyMatch[2].slice(-2),
      slipNo: '001',
      sequence: 1,
    };
  }

  return null;
};

/**
 * Generates payslip number according to the format:
 * <EMPLOYEE_CODE><MM><YY><SLIP_NO>
 * e.g., EMP10926001 (EMP1, September 2026, slip no 001)
 * e.g., X0010725001 (X001, July 2025, slip no 001)
 *
 * @param employeeCode Employee code directly from user/database (e.g. EMP1, X001, EMP001, EMP-001)
 * @param monthYearStr Month and year string or pay period (e.g. "SEPTEMBER 2026", "2026-09", "09/2026")
 * @param slipSequence Slip sequence number (default 1, produces "001", or 2 for "002", etc.)
 */
export const generateSlipNumber = (
  employeeCode?: string | number | null,
  monthYearStr?: string | null,
  slipSequence: number | string = 1
): string => {
  if (employeeCode === undefined || employeeCode === null || String(employeeCode).trim() === '') {
    return '';
  }

  const cleanEmpCode = formatEmployeeCode(employeeCode);
  if (!cleanEmpCode) return '';

  const parts = String(monthYearStr || '')
    .trim()
    .split(/[\s\/\-]+/)
    .filter(Boolean);
  const monthsList = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  // 1. Dynamic Fallback to current system date
  const now = new Date();
  let year = now.getFullYear();
  let monthVal = now.getMonth() + 1;

  // 2. Parse selected year and month dynamically from input
  for (const part of parts) {
    const num = Number(part);
    if (!isNaN(num)) {
      if (num >= 1900 && num <= 2100) {
        year = num; // Dynamically sets the selected year (e.g., 2026 -> 26)
      } else if (num >= 1 && num <= 12) {
        monthVal = num; // Dynamically sets selected month if numeric (e.g., 09)
      }
    } else {
      const upper = part.toUpperCase();
      const idx = monthsList.findIndex((m) => m === upper || m.startsWith(upper.slice(0, 3)));
      if (idx !== -1) {
        monthVal = idx + 1; // Dynamically sets selected month (e.g., September -> 09)
      }
    }
  }

  const mm = String(monthVal).padStart(2, '0');
  const yy = String(year).slice(-2);
  const seqNum = Number(slipSequence) || 1;
  const seqStr = String(seqNum).padStart(3, '0');

  // Format: <employeeCode><MM><YY><SLIP_NO>
  // e.g. EMP10926001 or X0010926001
  return `${cleanEmpCode}${mm}${yy}${seqStr}`;
};
