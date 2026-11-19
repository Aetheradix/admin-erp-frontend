import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { LayoutNode } from '../utils/orgLayoutEngine';
import { useOrgCanvasLayout } from './org-canvas/useOrgCanvasLayout';
import { useOrgCanvasTransform } from './org-canvas/useOrgCanvasTransform';
import { OrgNodeCard } from './org-canvas/OrgNodeCard';
import { OrgCanvasControls } from './org-canvas/OrgCanvasControls';
import { OrgContextMenu, type OrgContextMenuState } from './org-canvas/OrgContextMenu';
import { DotGridBackground } from './org-canvas/DotGridBackground';

interface OrgCanvasMapProps {
  rootUsers: HierarchyNodeUser[];
  flatUsers: HierarchyNodeUser[];
  searchQuery: string;
  selectedDepartment: string;
  selectedUserId: number | null;
  onSelectUser: (user: HierarchyNodeUser) => void;
  onAddDirectReport: (user: HierarchyNodeUser) => void;
  onRemoveUser: (user: HierarchyNodeUser) => void;
  expandedNodes: Record<number, boolean>;
  onToggleNode: (nodeId: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onHiddenCountChange?: (count: number) => void;
}

const CLOSED_MENU: OrgContextMenuState = { open: false, x: 0, y: 0, node: null };

export const OrgCanvasMap = ({
  rootUsers,
  flatUsers,
  searchQuery,
  selectedDepartment,
  selectedUserId,
  onSelectUser,
  onAddDirectReport,
  onRemoveUser,
  expandedNodes,
  onToggleNode,
  onHiddenCountChange,
}: OrgCanvasMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<OrgContextMenuState>(CLOSED_MENU);

  const { filterEval, layoutResult } = useOrgCanvasLayout(
    rootUsers,
    flatUsers,
    searchQuery,
    selectedDepartment,
    expandedNodes
  );

  const transform = useOrgCanvasTransform({
    containerRef,
    nodes: layoutResult.nodes,
    nodeMap: layoutResult.nodeMap,
    bounds: layoutResult.bounds,
    selectedUserId,
  });

  useEffect(() => {
    onHiddenCountChange?.(layoutResult.hiddenCount);
  }, [layoutResult.hiddenCount, onHiddenCountChange]);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
  }, []);

  // Close the context menu on outside clicks or Escape; both listeners are removed on cleanup.
  useEffect(() => {
    if (!contextMenu.open) return;
    const handleClick = () => closeContextMenu();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeContextMenu();
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.open, closeContextMenu]);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: LayoutNode) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ open: true, x: event.clientX, y: event.clientY, node });
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={transform.handlePointerDown}
      onPointerMove={transform.handlePointerMove}
      onPointerUp={transform.handlePointerUp}
      className="relative w-full h-full min-h-[640px] flex-1 overflow-hidden select-none bg-[#faf9f8] text-slate-800 cursor-grab active:cursor-grabbing font-sans"
      style={{ touchAction: 'none' }}>
      <DotGridBackground zoom={transform.zoom} pan={transform.pan} />

      {filterEval.hasFilter && filterEval.isEmptyMatch && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-white/95 border border-slate-200 shadow-lg text-xs font-semibold text-slate-700 flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Search size={14} className="text-[#e8583a]" />
          <span>No one matches &ldquo;{searchQuery}&rdquo;</span>
        </div>
      )}

      <div
        className="absolute top-0 left-0 w-0 h-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate3d(${transform.pan.x}px, ${transform.pan.y}px, 0px) scale(${transform.zoom})`,
        }}>
        <svg
          className="absolute overflow-visible pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: layoutResult.bounds.width + 600,
            height: layoutResult.bounds.height + 600,
          }}>
          {layoutResult.connectors.map((connector) => (
            <path
              key={connector.id}
              d={connector.path}
              fill="none"
              stroke={connector.isHighlighted ? '#e8583a' : '#cbd5e1'}
              strokeWidth={connector.isHighlighted ? 2.5 : 2}
              strokeLinecap="round"
              className="transition-[stroke,stroke-width] duration-300"
            />
          ))}
        </svg>

        {layoutResult.nodes.map((node) => (
          <OrgNodeCard
            key={node.id}
            node={node}
            isSelected={selectedUserId === node.id}
            isMatched={filterEval.matchedIds.has(node.id)}
            isDimmed={filterEval.hasFilter && !filterEval.highlightedIds.has(node.id)}
            onSelect={(target) => onSelectUser(target.user)}
            onToggle={onToggleNode}
            onContextMenu={handleNodeContextMenu}
          />
        ))}
      </div>

      <OrgCanvasControls
        onZoomIn={transform.zoomIn}
        onZoomOut={transform.zoomOut}
        onFit={transform.handleFit}
      />

      <OrgContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onSelectUser={onSelectUser}
        onAddDirectReport={onAddDirectReport}
        onRemoveUser={onRemoveUser}
        onToggleNode={onToggleNode}
      />
    </div>
  );
};
