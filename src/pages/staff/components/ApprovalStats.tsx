import { ListTodo, ShieldCheck, AlertCircle } from 'lucide-react';

interface ApprovalStatsProps {
  counts: {
    Pending?: number;
    Approved?: number;
    Rejected?: number;
  };
}

export const ApprovalStats = ({ counts }: ApprovalStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
            <ListTodo size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">{counts.Pending || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Pending Review</span>
          </div>
        </div>
        <p className="text-[10px] text-muted font-bold italic leading-relaxed">Requests awaiting administrative decision.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">{counts.Approved || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Approved Requests</span>
          </div>
        </div>
        <p className="text-[10px] text-muted font-bold italic leading-relaxed">Successfully processed and admitted applications.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[32px] border border-border-subtle shadow-soft transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-foreground">{counts.Rejected || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Rejected Requests</span>
          </div>
        </div>
        <p className="text-[10px] text-muted font-bold italic leading-relaxed">Applications that did not meet specific criteria.</p>
      </div>
    </div>
  );
};
