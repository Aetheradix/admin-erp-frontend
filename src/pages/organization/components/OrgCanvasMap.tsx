import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Tooltip } from 'antd';
import {
  Crown,
  Search,
  UserPlus,
  Trash2,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import {
  computeHorizontalTreeLayout,
  buildParentMap,
  evaluateFilterAndSearch,
  type LayoutNode,
} from '../utils/orgLayoutEngine';

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

interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  node: LayoutNode | null;
}

export const OrgCanvasMap: React.FC<OrgCanvasMapProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform state: pan & zoom
  const [pan, setPan] = useState({ x: 80, y: 140 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const hasInitializedZoom = useRef(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    node: null,
  });

  // Parent lookup map
  const parentMap = useMemo(() => buildParentMap(flatUsers), [flatUsers]);

  // Unified apex tree
  const unifiedRoot = useMemo<HierarchyNodeUser | null>(() => {
    if (!rootUsers || rootUsers.length === 0) return null;
    if (rootUsers.length === 1) return rootUsers[0];

    // Find founder or first root as apex
    const founder =
      rootUsers.find(
        (u) =>
          u.username.toLowerCase().includes('founder') ||
          u.designation?.toLowerCase().includes('founder') ||
          u.designation?.toLowerCase().includes('ceo')
      ) || rootUsers[0];

    const otherRoots = rootUsers.filter((u) => u.id !== founder.id);
    return {
      ...founder,
      directReports: [...(founder.directReports || []), ...otherRoots],
    };
  }, [rootUsers]);

  // Filter & Search Evaluation
  const filterEval = useMemo(() => {
    return evaluateFilterAndSearch(
      flatUsers,
      searchQuery,
      selectedDepartment,
      parentMap
    );
  }, [flatUsers, searchQuery, selectedDepartment, parentMap]);

  // Compute Layout
  const layoutResult = useMemo(() => {
    if (!unifiedRoot) {
      return {
        nodes: [],
        nodeMap: new Map<number, LayoutNode>(),
        connectors: [],
        bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400, width: 600, height: 400 },
        hiddenCount: 0,
      };
    }
    return computeHorizontalTreeLayout(
      unifiedRoot,
      expandedNodes,
      filterEval.highlightedIds
    );
  }, [unifiedRoot, expandedNodes, filterEval.highlightedIds]);

  // Notify parent of hidden count changes
  useEffect(() => {
    if (onHiddenCountChange) {
      onHiddenCountChange(layoutResult.hiddenCount);
    }
  }, [layoutResult.hiddenCount, onHiddenCountChange]);

  // Auto-fit function with high readability clamp
  const handleFit = useCallback(() => {
    if (!containerRef.current || layoutResult.nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 100;
    const bounds = layoutResult.bounds;

    const availableWidth = Math.max(100, clientWidth - padding);
    const availableHeight = Math.max(100, clientHeight - padding);

    const scaleX = availableWidth / Math.max(bounds.width, 250);
    const scaleY = availableHeight / Math.max(bounds.height, 250);
    // Clamp so the chart stays comfortably readable (minimum 0.70x, max 1.1x)
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.7), 1.1);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const targetPanX = clientWidth / 2 - centerX * fitScale;
    const targetPanY = clientHeight / 2 - centerY * fitScale;

    setZoom(fitScale);
    setPan({ x: targetPanX, y: targetPanY });
  }, [layoutResult]);

  // Default initial zoom and position: centered vertically, readable 1.0 scale
  useEffect(() => {
    if (hasInitializedZoom.current || !containerRef.current || layoutResult.nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const rootNode = layoutResult.nodes.find((n) => n.isRoot) || layoutResult.nodes[0];

    if (rootNode) {
      const defaultZoom = 1.0;
      const targetPanX = Math.max(60, clientWidth * 0.08);
      const targetPanY = clientHeight / 2 - (rootNode.y + rootNode.height / 2) * defaultZoom;
      setZoom(defaultZoom);
      setPan({ x: targetPanX, y: targetPanY });
      hasInitializedZoom.current = true;
    }
  }, [layoutResult.nodes]);

  // Center on selected node if changed
  useEffect(() => {
    if (!selectedUserId || !containerRef.current) return;
    const targetNode = layoutResult.nodeMap.get(selectedUserId);
    if (!targetNode) return;

    const { clientWidth, clientHeight } = containerRef.current;
    // Shift slightly to the left so drawer doesn't obstruct the node
    const targetX = clientWidth * 0.38 - (targetNode.x + targetNode.width / 2) * zoom;
    const targetY = clientHeight * 0.5 - (targetNode.y + targetNode.height / 2) * zoom;

    setPan({ x: targetX, y: targetY });
  }, [selectedUserId, layoutResult.nodeMap, zoom]);

  // Pointer/Mouse Drag Pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Don't drag or capture pointer if clicking directly on a node card or button
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-card], button, a, input, select')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Wheel Zoom toward cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.35), 2.0);

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Zoom buttons around center
  const zoomIn = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newZoom = Math.min(zoom * 1.2, 2.0);
    const cx = clientWidth / 2;
    const cy = clientHeight / 2;
    setPan({
      x: cx - (cx - pan.x) * (newZoom / zoom),
      y: cy - (cy - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  const zoomOut = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const newZoom = Math.max(zoom * 0.8, 0.35);
    const cx = clientWidth / 2;
    const cy = clientHeight / 2;
    setPan({
      x: cx - (cx - pan.x) * (newZoom / zoom),
      y: cy - (cy - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  // Close context menu on outside clicks
  useEffect(() => {
    const handleCloseMenu = () => {
      if (contextMenu.open) {
        setContextMenu((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleCloseMenu();
    });
    return () => {
      window.removeEventListener('click', handleCloseMenu);
    };
  }, [contextMenu.open]);

  // Context menu trigger
  const handleNodeContextMenu = (e: React.MouseEvent, node: LayoutNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[640px] flex-1 overflow-hidden select-none bg-[#faf9f8] text-slate-800 cursor-grab active:cursor-grabbing font-sans"
      style={{ touchAction: 'none' }}
    >
      {/* Professional Subtle Dot Grid on Light Canvas */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="light-dot-grid-pattern"
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % (24 * zoom)}, ${pan.y % (24 * zoom)})`}
          >
            <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#light-dot-grid-pattern)" />
      </svg>

      {/* Empty Search State Notice */}
      {filterEval.hasFilter && filterEval.isEmptyMatch && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-white/95 border border-slate-200 shadow-lg text-xs font-semibold text-slate-700 flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Search size={14} className="text-[#e8583a]" />
          <span>No one matches &ldquo;{searchQuery}&rdquo;</span>
        </div>
      )}

      {/* Main Canvas Transform Layer */}
      <div
        className="absolute top-0 left-0 w-0 h-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
        }}
      >
        {/* SVG Bezier Connectors Layer (Clean light grey lines with orange highlights) */}
        <svg
          className="absolute overflow-visible pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: layoutResult.bounds.width + 600,
            height: layoutResult.bounds.height + 600,
          }}
        >
          {layoutResult.connectors.map((c) => (
            <path
              key={c.id}
              d={c.path}
              fill="none"
              stroke={c.isHighlighted ? '#e8583a' : '#cbd5e1'}
              strokeWidth={c.isHighlighted ? 2.5 : 2}
              strokeLinecap="round"
              className="transition-[stroke,stroke-width] duration-300"
            />
          ))}
        </svg>

        {/* Nodes Layer: Crisp White Cards with High Readability */}
        {layoutResult.nodes.map((node) => {
          const isSelected = selectedUserId === node.id;
          const isMatched = filterEval.matchedIds.has(node.id);
          const isPathHighlighted = filterEval.highlightedIds.has(node.id);

          // Dim nodes if filter/search is active and node is not in highlighted path
          const isDimmed = filterEval.hasFilter && !isPathHighlighted;

          const initials = node.user.username
            .split(' ')
            .map((w) => w[0])
            .filter(Boolean)
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const isRootNode = node.isRoot;

          return (
            <div
              key={node.id}
              data-node-card="true"
              tabIndex={0}
              role="button"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser(node.user);
              }}
              onContextMenu={(e) => handleNodeContextMenu(e, node)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  onSelectUser(node.user);
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
              className={`absolute top-0 left-0 pointer-events-auto rounded-[16px] cursor-pointer outline-none select-none flex items-center justify-between px-3.5 transition-all bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 ${
                isRootNode
                  ? 'border-2 border-amber-300 shadow-md hover:shadow-lg'
                  : ''
              } ${
                isSelected
                  ? 'ring-2 ring-[#e8583a] ring-offset-2 ring-offset-[#faf9f8] shadow-md border-[#e8583a]'
                  : ''
              } ${
                isMatched && !isSelected
                  ? 'ring-2 ring-primary/80 shadow-md'
                  : ''
              } ${
                node.isDeptHead
                  ? 'border-l-4'
                  : ''
              }`}
            >
              {/* Left Side: Avatar + Name & Designation */}
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                {/* Circular Avatar */}
                {node.user.image_url ? (
                  <img
                    src={node.user.image_url}
                    alt={node.user.username}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isRootNode
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-white shadow-xs'
                    }`}
                    style={
                      !isRootNode
                        ? { backgroundColor: node.departmentColor.text }
                        : {}
                    }
                  >
                    {isRootNode ? <Crown size={15} className="text-white" /> : initials}
                  </div>
                )}

                {/* Name & Title */}
                <div className="min-w-0 flex-1">
                  <Tooltip title={node.user.username} placement="topLeft">
                    <span
                      className={`block font-bold text-[13px] truncate leading-tight ${
                        isRootNode ? 'text-slate-950 font-black' : 'text-slate-900'
                      }`}
                    >
                      {node.user.username}
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={`${node.user.designation || node.user.role}${
                      node.user.department ? ` · in ${node.user.department}` : ''
                    }`}
                    placement="bottomLeft"
                  >
                    <span className="block text-[11px] truncate leading-tight mt-0.5 text-slate-500 font-medium">
                      {node.user.designation || (isRootNode ? 'Founder & CEO' : node.user.role)}
                    </span>
                  </Tooltip>
                </div>
              </div>

              {/* Right Side: Team Size Badge (only if person has reports) */}
              {node.hasReports && (
                <Tooltip
                  title={
                    node.isExpanded
                      ? `Click to collapse branch (${node.directReportsCount} reports)`
                      : `Click to expand branch (${node.directReportsCount} reports)`
                  }
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleNode(node.id);
                    }}
                    className={`shrink-0 min-w-[26px] h-6 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                      isRootNode
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        : node.isExpanded
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-black'
                    }`}
                  >
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
        })}
      </div>

      {/* Floating Canvas Controls (Bottom-Left) on Clean Light Pill */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <div className="flex items-center rounded-full bg-white/95 border border-slate-200 p-1 shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={zoomOut}
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handleFit}
            className="px-2.5 h-7 rounded-full hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            title="Fit to screen"
          >
            Fit
          </button>
        </div>

        {/* Subtext under Zoom HUD */}
        <span className="text-[11px] text-slate-500 font-medium pl-1 select-none">
          Drag to pan · scroll to zoom · click node for details
        </span>
      </div>

      {/* Custom Right-Click Context Menu in Clean White SaaS Theme */}
      {contextMenu.open && contextMenu.node && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 text-slate-700 text-xs font-medium backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider truncate">
            {contextMenu.node.user.username}
          </div>

          {/* Action 1: View profile */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.node) onSelectUser(contextMenu.node.user);
              setContextMenu((prev) => ({ ...prev, open: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserCheck size={14} className="text-slate-400" />
            <span>View details</span>
          </button>

          {/* Action 2: Add direct report */}
          <button
            type="button"
            onClick={() => {
              if (contextMenu.node) onAddDirectReport(contextMenu.node.user);
              setContextMenu((prev) => ({ ...prev, open: false }));
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus size={14} className="text-slate-400" />
            <span>Add direct report</span>
          </button>

          {/* Action 3: Collapse/Expand branch (if has reports) */}
          {contextMenu.node.hasReports && (
            <button
              type="button"
              onClick={() => {
                if (contextMenu.node) onToggleNode(contextMenu.node.id);
                setContextMenu((prev) => ({ ...prev, open: false }));
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ChevronRight
                size={14}
                className={`text-slate-400 transition-transform ${
                  contextMenu.node.isExpanded ? 'rotate-90' : ''
                }`}
              />
              <span>{contextMenu.node.isExpanded ? 'Collapse branch' : 'Expand branch'}</span>
            </button>
          )}

          {/* Action 4: Remove (not for root) */}
          {!contextMenu.node.isRoot && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  if (contextMenu.node) onRemoveUser(contextMenu.node.user);
                  setContextMenu((prev) => ({ ...prev, open: false }));
                }}
                className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remove employee</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
