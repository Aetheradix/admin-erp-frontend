import { forwardRef } from 'react';
import type { InvoiceForm, InvoiceTotals } from '../types';
import { computeInvoiceTotals } from '../payloads';
import { InvoiceHeader } from './template/InvoiceHeader';
import { InvoiceParties } from './template/InvoiceParties';
import { InvoiceItemsTable } from './template/InvoiceItemsTable';
import { InvoiceTotalsBlock } from './template/InvoiceTotalsBlock';
import { InvoiceNotesFooter } from './template/InvoiceNotesFooter';

interface InvoiceTemplateProps {
  invoice: InvoiceForm;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice }, ref) => {
  const items = Array.isArray(invoice?.items) ? invoice.items : [];
  const totals: InvoiceTotals = computeInvoiceTotals(items, Number(invoice?.gstRate || 0));

  return (
    <div
      style={{
        width: '794px',
        backgroundColor: '#FFFFFF',
        padding: '0',
        margin: '0',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
      <div
        ref={ref}
        data-invoice-template="true"
        style={{
          position: 'relative',
          width: '794px',
          minHeight: '1123px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          padding: '53px',
          color: '#111827',
        }}>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '180px',
            lineHeight: '1',
            fontWeight: 900,
            color: '#EFF6FF',
            opacity: 0.6,
            pointerEvents: 'none',
            zIndex: 0,
          }}>
          ARX
        </div>

        <InvoiceHeader invoice={invoice} />
        <InvoiceParties invoice={invoice} />
        <InvoiceItemsTable items={items} />
        <InvoiceTotalsBlock totals={totals} gstRate={invoice.gstRate} />
        <InvoiceNotesFooter notes={invoice.notes} />
      </div>
    </div>
  );
});

export default InvoiceTemplate;
