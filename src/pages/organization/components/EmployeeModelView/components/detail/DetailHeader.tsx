import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { EmployeeAvatar } from '../nodes/EmployeeAvatar';
import { QuickActionsBar } from './QuickActionsBar';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface DetailHeaderProps {
  inspectedNode: HierarchyNodeUser;
  isCentral: boolean;
  onSetCentral: () => void;
  onClosePanel: () => void;
  onScheduleClick: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = React.memo(({
  inspectedNode,
  isCentral,
  onSetCentral,
  onClosePanel,
  onScheduleClick,
}) => {
  const deptColor = getDepartmentColor(inspectedNode.department);

  return (
    <>
      <div className="h-28 bg-gradient-to-r from-[#0078d4] via-[#106ebe] to-[#005a9e] relative shrink-0">
        <button
          type="button"
          onClick={onClosePanel}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Collapse Details Sidebar"
          aria-label="Collapse Details Sidebar"
        >
          <X size={15} />
        </button>
      </div>

      <div className="px-6 pb-4 pt-0 relative -mt-12 shrink-0 border-b border-slate-100">
        <div className="flex items-end justify-between mb-3">
          <EmployeeAvatar user={inspectedNode} size="xl" presence />

          {!isCentral ? (
            <button
              type="button"
              onClick={onSetCentral}
              className="px-3 py-1.5 rounded-xl bg-[#0078d4] text-white hover:bg-[#106ebe] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Set as central node in hierarchy"
            >
              <Sparkles size={13} />
              <span>Set as Central</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Check size={12} /> Central Focus
            </span>
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight">{inspectedNode.username}</h3>
        <p className="text-xs font-bold text-[#0078d4] mt-0.5">
          {inspectedNode.designation || inspectedNode.role}
        </p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
            style={{ backgroundColor: deptColor.bg, color: deptColor.text, borderColor: deptColor.border }}
          >
            {inspectedNode.department || 'General'}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {inspectedNode.employee_code || `EMP-${inspectedNode.id}`}
          </span>
        </div>

        <QuickActionsBar user={inspectedNode} onScheduleClick={onScheduleClick} />
      </div>
    </>
  );
});

DetailHeader.displayName = 'DetailHeader';
