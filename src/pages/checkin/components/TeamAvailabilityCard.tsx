import React, { useState, useMemo, useEffect } from 'react';
import {
  Coffee,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  PhoneOff,
  RefreshCw,
} from 'lucide-react';
import { useGetTeamAvailabilityQuery } from '@/store/api/attendanceSlice';
import type { TeamMemberAvailability } from '@/types/models';

export const TeamAvailabilityCard: React.FC = () => {
  /* Directory state (kept for reference if directory section is restored)
  const [showFullDirectory, setShowFullDirectory] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  */
  const [now, setNow] = useState<Date>(new Date());

  // Polling every 10 seconds for real-time presence synchronization
  const { data, isLoading, isFetching, refetch } = useGetTeamAvailabilityQuery(undefined, {
    pollingInterval: 10000,
  });

  // Local live tick every 10 seconds for smooth elapsed calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  /*
  const summary = data?.summary ?? {
    total: 0,
    on_break: 0,
    available: 0,
    checked_out: 0,
    offline: 0,
  };
  */

  const members: TeamMemberAvailability[] = data?.members ?? [];

  // Filter ALL colleagues currently on break for the hero MS Teams presence section
  const onBreakMembers = useMemo(() => {
    return (data?.active_breaks && data.active_breaks.length > 0)
      ? data.active_breaks
      : members.filter((m) => m.availability_status === 'ON_BREAK');
  }, [data?.active_breaks, members]);

  /*
  // Extract distinct departments for filtering in the collapsible directory
  const departments = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return ['All', ...Array.from(set).sort()];
  }, [members]);

  // Filter full directory members if expanded
  const filteredDirectoryMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedDept !== 'All' && m.department.toLowerCase() !== selectedDept.toLowerCase()) {
        return false;
      }
      if (directorySearch.trim()) {
        const q = directorySearch.trim().toLowerCase();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesDept = m.department?.toLowerCase().includes(q);
        const matchesDesig = m.designation?.toLowerCase().includes(q);
        if (!matchesName && !matchesDept && !matchesDesig) {
          return false;
        }
      }
      return true;
    });
  }, [members, selectedDept, directorySearch]);
  */

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatTimeOnly = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const calculateLiveTiming = (startStr?: string | null, maxAllowed = 30) => {
    if (!startStr) {
      return { elapsed: 0, remaining: maxAllowed, isOverTime: false, expectedReturnStr: '' };
    }
    const start = new Date(startStr);
    if (isNaN(start.getTime())) {
      return { elapsed: 0, remaining: maxAllowed, isOverTime: false, expectedReturnStr: '' };
    }
    const elapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    const remaining = Math.max(0, maxAllowed - elapsed);
    const isOverTime = elapsed > maxAllowed;
    const expected = new Date(start.getTime() + maxAllowed * 60000);
    const expectedReturnStr = formatTimeOnly(expected.toISOString());
    return { elapsed, remaining, isOverTime, expectedReturnStr };
  };

  return (
    <div className="bg-white dark:bg-surface border border-border-subtle rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* MS Teams-Style Presence Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-amber-500 shadow-xs">
              <Coffee size={20} className={onBreakMembers.length > 0 ? 'animate-pulse' : ''} />
            </div>
            {/* MS Teams Amber Presence Halo */}
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                onBreakMembers.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                Active Break Status
              </h2>
              {onBreakMembers.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {onBreakMembers.length} {onBreakMembers.length === 1 ? 'colleague away' : 'colleagues away'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 size={11} />
                  All Available
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-medium">
              Live presence indicators to know who is away before messaging or calling.
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50">
            <RefreshCw size={12} className={isFetching ? 'animate-spin text-primary' : 'text-muted'} />
            <span>{isFetching ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <span className="text-[10px] text-muted font-semibold hidden md:inline-block">
            Auto-syncs live
          </span>
        </div>
      </div>

      {/* Main Hero Section: ONLY Colleagues Currently on Break */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <RefreshCw size={24} className="animate-spin text-amber-500 mb-2" />
          <span className="text-xs font-bold text-muted">Checking team presence & break sessions...</span>
        </div>
      ) : onBreakMembers.length === 0 ? (
        /* Empty State: Everyone is Available (Clean White State) */
        <div className="py-8 px-6 rounded-2xl bg-surface-subtle border border-border-subtle text-center flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <CheckCircle2 size={24} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-foreground">
              Everyone is available — no active breaks right now
            </h3>
            <p className="text-xs text-muted font-medium max-w-md">
              All colleagues who have checked in are currently available at their desks. Feel free to collaborate and reach out!
            </p>
          </div>
        </div>
      ) : (
        /* Active Breaks Cards Grid (Clean White Background) */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Colleagues Currently On Break ({onBreakMembers.length})
            </span>
            <span className="text-[10px] font-bold text-muted">
              Live updates every 10s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {onBreakMembers.map((member) => {
              const breakInfo = member.active_break;
              const maxAllowed = breakInfo?.max_allowed_minutes || 30;
              const { elapsed, remaining, isOverTime, expectedReturnStr } = calculateLiveTiming(
                breakInfo?.break_start,
                maxAllowed
              );

              return (
                <div
                  key={member.user_id}
                  className="p-4 rounded-2xl bg-white dark:bg-surface border border-border-subtle hover:border-amber-500/40 shadow-xs flex flex-col justify-between space-y-3 transition-all">
                  {/* Top: Profile & Teams Presence Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with MS Teams presence indicator */}
                      <div className="relative">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-11 h-11 rounded-full object-cover border border-amber-500/40"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-black text-sm flex items-center justify-center shadow-xs">
                            {getInitials(member.name)}
                          </div>
                        )}
                        {/* MS Teams Orange/Yellow Status Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-surface flex items-center justify-center animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-black text-foreground truncate flex items-center gap-1.5">
                          <span>{member.name}</span>
                        </div>
                        <div className="text-[11px] font-bold text-muted truncate">
                          {member.designation || 'Team Member'} • {member.department}
                        </div>
                      </div>
                    </div>

                    {/* Presence pill badge */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                        <Coffee size={11} />
                        <span>ON BREAK</span>
                      </span>
                    </div>
                  </div>

                  {/* Break Details Box */}
                  <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle space-y-2.5">
                    {/* Break Name / Type & Elapsed Time */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-black text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{breakInfo?.break_type || 'Break'}</span>
                      </div>
                      <span className="font-bold text-muted text-xs">
                        {elapsed}m elapsed
                      </span>
                    </div>

                    {/* Status Message / Comment Note (MS Teams Status Message) */}
                    {(breakInfo?.break_status_message || breakInfo?.break_note) && (
                      <div className="flex items-start gap-2 text-xs font-bold text-foreground bg-white dark:bg-surface px-2.5 py-1.5 rounded-xl border border-border-subtle">
                        <MessageSquare size={13} className="shrink-0 mt-0.5 text-amber-500" />
                        <span className="break-words">
                          &ldquo;{breakInfo?.break_status_message || breakInfo?.break_note}&rdquo;
                        </span>
                      </div>
                    )}

                    {/* Timing Row: Start Time & Expected Return */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted pt-1 border-t border-border-subtle">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-muted" />
                        Started: {formatTimeOnly(breakInfo?.break_start)}
                      </span>

                      {isOverTime ? (
                        <span className="text-red-500 flex items-center gap-1 font-black">
                          <AlertTriangle size={12} />
                          Over limit (+{elapsed - maxAllowed}m)
                        </span>
                      ) : remaining > 0 ? (
                        <span className="text-muted font-bold">
                          Back in ~{remaining}m ({expectedReturnStr})
                        </span>
                      ) : null}
                    </div>

                    {/* MS Teams Interruption Warning Banner */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted bg-white dark:bg-surface px-2.5 py-1.5 rounded-lg border border-border-subtle">
                      <PhoneOff size={11} className="shrink-0 text-amber-500" />
                      <span>Please avoid contacting until the break ends</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Section: Full Team Presence Directory */}
      <div className="pt-2 border-t border-border-subtle">
        {/* <button
          type="button"
          onClick={() => setShowFullDirectory(!showFullDirectory)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-xs font-black text-foreground transition-all cursor-pointer">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-primary" />
            <span>
              {showFullDirectory ? 'Hide Full Team Directory' : 'View Full Team Directory & Availability'}
            </span>
            <span className="text-[10px] font-bold text-muted">
              ({summary.total} members &bull; {summary.available} available)
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted text-xs">
            <span>{showFullDirectory ? 'Collapse' : 'Expand'}</span>
            {showFullDirectory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button> */}

        {/* Collapsible Content */}
        {/* {showFullDirectory && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Search full directory by name, department, or role..."
                  className="w-full bg-surface-subtle border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-subtle border border-border-subtle self-start sm:self-auto">
                <Filter size={13} className="text-muted" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer">
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-surface text-foreground">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredDirectoryMembers.map((member) => {
                const isOnBreak = member.availability_status === 'ON_BREAK';
                const isAvailable = member.availability_status === 'AVAILABLE';
                const isCheckedOut = member.availability_status === 'CHECKED_OUT';

                return (
                  <div
                    key={member.user_id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      isOnBreak
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isAvailable
                        ? 'bg-surface-elevated border-border-subtle hover:border-emerald-500/30'
                        : 'bg-surface-subtle border-border-subtle/70 opacity-75'
                    }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-border-subtle"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-[11px] flex items-center justify-center ${
                              isOnBreak
                                ? 'bg-amber-500/20 text-amber-600'
                                : isAvailable
                                ? 'bg-emerald-500/20 text-emerald-600'
                                : 'bg-surface-elevated text-muted'
                            }`}>
                            {getInitials(member.name)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface ${
                            isOnBreak
                              ? 'bg-amber-500 animate-pulse'
                              : isAvailable
                              ? 'bg-emerald-500'
                              : isCheckedOut
                              ? 'bg-slate-400'
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{member.name}</div>
                        <div className="text-[10px] text-muted truncate">
                          {member.designation || 'Member'} &bull; {member.department}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isOnBreak ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                          ON BREAK
                        </span>
                      ) : isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                          AVAILABLE
                        </span>
                      ) : isCheckedOut ? (
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          LEFT
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
