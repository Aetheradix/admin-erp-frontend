import { Box, CheckCircle2, Clock, Archive, User, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Project } from '../hooks/mockStats';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'Ongoing': return 'bg-primary/10 text-primary border-primary/20';
      case 'Delayed': return 'bg-error/10 text-error border-error/20';
      case 'Archived': return 'bg-muted/10 text-muted border-muted/20';
      default: return 'bg-muted/10 text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Ongoing': return <Clock size={14} />;
      case 'Delayed': return <AlertTriangle size={14} />;
      case 'Archived': return <Archive size={14} />;
      default: return null;
    }
  };

  return (
    <div className="group bg-white p-8 rounded-4xl border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-surface-subtle flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Box size={24} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">{project.client}</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
          getStatusStyles(project.status)
        )}>
          {getStatusIcon(project.status)}
          <span>{project.status}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
          <span>Project Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:bg-primary" 
            style={{ width: `${project.progress}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
          <User size={12} className="text-primary/70" />
          <span>Lead ID: {project.leadId}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted">
          <Calendar size={12} className="text-primary/70" />
          <span>Started {project.startDate}</span>
        </div>
      </div>
    </div>
  );
}
