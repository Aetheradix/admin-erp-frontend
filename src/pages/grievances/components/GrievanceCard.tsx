import { Clock, CheckCircle2, AlertCircle, MessageSquare, Shield } from 'lucide-react';
import { classNames } from 'primereact/utils';
import type { Grievance } from '../hooks/mockGrievances';

interface GrievanceCardProps {
  grievance: Grievance;
}

export function GrievanceCard({ grievance }: GrievanceCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-success/10 text-success border-success/20';
      case 'In Review': return 'bg-warning/10 text-warning border-warning/20';
      case 'Received': return 'bg-info/10 text-info border-info/20';
      case 'Closed': return 'bg-muted/10 text-muted border-muted/20';
      default: return 'bg-muted/10 text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved': return <CheckCircle2 size={14} />;
      case 'In Review': return <Clock size={14} />;
      case 'Received': return <AlertCircle size={14} />;
      case 'Closed': return <MessageSquare size={14} />;
      default: return null;
    }
  };

  return (
    <div className="group bg-white p-8 rounded-[40px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex flex-col gap-6">
      {/* Anonymous Indicator */}
      {grievance.isAnonymous && (
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
          <Shield size={24} />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{grievance.category}</span>
          <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors pr-8">
            {grievance.title}
          </h3>
        </div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 italic">
          "{grievance.description}"
        </p>
      </div>

      {grievance.response && (
        <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle/50 flex flex-col gap-2">
          <span className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={12} className="text-primary" />
            Management Response
          </span>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            {grievance.response}
          </p>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-6 border-t border-border-subtle/50">
        <div className={classNames(
          "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
          getStatusStyles(grievance.status)
        )}>
          {getStatusIcon(grievance.status)}
          <span>{grievance.status}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-muted uppercase">Filed On</span>
          <span className="text-[10px] font-bold text-foreground">{grievance.date}</span>
        </div>
      </div>
    </div>
  );
}
