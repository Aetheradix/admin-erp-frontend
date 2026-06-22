import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { MoreHorizontal, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Invoice {
    id: string;
    client: string;
    amount: number;
    status: string;
    date: string;
}

const statusIcons: Record<string, { icon: any; color: string }> = {
    Paid: { icon: CheckCircle, color: 'text-success' },
    Pending: { icon: Clock, color: 'text-warning' },
    Overdue: { icon: AlertCircle, color: 'text-error' },
};

const STATUS_OPTIONS = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Overdue', value: 'Overdue' },
];

const initialInvoices: Invoice[] = [
    { id: 'INV-2026-001', client: 'Acme Corp', amount: 4500, status: 'Paid', date: '2026-06-01' },
    { id: 'INV-2026-002', client: 'Globex Inc', amount: 1200, status: 'Pending', date: '2026-06-05' },
    { id: 'INV-2026-003', client: 'Soylent Corp', amount: 8900, status: 'Overdue', date: '2026-05-15' },
    { id: 'INV-2026-004', client: 'Initech', amount: 3200, status: 'Paid', date: '2026-05-28' },
];

const emptyForm = { client: '', amount: 0, status: 'Pending', date: '' };

export function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const handleSubmit = () => {
        if (!form.client || !form.amount) return;
        const count = invoices.length + 1;
        const newInvoice: Invoice = {
            id: `INV-2026-${String(count).padStart(3, '0')}`,
            client: form.client,
            amount: form.amount,
            status: form.status,
            date: form.date || new Date().toISOString().slice(0, 10),
        };
        setInvoices([newInvoice, ...invoices]);
        setForm(emptyForm);
        setShowForm(false);
    };

    const columns: ColumnsType<Invoice> = [
        {
            title: 'Invoice ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span className="text-sm font-bold text-foreground">{text}</span>,
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client',
            render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span className="text-sm font-black text-foreground">₹{amount.toLocaleString()}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const State = statusIcons[status] || statusIcons.Pending;
                return (
                    <div className={`flex items-center gap-2 text-xs font-bold ${State.color}`}>
                        <State.icon size={14} />{status}
                    </div>
                );
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
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
            <PageHeader title="Invoices" description="Manage and track client billing."
                breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Finance', url: '/finance' }, { label: 'Invoices' }]}
                primaryAction={{ label: 'Create Invoice', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={invoices}
                    rowKey="id"
                    pagination={false}
                    className="premium-table"
                />
            </motion.div>

            {/* Create Invoice Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Create Invoice" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
            >
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Client Name</label>
                        <Input placeholder="e.g. Acme Corp" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Amount (₹)</label>
                            <Input type="number" placeholder="0" value={String(form.amount || '')} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Due Date</label>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Status</label>
                        <Select options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} placeholder="Select status" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-xl!" />
                        <Button label="Create Invoice" onClick={handleSubmit} icon="pi pi-check" className="rounded-xl! px-8!" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
