import { History, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function FinanceStats() {
  const stats = [
    { label: 'Total Pending', value: '$52.99', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Approved', value: '$250.00', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Paid Reimbursements', value: '$1,240.50', icon: History, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Rejected Requests', value: '$75.20', icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex flex-col gap-4 group">
          <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
            <stat.icon size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{stat.value}</span>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
