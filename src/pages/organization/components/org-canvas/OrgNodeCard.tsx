import { Tooltip } from 'antd';
import { Crown, UserCheck } from 'lucide-react';
import type { LayoutNode } from '../../utils/orgLayoutEngine';

interface OrgNodeCardProps {
  node: LayoutNode;
  isSelected: boolean;
  isMatched: boolean;
  isDimmed: boolean;
  onSelect: (node: LayoutNode) => void;
  onToggle: (nodeId: number) => void;
  onContextMenu: (event: React.MouseEvent, node: LayoutNode) => void;
}

function getInitials(username: string): string {
  return username
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function OrgNodeCard({
  node,
  isSelected,
  isMatched,
  isDimmed,
  onSelect,
  onToggle,
  onContextMenu,
}: OrgNodeCardProps) {
  const isUnassignedPool = node.id === -999;

  // Founder/CEO styling is based on the job title, not the RBAC role.
  const isFounderOrCeoNode = Boolean(
    !isUnassignedPool &&
    !node.user.reporting_manager_id &&
    (node.user.designation?.toLowerCase().includes('founder') ||
      node.user.designation?.toLowerCase().includes('ceo'))
  );

  const handleActivate = () => {
    if (isUnassignedPool) {
      onToggle(node.id);
    } else {
      onSelect(node);
    }
  };

  return (
    <div
      data-node-card="true"
      tabIndex={0}
      role="button"
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleActivate();
      }}
      onContextMenu={(e) => {
        if (!isUnassignedPool) {
          onContextMenu(e, node);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          handleActivate();
        }
      }}
      style={{
        width: node.width,
        height: node.height,
        transform: `translate3d(${node.x}px, ${node.y}px, 0px)`,
        transition:
          'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease, box-shadow 200ms ease',
        opacity: isDimmed ? 0.25 : 1,
        ...(node.isDeptHead ? { borderLeftColor: node.departmentColor.text } : {}),
      }}
      className={`absolute top-0 left-0 pointer-events-auto rounded-2xl cursor-pointer outline-none select-none flex items-center justify-between px-3.5 transition-all bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 ${
        isUnassignedPool
          ? 'border-2 border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100/80 shadow-xs'
          : isFounderOrCeoNode
            ? 'border-2 border-amber-300 shadow-md hover:shadow-lg'
            : ''
      } ${
        isSelected
          ? 'ring-2 ring-[#e8583a] ring-offset-2 ring-offset-[#faf9f8] shadow-md border-[#e8583a]'
          : ''
      } ${isMatched && !isSelected ? 'ring-2 ring-primary/80 shadow-md' : ''} ${
        node.isDeptHead ? 'border-l-4' : ''
      }`}>
      {/* Left Side: Avatar + Name & Designation */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        {isUnassignedPool ? (
          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
            <UserCheck size={16} className="text-amber-600" />
          </div>
        ) : node.user.image_url ? (
          <img
            src={node.user.image_url}
            alt={node.user.username}
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isFounderOrCeoNode ? 'bg-amber-500 text-white shadow-xs' : 'text-white shadow-xs'
            }`}
            style={!isFounderOrCeoNode ? { backgroundColor: node.departmentColor.text } : {}}>
            {isFounderOrCeoNode ? (
              <Crown size={15} className="text-white" />
            ) : (
              getInitials(node.user.username)
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Tooltip title={node.user.username} placement="topLeft">
            <span
              className={`block font-bold text-[13px] truncate leading-tight ${
                isUnassignedPool
                  ? 'text-amber-950 font-bold'
                  : isFounderOrCeoNode
                    ? 'text-slate-950 font-black'
                    : 'text-slate-900'
              }`}>
              {node.user.username}
            </span>
          </Tooltip>

          <Tooltip
            title={
              isUnassignedPool
                ? `${node.user.directReports?.length || 0} employees awaiting manager assignment`
                : `${node.user.designation || node.user.role || 'Member'}${
                    node.user.department ? ` · in ${node.user.department}` : ''
                  }`
            }
            placement="bottomLeft">
            <span
              className={`block text-[11px] truncate leading-tight mt-0.5 font-medium ${
                isUnassignedPool ? 'text-amber-700 font-semibold' : 'text-slate-500'
              }`}>
              {node.user.designation ||
                node.user.role ||
                (isFounderOrCeoNode ? 'Founder & CEO' : 'Member')}
            </span>
          </Tooltip>
        </div>
      </div>

      {node.hasReports && (
        <Tooltip
          title={
            isUnassignedPool
              ? node.isExpanded
                ? 'Click to collapse unassigned staff'
                : 'Click to expand unassigned staff'
              : node.isExpanded
                ? `Click to collapse branch (${node.directReportsCount} reports)`
                : `Click to expand branch (${node.directReportsCount} reports)`
          }>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className={`shrink-0 min-w-6.5 h-6 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
              isUnassignedPool
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold'
                : isFounderOrCeoNode
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  : node.isExpanded
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-black'
            }`}>
            {node.isExpanded ? (
              <span>{node.totalTeamCount || node.directReportsCount}</span>
            ) : (
              <span>+{node.totalTeamCount || node.directReportsCount}</span>
            )}
          </button>
        </Tooltip>
      )}
    </div>
  );
}
