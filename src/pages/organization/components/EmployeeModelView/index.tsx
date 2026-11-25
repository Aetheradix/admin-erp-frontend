import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EmployeeModelViewModalProps } from './types';
import { useOrgModel } from './hooks/useOrgModel';
import { useResolveUser } from './hooks/useResolveUser';
import { useOrgRelations } from './hooks/useOrgRelations';
import { useOrgLayout } from './hooks/useOrgLayout';
import { usePanZoom } from './hooks/usePanZoom';
import { useInspectedProfile } from './hooks/useInspectedProfile';
import { useModalBehavior } from './hooks/useModalBehavior';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { useOrgNavigation } from './hooks/useOrgNavigation';
import { ModalHeader } from './components/ModalHeader';
import { TreeCanvas } from './components/TreeCanvas';
import { DetailPanel } from './components/detail/DetailPanel';

export const EmployeeModelViewModal: React.FC<EmployeeModelViewModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    flatUsers,
    flatUsersById,
    childrenByManagerId,
    dbUsers,
    offices,
    companyProfile,
    isLoadingHierarchy,
  } = useOrgModel();
  const resolveUser = useResolveUser(flatUsers, flatUsersById, dbUsers);
  useModalBehavior(isOpen, onClose, modalRef);
  const { copied: copiedEmail, copy: copyEmail } = useCopyToClipboard();

  const {
    focusedNode,
    inspectedNode,
    navHistory,
    showDetail,
    setShowDetail,
    expandedSubTrees,
    handleFocus,
    handleBack,
    handleInspect,
    toggleSubTree,
  } = useOrgNavigation({ isOpen, employee, resolveUser, flatUsersById });

  const relations = useOrgRelations({
    focusedNode,
    flatUsers,
    flatUsersById,
    childrenByManagerId,
    resolveUser,
  });
  const layout = useOrgLayout({ focusedNode, ...relations }, expandedSubTrees);
  const panZoom = usePanZoom({
    containerRef,
    bounds: layout.bounds,
    centralPos: layout.centralPos,
    isOpen,
  });
  const { handleFit } = panZoom;
  const profile = useInspectedProfile({
    inspectedNode,
    dbUsers,
    offices,
    companyProfile,
    flatUsersById,
    childrenByManagerId,
    resolveUser,
  });

  useEffect(() => {
    if (isOpen && focusedNode && containerRef.current) {
      const observer = new ResizeObserver(() => handleFit());
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [isOpen, focusedNode, handleFit]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/45 backdrop-blur-[2px] animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Employee Organizational Model"
        tabIndex={-1}
        className="w-full max-w-7xl h-[96vh] sm:h-[90vh] max-h-[940px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative focus:outline-none"
        onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          focusedNode={focusedNode}
          navigationHistoryLength={navHistory.length}
          showDetailPanel={showDetail}
          onBackNavigation={handleBack}
          onToggleDetailPanel={() => setShowDetail((p) => !p)}
          onViewFullTree={() => {
            onClose();
            navigate('/org?tab=Organization+Hierarchy');
          }}
          onClose={onClose}
        />
        <div className="flex-1 flex overflow-hidden relative">
          <TreeCanvas
            containerRef={containerRef}
            layout={layout}
            pan={panZoom.pan}
            zoom={panZoom.zoom}
            isLoading={isLoadingHierarchy}
            showDetailPanel={showDetail && Boolean(inspectedNode)}
            focusedNode={focusedNode}
            relations={{ focusedNode, ...relations }}
            expandedSubTrees={expandedSubTrees}
            inspectedUserId={inspectedNode?.id ?? null}
            resolvedOffice={profile.resolvedOffice}
            joinDateInfo={profile.joinDate}
            onPointerDown={panZoom.handlePointerDown}
            onPointerMove={panZoom.handlePointerMove}
            onPointerUp={panZoom.handlePointerUp}
            onInspectUser={handleInspect}
            onFocusUser={handleFocus}
            onToggleSubTree={toggleSubTree}
            onZoomIn={panZoom.zoomIn}
            onZoomOut={panZoom.zoomOut}
            onFit={panZoom.handleFit}
            onCenter={panZoom.handleCenter}
          />
          {showDetail && inspectedNode && (
            <>
              <div
                className="lg:hidden absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-20"
                onClick={() => setShowDetail(false)}
              />
              <DetailPanel
                inspectedNode={inspectedNode}
                isCentral={inspectedNode.id === focusedNode?.id}
                resolvedOffice={profile.resolvedOffice}
                joinDateInfo={profile.joinDate}
                copiedEmail={copiedEmail}
                manager={profile.inspectedManager}
                directReports={profile.inspectedReports}
                peers={relations.peers}
                skills={profile.skills}
                dbUserStatus={profile.inspectedDbUser?.status}
                onSetCentral={() => handleFocus(inspectedNode)}
                onClosePanel={() => setShowDetail(false)}
                onScheduleClick={() => {
                  onClose();
                  navigate(`/calendar?user=${encodeURIComponent(inspectedNode.username)}`);
                }}
                onCopyEmail={() =>
                  copyEmail(inspectedNode.email, `Copied ${inspectedNode.email} to clipboard!`)
                }
                onInspectUser={handleInspect}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModelViewModal;
