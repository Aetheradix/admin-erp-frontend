import { useCallback } from 'react';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync, type SyncEventType } from '@/services/syncService';

export interface AttendanceToggleOptions {
  workMode?: 'office' | 'wfh' | 'field';
  checkedInMessage?: string;
  checkedOutMessage?: string;
  errorMessage?: string;
  syncChannel?: SyncEventType;
}

/** Try to get the browser's current position with a short timeout. Resolves to null on failure. */
function tryGetPosition(timeoutMs = 5000): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve(pos.coords);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}

/**
 * Accuracy threshold for the quick-toggle check-in.
 * If the browser reports accuracy worse than this (e.g. IP-based ±50 000m),
 * we silently switch to WFH/remote mode so the user is never blocked by the
 * geofence. The dedicated /checkin page has its own strict GPS flow.
 */
const QUICK_OFFICE_ACCURACY_LIMIT = 2000; // meters

export function useAttendanceToggle(isCheckedIn: boolean, options: AttendanceToggleOptions = {}) {
  const {
    workMode = 'office',
    checkedInMessage = 'Checked in successfully!',
    checkedOutMessage = 'Checked out successfully!',
    errorMessage = 'Attendance action failed',
    syncChannel = 'attendance',
  } = options;

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const toggle = useCallback(async () => {
    try {
      if (isCheckedIn) {
        // Check-out: attempt GPS but never block if unavailable
        const coords = await tryGetPosition(4000);
        await checkOut(
          coords
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                check_out_latitude: coords.latitude,
                check_out_longitude: coords.longitude,
                location_accuracy: coords.accuracy,
              }
            : {}
        ).unwrap();
        showToast.success(checkedOutMessage);
      } else {
        // Check-in: attempt GPS.
        // - GPS unavailable → WFH/remote (no coords needed).
        // - GPS available but accuracy > 2000m (WiFi/IP based) → WFH/remote so geofence isn't triggered.
        // - GPS available with good accuracy → use the requested workMode (office/wfh/field).
        const coords = await tryGetPosition(5000);

        const hasGoodAccuracy =
          coords !== null &&
          (coords.accuracy === null || coords.accuracy <= QUICK_OFFICE_ACCURACY_LIMIT);

        const effectiveMode = hasGoodAccuracy ? workMode : 'wfh';
        const isRemote = effectiveMode !== 'office';

        await checkIn({
          work_mode: effectiveMode,
          is_wfh: isRemote,
          remark: hasGoodAccuracy ? 'Office Check-in' : 'Quick Check-in (Remote)',
          ...(coords
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                check_in_latitude: coords.latitude,
                check_in_longitude: coords.longitude,
                location_accuracy: coords.accuracy,
              }
            : {}),
        }).unwrap();
        showToast.success(checkedInMessage);
      }
      broadcastSync(syncChannel);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      showToast.error(message || errorMessage);
    }
  }, [
    isCheckedIn,
    checkIn,
    checkOut,
    workMode,
    checkedInMessage,
    checkedOutMessage,
    errorMessage,
    syncChannel,
  ]);

  return { toggle, isCheckingIn, isCheckingOut, isSubmitting: isCheckingIn || isCheckingOut };
}
