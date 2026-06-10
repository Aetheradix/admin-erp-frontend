import { PageHeader } from '@/components/ui/composed/PageHeader';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const reports = [
    { id: 1, name: 'Monthly Financial Summary', type: 'Financial', date: 'June 2026', size: '2.4 MB' },
    { id: 2, name: 'User Growth Audit', type: 'Marketing', date: 'May 2026', size: '1.8 MB' },
    { id: 3, name: 'Inventory Movement Log', type: 'Operational', date: 'Q2 2026', size: '4.1 MB' },
    { id: 4, name: 'Sales Performance Report', type: 'Revenue', date: 'May 2026', size: '3.2 MB' },
    { id: 5, name: 'Staff Performance Index', type: 'HR', date: '2026 Yearly', size: '1.1 MB' },
];

export function ReportsPage() {
    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Reports"
                description="Access and download generated business reports."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Analytics', url: '/analytics' },
                    { label: 'Reports' },
                ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, i) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 flex flex-col gap-6 group hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <FileText size={22} />
                            </div>
                            <button className="p-2 rounded-xl bg-surface-subtle text-muted hover:text-primary transition-colors">
                                <Download size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{report.type}</span>
                            <h3 className="text-lg font-black text-foreground tracking-tight leading-tight">{report.name}</h3>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50 text-xs font-bold text-muted">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {report.date}
                            </div>
                            <span>{report.size}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
