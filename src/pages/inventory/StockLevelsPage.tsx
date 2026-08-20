import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface StockItem {
  id: number;
  name: string;
  sku: string;
  current: number;
  minimum: number;
  maximum: number;
  status: string;
}

const stockData: StockItem[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    sku: 'HW-MBP-001',
    current: 24,
    minimum: 10,
    maximum: 50,
    status: 'OK',
  },
  {
    id: 2,
    name: 'Dell Monitor 27"',
    sku: 'HW-DM27-002',
    current: 15,
    minimum: 5,
    maximum: 30,
    status: 'OK',
  },
  {
    id: 3,
    name: 'Ergonomic Keyboard',
    sku: 'ACC-EK-003',
    current: 42,
    minimum: 20,
    maximum: 60,
    status: 'OK',
  },
  {
    id: 4,
    name: 'USB-C Hub',
    sku: 'ACC-UCH-004',
    current: 3,
    minimum: 10,
    maximum: 40,
    status: 'Low',
  },
  {
    id: 5,
    name: 'Standing Desk',
    sku: 'FRN-SD-005',
    current: 8,
    minimum: 5,
    maximum: 20,
    status: 'OK',
  },
  {
    id: 6,
    name: 'Office Chair Pro',
    sku: 'FRN-OCP-006',
    current: 0,
    minimum: 5,
    maximum: 15,
    status: 'Critical',
  },
  {
    id: 7,
    name: 'Wireless Mouse',
    sku: 'ACC-WM-007',
    current: 67,
    minimum: 20,
    maximum: 60,
    status: 'Overstocked',
  },
  {
    id: 8,
    name: 'Webcam HD',
    sku: 'HW-WC-008',
    current: 2,
    minimum: 5,
    maximum: 25,
    status: 'Low',
  },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  OK: { color: 'text-success', bg: 'bg-success' },
  Low: { color: 'text-warning', bg: 'bg-warning' },
  Critical: { color: 'text-error', bg: 'bg-error' },
  Overstocked: { color: 'text-info', bg: 'bg-info' },
};

export function StockLevelsPage() {
  const columns: ColumnsType<StockItem> = [
    {
      title: 'Item',
      key: 'item',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{record.name}</span>
          <span className="text-[10px] text-muted tracking-wider">{record.sku}</span>
        </div>
      ),
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      render: (text) => <span className="text-sm font-black text-foreground">{text}</span>,
    },
    {
      title: 'Min',
      dataIndex: 'minimum',
      key: 'minimum',
      render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
    },
    {
      title: 'Max',
      dataIndex: 'maximum',
      key: 'maximum',
      render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
    },
    {
      title: 'Level',
      key: 'level',
      render: (_, record) => {
        const pct = Math.min((record.current / record.maximum) * 100, 100);
        const cfg = statusConfig[record.status] || statusConfig.OK;
        return (
          <div className="w-24 h-2 rounded-full bg-surface-subtle overflow-hidden">
            <div className={`h-full rounded-full ${cfg.bg}`} style={{ width: `${pct}%` }} />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cfg = statusConfig[status] || statusConfig.OK;
        return <span className={`text-xs font-bold ${cfg.color}`}>● {status}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Stock Levels"
        description="Monitor inventory levels and restock alerts."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Inventory', url: '/inventory' },
          { label: 'Stock Levels' },
        ]}
      />

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(
          stockData.reduce(
            (acc, item) => {
              acc[item.status] = (acc[item.status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        ).map(([status, count]) => (
          <div
            key={status}
            className={`rounded-[28px] border border-border-subtle p-6 shadow-soft bg-white flex items-center gap-4`}
          >
            <div className={`w-3 h-3 rounded-full ${statusConfig[status]?.bg || 'bg-muted'}`} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-black text-foreground">{count}</span>
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={stockData}
          rowKey="id"
          pagination={false}
          className="premium-table"
        />
      </motion.div>
    </div>
  );
}
