import { PageHeader } from '@/components/ui/composed/PageHeader';
import { MoreHorizontal, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PayrollRecord {
    id: number;
    name: string;
    role: string;
    base: number;
    bonus: number;
    total: number;
    date: string;
}

const payroll: PayrollRecord[] = [
    { id: 1, name: 'Sarah Chen', role: 'Super Admin', base: 12000, bonus: 2000, total: 14000, date: 'June 2026' },
    { id: 2, name: 'James Wilson', role: 'Admin', base: 8500, bonus: 500, total: 9000, date: 'June 2026' },
    { id: 3, name: 'Maya Johnson', role: 'Manager', base: 7200, bonus: 800, total: 8000, date: 'June 2026' },
    { id: 4, name: 'David Kim', role: 'Developer', base: 6500, bonus: 0, total: 6500, date: 'June 2026' },
];

export function PayrollPage() {
    const columns: ColumnsType<PayrollRecord> = [
        {
            title: 'Employee',
            key: 'employee',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <User size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{record.name}</span>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{record.role}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Base Pay',
            dataIndex: 'base',
            key: 'base',
            render: (value) => <span className="text-sm font-medium text-muted">₹{value.toLocaleString()}</span>,
        },
        {
            title: 'Bonus',
            dataIndex: 'bonus',
            key: 'bonus',
            render: (value) => <span className="text-sm font-medium text-success">+₹{value.toLocaleString()}</span>,
        },
        {
            title: 'Total Salary',
            dataIndex: 'total',
            key: 'total',
            render: (value) => <span className="text-sm font-black text-foreground">₹{value.toLocaleString()}</span>,
        },
        {
            title: 'Pay Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                    <Calendar size={14} />
                    {text}
                </div>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 80,
            render: () => (
                <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Payroll"
                description="Employee compensation and distribution history."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Finance', url: '/finance' },
                    { label: 'Payroll' },
                ]}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden"
            >
                <Table
                    columns={columns}
                    dataSource={payroll}
                    rowKey="id"
                    pagination={false}
                    className="premium-table"
                />
            </motion.div>
        </div>
    );
}
