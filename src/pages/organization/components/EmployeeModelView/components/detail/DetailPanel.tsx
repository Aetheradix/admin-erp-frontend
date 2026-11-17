import React, { useState } from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { DetailTab, ResolvedOffice, JoinDateInfo } from '../../types';
import { DETAIL_TABS } from '../../constants';
import { DetailHeader } from './DetailHeader';
import { ContactTab } from './ContactTab';
import { OrganizationTab } from './OrganizationTab';
import { SkillsTab } from './SkillsTab';

interface DetailPanelProps {
  inspectedNode: HierarchyNodeUser;
  isCentral: boolean;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  copiedEmail: boolean;
  manager: HierarchyNodeUser | null;
  directReports: HierarchyNodeUser[];
  peers: HierarchyNodeUser[];
  skills: string[];
  onSetCentral: () => void;
  onClosePanel: () => void;
  onScheduleClick: () => void;
  onCopyEmail: () => void;
  onInspectUser: (user: HierarchyNodeUser) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = React.memo(({
  inspectedNode,
  isCentral,
  resolvedOffice,
  joinDateInfo,
  copiedEmail,
  manager,
  directReports,
  peers,
  skills,
  onSetCentral,
  onClosePanel,
  onScheduleClick,
  onCopyEmail,
  onInspectUser,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('contact');

  return (
    <div className="w-full lg:w-[70%] lg:min-w-[320px] h-full bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200 z-30 shadow-xl">
      <DetailHeader
        inspectedNode={inspectedNode}
        isCentral={isCentral}
        onSetCentral={onSetCentral}
        onClosePanel={onClosePanel}
        onScheduleClick={onScheduleClick}
      />

      <div className="flex border-b border-slate-200 px-6 shrink-0 bg-slate-50/50">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#0078d4] text-[#0078d4]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 space-y-5">
        {activeTab === 'contact' && (
          <ContactTab
            user={inspectedNode}
            resolvedOffice={resolvedOffice}
            joinDateInfo={joinDateInfo}
            copiedEmail={copiedEmail}
            onCopyEmail={onCopyEmail}
          />
        )}

        {activeTab === 'organization' && (
          <OrganizationTab
            manager={manager}
            directReports={directReports}
            peers={peers}
            onInspectUser={onInspectUser}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab user={inspectedNode} skills={skills} />
        )}
      </div>
    </div>
  );
});

DetailPanel.displayName = 'DetailPanel';
