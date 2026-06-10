import { PageHeader } from '@/components/ui/composed/PageHeader';
import { DollarSign, MoreHorizontal, User, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const payroll = [
    { id: 1, name: 'Sarah Chen', role: 'Super Admin', base: 12000, bonus: 2000, total: 14000, date: 'June 2026' },
    { id: 2, name: 'James Wilson', role: 'Admin', base: 8500, bonus: 500, total: 9000, date: 'June 2026' },
    { id: 3, name: 'Maya Johnson', role: 'Manager', base: 7200, bonus: 800, total: 8000, date: 'June 2026' },
    { id: 4, name: 'David Kim', role: 'Developer', base: 6500, bonus: 0, total: 6500, date: 'June 2026' },
];

export function PayrollPage() {
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
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-subtle bg-surface-subtle/30">
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Employee</th>
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Base Pay</th>
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Bonus</th>
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Total Salary</th>
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Pay Date</th>
                            <th className="w-16 px-10 py-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payroll.map((pay) => (
                            <tr key={pay.id} className="border-b border-border-subtle/50 hover:bg-surface-subtle/50 transition-colors">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{pay.name}</span>
                                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{pay.role}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-sm font-medium text-muted">${pay.base.toLocaleString()}</td>
                                <td className="px-10 py-6 text-sm font-medium text-success">+${pay.bonus.toLocaleString()}</td>
                                <td className="px-10 py-6 text-sm font-black text-foreground">${pay.total.toLocaleString()}</td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                        <Calendar size={14} />
                                        {pay.date}
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
