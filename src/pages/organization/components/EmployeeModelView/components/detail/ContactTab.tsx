import React from 'react';
import { Mail, Phone, Building2, Calendar, Clock, MapPin, Copy, Check } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { ResolvedOffice, JoinDateInfo } from '../../types';
import { FALLBACKS } from '../../constants';
import { InfoRow } from './InfoRow';

interface ContactTabProps {
  user: HierarchyNodeUser;
  resolvedOffice: ResolvedOffice | null;
  joinDateInfo: JoinDateInfo;
  copiedEmail: boolean;
  onCopyEmail: () => void;
}

export const ContactTab: React.FC<ContactTabProps> = React.memo(({
  user, resolvedOffice, joinDateInfo, copiedEmail, onCopyEmail,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <InfoRow
        icon={<Mail size={13} className="text-[#0078d4]" />}
        label="Work Email"
        value={user.email || FALLBACKS.NO_EMAIL}
        action={user.email ? (
          <button
            type="button"
            onClick={onCopyEmail}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Copy email address"
          >
            {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        ) : undefined}
      />

      <InfoRow icon={<Phone size={13} className="text-[#0078d4]" />} label="Phone / Mobile" value={user.contact_number || FALLBACKS.PHONE} />

      <InfoRow
        icon={<Building2 size={13} className="text-[#0078d4]" />}
        label="Office & Branch Location"
        badge={resolvedOffice ? (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {resolvedOffice.is_hq || resolvedOffice.isHq ? 'GLOBAL HQ' : 'ACTIVE HUB'}
          </span>
        ) : undefined}
        value={
          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-[#0078d4] mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block truncate">{resolvedOffice?.name || FALLBACKS.COMPANY_NAME}</span>
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

      <InfoRow
        icon={<Calendar size={13} className="text-[#0078d4]" />}
        label="Date & Time of Joining"
        value={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{joinDateInfo.dateFormatted}</span>
            {joinDateInfo.timeFormatted && (
              <span className="text-[11px] font-bold font-mono text-[#0078d4] bg-[#0078d4]/8 px-2 py-0.5 rounded-md border border-[#0078d4]/20">
                {joinDateInfo.timeFormatted}
              </span>
            )}
          </div>
        }
        description={`Verified official onboarding timestamp from database records (${joinDateInfo.timezone}).`}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department</span>
          <span className="text-xs font-black text-slate-900 block truncate mt-0.5">{user.department || FALLBACKS.GENERAL_DEPT}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Employee ID</span>
          <span className="text-xs font-mono font-black text-[#0078d4] block truncate mt-0.5">{user.employee_code || `EMP-${user.id}`}</span>
        </div>
      </div>

      <InfoRow
        icon={<Clock size={13} className="text-[#0078d4]" />}
        label="Standard Working Hours & Timezone"
        value={`${FALLBACKS.DEFAULT_WORKING_HOURS} (${resolvedOffice?.timezone || FALLBACKS.DEFAULT_TIMEZONE}) · Full-Time`}
      />
    </div>
  );
});

ContactTab.displayName = 'ContactTab';
