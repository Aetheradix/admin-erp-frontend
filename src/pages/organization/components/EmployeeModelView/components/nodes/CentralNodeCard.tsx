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
  reportingManager: HierarchyNodeUser | null;
  directReportsCount: number;
  totalTeamCount: number;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  isSelected: boolean;
  onInspect: (user: HierarchyNodeUser) => void;
}

export const CentralNodeCard: React.FC<CentralNodeCardProps> = React.memo(
  ({
    user,
    pos,
    reportingManager,
    directReportsCount,
    totalTeamCount,
    resolvedOffice,
    joinDateInfo,
    isSelected,
    onInspect,
  }) => {
    const deptColor = getDepartmentColor(user.department);

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Central focus: ${user.username}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onInspect(user);
          }
        }}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
        }}
        onClick={() => onInspect(user)}
        className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border-2 p-4 flex flex-col justify-between transition-all cursor-pointer shadow-xl ${
          isSelected
            ? 'border-[#0078d4] ring-4 ring-[#0078d4]/20'
            : 'border-[#0078d4] hover:shadow-2xl'
        }`}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles size={11} /> Central Focus
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
            style={{
              backgroundColor: deptColor.bg,
              color: deptColor.text,
              borderColor: deptColor.border,
            }}>
            {user.department || 'General'}
          </span>
        </div>

        <div className="flex items-center gap-3.5 my-1">
          <EmployeeAvatar user={user} size="lg" presence />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-slate-900 truncate leading-snug">
              {user.username}
            </h3>
            <p className="text-xs font-extrabold text-[#0078d4] truncate">
              {user.designation || user.role}
            </p>
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
          <Tooltip
            title={
              reportingManager
                ? `Reports to ${reportingManager.username} (${reportingManager.designation || reportingManager.role})`
                : 'Reports to Board of Directors'
            }>
            <div className="flex flex-col cursor-default">
              <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                Reporting Manager
              </span>
              <span className="font-extrabold text-slate-800 truncate">
                {reportingManager ? reportingManager.username : 'Board of Directors'}
              </span>
            </div>
          </Tooltip>
          <Tooltip
            title={`${directReportsCount} direct reports • ${totalTeamCount} total team hierarchy`}>
            <div className="flex flex-col text-right cursor-default">
              <span className="text-slate-400 font-bold uppercase tracking-tighter text-[9px]">
                Direct Reports
              </span>
              <span className="font-black text-[#0078d4]">
                {directReportsCount}{' '}
                <span className="text-slate-500 font-normal">({totalTeamCount} team)</span>
              </span>
            </div>
          </Tooltip>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
          <Tooltip
            title={
              resolvedOffice?.address
                ? `${resolvedOffice.name} • ${resolvedOffice.address}`
                : resolvedOffice?.name || 'SFA Technologies HQ'
            }>
            <span className="flex items-center gap-1 font-bold text-slate-700 truncate max-w-[170px] cursor-default">
              <Building2 size={11} className="text-[#0078d4] shrink-0" />
              <span className="truncate">{resolvedOffice?.name || 'SFA Technologies'}</span>
            </span>
          </Tooltip>
          <Tooltip title={`Onboarded on ${joinDateInfo.dateFormatted} (${joinDateInfo.timezone})`}>
            <span className="flex items-center gap-1 text-slate-400 font-medium cursor-default">
              <Calendar size={11} className="text-slate-400 shrink-0" />
              <span>Joined {joinDateInfo.dateFormatted}</span>
            </span>
          </Tooltip>
        </div>
      </div>
    );
  }
);

CentralNodeCard.displayName = 'CentralNodeCard';
