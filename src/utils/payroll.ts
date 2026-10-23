/**
 * Utility functions for payroll and salary slip generation.
 */

/**
 * Generates payslip number according to the format:
 * SLIP-<EMP_CODE>-<YYYY><MM>
 * e.g., SLIP-EMP-001-202610
 *
 * @param employeeCode Employee code directly from the database (e.g. EMP-001, EMP004, 102)
 * @param monthYearStr Month and year string or pay period (e.g. "OCTOBER 2026", "2026-10", "10/2026")
 */
export const generateSlipNumber = (
  employeeCode?: string | number | null,
  monthYearStr?: string | null
): string => {
  const parts = String(monthYearStr || '').trim().split(/[\s\/\-]+/).filter(Boolean);
  const monthsList = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
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
        year = num; // Dynamically sets the selected year (e.g., 2026)
      } else if (num >= 1 && num <= 12) {
        monthVal = num; // Dynamically sets selected month if numeric (e.g., 10)
      }
    } else {
      const upper = part.toUpperCase();
      const idx = monthsList.findIndex((m) => m === upper || m.startsWith(upper.slice(0, 3)));
      if (idx !== -1) {
        monthVal = idx + 1; // Dynamically sets selected month (e.g., August -> 08)
      }
    }
  }

  const formattedMonth = String(monthVal).padStart(2, '0');

  // 3. Employee Code directly from the database without mutating or stripping prefixes
  let cleanEmpCode = String(employeeCode || '').trim();
  if (cleanEmpCode.toUpperCase().startsWith('SLIP-')) {
    cleanEmpCode = cleanEmpCode.replace(/^SLIP[-_]?/i, '');
  }
  if (!cleanEmpCode) {
    cleanEmpCode = 'EMP-001';
  }

  // Format: SLIP-<EMP_CODE>-<YYYY><MM>
  return `SLIP-${cleanEmpCode}-${year}${formattedMonth}`;
};
