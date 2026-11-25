import React from 'react';
import { Crown } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { LayoutResult, ResolvedOffice, JoinDateInfo } from '../types';
import type { OrgRelationsInput } from '../utils/layoutEngine';
import { DotGridBackground } from './DotGridBackground';
import { ConnectorsLayer } from './ConnectorsLayer';
import { CanvasControls } from './CanvasControls';
import { OrgNodeCard } from './nodes/OrgNodeCard';
import { CentralNodeCard } from './nodes/CentralNodeCard';
import { EmptyReportsCard } from './nodes/EmptyReportsCard';

interface TreeCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  layout: LayoutResult;
  pan: { x: number; y: number };
  zoom: number;
  isLoading: boolean;
  showDetailPanel: boolean;
  focusedNode: HierarchyNodeUser | null;
  relations: OrgRelationsInput;
  expandedSubTrees: Record<number, boolean>;
  inspectedUserId: number | null;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onInspectUser: (user: HierarchyNodeUser) => void;
  onFocusUser: (user: HierarchyNodeUser) => void;
  onToggleSubTree: (reportId: number, e: React.MouseEvent) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onCenter: () => void;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = React.memo(
  ({
    containerRef,
    layout,
    pan,
    zoom,
    isLoading,
    showDetailPanel,
    focusedNode,
    relations,
    expandedSubTrees,
    inspectedUserId,
    resolvedOffice,
    joinDateInfo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onInspectUser,
    onFocusUser,
    onToggleSubTree,
    onZoomIn,
    onZoomOut,
    onFit,
    onCenter,
  }) => {
    const { reportingManager, grandManager, directReports, subUnderReportsMap } = relations;

    return (
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`relative h-full overflow-hidden select-none bg-[#f8f9fa] cursor-grab active:cursor-grabbing transition-all duration-300 ${
          showDetailPanel ? 'w-full lg:w-[42%] xl:w-[40%] shrink-0' : 'flex-1 w-full'
        }`}
        style={{ touchAction: 'none' }}>
        <DotGridBackground pan={pan} zoom={zoom} />
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-600">
                Loading Organizational Hierarchy...
              </span>
            </div>
          </div>
        )}

        <div
          className="absolute top-0 left-0 w-0 h-0 origin-top-left pointer-events-none"
          style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})` }}>
          <ConnectorsLayer connectors={layout.connectors} />

          {grandManager && layout.grandManagerPos && (
            <OrgNodeCard
              user={grandManager}
              pos={layout.grandManagerPos}
              variant="grand"
              isSelected={inspectedUserId === grandManager.id}
              onInspect={onInspectUser}
              onFocus={onFocusUser}
            />
          )}

          {reportingManager && layout.managerPos ? (
            <OrgNodeCard
              user={reportingManager}
              pos={layout.managerPos}
              variant="manager"
              isSelected={inspectedUserId === reportingManager.id}
              onInspect={onInspectUser}
              onFocus={onFocusUser}
            />
          ) : (
            !reportingManager &&
            layout.managerPos && (
              <div
                style={{
                  width: layout.managerPos.width,
                  height: layout.managerPos.height,
                  transform: `translate3d(${layout.managerPos.x}px, ${layout.managerPos.y}px, 0px)`,
                }}
                className="absolute top-0 left-0 pointer-events-auto rounded-2xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col justify-center items-center text-center text-amber-900">
                <Crown size={20} className="text-amber-600 mb-1" />
                <span className="text-xs font-black">Top of Reporting Line</span>
                <span className="text-[11px] text-amber-700 font-medium mt-0.5">
                  Direct Executive reporting to Board of Directors
                </span>
              </div>
            )
          )}

          {focusedNode && (
            <CentralNodeCard
              user={focusedNode}
              pos={layout.centralPos}
              isSelected={inspectedUserId === focusedNode.id}
              reportingManager={reportingManager}
              directReportsCount={directReports.length}
              totalTeamCount={focusedNode.subordinatesCount ?? directReports.length}
              resolvedOffice={resolvedOffice}
              joinDateInfo={joinDateInfo}
              onInspect={onInspectUser}
            />
          )}

          {directReports.length > 0
            ? layout.reportsPositions.map(({ pos, user: rep, subPositions }) => {
                const subs = subUnderReportsMap[rep.id] || [];
                const isExp = Boolean(expandedSubTrees[rep.id]);
                return (
                  <React.Fragment key={rep.id}>
                    <OrgNodeCard
                      user={rep}
                      pos={pos}
                      variant="report"
                      isSelected={inspectedUserId === rep.id}
                      onInspect={onInspectUser}
                      onFocus={onFocusUser}
                      hasSubs={subs.length > 0}
                      isExpanded={isExp}
                      subCount={subs.length}
                      onToggleSub={(e) => onToggleSubTree(rep.id, e)}
                    />
                    {isExp &&
                      subPositions.map(({ pos: sPos, user: sUser }) => (
                        <OrgNodeCard
                          key={sUser.id}
                          user={sUser}
                          pos={sPos}
                          variant="sub"
                          isSelected={inspectedUserId === sUser.id}
                          onInspect={onInspectUser}
                          onFocus={onFocusUser}
                          reportsToName={rep.username.split(' ')[0]}
                        />
                      ))}
                  </React.Fragment>
                );
              })
            : layout.emptyReportsPos && (
                <EmptyReportsCard
                  pos={layout.emptyReportsPos}
                  managerName={reportingManager?.username}
                />
              )}
        </div>

        <CanvasControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
          onCenter={onCenter}
        />
      </div>
    );
  }
);

TreeCanvas.displayName = 'TreeCanvas';
