import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

interface SkillsSummaryCardProps {
  skills: string[];
  department?: string;
  role?: string;
}

export const SkillsSummaryCard: React.FC<SkillsSummaryCardProps> = React.memo(({
  skills,
  department,
  role,
}) => {
  return (
    <div className="p-3.5 w-full rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#0078d4]" />
          Skills & Core Competencies
        </span>
        <span className="text-[10px] font-bold text-slate-500">
          {skills.length > 0 ? `${skills.length} Recorded` : 'System Verified'}
        </span>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {skills.map((sk) => (
            <span
              key={sk}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 hover:border-[#0078d4]/40 text-slate-700 hover:text-[#0078d4] text-[11px] font-bold transition-colors shadow-2xs"
            >
              {sk}
            </span>
          ))}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">No specific skill tags in profile record</span>
          <span className="text-[10px] font-bold text-[#0078d4] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
            <Shield size={10} /> {role || 'Employee'} · {department || 'General'}
          </span>
        </div>
      )}
    </div>
  );
});

SkillsSummaryCard.displayName = 'SkillsSummaryCard';
