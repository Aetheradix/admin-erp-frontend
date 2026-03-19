import { Calendar, Plus, Search } from 'lucide-react';
import { useGetEventsQuery } from '@/store/api/eventSlice';
import { Spin } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/ui/StatCard';
import EventCard from './components/EventCard';
import { useEventActions } from './hooks/useEventActions';

export default function EventsList() {
  const { data: events = [], isLoading, isError } = useGetEventsQuery();
  const { handleDelete } = useEventActions();

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Spin size="large" /></div>;
  if (isError) return <div className="p-8 text-center text-white/50">Error loading events</div>;

  return (
    <div className="animate-fade-in group pb-12">
      <PageHeader 
        title="Events Management"
        subtitle="Organize and manage your upcoming events and workshops."
        actions={
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-8! py-4! rounded-2xl transition-all duration-300 font-bold shadow-lg shadow-primary/20">
            <Plus size={20} />
            Create Event
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <StatCard 
            icon={Calendar}
            label="Total Events" 
            value={events.length.toString()} 
         />
         <StatCard 
            icon={Plus}
            label="Upcoming Nodes" 
            value={events.filter((e: any) => e.status === 'Upcoming').length.toString()} 
            trend="active"
            trendValue="LIVE"
         />
         <div className="bg-white/5 border border-white/5 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group/search flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block font-sans">Neural Search</span>
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-primary transition-colors" size={20} />
              <input type="text" placeholder="Scan protocols..." className="bg-transparent border-none outline-none w-full pl-8 text-xl font-bold placeholder:text-white/10" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event: any) => (
          <EventCard 
            key={event.id || event.key} 
            event={event} 
            onDelete={handleDelete} 
          />
        ))}
      </div>
    </div>
  );
}
