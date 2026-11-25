import { ChevronRight, Trash2, UserCheck, UserPlus } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { LayoutNode } from '../../utils/orgLayoutEngine';

export interface OrgContextMenuState {
  open: boolean;
  x: number;
  y: number;
  node: LayoutNode | null;
}

interface OrgContextMenuProps {
  state: OrgContextMenuState;
  onClose: () => void;
  onSelectUser: (user: HierarchyNodeUser) => void;
  onAddDirectReport: (user: HierarchyNodeUser) => void;
  onRemoveUser: (user: HierarchyNodeUser) => void;
  onToggleNode: (nodeId: number) => void;
}

export function OrgContextMenu({
  state,
  onClose,
  onSelectUser,
  onAddDirectReport,
  onRemoveUser,
  onToggleNode,
}: OrgContextMenuProps) {
  if (!state.open || !state.node) return null;
  const node = state.node;

  return (
    <div
      style={{ top: state.y, left: state.x }}
      className="fixed z-50 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 text-slate-700 text-xs font-medium backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}>
      <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider truncate">
        {node.user.username}
      </div>

      <button
        type="button"
        onClick={() => {
          onSelectUser(node.user);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer">
        <UserCheck size={14} className="text-slate-400" />
        <span>View details</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onAddDirectReport(node.user);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer">
        <UserPlus size={14} className="text-slate-400" />
        <span>Add direct report</span>
      </button>

      {node.hasReports && (
        <button
          type="button"
          onClick={() => {
            onToggleNode(node.id);
            onClose();
          }}
          className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer">
          <ChevronRight
            size={14}
            className={`text-slate-400 transition-transform ${node.isExpanded ? 'rotate-90' : ''}`}
          />
          <span>{node.isExpanded ? 'Collapse branch' : 'Expand branch'}</span>
        </button>
      )}

      {!node.isRoot && node.id !== -999 && (
        <>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => {
              onRemoveUser(node.user);
              onClose();
            }}
            className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer">
            <Trash2 size={14} />
            <span>Remove employee</span>
          </button>
        </>
      )}
    </div>
  );
}
