import type React from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Table as AntTable } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FinancialEntry } from '../types';
import { formatAuditCurrency } from '../utils';

interface LedgerTableProps {
  title: string;
  entries: FinancialEntry[];
  color: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
}

export function LedgerTable({ title, entries, color, icon, defaultOpen = true }: LedgerTableProps) {
  const [open, setOpen] = useState(defaultOpen);
  const total = entries.reduce((sum, entry) => sum + entry.currentPeriod, 0);

  const columns: ColumnsType<FinancialEntry> = [
    {
      title: 'Particulars',
      dataIndex: 'particulars',
      key: 'particulars',
      render: (value: string) => <span style={{ color: '#cbd5e1' }}>{value}</span>,
    },
    {
      title: 'Current Period (₹)',
      dataIndex: 'currentPeriod',
      key: 'currentPeriod',
      align: 'right',
      render: (value: number) => (
        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{formatAuditCurrency(value)}</span>
      ),
    },
    {
      title: '% of Total',
      key: 'percentage',
      align: 'right',
      render: (_, entry) => (
        <span style={{ color: '#64748b' }}>
          {total > 0 ? `${((entry.currentPeriod / total) * 100).toFixed(1)}%` : '—'}
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${color}22`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', textAlign: 'left' }}>
              {title}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{entries.length} line items</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color }}>
            {formatAuditCurrency(total)}
          </div>
          {open ? (
            <ChevronUp size={16} color="#64748b" />
          ) : (
            <ChevronDown size={16} color="#64748b" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}>
            <AntTable<FinancialEntry>
              columns={columns}
              dataSource={entries}
              rowKey="particulars"
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              summary={() => (
                <AntTable.Summary.Row style={{ background: `${color}08` }}>
                  <AntTable.Summary.Cell index={0}>
                    <strong style={{ color }}>Total {title}</strong>
                  </AntTable.Summary.Cell>
                  <AntTable.Summary.Cell index={1} align="right">
                    <strong style={{ color }}>{formatAuditCurrency(total)}</strong>
                  </AntTable.Summary.Cell>
                  <AntTable.Summary.Cell index={2} align="right">
                    <span style={{ color: '#64748b' }}>100%</span>
                  </AntTable.Summary.Cell>
                </AntTable.Summary.Row>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
