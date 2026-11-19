import { Table as AntTable } from 'antd';
import { HEADCOUNT_ESTIMATE } from '../constants';
import type { AuditBookMetrics } from '../types';
import { formatAuditCurrency } from '../utils';

interface ProfitLossSummaryProps {
  metrics: AuditBookMetrics;
}

export function ProfitLossSummary({ metrics }: ProfitLossSummaryProps) {
  const { totalRevenue, totalExpenses, netProfitLoss, grossMargin, expenseRatio } = metrics;
  const fmt = formatAuditCurrency;

  const summaryRows = [
    ['Total Revenue', fmt(totalRevenue), '#22c55e'],
    ['Less: Expenses', `(${fmt(totalExpenses)})`, '#f87171'],
    [
      netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss',
      fmt(Math.abs(netProfitLoss)),
      netProfitLoss >= 0 ? '#6366f1' : '#f87171',
    ],
  ].map(([label, value, color], index) => ({ key: String(index), label, value, color, index }));

  const healthIndicators = [
    { label: 'Gross Margin', value: `${grossMargin}%`, good: parseFloat(grossMargin) > 30 },
    { label: 'Expense Ratio', value: `${expenseRatio}%`, good: totalExpenses / totalRevenue < 0.7 },
    {
      label: 'Revenue per Employee',
      value: fmt(totalRevenue / HEADCOUNT_ESTIMATE),
      good: true,
    },
  ];

  return (
    <div
      style={{
        background: netProfitLoss >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(248,113,113,0.06)',
        border: `1px solid ${netProfitLoss >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)'}`,
        borderRadius: 16,
        padding: '24px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 24,
      }}>
      <div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
          Net Profit / Loss Summary
        </div>
        <AntTable
          size="small"
          pagination={false}
          showHeader={false}
          scroll={{ x: 'max-content' }}
          rowKey="key"
          dataSource={summaryRows}
          columns={[
            {
              title: 'Label',
              dataIndex: 'label',
              key: 'label',
              render: (value, record) => (
                <span style={{ color: '#94a3b8', fontWeight: record.index === 2 ? 700 : 400 }}>
                  {value}
                </span>
              ),
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              align: 'right' as const,
              render: (value, record) => (
                <span style={{ color: record.color, fontWeight: 700 }}>{value}</span>
              ),
            },
          ]}
        />
      </div>
      <div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
          Financial Health Indicators
        </div>
        {healthIndicators.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.label}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: item.good ? '#22c55e' : '#f87171',
                background: item.good ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
                padding: '2px 8px',
                borderRadius: 6,
              }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
