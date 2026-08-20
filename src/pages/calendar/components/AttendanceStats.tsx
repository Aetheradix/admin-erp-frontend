import { CheckCircle2, Home, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useGetAttendanceStatsQuery } from '@/store/api/attendanceSlice';

export function AttendanceStats() {
  const { data: statsData, isLoading } = useGetAttendanceStatsQuery();

  const stats = [
    {
      label: 'Days Present',
      value: String(statsData?.daysPresent ?? '0'),
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Work from Home',
      value: String(statsData?.wfhCount ?? '0'),
      icon: Home,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      label: 'On Leave',
      value: String(statsData?.leaveCount ?? '0'),
      icon: CalendarIcon,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Avg Check-in',
      value: String(statsData?.avgCheckIn ?? '--:--'),
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white h-32 rounded-4xl border border-border-subtle shadow-soft"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-4xl border border-border-subtle shadow-soft flex flex-col gap-4"
        >
          <div
            className={`w-12 h-12 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center`}
          >
            <stat.icon size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{stat.value}</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
