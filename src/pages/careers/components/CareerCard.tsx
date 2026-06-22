import { MapPin, Clock, DollarSign, ArrowRight, Briefcase, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import type { Career } from '../hooks/mockCareers';

interface CareerCardProps {
  career: Career;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CareerCard({ career, onViewDetails, onEdit, onDelete }: CareerCardProps) {
  return (
    <div className="group relative bg-white rounded-4xl p-8 border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 hover:-translate-y-1 overflow-hidden">
      {/* Action Buttons (Edit/Delete) - Absolute Positioned */}
      <div className="absolute right-6 top-6 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
        <button 
          onClick={() => onEdit?.(String(career.id))}
          className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-info hover:text-white transition-all duration-300 flex items-center justify-center border border-border-subtle shadow-sm"
          title="Edit Position"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete?.(String(career.id))}
          className="w-10 h-10 rounded-3xl bg-surface-subtle hover:bg-error hover:text-white transition-all duration-300 flex items-center justify-center border border-border-subtle shadow-sm"
          title="Remove Position"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Background Accent Decor */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="relative flex flex-col h-full gap-6">
        {/* Header: Icon + Department */}
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 rounded-3xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <Briefcase size={28} />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-primary-soft text-primary text-[10px] font-black uppercase tracking-wider">
            {career.department}
          </span>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-black text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
            {career.title}
          </h3>
          <p className="text-sm text-muted font-medium line-clamp-2 leading-relaxed">
            {career.description}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2.5 text-muted/80">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center">
              <MapPin size={14} className="text-primary/70" />
            </div>
            <span className="text-xs font-bold truncate">{career.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted/80">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center">
              <Clock size={14} className="text-primary/70" />
            </div>
            <span className="text-xs font-bold truncate">{career.type}</span>
          </div>
          <div className="flex items-center gap-2.5 text-muted/80 col-span-2">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center">
              <DollarSign size={14} className="text-primary/70" />
            </div>
            <span className="text-xs font-black text-foreground/80">{career.salary}</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-auto pt-6 border-t border-border-subtle/50">
          <Button
            onClick={() => onViewDetails?.(String(career.id))}
            variant="ghost"
            className="w-full justify-between h-14 px-6 rounded-3xl! group/btn hover:bg-primary! hover:text-white! transition-all duration-300 border border-transparent hover:border-primary!"
          >
            <span className="font-black text-sm uppercase tracking-widest">Explore Role</span>
            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
