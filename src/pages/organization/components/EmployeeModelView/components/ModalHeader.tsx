import React from 'react';
import { Tooltip } from 'antd';
import { Network, RotateCcw, PanelRightClose, PanelRightOpen, ExternalLink, X } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { getDepartmentColor } from '@/pages/organization/utils/orgLayoutEngine';

interface ModalHeaderProps {
  focusedNode: HierarchyNodeUser | null;
  navigationHistoryLength: number;
  showDetailPanel: boolean;
  onBackNavigation: () => void;
  onToggleDetailPanel: () => void;
  onViewFullTree: () => void;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = React.memo(
  ({
    focusedNode,
    navigationHistoryLength,
    showDetailPanel,
    onBackNavigation,
    onToggleDetailPanel,
    onViewFullTree,
    onClose,
  }) => {
    const deptColor = focusedNode ? getDepartmentColor(focusedNode.department) : null;

    return (
      <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 sm:gap-4 bg-white shrink-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0078d4]/10 text-[#0078d4] flex items-center justify-center shrink-0 border border-[#0078d4]/20">
            <Network size={18} className="sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                Employee Organizational Model
              </h2>
              {focusedNode && (
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#0078d4] bg-[#0078d4]/8 px-1.5 sm:px-2 py-0.5 rounded-md border border-[#0078d4]/20">
                  {focusedNode.employee_code || `EMP-${focusedNode.id}`}
                </span>
              )}
            </div>

            {focusedNode && (
              <p className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-900 font-bold">{focusedNode.username}</span>
                <span className="text-slate-400">•</span>
                <span>{focusedNode.designation || focusedNode.role}</span>
                {focusedNode.department && deptColor && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span
                      className="px-1.5 sm:px-2 py-px rounded-md text-[9px] sm:text-[10px] font-bold"
                      style={{ backgroundColor: deptColor.bg, color: deptColor.text }}>
                      {focusedNode.department}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {navigationHistoryLength > 0 && (
            <Tooltip title="Back to previous employee in view">
              <button
                type="button"
                onClick={onBackNavigation}
                className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Previous</span>
              </button>
            </Tooltip>
          )}

          <Tooltip
            title={showDetailPanel ? 'Hide profile card sidebar' : 'Show profile card sidebar'}>
            <button
              type="button"
              onClick={onToggleDetailPanel}
              className={`h-8 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                showDetailPanel
                  ? 'bg-[#0078d4]/10 text-[#0078d4] border-[#0078d4]/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}>
              {showDetailPanel ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              <span className="hidden md:inline">
                {showDetailPanel ? 'Hide Profile Card' : 'Show Profile Card'}
              </span>
            </button>
          </Tooltip>

          <Tooltip title="Navigate to /org to view the complete organizational hierarchy">
            <button
              type="button"
              onClick={onViewFullTree}
              className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl bg-[#0078d4] text-white hover:bg-[#106ebe] text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-md shadow-[#0078d4]/20 hover:shadow-lg">
              <ExternalLink size={13} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline font-extrabold tracking-wide">View Full Tree</span>
              <span className="sm:hidden font-extrabold">Tree</span>
            </button>
          </Tooltip>

          <Tooltip title="Close modal">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal">
              <X size={18} />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';
