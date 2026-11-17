import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { NodePosition, OrgNodeVariant } from '../../types';
import { NODE_VARIANTS } from './nodeVariants';
import { EmployeeAvatar } from './EmployeeAvatar';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface OrgNodeCardProps {
  user: HierarchyNodeUser;
  pos: NodePosition;
  variant: OrgNodeVariant;
  isSelected: boolean;
  onInspect: (user: HierarchyNodeUser) => void;
  onFocus: (user: HierarchyNodeUser) => void;
  hasSubs?: boolean;
  isExpanded?: boolean;
  subCount?: number;
  onToggleSub?: (e: React.MouseEvent) => void;
  reportsToName?: string;
}

export const OrgNodeCard: React.FC<OrgNodeCardProps> = React.memo(({
  user,
  pos,
  variant,
  isSelected,
  onInspect,
  onFocus,
  hasSubs,
  isExpanded,
  subCount = 0,
  onToggleSub,
  reportsToName,
}) => {
  const config = NODE_VARIANTS[variant];
  const deptColor = getDepartmentColor(user.department);

  return (
    <div
      data-node-card="true"
      tabIndex={0}
      role="button"
      aria-label={`${config.badgeLabel}: ${user.username}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect(user);
        }
      }}
      style={{
        width: pos.width,
        height: pos.height,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`,
      }}
      onClick={() => onInspect(user)}
      className={`absolute top-0 left-0 pointer-events-auto rounded-2xl bg-white border p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0078d4] ${
        isSelected ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30' : config.borderClass
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badgeClass}`}
        >
          {config.badgeIcon}
          {config.badgeLabel}
        </span>

        <div className="flex items-center gap-1">
          {hasSubs && onToggleSub && (
            <button
              type="button"
              onClick={onToggleSub}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                isExpanded
                  ? 'bg-[#0078d4] text-white'
                  : 'bg-[#0078d4]/10 text-[#0078d4] hover:bg-[#0078d4]/20 border border-[#0078d4]/20'
              }`}
              title={isExpanded ? 'Collapse sub-tree' : 'Expand sub-tree reports'}
            >
              <span>{subCount} sub-reports</span>
              <ChevronDown
                size={11}
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFocus(user);
            }}
            className="text-[10px] font-bold text-slate-400 group-hover:text-[#0078d4] hover:underline transition-colors flex items-center gap-0.5"
          >
            {config.focusText} <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <EmployeeAvatar user={user} size={config.avatarSize} />
        <div className="min-w-0 flex-1">
          <span
            className={`block text-xs font-black text-slate-900 truncate transition-colors ${
              config.subTitleClass || ''
            }`}
          >
            {user.username}
          </span>
          <span className="block text-[11px] text-slate-600 font-semibold truncate">
            {user.designation || user.role}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block truncate">
            {user.employee_code || `ID: ${user.id}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
        <span
          className="font-bold px-1.5 py-0.25 rounded text-[10px]"
          style={{ backgroundColor: deptColor.bg, color: deptColor.text }}
        >
          {user.department || 'General'}
        </span>
        <span className="text-slate-400">
          {reportsToName
            ? `Reports to ${reportsToName}`
            : user.subordinatesCount
            ? `${user.subordinatesCount} Reports`
            : user.directReports?.length
            ? `${user.directReports.length} Direct Reports`
            : 'Individual Contributor'}
        </span>
      </div>
    </div>
  );
});

OrgNodeCard.displayName = 'OrgNodeCard';
