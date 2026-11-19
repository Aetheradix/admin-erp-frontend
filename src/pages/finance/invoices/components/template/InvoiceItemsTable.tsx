import type { InvoiceItem } from '../../types';
import { formatInvoiceCurrency } from './utils';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <table
      style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '40px',
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '18px',
      }}>
      <thead>
        <tr style={{ borderTop: '2px solid #D1D5DB', borderBottom: '2px solid #D1D5DB' }}>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>Description</th>
          <th style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>Qty</th>
          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>Rate</th>
          <th style={{ padding: '12px', textAlign: 'right', fontWeight: 700 }}>Amount</th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => {
          const amount = Number(item.quantity || 0) * Number(item.rate || 0);

          return (
            <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '12px' }}>{item.description}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                {formatInvoiceCurrency(item.rate)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{formatInvoiceCurrency(amount)}</td>
            </tr>
          );
        })}

        {items.length === 0 && (
          <tr>
            <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
              No invoice items
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
