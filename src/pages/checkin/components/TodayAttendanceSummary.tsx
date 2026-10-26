import React from 'react';
import { Button } from '@/components/ui/primitives/Button';
import {
  LogIn,
  LogOut,
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Activity,
  Smile,
  Meh,
  Frown,
  MapPin,
  Home,
  Building,
  RefreshCw,
  Navigation,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { formatTime, formatFullDate } from '@/utils/date';
import type { AttendanceStatus } from '@/types/models';
import type { GeoLocationState } from '../hooks/useAttendance';

interface TodayAttendanceSummaryProps {
  time: Date;
  status?: AttendanceStatus | null;
  selectedMood: number | null;
  isLoading: boolean;
  isSubmittingMood: boolean;
  isBreakLoading: boolean;
  handleAttendance: () => void;
  handleBreak: (remark?: string) => void;
  logMood: (score: number, label: string) => void;
  liveWorkingTime: string;
  checkInTimeDisplay: string;
  checkOutTimeDisplay: string;
  totalBreakDisplay: string;
  netWorkingDisplay: string;
  isLate: boolean;
  lateDurationDisplay: string;
  earlyDurationDisplay: string;
  punctualityStatus: 'late' | 'on-time' | 'early' | 'unknown';
  shiftTimingDisplay: string;
  workMode: 'office' | 'wfh';
  setWorkMode: (mode: 'office' | 'wfh') => void;
  geoLocation: GeoLocationState;
  requestGeoLocation: () => void;
  breakNote: string;
  setBreakNote: (v: string) => void;
}

const MOODS = [
  { value: 1, icon: Frown, label: 'Awful' },
  { value: 2, icon: Frown, label: 'Bad' },
  { value: 3, icon: Meh, label: 'Okay' },
  { value: 4, icon: Smile, label: 'Good' },
  { value: 5, icon: Smile, label: 'Great' },
];

export const TodayAttendanceSummary: React.FC<TodayAttendanceSummaryProps> = ({
  time,
  status,
  selectedMood,
  isLoading,
  isSubmittingMood,
  isBreakLoading,
  handleAttendance,
  handleBreak,
  logMood,
  liveWorkingTime,
  checkInTimeDisplay,
  checkOutTimeDisplay,
  totalBreakDisplay,
  netWorkingDisplay,
  isLate,
  lateDurationDisplay,
  earlyDurationDisplay,
  punctualityStatus,
  shiftTimingDisplay,
  workMode,
  setWorkMode,
  geoLocation,
  requestGeoLocation,
  breakNote,
  setBreakNote,
}) => {
  const isCheckedIn = status?.status === 'checked-in';
  const isOnBreak = !!status?.onBreak;
  const isWfhCheckedIn = Boolean(status?.is_wfh || status?.work_mode === 'wfh');

  const getStatusBadge = () => {
    if (isOnBreak) {
      return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs uppercase tracking-widest animate-pulse">
          <Coffee size={14} /> ON BREAK
        </span>
      );
    }
    if (isCheckedIn) {
      if (isWfhCheckedIn) {
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 font-black text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <Home size={14} /> WFH (REMOTE)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black text-xs uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Building size={14} /> IN OFFICE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-surface-subtle border border-border-subtle text-muted font-black text-xs uppercase tracking-widest">
        <LogOut size={14} /> CHECKED OUT
      </span>
    );
  };

  return (
    <div className="bg-surface-elevated rounded-[36px] p-6 sm:p-8 border border-border-subtle shadow-xl relative overflow-hidden flex flex-col gap-6 transition-all hover:shadow-2xl">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-black text-foreground tracking-tight">
                Today's Attendance
              </h2>
              {getStatusBadge()}
              {isCheckedIn && status?.check_in_location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-foreground/80 font-bold text-[11px]">
                  <MapPin size={12} className="text-primary" />
                  {status.check_in_location}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-muted mt-0.5">{formatFullDate(time)}</p>
          </div>
        </div>

        {/* Live Real-Time Digital Clock */}
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
            {formatTime(time)}
          </span>
          <span className="text-[9px] font-black text-primary/80 uppercase tracking-widest">
            Real-Time Clock
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Action Control Hub (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-surface-subtle/50 p-5 rounded-[28px] border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Quick Actions
            </span>
            <span className="text-[10px] font-bold text-muted">
              Shift: <strong className="text-foreground">{shiftTimingDisplay}</strong>
            </span>
          </div>

          {/* Work Mode Toggle: Office vs WFH */}
          <div className="flex flex-col gap-2 p-3 bg-surface-elevated rounded-2xl border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Work Location Mode
              </span>
              {isCheckedIn ? (
                <span className="text-[10px] font-bold text-primary">Locked (Active Shift)</span>
              ) : (
                <span className="text-[10px] font-bold text-muted">Select before Punch</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isCheckedIn}
                onClick={() => setWorkMode('office')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  workMode === 'office'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'bg-surface-subtle border border-transparent text-muted hover:text-foreground'
                } ${isCheckedIn ? 'opacity-80 cursor-not-allowed' : ''}`}>
                <Building size={14} />
                <span>In-Office</span>
              </button>

              <button
                type="button"
                disabled={isCheckedIn}
                onClick={() => setWorkMode('wfh')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  workMode === 'wfh'
                    ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'bg-surface-subtle border border-transparent text-muted hover:text-foreground'
                } ${isCheckedIn ? 'opacity-80 cursor-not-allowed' : ''}`}>
                <Home size={14} />
                <span>WFH</span>
              </button>
            </div>
          </div>

          {/* Real-Time Geo-Tagging Status Indicator */}
          <div className="p-3 bg-surface-elevated rounded-2xl border border-border-subtle flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Navigation size={13} className="text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Geo-Tag Verification
                </span>
              </div>
              <button
                type="button"
                onClick={requestGeoLocation}
                disabled={geoLocation.isFetching}
                title="Refresh GPS Coordinates"
                className="text-muted hover:text-primary transition-colors p-1 rounded-lg cursor-pointer">
                <RefreshCw size={12} className={geoLocation.isFetching ? 'animate-spin text-primary' : ''} />
              </button>
            </div>

            {geoLocation.latitude && geoLocation.longitude ? (
              <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 size={12} />
                  GPS Tagged: {geoLocation.latitude.toFixed(4)}°, {geoLocation.longitude.toFixed(4)}°
                </span>
                {geoLocation.accuracy && (
                  <span className="text-[10px] text-muted">±{Math.round(geoLocation.accuracy)}m</span>
                )}
              </div>
            ) : geoLocation.error ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <AlertTriangle size={12} />
                <span>{geoLocation.error}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted">
                <MapPin size={12} />
                <span>Detecting location...</span>
              </div>
            )}
          </div>

          {/* Check-In / Check-Out Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant={isCheckedIn ? 'ghost' : 'primary'}
              aria-label={isCheckedIn ? 'Check Out' : 'Check In'}
              className={`w-full h-14 rounded-2xl! text-sm shadow-lg ${
                isCheckedIn
                  ? 'border-2 border-border-strong! hover:bg-surface-elevated'
                  : 'shadow-primary/30'
              } flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer`}
              onClick={handleAttendance}
              loading={isLoading}
              disabled={isLoading || isOnBreak}>
              {isCheckedIn ? <LogOut size={18} /> : <LogIn size={18} />}
              <span className="font-black tracking-wider uppercase">
                {isCheckedIn
                  ? 'Check Out'
                  : workMode === 'wfh'
                  ? 'Check In (WFH)'
                  : 'Check In (Office)'}
              </span>
            </Button>

          {/* Break Action Hub */}
          <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-elevated border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Coffee size={12} className={isOnBreak ? 'text-amber-500 animate-pulse' : 'text-primary'} />
                Break Management
              </span>
              {isOnBreak ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  IN PROGRESS
                </span>
              ) : isCheckedIn ? (
                <span className="text-[10px] font-bold text-muted">Ready</span>
              ) : (
                <span className="text-[10px] font-bold text-muted">Punch in first</span>
              )}
            </div>

            {/* Active break status card */}
            {isOnBreak && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {status?.activeBreak?.break_type || (status?.activeBreak?.break_note ? `${status.activeBreak.break_note} Break` : 'Break In Progress')}
                  </span>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                    {totalBreakDisplay}
                  </span>
                </div>
                {status?.activeBreak?.break_note && (
                  <div className="flex items-start gap-1.5 text-[11px] font-bold text-foreground bg-white/70 dark:bg-surface-subtle/80 px-2 py-1 rounded-lg">
                    <MessageSquare size={12} className="shrink-0 mt-0.5 text-amber-500" />
                    <span>{status.activeBreak.break_note}</span>
                  </div>
                )}
                {status?.activeBreak?.break_start && (
                  <span className="text-[9px] font-bold text-muted">
                    Started at: {new Date(status.activeBreak.break_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            {/* When NOT on break: Quick Presets + Reason Input */}
            {!isOnBreak && isCheckedIn && (
              <div className="flex flex-col gap-2">
                {/* Quick 1-Click Break Presets */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isBreakLoading}
                    onClick={() => handleBreak('Tea Break', breakNote || 'Tea Break')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-surface-subtle hover:bg-amber-500/15 border border-border-subtle hover:border-amber-500/40 text-[11px] font-bold text-foreground transition-all cursor-pointer">
                    <Coffee size={13} className="text-amber-500" />
                    <span>Tea Break</span>
                    <span className="text-[9px] text-muted">(15m)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBreakLoading}
                    onClick={() => handleBreak('Lunch Break', breakNote || 'Lunch Break')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-surface-subtle hover:bg-amber-500/15 border border-border-subtle hover:border-amber-500/40 text-[11px] font-bold text-foreground transition-all cursor-pointer">
                    <Coffee size={13} className="text-amber-500" />
                    <span>Lunch Break</span>
                    <span className="text-[9px] text-muted">(45m)</span>
                  </button>
                </div>

                {/* Custom Remark Input */}
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={breakNote}
                    onChange={(e) => setBreakNote(e.target.value)}
                    placeholder="Custom break reason (optional)..."
                    maxLength={80}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Primary Break Action Button */}
            <Button
              variant={isOnBreak ? 'ghost' : 'secondary'}
              aria-label={isOnBreak ? 'End Break' : 'Start Break'}
              className={`w-full h-11 rounded-2xl! text-xs shadow-sm ${
                isOnBreak
                  ? 'border-2 border-amber-500! text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'bg-surface-elevated border border-border-subtle hover:border-primary/40'
              } flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer`}
              onClick={() => handleBreak(breakNote || 'Break')}
              loading={isBreakLoading}
              disabled={isBreakLoading || !isCheckedIn}>
              <Coffee size={15} className={isOnBreak ? 'text-amber-500 animate-pulse' : 'text-muted'} />
              <span className="font-black tracking-wider uppercase">
                {isOnBreak ? 'End Break' : 'Start Break'}
              </span>
            </Button>
          </div>
          </div>{/* end flex-col gap-3 */}

          {/* Integrated Mood Selector */}
          <div className="pt-3 border-t border-border-subtle/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-muted uppercase tracking-wider">
                How are you feeling today?
              </span>
              {selectedMood && (
                <span className="text-[9px] font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={11} /> Saved
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => logMood(m.value, m.label)}
                  disabled={isSubmittingMood}
                  title={`Feeling ${m.label}`}
                  className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all border ${
                    selectedMood === m.value
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                      : 'bg-surface-subtle border-transparent hover:bg-surface-elevated text-muted'
                  }`}>
                  <m.icon size={15} />
                  <span className="text-[8px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Shift Metrics Cards (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Check-in Time */}
          <div className={`p-4 rounded-[22px] border flex flex-col justify-between transition-all ${
            isLate
              ? 'bg-amber-500/5 border-amber-500/25'
              : 'bg-surface-subtle border-border-subtle'
          }`}>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Check In</span>
              <LogIn size={15} className={isLate ? 'text-amber-500' : 'text-primary'} />
            </div>
            <div className="mt-2.5">
              <span className={`text-lg font-black block ${
                isLate ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
              }`}>{checkInTimeDisplay}</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {isLate ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-wide">
                    <AlertTriangle size={9} /> LATE · {lateDurationDisplay}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-muted">
                    {isWfhCheckedIn ? 'Work From Home' : 'First Punch Today'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Check-out Time */}
          <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Check Out</span>
              <LogOut size={15} className="text-muted" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-black text-foreground block">
                {checkOutTimeDisplay}
              </span>
              <span className="text-[9px] font-bold text-muted mt-0.5 block">Last Punch Today</span>
            </div>
          </div>

          {/* Card 3: Punctuality — 3 States: late / on-time / early */}
          {(() => {
            const cardConfig = {
              late: {
                bg: 'bg-amber-500/5',
                border: 'border-amber-500/25',
                icon: <AlertTriangle size={15} className="text-amber-500" />,
                label: 'LATE',
                labelColor: 'text-amber-500',
                sub: lateDurationDisplay,
                subColor: 'text-amber-400',
              },
              'on-time': {
                bg: 'bg-emerald-500/5',
                border: 'border-emerald-500/20',
                icon: <CheckCircle2 size={15} className="text-emerald-500" />,
                label: 'ON TIME',
                labelColor: 'text-emerald-500',
                sub: 'Within shift window',
                subColor: 'text-muted',
              },
              early: {
                bg: 'bg-blue-500/5',
                border: 'border-blue-500/20',
                icon: <Zap size={15} className="text-blue-500" />,
                label: 'EARLY',
                labelColor: 'text-blue-500',
                sub: earlyDurationDisplay,
                subColor: 'text-blue-400',
              },
              unknown: {
                bg: 'bg-surface-subtle',
                border: 'border-border-subtle',
                icon: <Clock size={15} className="text-muted" />,
                label: '—',
                labelColor: 'text-muted',
                sub: 'Not checked in',
                subColor: 'text-muted',
              },
            };
            const cfg = cardConfig[punctualityStatus];
            return (
              <div className={`${cfg.bg} p-4 rounded-[22px] border ${cfg.border} flex flex-col justify-between transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Punctuality</span>
                  {cfg.icon}
                </div>
                <div className="mt-2.5">
                  <span className={`text-sm font-black block ${cfg.labelColor}`}>{cfg.label}</span>
                  <span className={`text-[9px] font-bold mt-0.5 block ${cfg.subColor}`}>{cfg.sub}</span>
                </div>
              </div>
            );
          })()}

          {/* Card 4: Live Session Timer */}
          <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">
                Current Session
              </span>
              <Activity size={15} className="text-info" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-black text-foreground block">{liveWorkingTime}</span>
              <span className="text-[9px] font-bold text-muted mt-0.5 block">
                Live Clock Elapsed
              </span>
            </div>
          </div>

          {/* Card 5: Total Break */}
          <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Break</span>
              <Coffee size={15} className="text-amber-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-black text-foreground block">{totalBreakDisplay}</span>
              <span className="text-[9px] font-bold text-muted mt-0.5 block">
                Cumulative Breaks
              </span>
            </div>
          </div>

          {/* Card 6: Net Working Time */}
          <div className="bg-surface-subtle p-4 rounded-[22px] border border-border-subtle flex flex-col justify-between bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between text-primary">
              <span className="text-[10px] font-black uppercase tracking-wider">Net Working</span>
              <Hourglass size={15} className="text-primary" />
            </div>
            <div className="mt-2.5">
              <span className="text-lg font-black text-primary block">{netWorkingDisplay}</span>
              <span className="text-[9px] font-bold text-primary/80 mt-0.5 block">
                Gross minus Breaks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
