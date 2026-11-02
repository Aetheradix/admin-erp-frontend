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
export const PAYROLL_SLIP_NO_STORAGE_KEY = 'aether_erp_payroll_slip_no_overrides';

/**
 * Retrieves all stored slip number overrides from localStorage.
 */
export const getPayrollSlipNoOverrides = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(PAYROLL_SLIP_NO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Saves a slip number override for a given key in localStorage.
 */
export const setPayrollSlipNoOverride = (key: string | number, slipNo: string) => {
  if (!key || !slipNo) return;
  try {
    const current = getPayrollSlipNoOverrides();
    current[String(key)] = String(slipNo).trim();
    localStorage.setItem(PAYROLL_SLIP_NO_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save payroll slip number override:', e);
  }
};

/**
 * Helper to save slip number under multiple lookup keys (id, empCode_monthYear, userId_monthYear).
 */
export const saveSlipNumberOverrides = (
  slipNo: string,
  options: {
    id?: string | number;
    empCode?: string | number | null;
    userId?: string | number | null;
    monthYear?: string | null;
    month?: number | string | null;
    year?: number | string | null;
  }
) => {
  if (!slipNo) return;
  const cleanSlipNo = String(slipNo).trim();
  if (options.id) {
    setPayrollSlipNoOverride(String(options.id), cleanSlipNo);
  }
  const cleanCode = options.empCode ? formatEmployeeCode(options.empCode) : '';
  const my = options.monthYear ? String(options.monthYear).trim() : '';
  if (cleanCode && my) {
    setPayrollSlipNoOverride(`${cleanCode}_${my}`, cleanSlipNo);
    setPayrollSlipNoOverride(`${cleanCode}_${my.toUpperCase()}`, cleanSlipNo);
  }
  if (options.userId && my) {
    setPayrollSlipNoOverride(`${options.userId}_${my}`, cleanSlipNo);
    setPayrollSlipNoOverride(`${options.userId}_${my.toUpperCase()}`, cleanSlipNo);
  }
  if (options.month && options.year) {
    const mStr = String(options.month).padStart(2, '0');
    const yStr = String(options.year).slice(-2);
    if (cleanCode) {
      setPayrollSlipNoOverride(`${cleanCode}_${mStr}_${yStr}`, cleanSlipNo);
    }
  }
};

/**
 * Extracts a slip number tagged in text (e.g. remarks or hr_note: '[SLIP_NO: EMP11026007]').
 */
export const extractSlipNoFromText = (text?: string | null): string | null => {
  if (!text || typeof text !== 'string') return null;
  const matches = [...text.matchAll(/\[SLIP_NO:\s*([^\]|]+)\]/gi)];
  if (matches.length > 0) {
    return matches[matches.length - 1][1].trim();
  }
  return null;
};

/**
 * Extracts a sequence number tagged in text (e.g. remarks or hr_note: '[SLIP_SEQ: 7]').
 */
export const extractSlipSeqFromText = (text?: string | null): number | null => {
  if (!text || typeof text !== 'string') return null;
  const matches = [...text.matchAll(/\[SLIP_SEQ:\s*(\d+)\]/gi)];
  if (matches.length > 0) {
    return parseInt(matches[matches.length - 1][1], 10);
  }
  return null;
};

/**
 * Parses a payslip number formatted as <EMPLOYEE_CODE><MM><YY><SLIP_NO>
 * e.g., 'EMP10926001' -> { employeeCode: 'EMP1', month: '09', year: '26', slipNo: '001', sequence: 1 }
 * e.g., 'X0010725007' -> { employeeCode: 'X001', month: '07', year: '25', slipNo: '007', sequence: 7 }
 * Also supports optional separator formats (e.g. 'EMP1-0926001', 'E002-0926001'), standalone digits ('007' or '7'), and legacy 'SLIP-...'
 */
export const parseSlipNumber = (
  slipNumber?: string | null
): { employeeCode: string; month: string; year: string; slipNo: string; sequence: number } | null => {
  if (!slipNumber) return null;
  const trimmed = String(slipNumber).trim();
  if (!trimmed) return null;

  // 0. Check if embedded in tags e.g. [SLIP_NO: EMP11026007]
  const tagSlip = extractSlipNoFromText(trimmed);
  if (tagSlip && tagSlip !== trimmed) {
    return parseSlipNumber(tagSlip);
  }

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
  // e.g. 'EMP10926001', 'X0010926001', 'EMP11026007'
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

  // 4. Standalone sequence digits e.g. '007', '7', '42'
  if (/^\d{1,4}$/.test(trimmed)) {
    const seq = parseInt(trimmed, 10);
    return {
      employeeCode: '',
      month: '',
      year: '',
      slipNo: String(seq).padStart(3, '0'),
      sequence: seq,
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

  // Format: <employeeCode>-<MM><YY><SLIP_NO>
  // e.g. EMP1-1026001 or X001-0926001 or EMP1-1026007
  return `${cleanEmpCode}-${mm}${yy}${seqStr}`;
};

/**
 * Normalizes any payslip number string to the standard dashed format:
 * <EMPLOYEE_CODE>-<MM><YY><SLIP_NO>
 * e.g., 'EMP11026001' -> 'EMP1-1026001'
 * e.g., 'EMP1-1026001' -> 'EMP1-1026001'
 * e.g., 'X0010725007' -> 'X001-0725007'
 */
export const normalizeToDashedSlipNumber = (slipNumber?: string | null): string => {
  if (!slipNumber) return '';
  const trimmed = String(slipNumber).trim();
  if (!trimmed) return '';

  const parsed = parseSlipNumber(trimmed);
  if (parsed && parsed.employeeCode && parsed.month && parsed.year && parsed.slipNo) {
    return `${parsed.employeeCode}-${parsed.month}${parsed.year}${parsed.slipNo}`;
  }
  return trimmed;
};

/**
 * Resolves the payslip number for a salary slip record, prioritizing:
 * 1. Saved localStorage override by slip ID, empCode_monthYear, or userId_monthYear.
 * 2. Explicit direct slip number properties on the record.
 * 3. Serialized [SLIP_NO: ...] in remarks or hr_note.
 * 4. Serialized [SLIP_SEQ: ...] in remarks or hr_note -> generates with that sequence.
 * 5. Explicit sequence property on record (e.g. slip_sequence, sequence).
 * 6. Dynamic fallback sequence passed by the caller (fallbackSequence) or defaults.
 */
export const extractSlipNumber = (
  item: any,
  fallbackSequence?: number
): string => {
  if (!item || typeof item !== 'object') return '';

  const id = item.id || item.salary_slip_id || item.slip_id;
  const rawEmpCode =
    item.employee_code ||
    item.employeeCode ||
    item.employee_id ||
    item.employeeId ||
    item.user_id ||
    item.userId ||
    '';
  const cleanEmpCode = formatEmployeeCode(rawEmpCode);

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
  let monthYearStr = String(item.monthYear || item.month_year || item.date || '').trim();
  if (!monthYearStr && item.pay_period_month && item.pay_period_year) {
    const mIdx = Number(item.pay_period_month) - 1;
    const mName = monthsList[mIdx] || 'OCTOBER';
    monthYearStr = `${mName} ${item.pay_period_year}`;
  }

  // 1. Check localStorage overrides
  const overrides = getPayrollSlipNoOverrides();
  if (id && overrides[String(id)]) {
    return normalizeToDashedSlipNumber(overrides[String(id)]);
  }
  if (cleanEmpCode && monthYearStr) {
    const key = `${cleanEmpCode}_${monthYearStr}`;
    if (overrides[key]) return normalizeToDashedSlipNumber(overrides[key]);
    if (overrides[key.toUpperCase()]) return normalizeToDashedSlipNumber(overrides[key.toUpperCase()]);
  }
  const uId = item.user_id || item.userId;
  if (uId && monthYearStr) {
    const key = `${uId}_${monthYearStr}`;
    if (overrides[key]) return normalizeToDashedSlipNumber(overrides[key]);
    if (overrides[key.toUpperCase()]) return normalizeToDashedSlipNumber(overrides[key.toUpperCase()]);
  }

  // 2. Check serialized tag in remarks or hr_note (the primary database persistence layer)
  const tagSlip =
    extractSlipNoFromText(item.remarks) ||
    extractSlipNoFromText(item.hr_note) ||
    extractSlipNoFromText(item.hrNote);
  if (tagSlip) return normalizeToDashedSlipNumber(tagSlip);

  // 3. Check serialized sequence in remarks or hr_note
  const tagSeq =
    extractSlipSeqFromText(item.remarks) ||
    extractSlipSeqFromText(item.hr_note) ||
    extractSlipSeqFromText(item.hrNote);
  if (tagSeq && tagSeq > 0) {
    return generateSlipNumber(cleanEmpCode || 'EMP1', monthYearStr, tagSeq);
  }

  // 4. Check explicit sequence fields on the record
  const explicitSeq = Number(
    item.slip_sequence || item.slipSequence || item.sequence || 0
  );
  if (explicitSeq && explicitSeq > 0) {
    return generateSlipNumber(cleanEmpCode || 'EMP1', monthYearStr, explicitSeq);
  }

  // 5. Check direct fields on the record
  const candidateSlip =
    item.paySlipNo ||
    item.pay_slip_no ||
    item.payslipNo ||
    item.payslip_no ||
    item.slipNo ||
    item.slip_no ||
    item.pay_slip_number ||
    item.payslip_number ||
    item.salary_slip_no ||
    item.salary_slip_number;

  if (candidateSlip && String(candidateSlip).trim() !== '' && String(candidateSlip).trim() !== 'null') {
    const trimmedCandidate = String(candidateSlip).trim();
    // If candidate defaulted to 001 but a distinct sequential fallback sequence is provided (>1),
    // prefer the sequential fallback so not everyone ends up with 001
    if (fallbackSequence && fallbackSequence > 1 && trimmedCandidate.endsWith('001')) {
      return generateSlipNumber(cleanEmpCode || 'EMP1', monthYearStr, fallbackSequence);
    }
    return normalizeToDashedSlipNumber(trimmedCandidate);
  }

  // 6. Final fallback sequence (e.g. index in the table) or default 1
  const effectiveSeq = fallbackSequence && fallbackSequence > 0 ? fallbackSequence : 1;
  return generateSlipNumber(cleanEmpCode || 'EMP1', monthYearStr, effectiveSeq);
};

