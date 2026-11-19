export function AuditDisclaimer() {
  return (
    <div
      style={{
        padding: '14px 20px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 12,
        color: '#475569',
        lineHeight: 1.6,
      }}>
      <strong style={{ color: '#64748b' }}>Disclaimer:</strong> This financial audit book is
      generated from ERP system data and is for internal reference purposes. Figures are subject to
      review and reconciliation by a Chartered Accountant. This document does not constitute a
      certified audit report. All monetary values are in Indian Rupees (INR).
    </div>
  );
}
