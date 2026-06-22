import { Badge } from '@/components/ui/primitives/Badge';
import { Button } from '@/components/ui/primitives/Button';
import { Clock, Edit2, MapPin, Trash2, Users } from 'lucide-react';
import type { ERPEvent } from '../hooks/mockEvents';

interface EventCardProps {
  event: ERPEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EventCard = ({ event, onEdit, onDelete }: EventCardProps) => {
  const categoryVariants: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
    Conference: 'primary',
    Workshop: 'success',
    Social: 'warning',
    Meeting: 'secondary',
  };

  const eventDate = new Date(event.event_date);
  const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <div className="group bg-white rounded-4xl border border-border-subtle overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full">
      {/* Visual Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-6">
          <Badge variant={categoryVariants[event.category] || 'primary'} className="rounded-full px-4 py-1! text-[10px] font-black tracking-widest uppercase border-none backdrop-blur-md bg-white/20! text-white!">
            {event.category}
          </Badge>
        </div>
        
        {/* Date Tablet */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-3xl p-3 flex flex-col items-center min-w-15 shadow-sm border border-white/20">
          <span className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none mb-1">
            {month}
          </span>
          <span className="text-xl font-black text-foreground leading-none">
            {day}
          </span>
        </div>

        {/* Action Menu overlay */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex gap-2">
             <Button 
                variant="ghost" 
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-primary hover:bg-white border-none shadow-soft"
                onClick={() => onEdit(String(event.id))}
                aria-label={`Edit ${event.title}`}
             >
               <Edit2 size={16} />
             </Button>
             <Button 
                variant="ghost" 
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-white border-none shadow-soft"
                onClick={() => onDelete(String(event.id))}
                aria-label={`Cancel ${event.title}`}
             >
               <Trash2 size={16} />
             </Button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
            </h3>
            <p className="text-sm text-muted font-medium line-clamp-2">
                {event.description}
            </p>
        </div>

         <div className="mt-auto grid grid-cols-2 gap-y-3 pt-4 border-t border-border-subtle/50">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-tighter">
              <Clock size={14} className="text-primary" />
              <span className="truncate">{event.time?.split(' - ')[0] || event.time || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-tighter">
              <MapPin size={14} className="text-primary" />
              <span className="truncate">{event.location?.split(',')[0] || event.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-black text-[10px] uppercase tracking-widest">
              <Users size={14} />
              <span>{event.attendees || 0}+ Joined</span>
            </div>
            <div className="flex items-center gap-2 text-muted font-black text-[10px] uppercase tracking-widest">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="truncate">{event.organizer || 'Team'}</span>
            </div>
         </div>

        <Button variant="secondary" className="w-full mt-2 h-12 rounded-3xl! gap-2 font-black text-xs uppercase tracking-widest border-border-subtle! group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
          Register Now
        </Button>
      </div>
    </div>
  );
};
