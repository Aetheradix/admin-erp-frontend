//

import { forwardRef } from 'react';
// import arxLogoFromAssets from '../../assets/ARX_Logo_White_v3.webp';
import arxLogoFromAssets from '@/assets/ARX_Logo_White_v3.webp';
/* =========================================================
   TYPES
========================================================= */

export interface EarningsItem {
  id?: string;
  name: string;
  amount: number;
}

export interface DeductionItem {
  id?: string;
  name: string;
  amount: number;
}

export interface SalarySlipData {
  monthYear: string;
  paySlipNo: string;
  payPeriod: string;

  companyName: string;
  companyAddress: string;

  employeeId: string;
  employeeName: string;
  position: string;
  accountNumber: string;

  paidDays: number;
  lopDays: number;

  generatedOn: string;

  earnings: EarningsItem[];
  deductions: DeductionItem[];

  authorizedSignatory: string;
  signatoryRole: string;

  hrNote: string;

  /**
   * Optional values from the new design
   */
  currencySymbol?: string;
  watermarkText?: string;
  netPayInWords?: string;
}

interface SalarySlipTemplateProps {
  data: SalarySlipData;
}

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount: number, currencySymbol = '₹'): string => {
  const value = Number(amount || 0);

  return `${currencySymbol}${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

const getAmountInWords = (amount: number): string => {
  if (amount === 0) return 'Zero Rupees Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertBelowThousand = (num: number): string => {
    let result = '';

    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)];

      if (num % 10) {
        result += ` ${ones[num % 10]}`;
      }
    } else if (num > 0) {
      result += ones[num];
    }

    return result.trim();
  };

  let number = Math.floor(Math.abs(amount));

  const parts: string[] = [];

  const crore = Math.floor(number / 10000000);
  number %= 10000000;

  const lakh = Math.floor(number / 100000);
  number %= 100000;

  const thousand = Math.floor(number / 1000);
  number %= 1000;

  if (crore) {
    parts.push(`${convertBelowThousand(crore)} Crore`);
  }

  if (lakh) {
    parts.push(`${convertBelowThousand(lakh)} Lakh`);
  }

  if (thousand) {
    parts.push(`${convertBelowThousand(thousand)} Thousand`);
  }

  if (number) {
    parts.push(convertBelowThousand(number));
  }

  return `${parts.join(' ')} Rupees Only`;
};

/* =========================================================
   MAIN TEMPLATE
========================================================= */

const SalarySlipTemplate = forwardRef<HTMLDivElement, SalarySlipTemplateProps>(({ data }, ref) => {
  const currencySymbol = data.currencySymbol || '₹';
  const watermarkText = data.watermarkText || 'ARX';

  const totalEarnings = data.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDeductions = data.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netPay = totalEarnings - totalDeductions;

  const netPayInWords = data.netPayInWords || getAmountInWords(netPay);

  /*
   * Keep both tables the same height.
   * Minimum of 4 rows as in the new design.
   */
  const maxRows = Math.max(4, data.earnings.length, data.deductions.length);

  const paddedEarnings = [...data.earnings];

  while (paddedEarnings.length < maxRows) {
    paddedEarnings.push({
      id: `padding-earning-${paddedEarnings.length}`,
      name: '',
      amount: 0,
    });
  }

  const paddedDeductions = [...data.deductions];

  while (paddedDeductions.length < maxRows) {
    paddedDeductions.push({
      id: `padding-deduction-${paddedDeductions.length}`,
      name: '',
      amount: 0,
    });
  }

  return (
    <div
      ref={ref}
      className="salary-statement-paper"
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#ffffff',
        color: '#111111',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="paper-inner"
        style={{
          width: '100%',
          minHeight: '100%',
          boxSizing: 'border-box',
          padding: '38px 42px 34px',
          position: 'relative',
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="preview-header-exact"
          style={{
            position: 'relative',
            marginBottom: '22px',
          }}
        >
          <div
            className="header-gray-strip"
            style={{
              minHeight: '128px',
              background: '#eeeeee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              position: 'relative',
            }}
          >
            {/* LEFT: SALARY STATEMENT */}

            <div
              className="header-left-title-box"
              style={{
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: '250px',
              }}
            >
              <h1
                className="header-title-salary"
                style={{
                  margin: 0,
                  fontSize: '31px',
                  lineHeight: '0.95',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                }}
              >
                SALARY
              </h1>

              <h2
                className="header-title-statement"
                style={{
                  margin: '2px 0 7px',
                  fontSize: '27px',
                  lineHeight: '1',
                  fontWeight: 400,
                  letterSpacing: '-0.8px',
                }}
              >
                STATEMENT
              </h2>

              <div
                className="header-title-month"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  color: '#444444',
                }}
              >
                {data.monthYear || 'JUNE 2026'}
              </div>
            </div>

            {/* RIGHT: LOGO + COMPANY */}

            <div
              className="header-right-company-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '390px',
                justifyContent: 'flex-end',
              }}
            >
              {/* ARX LOGO */}

              <div
                className="arx-black-logo-box"
                style={{
                  width: '105px',
                  height: '105px',
                  background: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginRight: '17px',
                }}
              >
                <img
                  src={arxLogoFromAssets}
                  alt={data.companyName || 'ARX'}
                  className="arx-logo-img-asset"
                  style={{
                    width: '72px',
                    maxHeight: '72px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* COMPANY */}

              <div
                className="company-text-info"
                style={{
                  width: '205px',
                  paddingRight: '12px',
                }}
              >
                <h3
                  className="company-title-text"
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    lineHeight: '1.2',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    wordBreak: 'break-word',
                  }}
                >
                  {data.companyName || 'A E T H E R A D I X'}
                </h3>

                <p
                  className="company-address-text"
                  style={{
                    margin: '7px 0 0',
                    fontSize: '9px',
                    lineHeight: '1.45',
                    color: '#555555',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {data.companyAddress ||
                    'F-N 507, Crystal Tower, IBD Kings Park,\nBawadia Kalan, Bhopal, MP | 462039'}
                </p>
              </div>
            </div>
          </div>

          {/* HEADER BOTTOM */}

          <div
            className="header-bottom-row"
            style={{
              height: '35px',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              className="header-bottom-line"
              style={{
                height: '2px',
                background: '#111111',
                width: '100%',
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}
            />

            <div
              className="payslip-no-black-badge"
              style={{
                position: 'absolute',
                right: 0,
                bottom: '-1px',
                background: '#111111',
                color: '#ffffff',
                minWidth: '180px',
                height: '28px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                fontSize: '10px',
              }}
            >
              <span className="ps-label" style={{ fontWeight: 400 }}>
                Pay Slip No.
              </span>

              <span className="ps-colon">:</span>

              <span className="ps-value" style={{ fontWeight: 700 }}>
                {data.paySlipNo || '0626001'}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            EMPLOYEE / PAY META
        ================================================= */}

        <div
          className="preview-meta-grid"
          style={{
            marginBottom: '20px',
          }}
        >
          <div
            className="meta-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '28px',
            }}
          >
            <MetaItem label="Pay Period" value={data.payPeriod || '01 June - 30 June'} />

            <MetaItem label="Employee ID" value={data.employeeId || 'X001'} />
          </div>

          <div
            className="meta-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '28px',
            }}
          >
            <MetaItem
              label="Employee Name"
              value={data.employeeName || 'Pratyush Srivastava'}
              bold
            />

            <MetaItem label="Position" value={data.position || 'Director'} bold />
          </div>
        </div>

        {/* =================================================
            EARNINGS / DEDUCTIONS
        ================================================= */}

        <div
          className="preview-tables-container"
          style={{
            position: 'relative',
            marginBottom: '20px',
          }}
        >
          {/* WATERMARK */}

          <div
            className="table-watermark"
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox="0 0 400 200"
              className="watermark-svg"
              style={{
                width: '100%',
                height: '220px',
              }}
            >
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#1a1a1a"
                opacity="0.06"
                fontSize="140"
                fontWeight="900"
                fontFamily="Arial, Helvetica, sans-serif"
                letterSpacing="8"
              >
                {watermarkText}
              </text>
            </svg>
          </div>

          <div
            className="tables-flex-row"
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
            }}
          >
            {/* ================= EARNINGS ================= */}

            <SalaryTable
              title="EARNINGS"
              rows={paddedEarnings}
              totalLabel="Total Earnings"
              total={totalEarnings}
              currencySymbol={currencySymbol}
            />

            {/* ================= DEDUCTIONS ================= */}

            <div>
              <SalaryTable
                title="DEDUCTIONS"
                rows={paddedDeductions}
                totalLabel="Total Deduction"
                total={totalDeductions}
                currencySymbol={currencySymbol}
              />

              {/* NET PAY */}

              <div
                className="table-netpay-row"
                style={{
                  background: '#111111',
                  color: '#ffffff',
                  minHeight: '51px',
                  padding: '0 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  className="netpay-label"
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  Net Pay
                </span>

                <span
                  className="netpay-amount"
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(netPay, currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TOTALS / NET PAY
        ================================================= */}

        <div
          className="preview-totals-section"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 235px',
            gap: '22px',
            marginBottom: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* LEFT */}

          <div
            className="totals-left"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <DetailRow label="Generated On" value={data.generatedOn || '01 July, 2026'} />

            <DetailRow label="Account Number" value={data.accountNumber || '005501040352'} />

            {/* AMOUNT IN WORDS */}

            <div
              className="in-words-box"
              style={{
                marginTop: '14px',
                border: '1px solid #d5d5d5',
                padding: '10px 12px',
                background: '#fafafa',
              }}
            >
              <span
                className="in-words-title"
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#555555',
                  marginBottom: '5px',
                }}
              >
                Amount in Words:
              </span>

              <span
                className="in-words-text"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  lineHeight: '1.4',
                }}
              >
                {netPayInWords}
              </span>
            </div>
          </div>

          {/* RIGHT NET PAY CARD */}

          <div
            className="totals-right"
            style={{
              display: 'flex',
            }}
          >
            <div
              className="net-pay-card"
              style={{
                width: '100%',
                background: '#111111',
                color: '#ffffff',
                padding: '16px 18px',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="net-pay-amount"
                style={{
                  fontSize: '25px',
                  fontWeight: 800,
                  lineHeight: '1.1',
                }}
              >
                {formatCurrency(netPay, currencySymbol)}
              </div>

              <div
                className="net-pay-subtext"
                style={{
                  marginTop: '3px',
                  fontSize: '9px',
                  color: '#bdbdbd',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Total Net Pay
              </div>

              <div
                className="card-divider"
                style={{
                  height: '1px',
                  background: '#444444',
                  margin: '12px 0',
                }}
              />

              <DaysRow label="Paid Days" value={String(data.paidDays ?? 22).padStart(2, '0')} />

              <DaysRow label="LOP Days" value={String(data.lopDays ?? 0).padStart(2, '0')} />
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="preview-footer-section"
          style={{
            marginTop: '20px',
          }}
        >
          <div
            className="footer-line"
            style={{
              height: '1px',
              background: '#111111',
              marginBottom: '14px',
            }}
          />

          <div
            className="footer-cols"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px',
            }}
          >
            {/* SIGNATORY */}

            <div className="footer-col-left">
              <div
                className="signatory-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '112px 10px 1fr',
                  fontSize: '10px',
                  lineHeight: '1.5',
                }}
              >
                <span
                  className="sign-label"
                  style={{
                    color: '#555555',
                  }}
                >
                  Authorized Signatory
                </span>

                <span className="sign-colon">:</span>

                <span
                  className="sign-value"
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {data.authorizedSignatory || 'Seema Srivastava'}

                  <br />

                  <small
                    className="sign-title"
                    style={{
                      color: '#555555',
                      fontWeight: 400,
                    }}
                  >
                    {data.signatoryRole || '(Director)'}
                  </small>
                </span>
              </div>
            </div>

            {/* HR NOTE */}

            <div className="footer-col-right">
              <div
                className="hr-note-box"
                style={{
                  fontSize: '10px',
                  lineHeight: '1.45',
                }}
              >
                <span
                  className="hr-note-title"
                  style={{
                    fontWeight: 800,
                  }}
                >
                  HR Note :
                </span>

                <p
                  className="hr-note-text"
                  style={{
                    margin: '4px 0 0',
                    color: '#555555',
                  }}
                >
                  {data.hrNote ||
                    'For any discrepancies, please contact the HR department within 3 working days.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* =========================================================
   SUB COMPONENTS
========================================================= */

interface MetaItemProps {
  label: string;
  value: string;
  bold?: boolean;
}

function MetaItem({ label, value, bold = false }: MetaItemProps) {
  return (
    <div
      className="meta-col"
      style={{
        display: 'grid',
        gridTemplateColumns: '92px 10px 1fr',
        alignItems: 'baseline',
        padding: '3px 0',
        fontSize: '10px',
      }}
    >
      <span
        className="meta-label"
        style={{
          color: '#666666',
        }}
      >
        {label}
      </span>

      <span className="meta-colon">:</span>

      <span
        className={`meta-value ${bold ? 'font-bold' : ''}`}
        style={{
          fontWeight: bold ? 700 : 400,
          wordBreak: 'break-word',
        }}
      >
        {value || '-'}
      </span>
    </div>
  );
}

/* =========================================================
   SALARY TABLE
========================================================= */

interface SalaryTableProps {
  title: string;
  rows: EarningsItem[] | DeductionItem[];
  totalLabel: string;
  total: number;
  currencySymbol: string;
}

function SalaryTable({ title, rows, totalLabel, total, currencySymbol }: SalaryTableProps) {
  return (
    <div
      className="table-col"
      style={{
        border: '1px solid #111111',
        background: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="table-header-bar"
        style={{
          height: '31px',
          background: '#111111',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 13px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </div>

      <div className="table-body">
        {rows.map((item, index) => (
          <div
            key={item.id || `${title}-${item.name}-${index}`}
            className="table-row"
            style={{
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 13px',
              borderBottom: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              fontSize: '10px',
            }}
          >
            <span
              className="item-name"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: '10px',
              }}
            >
              {item.name}
            </span>

            <span
              className="item-amount"
              style={{
                flexShrink: 0,
                fontWeight: item.name ? 600 : 400,
              }}
            >
              {item.name ? formatCurrency(item.amount, currencySymbol) : ''}
            </span>
          </div>
        ))}
      </div>

      <div
        className="table-total-row"
        style={{
          minHeight: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 13px',
          background: '#eeeeee',
          fontSize: '10px',
          fontWeight: 800,
        }}
      >
        <span className="total-label">{totalLabel}</span>

        <span className="total-amount">{formatCurrency(total, currencySymbol)}</span>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="detail-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '105px 10px 1fr',
        alignItems: 'baseline',
        minHeight: '25px',
        fontSize: '10px',
      }}
    >
      <span
        className="detail-label"
        style={{
          color: '#555555',
        }}
      >
        {label}
      </span>

      <span className="detail-colon">:</span>

      <span
        className="detail-value"
        style={{
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        {value || '-'}
      </span>
    </div>
  );
}

/* =========================================================
   DAYS ROW
========================================================= */

function DaysRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="days-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '65px 8px 1fr',
        fontSize: '9px',
        lineHeight: '1.8',
      }}
    >
      <span
        className="days-label"
        style={{
          color: '#bbbbbb',
        }}
      >
        {label}
      </span>

      <span className="days-colon">:</span>

      <span
        className="days-value"
        style={{
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}

SalarySlipTemplate.displayName = 'SalarySlipTemplate';

export default SalarySlipTemplate;
