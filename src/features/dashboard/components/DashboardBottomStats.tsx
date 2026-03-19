import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

const DashboardBottomStats: React.FC = () => {
  const { chartData } = useDashboardData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Projects this year */}
      <div className="bg-[#1b212f] rounded-[2.5rem] p-6 lg:p-8 border border-white/5 relative">
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hidden sm:flex">
          <ArrowUpRight size={20} className="text-white/50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-6">Projects this year</h3>
        
        <div className="mb-6">
          <p className="text-sm text-white/50 mb-1">Average tasks value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">$ 568,338</span>
            <span className="text-xs text-white/30">$ 321,339 less than last year</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-white/50 mb-1">Average tasks per project</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">89,3</span>
            <span className="text-xs text-white/30">61.4 less than last year</span>
          </div>
        </div>
      </div>

      {/* Yearly Profit */}
      <div className="bg-[#1b212f] rounded-[2.5rem] p-6 lg:p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hidden sm:flex">
          <ArrowUpRight size={20} className="text-white/50" />
        </div>
        <div className="flex items-end gap-2 mb-8">
          <h3 className="text-xl font-bold text-white">Yearly profit</h3>
          <span className="text-sm text-white/40 mb-0.5">(28%)</span>
        </div>
        
        <div className="flex items-end justify-between h-32 gap-2 mt-4">
          {chartData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group cursor-pointer h-full">
              <div 
                className={`w-full max-w-3 rounded-t-sm transition-all duration-300 ${i === 7 ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}`} 
                style={{ height: `${data.value}%` }}
              ></div>
              <span className={`text-[10px] uppercase font-bold ${i === 7 ? 'text-cyan-400' : 'text-white/30'}`}>
                {data.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardBottomStats;
