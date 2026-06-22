import { PageHeader } from '@/components/ui/composed/PageHeader';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Movement {
    id: number;
    item: string;
    sku: string;
    type: 'In' | 'Out';
    quantity: number;
    date: string;
    reference: string;
    by: string;
}

const movements: Movement[] = [
    { id: 1, item: 'MacBook Pro 16"', sku: 'HW-MBP-001', type: 'In', quantity: 10, date: '2026-06-09', reference: 'PO-2026-0145', by: 'Sarah Chen' },
    { id: 2, item: 'Office Chair Pro', sku: 'FRN-OCP-006', type: 'Out', quantity: 3, date: '2026-06-09', reference: 'REQ-2026-0089', by: 'James Wilson' },
    { id: 3, item: 'USB-C Hub', sku: 'ACC-UCH-004', type: 'Out', quantity: 5, date: '2026-06-08', reference: 'REQ-2026-0088', by: 'David Kim' },
    { id: 4, item: 'Ergonomic Keyboard', sku: 'ACC-EK-003', type: 'In', quantity: 20, date: '2026-06-08', reference: 'PO-2026-0144', by: 'Lisa Park' },
    { id: 5, item: 'Wireless Mouse', sku: 'ACC-WM-007', type: 'In', quantity: 30, date: '2026-06-07', reference: 'PO-2026-0143', by: 'Sarah Chen' },
    { id: 6, item: 'Standing Desk', sku: 'FRN-SD-005', type: 'Out', quantity: 2, date: '2026-06-07', reference: 'REQ-2026-0087', by: 'Emily Davis' },
    { id: 7, item: 'Webcam HD', sku: 'HW-WC-008', type: 'Out', quantity: 4, date: '2026-06-06', reference: 'REQ-2026-0086', by: 'Rahul Patel' },
    { id: 8, item: 'Dell Monitor 27"', sku: 'HW-DM27-002', type: 'In', quantity: 8, date: '2026-06-05', reference: 'PO-2026-0142', by: 'Lisa Park' },
];

export function MovementsPage() {
    const totalIn = movements.filter(m => m.type === 'In').reduce((a, m) => a + m.quantity, 0);
    const totalOut = movements.filter(m => m.type === 'Out').reduce((a, m) => a + m.quantity, 0);

    const columns: ColumnsType<Movement> = [
        {
            title: 'Type',
            key: 'type',
            width: 80,
            render: (_, record) => (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.type === 'In' ? 'bg-success/10' : 'bg-error/10'}`}>
                    {record.type === 'In' ? <ArrowDownLeft size={16} className="text-success" /> : <ArrowUpRight size={16} className="text-error" />}
                </div>
            ),
        },
        {
            title: 'Item',
            key: 'item',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{record.item}</span>
                    <span className="text-[10px] text-muted tracking-wider">{record.sku}</span>
                </div>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <span className={`text-sm font-bold ${record.type === 'In' ? 'text-success' : 'text-error'}`}>
                    {record.type === 'In' ? '+' : '-'}{quantity}
                </span>
            ),
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            render: (text) => <span className="text-xs font-medium text-muted">{text}</span>,
        },
        {
            title: 'By',
            dataIndex: 'by',
            key: 'by',
            render: (text) => <span className="text-xs font-medium text-muted">{text}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <span className="text-xs font-medium text-muted">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Stock Movements"
                description="Track inventory inflows and outflows."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Inventory', url: '/inventory' },
                    { label: 'Movements' },
                ]}
            />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[28px] border border-border-subtle shadow-soft p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                        <ArrowDownLeft size={28} className="text-success" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-black text-foreground">{totalIn} units</span>
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Total Received</span>
                    </div>
                </div>
                <div className="bg-white rounded-[28px] border border-border-subtle shadow-soft p-8 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center">
                        <ArrowUpRight size={28} className="text-error" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-2xl font-black text-foreground">{totalOut} units</span>
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Total Dispatched</span>
                    </div>
                </div>
            </div>

            {/* Movements Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden"
            >
                <Table
                    columns={columns}
                    dataSource={movements}
                    rowKey="id"
                    pagination={false}
                    className="premium-table"
                />
            </motion.div>
        </div>
    );
}
