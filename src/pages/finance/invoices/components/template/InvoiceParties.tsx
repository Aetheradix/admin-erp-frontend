import type { InvoiceForm } from '../../types';
import { formatInvoiceDate } from './utils';

interface InvoicePartiesProps {
  invoice: InvoiceForm;
}

export function InvoiceParties({ invoice }: InvoicePartiesProps) {
  return (
    <>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '40px',
          fontSize: '18px',
          lineHeight: '28px',
        }}>
        {invoice.companyName && <p style={{ margin: 0, fontWeight: 700 }}>{invoice.companyName}</p>}

        {invoice.companyContact && <p style={{ margin: 0 }}>{invoice.companyContact}</p>}

        {invoice.companyAddress && <p style={{ margin: 0 }}>{invoice.companyAddress}</p>}

        {invoice.companyCity && <p style={{ margin: 0 }}>{invoice.companyCity}</p>}

        {(invoice.companyState || invoice.companyCountry || invoice.companyPincode) && (
          <p style={{ margin: 0 }}>
            {[invoice.companyState, invoice.companyCountry].filter(Boolean).join(', ')}

            {invoice.companyPincode && ` - ${invoice.companyPincode}`}
          </p>
        )}

        {invoice.companyGSTIN && <p style={{ margin: 0 }}>GSTIN: {invoice.companyGSTIN}</p>}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '40px',
          fontSize: '18px',
          lineHeight: '28px',
        }}>
        <h3 style={{ margin: 0, fontWeight: 700 }}>Bill To:</h3>

        {invoice.billToName && <p style={{ margin: 0 }}>{invoice.billToName}</p>}

        {invoice.billToPhone && (
          <p style={{ margin: 0, fontSize: '16px', color: '#374151' }}>
            Phone: {invoice.billToPhone}
          </p>
        )}

        {invoice.billToAddress && <p style={{ margin: 0 }}>{invoice.billToAddress}</p>}

        {(invoice.billToCity || invoice.billToState) && (
          <p style={{ margin: 0 }}>
            {[invoice.billToCity, invoice.billToState].filter(Boolean).join(', ')}
          </p>
        )}

        {invoice.billToCountry && <p style={{ margin: 0 }}>{invoice.billToCountry}</p>}

        {invoice.billToPincode && <p style={{ margin: 0 }}>{invoice.billToPincode}</p>}

        {invoice.billToGSTIN && <p style={{ margin: 0 }}>GSTIN: {invoice.billToGSTIN}</p>}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '18px',
          lineHeight: '28px',
        }}>
        <div>
          <p style={{ margin: 0 }}>
            Invoice Date:{' '}
            <span style={{ fontWeight: 700 }}>{formatInvoiceDate(invoice.invoiceDate)}</span>
          </p>

          <p style={{ margin: 0 }}>
            Due Date: <span style={{ fontWeight: 700 }}>{formatInvoiceDate(invoice.dueDate)}</span>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}>Place of Supply:</p>

          <p style={{ margin: 0, fontWeight: 700 }}>{invoice.placeOfSupply}</p>
        </div>
      </div>
    </>
  );
}
