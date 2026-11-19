import arxLogoFromAssets from '@/assets/ARX_Logo_White_v9SVG.svg';
import type { InvoiceForm } from '../../types';

interface InvoiceHeaderProps {
  invoice: InvoiceForm;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#111827',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}>
          <img
            src={arxLogoFromAssets}
            alt={invoice.companyName || 'AETHERADIX'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              lineHeight: '1.2',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.5px',
            }}>
            {invoice.companyName || 'AETHERADIX'}
          </h2>
          {invoice.companyContact && (
            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
              {invoice.companyContact}
            </p>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'Courier New, monospace',
            fontSize: '48px',
            lineHeight: '1.1',
            fontWeight: 700,
            color: '#111827',
            whiteSpace: 'nowrap',
          }}>
          TAX INVOICE
        </h1>

        <p
          style={{
            margin: '12px 0 0 0',
            fontFamily: 'Courier New, monospace',
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
          }}>
          INVOICE# {invoice.invoiceNumber}
        </p>
      </div>
    </div>
  );
}
