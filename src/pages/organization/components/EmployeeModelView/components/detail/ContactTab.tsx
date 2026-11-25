import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { Tooltip } from 'antd';
import { Building2, Calendar, Check, Clock, Copy, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';
import { FALLBACKS } from '../../constants';
import type { JoinDateInfo, ResolvedOffice } from '../../types';
import { InfoRow } from './InfoRow';
import { TeamSummaryCard } from './TeamSummaryCard';
import { WorkScheduleCard } from './WorkScheduleCard';

interface ContactTabProps {
  user: HierarchyNodeUser;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  copiedEmail: boolean;
  manager: HierarchyNodeUser | null;
  directReports: HierarchyNodeUser[];
  skills: string[];
  onCopyEmail: () => void;
  onInspectUser?: (user: HierarchyNodeUser) => void;
}

export const ContactTab: React.FC<ContactTabProps> = React.memo(
  ({
    user,
    resolvedOffice,
    joinDateInfo,
    copiedEmail,
    manager,
    directReports,
    onCopyEmail,
    onInspectUser,
  }) => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-150">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
          <InfoRow
            icon={<Mail size={13} className="text-[#0078d4]" />}
            label="Work Email"
            value={user.email || FALLBACKS.NO_EMAIL}
            action={
              user.email ? (
                <Tooltip title={copiedEmail ? 'Copied to clipboard!' : 'Copy email address'}>
                  <button
                    type="button"
                    onClick={onCopyEmail}
                    className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                    {copiedEmail ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </Tooltip>
              ) : undefined
            }
          />
          <InfoRow
            icon={<Phone size={13} className="text-[#0078d4]" />}
            label="Phone / Mobile"
            value={user.contact_number || FALLBACKS.PHONE}
          />
        </div>

        <InfoRow
          icon={<Building2 size={13} className="text-[#0078d4]" />}
          label="Office & Branch Location"
          badge={
            resolvedOffice ? (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {resolvedOffice.is_hq || resolvedOffice.isHq ? 'GLOBAL HQ' : 'ACTIVE HUB'}
              </span>
            ) : undefined
          }
          value={
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-[#0078d4] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-bold text-slate-900">
                  {resolvedOffice?.name || FALLBACKS.COMPANY_NAME}
                </span>
                <span className="text-[11px] font-normal text-slate-600 block mt-0.5 leading-relaxed">
                  {resolvedOffice?.address || FALLBACKS.COMPANY_ADDRESS}
                </span>
                {resolvedOffice?.timezone && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                    <Clock size={10} /> Timezone: {resolvedOffice.timezone}
                  </span>
                )}
              </div>
            </div>
          }
        />
        <WorkScheduleCard resolvedOffice={resolvedOffice} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Department
            </span>
            <span className="text-xs font-black text-slate-900 block truncate mt-0.5">
              {user.department || FALLBACKS.GENERAL_DEPT}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Employee Code
            </span>
            <span className="text-xs font-mono font-black text-[#0078d4] block truncate mt-0.5">
              {user.employee_code || `EMP-${user.id}`}
            </span>
          </div>
        </div>

        <InfoRow
          icon={<Calendar size={13} className="text-[#0078d4]" />}
          label="Date & Time of Joining"
          value={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">{joinDateInfo.dateFormatted}</span>
              {joinDateInfo.timeFormatted && (
                <span className="text-[11px] font-bold font-mono text-[#0078d4] bg-[#0078d4]/8 px-2 py-0.5 rounded-md border border-[#0078d4]/20">
                  {joinDateInfo.timeFormatted}
                </span>
              )}
            </div>
          }
          description={`Verified official onboarding timestamp (${joinDateInfo.timezone}).`}
        />
        <TeamSummaryCard
          manager={manager}
          directReports={directReports}
          onInspectUser={onInspectUser}
        />
        {/* <ProjectsCard department={user.department} />
      <SkillsSummaryCard skills={skills} department={user.department} role={user.role} /> */}
      </div>
    </div>
  )
);

ContactTab.displayName = 'ContactTab';
