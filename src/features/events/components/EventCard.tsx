import React from 'react';
import { Calendar, MapPin, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Dropdown } from 'antd';

interface Event {
  id: string;
  key?: string;
  title: string;
  event_date: string;
  location: string;
  status: 'Upcoming' | 'Scheduled' | 'Completed' | string;
  type: string;
  image_url?: string;
}

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const statusStyles: Record<string, string> = {
    Upcoming: 'text-primary border-primary/20 bg-primary/5',
    Scheduled: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
    Default: 'text-orange-400 border-orange-400/20 bg-orange-400/5'
  };

  const currentStatusStyle = statusStyles[event.status] || statusStyles.Default;

  return (
    <div className="bg-[#1b212f] border border-white/5 rounded-[2.5rem] p-8 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 group/card relative overflow-hidden shadow-xl shadow-black/20">
      <div className="absolute top-0 right-0 p-8">
        <Dropdown
          menu={{
            items: [
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                icon: <Trash2 size={14} />,
                onClick: () => onDelete(event.id || event.key!),
              },
            ],
            className: 'dark-dropdown',
          }}
          trigger={['click']}
        >
          <button className="text-white/20 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </Dropdown>
      </div>
      
      <div className="mb-6">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/10 ${currentStatusStyle}`}>
          {event.status}
        </span>
      </div>

      <h3 className="text-2xl font-bold mb-4 group-hover/card:text-primary transition-colors leading-tight">
        {event.title}
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-white/40 text-sm">
          <Calendar size={16} />
          <span>{event.event_date}</span>
        </div>
        <div className="flex items-center gap-3 text-white/40 text-sm">
          <MapPin size={16} />
          <span>{event.location}</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-white/20">{event.type}</span>
        <button className="text-sm font-bold text-white/60 hover:text-primary transition-colors flex items-center gap-1 group/btn">
          Manage Event 
          <Plus size={14} className="group-hover/btn:rotate-90 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
