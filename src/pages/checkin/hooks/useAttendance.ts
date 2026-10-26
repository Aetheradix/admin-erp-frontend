import { useState, useEffect, useMemo } from 'react';
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceStatusQuery,
  useTakeBreakMutation,
  useEndBreakMutation,
  useGetAttendanceHistoryQuery,
} from '@/store/api/attendanceSlice';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { generateMonthAttendanceRecords, calculateMonthSummary } from '../utils/attendanceUtils';

// ---------- helpers ----------

/** Format a Date/ISO string to "10:45 AM" style */
function formatTimeDisplay(dateOrIso: string | Date | null | undefined): string {
  if (!dateOrIso) return '—';
  const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Format elapsed minutes → "4h 45m" */
function formatElapsed(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Shift config — keep centralised for future config-based shifts */
const SHIFT_START_HOUR = 10;
const SHIFT_START_MIN = 0;
const SHIFT_DISPLAY = '10:00 AM – 05:00 PM';

export interface GeoLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isFetching: boolean;
  locationName: string | null;
  permissionGranted: boolean;
}

export const useAttendance = () => {
  const [time, setTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // WFH vs Office Work Mode toggle (defaults to 'office')
  const [workMode, setWorkMode] = useState<'office' | 'wfh'>('office');

  // Break remark state (employee types reason before taking break)
  const [breakRemark, setBreakRemark] = useState<string>('');

  // Real-time Geo-Tagging state
  const [geoLocation, setGeoLocation] = useState<GeoLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isFetching: false,
    locationName: null,
    permissionGranted: false,
  });

  const { data: status, isLoading: isFetching } = useGetAttendanceStatusQuery();
  const { data: history = [] } = useGetAttendanceHistoryQuery();

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  const [submitMood, { isLoading: isSubmittingMood }] = useSubmitMoodMutation();

  const [takeBreak, { isLoading: isStartingBreak }] = useTakeBreakMutation();
  const [endBreak, { isLoading: isEndingBreak }] = useEndBreakMutation();

  // Sync workMode with backend status if already checked in
  useEffect(() => {
    if (status?.work_mode) {
      setWorkMode(status.work_mode === 'wfh' ? 'wfh' : 'office');
    }
  }, [status?.work_mode]);

  // Request browser geolocation helper
  const requestGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isFetching: false,
      }));
      return;
    }

    setGeoLocation((prev) => ({ ...prev, isFetching: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGeoLocation({
          latitude,
          longitude,
          accuracy,
          error: null,
          isFetching: false,
          locationName: `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (GPS)`,
          permissionGranted: true,
        });
      },
      (err) => {
        let msg = 'Failed to get location';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information unavailable';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out';
        }
        setGeoLocation((prev) => ({
          ...prev,
          error: msg,
          isFetching: false,
          permissionGranted: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Auto-detect geolocation on mount
  useEffect(() => {
    requestGeoLocation();
  }, []);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate monthly records (merging API data if present with standard month generator)
  const monthRecords = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const generated = generateMonthAttendanceRecords(year, month);

    // Overlay real API history items if date matches
    if (Array.isArray(history) && history.length > 0) {
      history.forEach((h: any) => {
        const matchingIndex = generated.findIndex((g) => g.date === h.date);
        if (matchingIndex !== -1) {
          generated[matchingIndex] = {
            ...generated[matchingIndex],
            checkIn: h.checkIn || generated[matchingIndex].checkIn,
            checkOut: h.checkOut || generated[matchingIndex].checkOut,
            status: (h.status as any) || generated[matchingIndex].status,
            work_mode: h.work_mode || (h.is_wfh ? 'wfh' : 'office'),
            is_wfh: Boolean(h.is_wfh || h.work_mode === 'wfh'),
            check_in_latitude: h.check_in_latitude,
            check_in_longitude: h.check_in_longitude,
            check_in_location: h.check_in_location,
            check_out_latitude: h.check_out_latitude,
            check_out_longitude: h.check_out_longitude,
            check_out_location: h.check_out_location,
          };
        }
      });
    }

    return generated;
  }, [currentMonth, history]);

  // Aggregate monthly stats summary
  const monthSummary = useMemo(() => {
    return calculateMonthSummary(monthRecords);
  }, [monthRecords]);

  // Currently selected date detail record
  const selectedDayRecord = useMemo(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return monthRecords.find((r) => r.date === dateStr);
  }, [selectedDate, monthRecords]);

  // Live session metrics calculation
  const isCheckedIn = status?.status === 'checked-in';
  const isOnBreak = !!status?.onBreak;

  // ── Check-in time (from API lastAction / record) ──
  const checkInDate: Date | null = useMemo(() => {
    const raw = status?.lastAction || (status?.record as any)?.check_in_time;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [status?.lastAction, status?.record]);

  // ── Check-out time ──
  const checkOutDate: Date | null = useMemo(() => {
    const raw = (status?.record as any)?.check_out_time;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [status?.record]);

  const checkInTimeDisplay = checkInDate ? formatTimeDisplay(checkInDate) : '—';
  const checkOutTimeDisplay = isCheckedIn ? 'In Progress' : (checkOutDate ? formatTimeDisplay(checkOutDate) : '—');
  const shiftTimingDisplay = SHIFT_DISPLAY;

  // ── 3-state Punctuality: early | on-time | late ──
  // Grace window: ±5 min around shift start counts as 'on-time'
  const GRACE_MINUTES = 5;
  const { punctualityStatus, isLate, lateDurationDisplay, earlyDurationDisplay } = useMemo(() => {
    if (!checkInDate) {
      return {
        punctualityStatus: 'unknown' as const,
        isLate: false,
        lateDurationDisplay: '',
        earlyDurationDisplay: '',
      };
    }
    const shiftStartMinutes = SHIFT_START_HOUR * 60 + SHIFT_START_MIN;
    const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
    const diffMinutes = checkInMinutes - shiftStartMinutes; // positive = late, negative = early

    if (diffMinutes > GRACE_MINUTES) {
      // LATE
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      const display = h > 0 ? `${h}h ${m}m late` : `${m} min late`;
      return { punctualityStatus: 'late' as const, isLate: true, lateDurationDisplay: display, earlyDurationDisplay: '' };
    } else if (diffMinutes < -GRACE_MINUTES) {
      // EARLY
      const absDiff = Math.abs(diffMinutes);
      const h = Math.floor(absDiff / 60);
      const m = absDiff % 60;
      const display = h > 0 ? `${h}h ${m}m early` : `${m} min early`;
      return { punctualityStatus: 'early' as const, isLate: false, lateDurationDisplay: '', earlyDurationDisplay: display };
    } else {
      // ON TIME (within grace window)
      return { punctualityStatus: 'on-time' as const, isLate: false, lateDurationDisplay: '', earlyDurationDisplay: '' };
    }
  }, [checkInDate]);


  // ── Live elapsed working time (ticks every second via `time`) ──
  const liveWorkingTime = useMemo(() => {
    if (!isCheckedIn || !checkInDate) return '—';
    const elapsedMs = time.getTime() - checkInDate.getTime();
    const totalMinutes = Math.floor(elapsedMs / 60000);
    return formatElapsed(Math.max(0, totalMinutes));
  }, [isCheckedIn, checkInDate, time]);

  // ── Break & net working ──
  const totalBreakDisplay = useMemo(() => {
    const activeBreakStart = (status?.activeBreak as any)?.start_time;
    // Count elapsed time of the current break if on break
    let breakMins = 0;
    if (isOnBreak && activeBreakStart) {
      const started = new Date(activeBreakStart);
      if (!isNaN(started.getTime())) {
        breakMins = Math.floor((time.getTime() - started.getTime()) / 60000);
      }
    }
    return breakMins > 0 ? `${formatElapsed(breakMins)} (Active)` : (isOnBreak ? 'On Break' : '—');
  }, [isOnBreak, status?.activeBreak, time]);

  const netWorkingDisplay = useMemo(() => {
    if (!isCheckedIn || !checkInDate) return '—';
    const elapsedMs = time.getTime() - checkInDate.getTime();
    const grossMins = Math.floor(elapsedMs / 60000);
    // Subtract active break if applicable
    const activeBreakStart = (status?.activeBreak as any)?.start_time;
    let breakMins = 0;
    if (isOnBreak && activeBreakStart) {
      const started = new Date(activeBreakStart);
      if (!isNaN(started.getTime())) {
        breakMins = Math.floor((time.getTime() - started.getTime()) / 60000);
      }
    }
    return formatElapsed(Math.max(0, grossMins - breakMins));
  }, [isCheckedIn, checkInDate, isOnBreak, status?.activeBreak, time]);

  const handleAttendance = async () => {
    try {
      if (status?.status === 'checked-in') {
        await checkOut({
          latitude: geoLocation.latitude,
          longitude: geoLocation.longitude,
          location_name: geoLocation.locationName,
        }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Checked Out',
          detail: 'You have been successfully checked out with geo-verification.',
          life: 3000,
        });
      } else {
        const isWfhSelected = workMode === 'wfh';
        // Build device info from browser
        const deviceInfo = [
          navigator.userAgent.slice(0, 120),
          `${screen.width}x${screen.height}`,
        ].join(' | ');
        await checkIn({
          remark: isWfhSelected ? 'WFH Check-in' : 'Office Check-in',
          work_mode: workMode,
          is_wfh: isWfhSelected,
          latitude: geoLocation.latitude,
          longitude: geoLocation.longitude,
          check_in_latitude: geoLocation.latitude,
          check_in_longitude: geoLocation.longitude,
          check_in_location:
            geoLocation.locationName || (isWfhSelected ? 'Remote / Home' : 'Office HQ'),
          location_name:
            geoLocation.locationName || (isWfhSelected ? 'Remote / Home' : 'Office HQ'),
          device_info: deviceInfo,
        }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Checked In',
          detail: `Welcome! Checked in as [${isWfhSelected ? 'Work From Home' : 'In Office'}].`,
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      console.error('Attendance action failed:', error);
      showToast({
        severity: 'error',
        summary: 'Attendance Error',
        detail: apiError.data?.message || 'Action failed',
        life: 3000,
      });
    }
  };

  const handleBreak = async (remarkOverride?: string) => {
    try {
      if (status?.onBreak) {
        await endBreak().unwrap();
        setBreakRemark('');
        showToast({
          severity: 'success',
          summary: 'Break Ended',
          detail: 'Welcome back! Break time has been recorded.',
          life: 3000,
        });
      } else {
        const remarkText =
          (remarkOverride && remarkOverride.trim())
            ? remarkOverride.trim()
            : (breakRemark && breakRemark.trim())
            ? breakRemark.trim()
            : 'Break';
        console.log('[useAttendance] takeBreak payload:', { remark: remarkText });
        await takeBreak({ remark: remarkText }).unwrap();
        setBreakRemark('');
        showToast({
          severity: 'success',
          summary: 'Break Started',
          detail: `Break started: "${remarkText}"`,
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      console.error('Break action failed:', error);
      showToast({
        severity: 'error',
        summary: 'Break Error',
        detail: apiError.data?.message || 'Action failed',
        life: 3000,
      });
    }
  };

  const logMood = async (score: number, label: string) => {
    setSelectedMood(score);
    try {
      await submitMood({
        mood_score: score,
        stress_level: 3,
        comments: `Feeling ${label}`,
      }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Mood Logged',
        detail: `You're feeling ${label.toLowerCase()} today. Thanks for sharing!`,
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Mood submission failed:', err);
      showToast({
        severity: 'error',
        summary: 'Mood Logging Error',
        detail: apiError.data?.message || 'Failed to log mood',
        life: 3000,
      });
    }
  };

  return {
    time,
    status,
    selectedMood,
    isLoading: isFetching || isCheckingIn || isCheckingOut,
    isBreakLoading: isStartingBreak || isEndingBreak,
    isSubmittingMood,
    handleAttendance,
    handleBreak,
    logMood,
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    monthRecords,
    monthSummary,
    selectedDayRecord,
    breakRemark,
    setBreakRemark,
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
  };
};
