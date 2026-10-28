/**
 * Utility functions for payroll and salary slip generation.
 */

/**
 * Formats an employee code to extract the core identifier and normalize digits.
 * Strips prefixes like 'SLIP-', 'EMP-', 'EMP_', 'EMP', 'E-', 'E_'.
 * If purely numeric, pads with leading zeros to at least 3 digits.
 * e.g.:
 * - '002' -> '002'
 * - '2' -> '002'
 * - 'EMP-002' -> '002'
 * - 'EMP002' -> '002'
 * - 'E002' -> '002'
 * - 'E-002' -> '002'
 * - '105' -> '105'
 */
export const formatEmployeeCode = (employeeCode?: string | number | null): string => {
  if (employeeCode === undefined || employeeCode === null) return '';
  const str = String(employeeCode).trim();
  if (!str) return '';

  // 1. Remove prefixes like 'SLIP-', 'EMP-', 'EMP_', 'EMP', 'E-', 'E_'
  let cleaned = str
    .replace(/^SLIP[-_]?/i, '')
    .replace(/^EMP[-_]?/i, '')
    .replace(/^E[-_]/i, '');

  // 2. If it still starts with 'E' followed by digits (e.g. 'E002' or 'E2'), strip the 'E'
  if (/^E\d+$/i.test(cleaned)) {
    cleaned = cleaned.substring(1);
  }

  // 3. If purely numeric, pad to at least 3 digits (e.g. '2' -> '002', '12' -> '012', '002' -> '002', '102' -> '102')
  if (/^\d+$/.test(cleaned)) {
    cleaned = cleaned.padStart(3, '0');
  }

  return cleaned || '001';
};

/**
 * Parses a payslip number formatted as E<EMP_CODE>-<MM><YY><SLIP_NO>
 * e.g., 'E002-0926001' -> { employeeCode: '002', month: '09', year: '26', slipNo: '001', sequence: 1 }
 */
export const parseSlipNumber = (
  slipNumber?: string | null
): { employeeCode: string; month: string; year: string; slipNo: string; sequence: number } | null => {
  if (!slipNumber) return null;
  const trimmed = String(slipNumber).trim();
  const match = trimmed.match(/^E([A-Za-z0-9]+)-(\d{2})(\d{2})(\d{3})$/);
  if (!match) return null;
  return {
    employeeCode: match[1],
    month: match[2],
    year: match[3],
    slipNo: match[4],
    sequence: parseInt(match[4], 10),
  };
};

/**
 * Generates payslip number according to the format:
 * E<EMP_CODE>-<MM><YY><SLIP_NO>
 * e.g., E002-0926001
 * where 002 is employee code, 09 is month, 26 is year, 001 is slip no (which can change to 002, 003, etc.)
 *
 * @param employeeCode Employee code directly from user/database (e.g. 002, EMP-002, 2, E002)
 * @param monthYearStr Month and year string or pay period (e.g. "SEPTEMBER 2026", "2026-09", "09/2026")
 * @param slipSequence Slip sequence number (default 1, produces "001", or 2 for "002", 3 for "003", etc.)
 */
export const generateSlipNumber = (
  employeeCode?: string | number | null,
  monthYearStr?: string | null,
  slipSequence: number | string = 1
): string => {
  if (!employeeCode) return '';

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

  // Format: E<EMP_CODE>-<MM><YY><SLIP_NO>
  return `E${cleanEmpCode}-${mm}${yy}${seqStr}`;
};
