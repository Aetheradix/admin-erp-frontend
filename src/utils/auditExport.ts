/**
 * Audit Log Retention & Export Utility
 * Enforces a strict 3-month (90-day) retention policy and provides
 * client-side Excel (.xls) and CSV (.csv) exports for Payroll and Invoice audit logs.
 */

export const THREE_MONTHS_DAYS = 90;
export const THREE_MONTHS_MS = THREE_MONTHS_DAYS * 24 * 60 * 60 * 1000;

/**
 * Returns the exact cutoff Date and timestamp for the 3-month retention window.
 */
export function getThreeMonthsCutoff(): {
  cutoffDate: Date;
  cutoffTimestamp: number;
  formattedLabel: string;
} {
  const cutoffDate = new Date(Date.now() - THREE_MONTHS_MS);
  const cutoffTimestamp = cutoffDate.getTime();
  const formattedLabel = cutoffDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { cutoffDate, cutoffTimestamp, formattedLabel };
}

/**
 * Filters an array of log items to only those within the last 3 months.
 */
export function filterLogsByRetention<T>(
  logs: T[],
  dateGetter?: (item: T) => string | number | Date | null | undefined
): T[] {
  if (!Array.isArray(logs)) return [];
  const { cutoffTimestamp } = getThreeMonthsCutoff();

  return logs.filter((item) => {
    if (!item) return false;
    let rawDate: any = dateGetter ? dateGetter(item) : undefined;

    if (!rawDate) {
      const record = item as any;
      rawDate =
        record.createdAt ||
        record.created_at ||
        record.timestamp ||
        record.date ||
        record.updatedAt;
    }

    if (!rawDate) return true; // keep if no date property present

    const time = new Date(rawDate).getTime();
    if (isNaN(time)) return true;
    return time >= cutoffTimestamp;
  });
}

/**
 * Prunes entries older than 3 months from a localStorage key.
 */
export function pruneLocalStorageLogs(key: string, dateProp = 'createdAt'): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const { cutoffTimestamp } = getThreeMonthsCutoff();
    const filtered = parsed.filter((entry: any) => {
      const d = entry?.[dateProp] || entry?.timestamp || entry?.created_at;
      if (!d) return true;
      const t = new Date(d).getTime();
      return isNaN(t) || t >= cutoffTimestamp;
    });

    if (filtered.length !== parsed.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch {
    // Ignore storage pruning errors
  }
}

export interface ExportDataOptions {
  filename: string;
  sheetName?: string;
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Triggers browser download of a generated file.
 */
function downloadFile(content: BlobPart, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports data into standard RFC 4180 CSV with UTF-8 BOM so Excel opens it with proper characters.
 */
export function exportToCsv({ filename, headers, rows }: ExportDataOptions): void {
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  downloadFile(csvContent, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports data into a rich HTML/XML Spreadsheet (.xls) compatible with Excel, Sheets, and Numbers.
 */
export function exportToExcel({
  filename,
  sheetName = 'Audit Logs',
  title,
  subtitle,
  headers,
  rows,
}: ExportDataOptions): void {
  const sanitize = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const headerCells = headers
    .map(
      (h) =>
        `<th style="background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 11pt; padding: 10px 14px; border: 1px solid #334155; text-align: left;">${sanitize(h)}</th>`
    )
    .join('');

  const bodyRows = rows
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = row
        .map(
          (c) =>
            `<td style="background-color: ${bg}; color: #1e293b; font-size: 10pt; padding: 8px 12px; border: 1px solid #e2e8f0;">${sanitize(c)}</td>`
        )
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sanitize(sheetName)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          .report-title { font-size: 16pt; font-weight: bold; color: #0f172a; padding: 6px 0; }
          .report-sub { font-size: 10pt; color: #64748b; padding-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="report-title">${sanitize(title)}</div>
        ${subtitle ? `<div class="report-sub">${sanitize(subtitle)}</div>` : ''}
        <table>
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(
    '\uFEFF' + excelHtml,
    filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

/**
 * Format timestamp into clean date string.
 */
function formatLogDate(val: any): string {
  if (!val) return '---';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Specialized exporter for Payroll Audit Logs (3-Month Window).
 */
export function exportPayrollAuditLogs(
  logs: any[],
  format: 'excel' | 'csv' = 'excel'
): void {
  const filtered = filterLogsByRetention(logs);
  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Payroll_Audit_Logs_3Months_${nowStr}`;
  const { formattedLabel } = getThreeMonthsCutoff();

  const headers = ['Timestamp', 'Action', 'Description / Details', 'Admin / User', 'Status'];
  const rows = filtered.map((l: any) => [
    formatLogDate(l.createdAt || l.created_at || l.timestamp),
    l.action || 'PAYROLL_ACTION',
    l.description || l.details || 'Payroll modification recorded',
    l.username || l.user || 'System',
    l.status || 'Success',
  ]);

  const options: ExportDataOptions = {
    filename,
    sheetName: 'Payroll Logs',
    title: 'Payroll Audit Logs Report',
    subtitle: `Stored Retention: 3 Months (Records from ${formattedLabel} to ${nowStr}) • Total Records: ${filtered.length}`,
    headers,
    rows,
  };

  if (format === 'csv') {
    exportToCsv(options);
  } else {
    exportToExcel(options);
  }
}

/**
 * Specialized exporter for Invoice Audit Logs (3-Month Window).
 */
export function exportInvoiceAuditLogs(
  logs: any[],
  format: 'excel' | 'csv' = 'excel'
): void {
  const filtered = filterLogsByRetention(logs);
  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `Invoice_Audit_Logs_3Months_${nowStr}`;
  const { formattedLabel } = getThreeMonthsCutoff();

  const headers = ['Timestamp', 'Action', 'Description / Details', 'Admin / User', 'Invoice Ref'];
  const rows = filtered.map((l: any) => [
    formatLogDate(l.createdAt || l.created_at || l.timestamp),
    l.action || 'INVOICE_ACTION',
    l.description || l.details || 'Invoice operation recorded',
    l.username || l.user || 'System',
    l.invoiceId || l.target || 'N/A',
  ]);

  const options: ExportDataOptions = {
    filename,
    sheetName: 'Invoice Logs',
    title: 'Invoice Audit Logs Report',
    subtitle: `Stored Retention: 3 Months (Records from ${formattedLabel} to ${nowStr}) • Total Records: ${filtered.length}`,
    headers,
    rows,
  };

  if (format === 'csv') {
    exportToCsv(options);
  } else {
    exportToExcel(options);
  }
}
