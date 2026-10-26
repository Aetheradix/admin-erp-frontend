import React from 'react';
import { Coffee, CheckCircle2, PhoneOff, ArrowRight } from 'lucide-react';
import { useGetTeamAvailabilityQuery } from '@/store/api/attendanceSlice';
import type { TeamMemberAvailability } from '@/types/models';

interface CompactTeamBreakBannerProps {
  onViewTeamTab?: () => void;
}

export const CompactTeamBreakBanner: React.FC<CompactTeamBreakBannerProps> = ({ onViewTeamTab }) => {
  const { data, isLoading } = useGetTeamAvailabilityQuery(undefined, {
    pollingInterval: 10000,
  });

  const members: TeamMemberAvailability[] = data?.members ?? [];
  const onBreakMembers: TeamMemberAvailability[] = (data?.active_breaks && data.active_breaks.length > 0)
    ? data.active_breaks
    : members.filter((m) => m.availability_status === 'ON_BREAK');

  if (isLoading) {
    return null; // Don't show jarring loading skeleton on top banner
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // If nobody is on break: show a very slim, clean, reassuring banner with white bg
  if (onBreakMembers.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white dark:bg-surface border border-border-subtle text-xs transition-all shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          <span>All team members are available &bull; No active breaks</span>
        </div>
        {onViewTeamTab && (
          <button
            type="button"
            onClick={onViewTeamTab}
            className="text-[11px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
            <span>Team Status</span>
            <ArrowRight size={11} />
          </button>
        )}
      </div>
    );
  }

  // When colleagues are on break: clean simple white background
  return (
    <div className="rounded-2xl bg-white dark:bg-surface border border-border-subtle p-3 sm:px-4 sm:py-2.5 transition-all shadow-xs space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left: Title & Active Count */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Coffee size={13} className="text-amber-500" />
            <span>Colleagues On Break</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black">
              {onBreakMembers.length}
            </span>
          </span>
        </div>

        {/* Right: Quick Notice & Tab switch */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-lg border border-border-subtle">
            <PhoneOff size={10} className="text-amber-500" />
            <span>Avoid calling until break ends</span>
          </div>

          {onViewTeamTab && (
            <button
              type="button"
              onClick={onViewTeamTab}
              className="text-[11px] font-bold text-primary hover:underline transition-all cursor-pointer flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Wrapped Chips of all colleagues on break */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {onBreakMembers.map((member) => {
          const breakInfo = member.active_break;
          const breakType = breakInfo?.break_type || 'Break';
          const elapsed = breakInfo?.elapsed_minutes ?? 0;
          const note = breakInfo?.break_status_message || breakInfo?.break_note;

          return (
            <div
              key={member.user_id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-subtle border border-border-subtle hover:border-amber-500/40 transition-colors shadow-2xs text-xs">
              {/* Avatar with MS Teams presence indicator */}
              <div className="relative shrink-0">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full object-cover border border-border-subtle"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-[10px] flex items-center justify-center">
                    {getInitials(member.name)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
              </div>

              {/* Name & Exact Break Type */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-foreground text-xs whitespace-nowrap">
                  {member.name}
                </span>
                <span
                  title={breakType}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black max-w-[200px] truncate">
                  {breakType}
                </span>
                {elapsed > 0 && (
                  <span className="text-[10px] font-bold text-muted whitespace-nowrap">
                    ({elapsed}m)
                  </span>
                )}
              </div>

              {/* Note / Message (if any) */}
              {note && note !== breakType && (
                <span
                  title={note}
                  className="text-[11px] font-medium text-muted truncate max-w-[180px] border-l border-border-subtle pl-1.5 italic">
                  &ldquo;{note}&rdquo;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
