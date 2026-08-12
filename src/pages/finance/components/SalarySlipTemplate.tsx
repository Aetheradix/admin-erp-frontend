import  { forwardRef } from 'react';

export interface EarningsItem {
  name: string;
  amount: number;
}

export interface DeductionItem {
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
}

interface SalarySlipTemplateProps {
  data: SalarySlipData;
}

const SalarySlipTemplate = forwardRef<HTMLDivElement, SalarySlipTemplateProps>(({ data }, ref) => {
  const totalEarnings = data.earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDeductions = data.deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netSalary = totalEarnings - totalDeductions;

  return (
    <div
      ref={ref}
      className="bg-white text-black"
      style={{
        width: '794px',
        minHeight: '1123px',
        padding: '40px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          borderBottom: '2px solid #111',
          paddingBottom: '20px',
          marginBottom: '25px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                margin: 0,
              }}
            >
              {data.companyName}
            </h1>

            <p
              style={{
                fontSize: '12px',
                color: '#555',
                marginTop: '8px',
                maxWidth: '400px',
              }}
            >
              {data.companyAddress}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h2
              style={{
                fontSize: '22px',
                margin: 0,
                fontWeight: 700,
              }}
            >
              SALARY SLIP
            </h2>

            <p
              style={{
                fontSize: '12px',
                color: '#555',
                marginTop: '8px',
              }}
            >
              {data.monthYear}
            </p>
          </div>
        </div>
      </div>

      {/* ================= SLIP DETAILS ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '25px',
        }}
      >
        <Info label="Pay Slip No." value={data.paySlipNo} />

        <Info label="Pay Period" value={data.payPeriod} />

        <Info label="Generated On" value={data.generatedOn} />
      </div>

      {/* ================= EMPLOYEE ================= */}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '18px',
          marginBottom: '25px',
        }}
      >
        <h3
          style={{
            margin: '0 0 15px',
            fontSize: '16px',
          }}
        >
          Employee Details
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
          }}
        >
          <Info label="Employee ID" value={data.employeeId} />

          <Info label="Employee Name" value={data.employeeName} />

          <Info label="Position" value={data.position} />

          <Info label="Account Number" value={data.accountNumber} />

          <Info label="Paid Days" value={String(data.paidDays)} />

          <Info label="LOP Days" value={String(data.lopDays)} />
        </div>
      </div>

      {/* ================= EARNINGS / DEDUCTIONS ================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px',
        }}
      >
        {/* Earnings */}

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#111',
              color: '#fff',
              padding: '12px 15px',
              fontWeight: 700,
            }}
          >
            Earnings
          </div>

          {data.earnings.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '11px 15px',
                borderBottom: '1px solid #eee',
                fontSize: '13px',
              }}
            >
              <span>{item.name}</span>

              <span>₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '13px 15px',
              fontWeight: 700,
              background: '#f5f5f5',
            }}
          >
            <span>Total Earnings</span>

            <span>₹{totalEarnings.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Deductions */}

        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#111',
              color: '#fff',
              padding: '12px 15px',
              fontWeight: 700,
            }}
          >
            Deductions
          </div>

          {data.deductions.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '11px 15px',
                borderBottom: '1px solid #eee',
                fontSize: '13px',
              }}
            >
              <span>{item.name}</span>

              <span>₹{Number(item.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '13px 15px',
              fontWeight: 700,
              background: '#f5f5f5',
            }}
          >
            <span>Total Deductions</span>

            <span>₹{totalDeductions.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ================= NET SALARY ================= */}

      <div
        style={{
          background: '#111',
          color: '#fff',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#aaa',
            }}
          >
            NET SALARY
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '5px',
            }}
          >
            ₹{netSalary.toLocaleString('en-IN')}
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#ccc',
          }}
        >
          <div>Paid Days: {data.paidDays}</div>

          <div>LOP Days: {data.lopDays}</div>
        </div>
      </div>

      {/* ================= AUTHORIZATION ================= */}

      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '12px',
              color: '#555',
              marginBottom: '30px',
            }}
          >
            {data.hrNote}
          </p>
        </div>

        <div
          style={{
            textAlign: 'center',
            minWidth: '180px',
          }}
        >
          <div
            style={{
              borderTop: '1px solid #111',
              paddingTop: '8px',
            }}
          >
            <strong>{data.authorizedSignatory}</strong>

            <div
              style={{
                fontSize: '12px',
                color: '#555',
                marginTop: '4px',
              }}
            >
              {data.signatoryRole}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SalarySlipTemplate.displayName = 'SalarySlipTemplate';

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: '10px',
          color: '#777',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}

export default SalarySlipTemplate;
