import React from 'react';
import { Tooltip } from 'antd';
import { Sparkles, Mail, Building2, Calendar } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { NodePosition, ResolvedOffice, JoinDateInfo } from '../../types';
import { EmployeeAvatar } from './EmployeeAvatar';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface CentralNodeCardProps {
  user: HierarchyNodeUser;
  pos: NodePosition;
  isSelected: boolean;
  reportingManager: HierarchyNodeUser | null;
  directReportsCount: number;
  totalTeamCount: number;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  onInspect: (user: HierarchyNodeUser) => void;
}

export const CentralNodeCard: React.FC<CentralNodeCardProps> = React.memo(({
  user, pos, isSelected, reportingManager, directReportsCount, totalTeamCount,
  resolvedOffice, joinDateInfo, onInspect,
}) => {
  const deptColor = getDepartmentColor(user.department);

  return (
    <div
      data-node-card="true"
      tabIndex={0}
      role="button"
      aria-label={`Central Focus: ${user.username}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onInspect(user))}
      style={{ width: pos.width, height: pos.height, transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)` }}
      onClick={() => onInspect(user)}
      className={`absolute top-0 left-0 pointer-events-auto rounded-3xl bg-white border-2 shadow-xl p-4 flex flex-col justify-between transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#0078d4]/30 ${
        isSelected ? 'border-[#0078d4] ring-4 ring-[#0078d4]/20 shadow-[#0078d4]/15' : 'border-slate-300 hover:border-[#0078d4]'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: deptColor.text }} />

      <div className="flex items-center justify-between mt-0.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0078d4] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
          <Sparkles size={11} /> Central Focus
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
          style={{ backgroundColor: deptColor.bg, color: deptColor.text, borderColor: deptColor.border }}
        >
          {user.department || 'General'}
        </span>
      </div>

      <div className="flex items-center gap-3.5 my-1">
        <EmployeeAvatar user={user} size="lg" presence />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-slate-900 truncate leading-snug">{user.username}</h3>
          <p className="text-xs font-extrabold text-[#0078d4] truncate">{user.designation || user.role}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
              {user.employee_code || `EMP-${user.id}`}
            </span>
            {user.email && (
              <Tooltip title={user.email}>
                <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Mail size={11} className="text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
        <div className="flex flex-col">
          <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">Reporting Manager</span>
          <span className="font-extrabold text-slate-800 truncate">{reportingManager ? reportingManager.username : 'Board of Directors'}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">Direct Reports</span>
          <span className="font-black text-[#0078d4]">
            {directReportsCount} <span className="text-slate-500 font-normal">({totalTeamCount} team)</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
        <span className="flex items-center gap-1 font-bold text-slate-700 truncate max-w-[170px]" title={resolvedOffice?.name || 'SFA Technologies'}>
          <Building2 size={11} className="text-[#0078d4] shrink-0" />
          <span className="truncate">{resolvedOffice?.name || 'SFA Technologies'}</span>
        </span>
        <span className="flex items-center gap-1 text-slate-400 font-medium">
          <Calendar size={11} className="text-slate-400 shrink-0" />
          <span>Joined {joinDateInfo.dateFormatted}</span>
        </span>
      </div>
    </div>
  );
});

CentralNodeCard.displayName = 'CentralNodeCard';
