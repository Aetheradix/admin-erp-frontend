import { forwardRef } from 'react';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceForm {
  invoiceNumber: string;

  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;

  companyName: string;
  companyContact: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  companyPincode: string;
  companyGSTIN: string;

  billToName: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToCountry: string;
  billToPincode: string;
  billToGSTIN: string;

  items: InvoiceItem[];

  gstRate: number;
  notes: string;
}

interface InvoiceTemplateProps {
  invoice: InvoiceForm;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice }, ref) => {
  /* =========================================================
       CALCULATIONS
    ========================================================= */

  const subTotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = (subTotal * Number(invoice.gstRate || 0)) / 100;

  const total = subTotal + gstAmount;

  /* =========================================================
       FORMATTERS
    ========================================================= */

  const formatCurrency = (value: number) => {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /* =========================================================
       STYLES
       IMPORTANT:
       Use HEX colors only.
       Do not use Tailwind color classes here.
    ========================================================= */

  const colors = {
    black: '#111827',
    dark: '#1F2937',
    gray: '#6B7280',
    lightGray: '#D1D5DB',
    veryLightGray: '#F3F4F6',
    white: '#FFFFFF',
    blue: '#E0F2FE',
    blueDark: '#BAE6FD',
  };

  /* =========================================================
       TEMPLATE
    ========================================================= */

  return (
    <div
      style={{
        width: '794px',
        backgroundColor: colors.white,
        padding: '0',
        margin: '0',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        ref={ref}
        style={{
          position: 'relative',
          width: '794px',
          minHeight: '1123px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          padding: '53px',
          color: colors.black,
        }}
      >
        {/* =====================================================
              WATERMARK
          ===================================================== */}

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
          }}
        >
          ARX
        </div>

        {/* =====================================================
              HEADER
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Logo */}

          <div>
            <div
              style={{
                backgroundColor: '#000000',
                color: colors.blueDark,
                fontSize: '90px',
                lineHeight: '1',
                fontWeight: 700,
                letterSpacing: '-2px',
                padding: '0 8px',
                display: 'inline-block',
              }}
            >
              ARX
            </div>

            <h2
              style={{
                margin: '8px 0 0 0',
                fontSize: '36px',
                lineHeight: '1.1',
                fontWeight: 700,
                color: '#BAE6FD',
              }}
            >
              AETHERADIX
            </h2>
          </div>

          {/* Invoice Title */}

          <div
            style={{
              textAlign: 'right',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: 'Courier New, monospace',
                fontSize: '48px',
                lineHeight: '1.1',
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
              }}
            >
              TAX INVOICE
            </h1>

            <p
              style={{
                margin: '12px 0 0 0',
                fontFamily: 'Courier New, monospace',
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              INVOICE# {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* =====================================================
              COMPANY DETAILS
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '40px',
            fontSize: '18px',
            lineHeight: '28px',
          }}
        >
          {invoice.companyName && (
            <p
              style={{
                margin: 0,
                fontWeight: 700,
              }}
            >
              {invoice.companyName}
            </p>
          )}

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

        {/* =====================================================
              BILL TO
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '40px',
            fontSize: '18px',
            lineHeight: '28px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontWeight: 700,
            }}
          >
            Bill To:
          </h3>

          {invoice.billToName && <p style={{ margin: 0 }}>{invoice.billToName}</p>}

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

        {/* =====================================================
              INVOICE INFORMATION
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            lineHeight: '28px',
          }}
        >
          <div>
            <p style={{ margin: 0 }}>
              Invoice Date:{' '}
              <span style={{ fontWeight: 700 }}>{formatDate(invoice.invoiceDate)}</span>
            </p>

            <p style={{ margin: 0 }}>
              Due Date: <span style={{ fontWeight: 700 }}>{formatDate(invoice.dueDate)}</span>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Place of Supply:</p>

            <p
              style={{
                margin: 0,
                fontWeight: 700,
              }}
            >
              {invoice.placeOfSupply}
            </p>
          </div>
        </div>

        {/* =====================================================
              ITEMS TABLE
          ===================================================== */}

        <table
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '40px',
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '18px',
          }}
        >
          <thead>
            <tr
              style={{
                borderTop: '2px solid #D1D5DB',
                borderBottom: '2px solid #D1D5DB',
              }}
            >
              <th
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  fontWeight: 700,
                }}
              >
                Description
              </th>

              <th
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                Qty
              </th>

              <th
                style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 700,
                }}
              >
                Rate
              </th>

              <th
                style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: 700,
                }}
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => {
              const amount = Number(item.quantity || 0) * Number(item.rate || 0);

              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  <td
                    style={{
                      padding: '12px',
                    }}
                  >
                    {item.description}
                  </td>

                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    {item.quantity}
                  </td>

                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(item.rate)}
                  </td>

                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(amount)}
                  </td>
                </tr>
              );
            })}

            {invoice.items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#9CA3AF',
                  }}
                >
                  No invoice items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* =====================================================
              TOTAL
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '320px',
              fontSize: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Sub Total</span>

              <span>{formatCurrency(subTotal)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
              }}
            >
              <span>GST ({invoice.gstRate}%)</span>

              <span>{formatCurrency(gstAmount)}</span>
            </div>

            <hr
              style={{
                margin: '12px 0',
                border: 0,
                borderTop: '1px solid #D1D5DB',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              <span>Total</span>

              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* =====================================================
              NOTES
          ===================================================== */}

        {invoice.notes && (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '64px',
              paddingTop: '20px',
              borderTop: '1px solid #D1D5DB',
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
              }}
            >
              Notes
            </p>

            <p
              style={{
                margin: '8px 0 0 0',
                color: '#6B7280',
              }}
            >
              {invoice.notes}
            </p>
          </div>
        )}

        {/* =====================================================
              FOOTER
          ===================================================== */}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '64px',
            paddingTop: '20px',
            borderTop: '1px solid #D1D5DB',
            textAlign: 'center',
            color: '#6B7280',
          }}
        >
          {invoice.notes || 'Thank you for your business'}
        </div>
      </div>
    </div>
  );
});

// InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
