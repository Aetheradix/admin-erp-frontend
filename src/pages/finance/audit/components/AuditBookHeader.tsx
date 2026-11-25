import { AlertCircle, BookOpen, CheckCircle, Download, Printer, RefreshCw } from 'lucide-react';
import { AUDIT_BOOK_YEARS, AUDIT_QUARTERS } from '../constants';

interface AuditBookHeaderProps {
  year: string;
  quarter: string;
  onYearChange: (year: string) => void;
  onQuarterChange: (quarter: string) => void;
  isGenerating: boolean;
  onExportPdf: () => void;
  onPrint: () => void;
}

const selectStyle = {
  padding: '9px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
} as const;

export function AuditBookHeader({
  year,
  quarter,
  onYearChange,
  onQuarterChange,
  isGenerating,
  onExportPdf,
  onPrint,
}: AuditBookHeaderProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#f1f5f9',
                  letterSpacing: '-0.5px',
                }}>
                Financial Audit Book
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                CA-grade financial ledger and audit trail
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            id="audit-year-select"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            style={selectStyle}>
            {AUDIT_BOOK_YEARS.map((option) => (
              <option key={option} value={option} style={{ background: '#1e293b' }}>
                {option}
              </option>
            ))}
          </select>

          <select
            id="audit-quarter-select"
            value={quarter}
            onChange={(e) => onQuarterChange(e.target.value)}
            style={selectStyle}>
            {AUDIT_QUARTERS.map((option) => (
              <option key={option} value={option} style={{ background: '#1e293b' }}>
                {option}
              </option>
            ))}
          </select>

          <button
            id="audit-export-pdf-btn"
            onClick={onExportPdf}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              cursor: isGenerating ? 'default' : 'pointer',
              fontWeight: 600,
              fontSize: 14,
              opacity: isGenerating ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}>
            {isGenerating ? (
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Download size={16} />
            )}
            {isGenerating ? 'Generating…' : 'Export PDF'}
          </button>

          <button
            id="audit-print-btn"
            onClick={onPrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontSize: 14,
            }}>
            <Printer size={16} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
          padding: '12px 20px',
          borderRadius: 12,
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
        <AlertCircle size={16} color="#6366f1" />
        <span style={{ fontSize: 13, color: '#94a3b8' }}>
          Audit Report for:{' '}
          <strong style={{ color: '#f1f5f9' }}>
            {quarter} {year}
          </strong>{' '}
          — Data is reconciled across Invoices, Expenses, Payroll, and Reimbursements.
        </span>
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#22c55e',
          }}>
          <CheckCircle size={13} />
          Live data
        </span>
      </div>
    </>
  );
}
