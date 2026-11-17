import React from 'react';
import { Clock, Calendar, ShieldCheck } from 'lucide-react';
import type { ResolvedOffice } from '../../types';
import { FALLBACKS } from '../../constants';

interface WorkScheduleCardProps {
  resolvedOffice: ResolvedOffice | null;
}

export const WorkScheduleCard: React.FC<WorkScheduleCardProps> = React.memo(({ resolvedOffice }) => {
  const timezone = resolvedOffice?.timezone || FALLBACKS.DEFAULT_TIMEZONE;

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock size={13} className="text-[#0078d4]" />
          Work Schedule & Availability
        </span>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Core Hours
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Standard Hours</span>
          <span className="font-extrabold text-slate-900 mt-0.5 block">{FALLBACKS.DEFAULT_WORKING_HOURS}</span>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{timezone}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Working Days</span>
          <span className="font-extrabold text-slate-900 mt-0.5 block">Monday – Friday</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">5 Days / 40h Wk</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-slate-400 shrink-0" />
          <span>Shift: General Business Hours</span>
        </span>
        <span className="flex items-center gap-1 text-[#0078d4] font-semibold">
          <ShieldCheck size={12} /> Full-Time Active
        </span>
      </div>
    </div>
  );
});

WorkScheduleCard.displayName = 'WorkScheduleCard';
