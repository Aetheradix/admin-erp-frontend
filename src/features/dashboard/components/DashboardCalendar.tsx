import { MoreHorizontal, ArrowUpRight } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import { useCalendarData } from '../hooks/useCalendarData';

const DashboardCalendar: React.FC = () => {
  const { days, isEmerald, isRose, isBold, hasAvatar } = useCalendarData();

  return (
    <div className="bg-[#1b212f] rounded-[2.5rem] p-6 lg:p-8 border border-white/5 flex flex-col shadow-2xl shadow-black/20 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-end gap-2">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Calendar</h2>
          <span className="text-white/40 font-black text-xs mb-1 tracking-widest uppercase">(April Cycle)</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={MoreHorizontal} className="bg-white/5! border-none!" />
          <IconButton icon={ArrowUpRight} className="bg-white/5! border-none!" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-6 gap-x-2 mt-4 text-center text-xs font-black uppercase tracking-widest text-white/20">
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
        
        {days.map((_, i) => {
          const day = i + 1;
          return (
            <div key={i} className="relative flex justify-center items-center h-10 w-full group cursor-pointer">
              {isEmerald(day) && (
                <div className="absolute inset-0 border border-current rounded-full opacity-30 text-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
              )}
              {isRose(day) && (
                <div className="absolute inset-0 border border-current rounded-full opacity-30 text-rose-500 scale-110 shadow-[0_0_15px_rgba(244,63,94,0.2)]"></div>
              )}
              <span className={`z-10 transition-all duration-300 ${isBold(day) ? 'text-white font-black scale-110' : 'group-hover:text-white group-hover:scale-110'}`}>
                {day}
              </span>

              {hasAvatar(day) && (
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-[#1b212f] overflow-hidden bg-white/10 z-20 shadow-lg">
                   <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=C${i}`} className="w-full h-full object-cover" alt="User" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCalendar;
