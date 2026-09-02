import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    CheckCircle2,
    AlertTriangle,
    Calendar as CalendarIcon,
    Sun,
    Clock,
    Zap,
} from 'lucide-react';
import { formatDate } from '@/utils/date';
import { formatHoursAndMinutes, formatMinutes, type DayDetailedRecord } from '../utils/attendanceUtils';

interface AttendanceHistoryTableProps {
    records: DayDetailedRecord[];
    onSelectRecord?: (record: DayDetailedRecord) => void;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
    records,
    onSelectRecord,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [onlyLate, setOnlyLate] = useState(false);
    const [onlyOvertime, setOnlyOvertime] = useState(false);

    const filteredRecords = useMemo(() => {
        return records.filter((r) => {
            // Search match
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matchesDate = r.date.toLowerCase().includes(term);
                const matchesStatus = r.status.toLowerCase().includes(term);
                if (!matchesDate && !matchesStatus) return false;
            }

            // Status filter
            if (statusFilter !== 'ALL') {
                if (statusFilter === 'PRESENT' && r.status !== 'Present' && r.status !== 'Late') return false;
                if (statusFilter === 'LATE' && r.status !== 'Late') return false;
                if (statusFilter === 'ABSENT' && r.status !== 'Absent') return false;
                if (statusFilter === 'LEAVE' && r.status !== 'On Leave') return false;
                if (statusFilter === 'HOLIDAY' && r.status !== 'Holiday') return false;
            }

            // Checkboxes
            if (onlyLate && !r.isLate) return false;
            if (onlyOvertime && r.overtimeHours <= 0) return false;

            return true;
        });
    }, [records, searchTerm, statusFilter, onlyLate, onlyOvertime]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Present
                    </span>
                );
            case 'Late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase border border-amber-500/20">
                        <AlertTriangle size={12} /> Late
                    </span>
                );
            case 'Absent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-black text-[10px] uppercase border border-red-500/20">
                        <AlertTriangle size={12} /> Absent
                    </span>
                );
            case 'On Leave':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase border border-blue-500/20">
                        <CalendarIcon size={12} /> Leave
                    </span>
                );
            case 'Holiday':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-[10px] uppercase border border-purple-500/20">
                        <Sun size={12} /> Holiday
                    </span>
                );
            case 'Weekend':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-subtle text-muted font-black text-[10px] uppercase">
                        Weekend
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-subtle text-muted font-black text-[10px] uppercase">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="bg-surface-elevated rounded-[40px] border border-border-subtle shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl">
            {/* Table Header Controls */}
            <div className="p-6 sm:p-8 border-b border-border-subtle flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Attendance History Log</h3>
                    <p className="text-xs font-bold text-muted mt-0.5">Filterable log of all daily punches and working hours</p>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search date or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-surface-subtle rounded-2xl border border-border-subtle text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-11 px-4 pr-8 bg-surface-subtle rounded-2xl border border-border-subtle text-xs font-bold text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late Arrivals</option>
                            <option value="LEAVE">Leaves</option>
                            <option value="HOLIDAY">Holidays</option>
                        </select>
                        <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>

                    {/* Checkboxes */}
                    <label className="flex items-center gap-2 px-3 py-2 bg-surface-subtle rounded-2xl border border-border-subtle text-xs font-bold text-foreground cursor-pointer">
                        <input
                            type="checkbox"
                            checked={onlyLate}
                            onChange={(e) => setOnlyLate(e.target.checked)}
                            className="rounded accent-primary cursor-pointer"
                        />
                        <span>Late Only</span>
                    </label>

                    <label className="flex items-center gap-2 px-3 py-2 bg-surface-subtle rounded-2xl border border-border-subtle text-xs font-bold text-foreground cursor-pointer">
                        <input
                            type="checkbox"
                            checked={onlyOvertime}
                            onChange={(e) => setOnlyOvertime(e.target.checked)}
                            className="rounded accent-primary cursor-pointer"
                        />
                        <span>Overtime Only</span>
                    </label>
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-subtle bg-surface-subtle/40 text-[10px] font-black uppercase text-muted tracking-widest">
                            <th className="py-4 px-6">Date</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Check In</th>
                            <th className="py-4 px-6">Check Out</th>
                            <th className="py-4 px-6">Breaks</th>
                            <th className="py-4 px-6">Net Hours</th>
                            <th className="py-4 px-6">Punctuality</th>
                            <th className="py-4 px-6">Overtime</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/40 text-xs font-bold">
                        {filteredRecords.map((r) => (
                            <tr
                                key={r.id}
                                onClick={() => onSelectRecord && onSelectRecord(r)}
                                className="hover:bg-surface-subtle/80 transition-colors cursor-pointer"
                            >
                                <td className="py-4 px-6 text-foreground font-black">
                                    {formatDate(r.date)}
                                </td>
                                <td className="py-4 px-6">{getStatusBadge(r.status)}</td>
                                <td className="py-4 px-6 text-foreground">{r.checkIn || '---'}</td>
                                <td className="py-4 px-6 text-foreground">{r.checkOut || '---'}</td>
                                <td className="py-4 px-6 text-amber-500">
                                    {r.totalBreakMinutes > 0 ? formatMinutes(r.totalBreakMinutes) : '0m'}
                                </td>
                                <td className="py-4 px-6 text-primary font-black">
                                    {r.netWorkingHours > 0 ? formatHoursAndMinutes(r.netWorkingHours) : '---'}
                                </td>
                                <td className="py-4 px-6">
                                    {r.isLate ? (
                                        <span className="text-warning font-black">+{r.lateMinutes}m Late</span>
                                    ) : r.status === 'Present' ? (
                                        <span className="text-success font-black">On Time</span>
                                    ) : (
                                        <span className="text-muted">---</span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    {r.overtimeHours > 0 ? (
                                        <span className="text-purple-500 font-black inline-flex items-center gap-1">
                                            <Zap size={12} /> +{r.overtimeHours}h
                                        </span>
                                    ) : (
                                        <span className="text-muted">---</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {filteredRecords.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-muted font-bold">
                                    No attendance records found matching filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
