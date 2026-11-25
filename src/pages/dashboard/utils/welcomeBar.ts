export function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatWelcomeDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCheckInTime(checkInTime: string | null | undefined): string | null {
  if (!checkInTime) return null;
  return new Date(checkInTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export interface AttendanceChipState {
  className: string;
  dotClassName: string;
  label: string;
}

export function getAttendanceChipState(
  isCheckedIn: boolean,
  isCheckedOut: boolean,
  checkInTime: string | null
): AttendanceChipState {
  if (isCheckedIn) {
    return {
      className: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25',
      dotClassName: 'bg-emerald-500 animate-pulse',
      label: `Working · In at ${checkInTime || 'Morning'}`,
    };
  }
  if (isCheckedOut) {
    return {
      className: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      dotClassName: 'bg-zinc-400',
      label: 'Shift Completed',
    };
  }
  return {
    className: 'bg-amber-500/10 text-amber-800 border-amber-500/25',
    dotClassName: 'bg-amber-500',
    label: 'Not Checked In',
  };
}
