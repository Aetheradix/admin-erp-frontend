import { PageHeader } from '@/components/ui/composed/PageHeader';
import { motion } from 'framer-motion';
import { Clock, User, Shield, Terminal, Search } from 'lucide-react';
import { useState } from 'react';

const logs = [
    { id: 1, action: 'User Login', user: 'Sarah Chen', target: 'System', timestamp: '2026-06-10 12:45:12', ip: '192.168.1.45', status: 'Success' },
    { id: 2, action: 'Settings Updated', user: 'James Wilson', target: 'Security Config', timestamp: '2026-06-10 11:32:05', ip: '192.168.1.12', status: 'Success' },
    { id: 3, action: 'Role Deleted', user: 'Sarah Chen', target: 'Guest Role', timestamp: '2026-06-10 10:15:44', ip: '192.168.1.45', status: 'Warning' },
    { id: 4, action: 'Bulk Upload', user: 'Maya Johnson', target: 'Users Table', timestamp: '2026-06-09 17:22:11', ip: '172.16.0.4', status: 'Success' },
    { id: 5, action: 'Unauthorized Access', user: 'Unknown', target: 'Finance API', timestamp: '2026-06-09 16:11:02', ip: '10.0.0.99', status: 'Critical' },
    { id: 6, action: 'Exported Data', user: 'Lisa Park', target: 'Payroll Report', timestamp: '2026-06-09 14:05:30', ip: '192.168.1.8', status: 'Success' },
];

const statusColors: Record<string, string> = {
    Success: 'text-success',
    Warning: 'text-warning',
    Critical: 'text-error',
};

export function AuditLogPage() {
    const [search, setSearch] = useState('');

    const filtered = logs.filter(l =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Audit Log"
                description="Historical record of all platform activities and system changes."
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'Settings', url: '/settings' },
                    { label: 'Audit Log' },
                ]}
            />

            {/* Search Toolbar */}
            <div className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-6 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Search logs by user, action, or target..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-surface-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-muted">All Time</div>
                    <div className="px-4 py-2 bg-surface-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-muted">Filter</div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden"
            >
                <div className="p-8 pb-4 border-b border-border-subtle flex items-center gap-3">
                    <Terminal size={18} className="text-primary" />
                    <span className="text-sm font-black text-foreground uppercase tracking-wider">System Activity Stream</span>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-subtle bg-surface-subtle/20">
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Activity</th>
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Actor</th>
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Target</th>
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Timestamp</th>
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Origin IP</th>
                            <th className="text-left px-10 py-5 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Outcome</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((log) => (
                            <tr key={log.id} className="border-b border-border-subtle/50 hover:bg-surface-subtle/30 transition-colors">
                                <td className="px-10 py-6">
                                    <span className="text-sm font-bold text-foreground">{log.action}</span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-surface-subtle flex items-center justify-center text-muted">
                                            <User size={12} />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">{log.user}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="px-3 py-1 bg-primary/5 rounded-lg text-[10px] font-bold text-primary tracking-wide">{log.target}</span>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                                        <Clock size={12} />
                                        {log.timestamp}
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-[11px] font-mono text-muted/60">{log.ip}</td>
                                <td className="px-10 py-6">
                                    <span className={`text-xs font-black uppercase tracking-tight ${statusColors[log.status]}`}>{log.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
