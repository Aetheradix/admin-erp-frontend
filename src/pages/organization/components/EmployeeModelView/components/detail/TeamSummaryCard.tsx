import React from 'react';
import { Tooltip } from 'antd';
import { Users, Crown, ChevronRight } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { EmployeeAvatar } from '../nodes/EmployeeAvatar';

interface TeamSummaryCardProps {
  manager: HierarchyNodeUser | null;
  directReports: HierarchyNodeUser[];
  onInspectUser?: (user: HierarchyNodeUser) => void;
}

export const TeamSummaryCard: React.FC<TeamSummaryCardProps> = React.memo(({
  manager,
  directReports,
  onInspectUser,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Users size={13} className="text-[#0078d4]" />
          Direct Reports & Team Summary
        </span>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#0078d4] border border-blue-200">
          {directReports.length} {directReports.length === 1 ? 'Report' : 'Reports'}
        </span>
      </div>

      <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reports To</span>
          <span className="text-xs font-black text-slate-900 block truncate mt-0.5">
            {manager ? manager.username : 'Board of Directors'}
          </span>
        </div>
        {manager && onInspectUser ? (
          <Tooltip title={`Inspect manager ${manager.username}`}>
            <button
              type="button"
              onClick={() => onInspectUser(manager)}
              className="text-[10px] font-bold text-[#0078d4] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Inspect <ChevronRight size={11} />
            </button>
          </Tooltip>
        ) : (
          <Crown size={15} className="text-amber-600 shrink-0" />
        )}
      </div>

      {directReports.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Direct Team Members</span>
          <div className="flex flex-wrap gap-1.5">
            {directReports.slice(0, 4).map((sub) => (
              <Tooltip key={sub.id} title={`${sub.username} • ${sub.designation || sub.role} (${sub.department || 'General'})`}>
                <button
                  type="button"
                  onClick={() => onInspectUser?.(sub)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200 hover:border-[#0078d4] hover:bg-blue-50/50 transition-colors cursor-pointer text-left"
                >
                  <EmployeeAvatar user={sub} size="sm" presence={false} />
                  <span className="text-[11px] font-bold text-slate-800 truncate max-w-[110px]">{sub.username}</span>
                </button>
              </Tooltip>
            ))}
            {directReports.length > 4 && (
              <Tooltip title={directReports.slice(4).map((u) => u.username).join(', ')}>
                <span className="px-2 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center cursor-default">
                  +{directReports.length - 4} more
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 font-medium py-1 px-0.5">
          Individual Contributor (no direct team reports assigned).
        </div>
      )}
    </div>
  );
});

TeamSummaryCard.displayName = 'TeamSummaryCard';
