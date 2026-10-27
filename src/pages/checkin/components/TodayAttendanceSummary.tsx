import React, { useState, useMemo } from 'react';
import {
  LogIn,
  LogOut,
  Coffee,
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
  Sparkles,
  ChevronDown,
  ChevronUp,
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
  handleBreak: (breakTypeOrRemark?: string, customRemark?: string) => void;
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
  const [showBreakTray, setShowBreakTray] = useState(false);

  const isCheckedIn = status?.status === 'checked-in';
  const isOnBreak = !!status?.onBreak;
  const isWfhCheckedIn = Boolean(status?.is_wfh || status?.work_mode === 'wfh');

  // Compute live seconds elapsed since check-in for real-time second-by-second ticking
  const checkInDate = useMemo(() => {
    const raw = status?.lastAction || (status?.record as any)?.check_in_time;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [status?.lastAction, status?.record]);

  const elapsedSeconds = useMemo(() => {
    if (!isCheckedIn || !checkInDate) return 0;
    return Math.max(0, Math.floor((time.getTime() - checkInDate.getTime()) / 1000));
  }, [isCheckedIn, checkInDate, time]);

  // Compute active break seconds if currently on break
  const activeBreakSeconds = useMemo(() => {
    const raw = status?.activeBreak?.break_start;
    if (!isOnBreak || !raw) return 0;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return 0;
    return Math.max(0, Math.floor((time.getTime() - d.getTime()) / 1000));
  }, [isOnBreak, status?.activeBreak?.break_start, time]);

  // Format seconds into HH:MM:SS
  const formatSecondsToHMS = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Target standard shift: 8h 30m = 510 minutes = 30,600 seconds
  const TARGET_SHIFT_SECONDS = 510 * 60;
  const progressPercent = useMemo(() => {
    if (!isCheckedIn) return 0;
    const totalBreakSec = (status?.total_break_minutes ?? 0) * 60 + activeBreakSeconds;
    const netSec = Math.max(0, elapsedSeconds - totalBreakSec);
    return Math.min(100, Math.round((netSec / TARGET_SHIFT_SECONDS) * 100));
  }, [isCheckedIn, elapsedSeconds, activeBreakSeconds, status?.total_break_minutes]);

  // SVG Progress Ring calculations (radius 82, perimeter ~515)
  const RING_RADIUS = 82;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const strokeDashoffset = RING_CIRCUMFERENCE - (progressPercent / 100) * RING_CIRCUMFERENCE;

  // Active status badge helper
  const renderStatusBadge = () => {
    if (isOnBreak) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          On Break
        </span>
      );
    }
    if (isCheckedIn) {
      if (isWfhCheckedIn) {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-black text-[11px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Active · Remote
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Active · Office
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-muted font-bold text-[11px] uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-muted/60" />
        Not Punched
      </span>
    );
  };

  return (
    <div className="bg-surface-elevated/90 backdrop-blur-md rounded-3xl border border-border-subtle shadow-sm p-5 sm:p-7 space-y-6 relative overflow-hidden transition-all">
      {/* Ambient background glow according to status */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700 ${
          isOnBreak
            ? 'bg-amber-500'
            : isCheckedIn
            ? isWfhCheckedIn
              ? 'bg-indigo-500'
              : 'bg-emerald-500'
            : 'bg-primary'
        }`}
      />

      {/* Top Header: Date, Shift timing, and Live Presence Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-black text-foreground tracking-tight">
              {formatFullDate(time)}
            </h2>
            {renderStatusBadge()}
          </div>
          <p className="text-xs font-semibold text-muted mt-0.5 flex items-center gap-2">
            <span>Shift Window: <strong className="text-foreground">{shiftTimingDisplay}</strong></span>
            {isCheckedIn && status?.check_in_location && (
              <>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  <MapPin size={12} />
                  {status.check_in_location}
                </span>
              </>
            )}
          </p>
        </div>

        {/* GPS Status & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {geoLocation.latitude && geoLocation.longitude ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-[11px] font-bold text-foreground/80">
              <Navigation size={12} className="text-primary" />
              <span>GPS Tagged: {geoLocation.latitude.toFixed(3)}°, {geoLocation.longitude.toFixed(3)}°</span>
              <button
                type="button"
                onClick={requestGeoLocation}
                disabled={geoLocation.isFetching}
                title="Refresh GPS"
                className="text-muted hover:text-primary transition-colors p-0.5 cursor-pointer">
                <RefreshCw size={11} className={geoLocation.isFetching ? 'animate-spin text-primary' : ''} />
              </button>
            </div>
          ) : geoLocation.error ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
              <AlertTriangle size={12} />
              <span>GPS: {geoLocation.error}</span>
              <button
                type="button"
                onClick={requestGeoLocation}
                className="ml-1 text-primary underline cursor-pointer text-[10px]">
                Retry
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={requestGeoLocation}
              disabled={geoLocation.isFetching}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-subtle border border-border-subtle text-muted text-[11px] font-bold hover:text-foreground transition-colors cursor-pointer">
              <Navigation size={12} className={geoLocation.isFetching ? 'animate-spin text-primary' : ''} />
              <span>{geoLocation.isFetching ? 'Locating GPS...' : 'Verify GPS'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dynamic Centerpiece Hero: Progress Orb + Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
        {/* Left: Dynamic SVG Progress Orb (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 190 190">
              {/* Background Track */}
              <circle
                cx="95"
                cy="95"
                r={RING_RADIUS}
                className="stroke-surface-subtle dark:stroke-border-subtle"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Dynamic Animated Progress Stroke */}
              <circle
                cx="95"
                cy="95"
                r={RING_RADIUS}
                className={`transition-all duration-1000 ease-out ${
                  isOnBreak
                    ? 'stroke-amber-500'
                    : isCheckedIn
                    ? isWfhCheckedIn
                      ? 'stroke-indigo-500'
                      : 'stroke-emerald-500'
                    : 'stroke-primary/40'
                }`}
                strokeWidth="10"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={isCheckedIn ? strokeDashoffset : RING_CIRCUMFERENCE}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content of Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              {isOnBreak ? (
                <>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
                    <Coffee size={12} className="animate-pulse" />
                    On Break
                  </span>
                  <span className="font-mono text-2xl font-black text-foreground tracking-tight">
                    {formatSecondsToHMS(activeBreakSeconds)}
                  </span>
                  <span className="text-[10px] font-bold text-muted mt-0.5">
                    {status?.activeBreak?.break_type || 'Break Session'}
                  </span>
                </>
              ) : isCheckedIn ? (
                <>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Working
                  </span>
                  <span className="font-mono text-2xl font-black text-foreground tracking-tight">
                    {formatSecondsToHMS(elapsedSeconds)}
                  </span>
                  <span className="text-[10px] font-bold text-muted mt-0.5">
                    {progressPercent}% of 8.5h shift
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-0.5">
                    Current Time
                  </span>
                  <span className="font-mono text-2xl font-black text-foreground tracking-tight">
                    {formatTime(time)}
                  </span>
                  <span className="text-[10px] font-bold text-muted mt-0.5">
                    Ready to punch in
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Primary Action Console & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">
              Attendance Action
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isOnBreak
                ? 'Break In Progress'
                : isCheckedIn
                ? 'Your Shift is Active'
                : 'Ready to Start Your Workday?'}
            </h3>
            <p className="text-xs text-muted font-medium mt-0.5">
              {isOnBreak
                ? `Taking ${status?.activeBreak?.break_type || 'break'}${status?.activeBreak?.break_note ? `: "${status.activeBreak.break_note}"` : ''}. Resume whenever you're back.`
                : isCheckedIn
                ? `Punched in at ${checkInTimeDisplay}. Track breaks or punch out at shift end.`
                : 'Select your work location mode and punch in to start recording your shift.'}
            </p>
          </div>

          {/* Location Mode Segmented Pill (only visible/interactable before punch-in) */}
          {!isCheckedIn && (
            <div className="inline-flex p-1 bg-surface-subtle rounded-2xl border border-border-subtle self-start gap-1">
              <button
                type="button"
                onClick={() => setWorkMode('office')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  workMode === 'office'
                    ? 'bg-surface-elevated text-foreground shadow-xs border border-border-subtle'
                    : 'text-muted hover:text-foreground'
                }`}>
                <Building size={14} className={workMode === 'office' ? 'text-primary' : 'text-muted'} />
                <span>In-Office</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkMode('wfh')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  workMode === 'wfh'
                    ? 'bg-surface-elevated text-foreground shadow-xs border border-border-subtle'
                    : 'text-muted hover:text-foreground'
                }`}>
                <Home size={14} className={workMode === 'wfh' ? 'text-indigo-500' : 'text-muted'} />
                <span>Remote / WFH</span>
              </button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {!isCheckedIn ? (
              /* PRIMARY PUNCH IN BUTTON */
              <button
                type="button"
                onClick={handleAttendance}
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[210px] h-13 px-8 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5">
                {isLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                <span>
                  {workMode === 'wfh' ? 'Punch In (Remote)' : 'Punch In (Office)'}
                </span>
              </button>
            ) : isOnBreak ? (
              /* RESUME FROM BREAK BUTTON */
              <button
                type="button"
                onClick={() => handleBreak()}
                disabled={isBreakLoading}
                className="w-full sm:w-auto min-w-[210px] h-13 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 animate-pulse">
                {isBreakLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Coffee size={18} />
                )}
                <span>Resume Work (End Break)</span>
              </button>
            ) : (
              /* ACTIVE SHIFT: CHECK OUT + BREAK BUTTONS */
              <>
                <button
                  type="button"
                  onClick={handleAttendance}
                  disabled={isLoading || isOnBreak}
                  className="h-12 px-6 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-strong text-foreground font-black text-xs tracking-wider uppercase hover:border-primary/40 hover:text-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs">
                  {isLoading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  <span>Check Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBreakTray(!showBreakTray)}
                  disabled={isBreakLoading}
                  className="h-12 px-6 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs tracking-wider uppercase active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs">
                  <Coffee size={16} />
                  <span>Take Break</span>
                  {showBreakTray ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </>
            )}
          </div>

          {/* Contextual Expandable Break Drawer when taking a break */}
          {isCheckedIn && !isOnBreak && showBreakTray && (
            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Coffee size={12} className="text-amber-500" />
                  Select Break Type
                </span>
                <span className="text-[10px] font-bold text-muted">1-Tap Start</span>
              </div>

              {/* 1-Tap Break Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isBreakLoading}
                  onClick={() => {
                    handleBreak('Tea Break', breakNote || 'Tea Break');
                    setShowBreakTray(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-amber-500/15 border border-border-subtle hover:border-amber-500/40 text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs active:scale-95">
                  <Coffee size={13} className="text-amber-500" />
                  <span>Tea Break</span>
                  <span className="text-[10px] text-muted">(15m)</span>
                </button>

                <button
                  type="button"
                  disabled={isBreakLoading}
                  onClick={() => {
                    handleBreak('Lunch Break', breakNote || 'Lunch Break');
                    setShowBreakTray(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-amber-500/15 border border-border-subtle hover:border-amber-500/40 text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs active:scale-95">
                  <Coffee size={13} className="text-amber-500" />
                  <span>Lunch Break</span>
                  <span className="text-[10px] text-muted">(45m)</span>
                </button>

                <button
                  type="button"
                  disabled={isBreakLoading}
                  onClick={() => {
                    handleBreak('Short Break', breakNote || 'Short Break');
                    setShowBreakTray(false);
                  }}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-surface-elevated hover:bg-amber-500/15 border border-border-subtle hover:border-amber-500/40 text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs active:scale-95">
                  <Zap size={13} className="text-amber-500" />
                  <span>Short Break</span>
                  <span className="text-[10px] text-muted">(10m)</span>
                </button>
              </div>

              {/* Custom Note Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={breakNote}
                  onChange={(e) => setBreakNote(e.target.value)}
                  placeholder="Optional break note (e.g. coffee with client)..."
                  maxLength={80}
                  className="flex-1 bg-surface-elevated border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  disabled={isBreakLoading}
                  onClick={() => {
                    handleBreak(breakNote || 'Break');
                    setShowBreakTray(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-600 active:scale-95 transition-all cursor-pointer">
                  Start
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Consolidated Metrics Strip (Replaces 6 boxy cards) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle/80 border border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-border-subtle/70">
        {/* Metric 1: First Punch (Check-In) */}
        <div className="flex flex-col justify-between pt-2 md:pt-0 md:px-3 first:px-0">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-black uppercase tracking-wider">Punch In</span>
            <LogIn size={14} className={isLate ? 'text-amber-500' : 'text-primary'} />
          </div>
          <div className="mt-2">
            <span className={`text-base sm:text-lg font-black block ${
              isLate ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
            }`}>
              {checkInTimeDisplay}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {punctualityStatus === 'late' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-wide">
                  <AlertTriangle size={10} /> {lateDurationDisplay || 'Late'}
                </span>
              ) : punctualityStatus === 'early' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-wide">
                  <Zap size={10} /> {earlyDurationDisplay || 'Early'}
                </span>
              ) : punctualityStatus === 'on-time' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <CheckCircle2 size={10} /> On Time
                </span>
              ) : (
                <span className="text-[10px] font-bold text-muted">Not punched</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Live Active Session */}
        <div className="flex flex-col justify-between pt-2 md:pt-0 md:px-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-black uppercase tracking-wider">Live Session</span>
            <Activity size={14} className={isCheckedIn ? 'text-emerald-500 animate-pulse' : 'text-muted'} />
          </div>
          <div className="mt-2">
            <span className="text-base sm:text-lg font-black text-foreground block">
              {liveWorkingTime}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5 block">
              {isCheckedIn ? 'Active shift elapsed' : 'No active session'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Break */}
        <div className="flex flex-col justify-between pt-2 md:pt-0 md:px-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-black uppercase tracking-wider">Breaks</span>
            <Coffee size={14} className={isOnBreak ? 'text-amber-500 animate-pulse' : 'text-muted'} />
          </div>
          <div className="mt-2">
            <span className="text-base sm:text-lg font-black text-foreground block">
              {totalBreakDisplay}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5 block">
              {isOnBreak ? 'Break currently active' : 'Total break time'}
            </span>
          </div>
        </div>

        {/* Metric 4: Net Productive Working Time */}
        <div className="flex flex-col justify-between pt-2 md:pt-0 md:px-3">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[10px] font-black uppercase tracking-wider">Net Working</span>
            <Hourglass size={14} className="text-primary" />
          </div>
          <div className="mt-2">
            <span className="text-base sm:text-lg font-black text-primary block">
              {netWorkingDisplay}
            </span>
            <span className="text-[10px] font-bold text-muted mt-0.5 block">
              {checkOutTimeDisplay !== '—' && checkOutTimeDisplay !== 'In Progress' ? `Out: ${checkOutTimeDisplay}` : 'Gross minus breaks'}
            </span>
          </div>
        </div>
      </div>

      {/* Minimal Micro-Interactive Mood Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border-subtle/50">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary" />
          <span className="text-[11px] font-black uppercase tracking-wider text-muted">
            How are you feeling today?
          </span>
          {selectedMood && (
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 ml-2">
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => logMood(m.value, m.label)}
                disabled={isSubmittingMood}
                title={`Feeling ${m.label}`}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/15 border border-primary/40 text-primary shadow-xs scale-105'
                    : 'bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-muted hover:text-foreground'
                }`}>
                <m.icon size={13} className={isSelected ? 'text-primary' : 'text-muted'} />
                <span className="text-[11px] font-bold">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
