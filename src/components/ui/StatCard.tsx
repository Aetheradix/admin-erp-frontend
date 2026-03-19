import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Badge from './Badge';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: string;
  trendValue?: string;
  variant?: 'default' | 'elevated';
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  trendValue,
  variant = 'default' 
}) => {
  return (
    <div className={`flex items-center gap-4 rounded-full pl-2 pr-6 py-2 border border-white/5 shadow-sm transition-all hover:border-white/10 ${variant === 'elevated' ? 'bg-[#1b212f]' : 'bg-white/5'}`}>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
        <Icon size={18} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{value}</span>
          {trendValue && (
            <Badge variant="primary" className="px-2! py-0.5! rounded-full scale-90 origin-left">
              {trendValue} {trend}
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
