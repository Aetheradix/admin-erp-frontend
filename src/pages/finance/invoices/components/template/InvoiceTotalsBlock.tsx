import type { InvoiceTotals } from '../../types';
import { formatInvoiceCurrency } from './utils';

interface InvoiceTotalsBlockProps {
  totals: InvoiceTotals;
  gstRate: number;
}

export function InvoiceTotalsBlock({ totals, gstRate }: InvoiceTotalsBlockProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '32px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
      <div style={{ width: '320px', fontSize: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Sub Total</span>
          <span>{formatInvoiceCurrency(totals.subTotal)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span>GST ({gstRate}%)</span>
          <span>{formatInvoiceCurrency(totals.gstAmount)}</span>
        </div>

        <hr style={{ margin: '12px 0', border: 0, borderTop: '1px solid #D1D5DB' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '24px',
            fontWeight: 700,
          }}>
          <span>Total</span>
          <span>{formatInvoiceCurrency(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}
