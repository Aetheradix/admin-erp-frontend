import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { Tooltip } from 'antd';
import { Building2, Crown, Users, X } from 'lucide-react';
import React from 'react';
import type { ResolvedOffice } from '../../types';
import { EmployeeAvatar } from '../nodes/EmployeeAvatar';
import { QuickActionsBar } from './QuickActionsBar';

interface DetailHeaderProps {
  inspectedNode: HierarchyNodeUser;
  isCentral: boolean;
  manager: HierarchyNodeUser | null;
  directReportsCount: number;
  resolvedOffice: ResolvedOffice | null;
  dbUserStatus?: string;
  onSetCentral: () => void;
  onClosePanel: () => void;
  onScheduleClick: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = React.memo(
  ({
    inspectedNode,
    manager,
    directReportsCount,
    resolvedOffice,
    dbUserStatus = 'Active',
    onClosePanel,
    onScheduleClick,
  }) => {
    // const deptColor = getDepartmentColor(inspectedNode.department);
    const managerName = manager ? manager.username : 'Board of Directors';
    const officeName = resolvedOffice?.name || 'SFA Technologies HQ';

    return (
      <>
        <div className="h-24 bg-linear-to-r from-[#0078d4] via-[#106ebe] to-[#005a9e] relative shrink-0">
          <Tooltip title="Collapse Details Sidebar">
            <button
              type="button"
              onClick={onClosePanel}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Collapse Details Sidebar">
              <X size={15} />
            </button>
          </Tooltip>
        </div>

        <div className="px-6 pb-4 pt-0 relative m-1 shrink-0 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="flex items-end gap-3.5 min-w-0">
              <EmployeeAvatar user={inspectedNode} size="xl" presence />
              <div className="min-w-0 pb-0.5">
                <h3 className="text-xl font-black text-slate-900 leading-tight truncate">
                  {inspectedNode.username}
                </h3>
                <p className="text-xs font-bold text-[#0078d4] mt-0.5 truncate">
                  {inspectedNode.designation || inspectedNode.role}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {/* <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
                  style={{ backgroundColor: deptColor.bg, color: deptColor.text, borderColor: deptColor.border }}
                >
                  {inspectedNode.department || 'General'}
                </span> */}
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {inspectedNode.employee_code || `EMP-${inspectedNode.id}`}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {dbUserStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              {/* {!isCentral ? (
              <Tooltip title="Focus organization tree on this employee">
                <button
                  type="button"
                  onClick={onSetCentral}
                  className="px-3 py-1.5 rounded-xl bg-[#0078d4] text-white hover:bg-[#106ebe] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Sparkles size={13} />
                  <span>Set as Central</span>
                </button>
              </Tooltip>
            ) : (
              <Tooltip title="This employee is currently the central focus of the organization model">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto cursor-default">
                  <Check size={12} /> Central Focus
                </span>
              </Tooltip>
            )} */}

              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                <Tooltip
                  title={
                    manager
                      ? `Reporting Manager: ${managerName} (${manager.designation || manager.role})`
                      : 'Reports to Board of Directors'
                  }>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left cursor-default">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400 block">
                      Manager
                    </span>
                    <span className="font-extrabold text-slate-800 truncate block max-w-25">
                      {manager ? (
                        manager.username
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Crown size={10} className="text-amber-600 inline" /> Board
                        </span>
                      )}
                    </span>
                  </div>
                </Tooltip>
                <Tooltip
                  title={`${directReportsCount} direct reports under ${inspectedNode.username}`}>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left cursor-default">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400 block">
                      Reports
                    </span>
                    <span className="font-black text-[#0078d4] flex items-center gap-1">
                      <Users size={10} /> {directReportsCount} Team
                    </span>
                  </div>
                </Tooltip>
                <Tooltip
                  title={
                    resolvedOffice?.address
                      ? `${officeName} • ${resolvedOffice.address}`
                      : officeName
                  }>
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left cursor-default">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400 block">
                      Location
                    </span>
                    <span className="font-extrabold text-slate-800 truncate block max-w-25">
                      <Building2 size={10} className="inline text-[#0078d4] mr-0.5" />
                      {resolvedOffice?.name || 'HQ'}
                    </span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          <QuickActionsBar user={inspectedNode} onScheduleClick={onScheduleClick} />
        </div>
      </>
    );
  }
);

DetailHeader.displayName = 'DetailHeader';
