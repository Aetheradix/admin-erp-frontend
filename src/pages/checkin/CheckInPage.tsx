import { useAttendance } from './hooks/useAttendance';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { AttendanceClockCard } from './components/AttendanceClockCard';

export function CheckInPage() {
  const {
    time,
    status,
    selectedMood,
    isLoading,
    isSubmittingMood,
    handleBreak,
    handleAttendance,
    logMood,
    isBreakLoading,
  } = useAttendance();

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[85vh]">
      <PageHeader
        title="Check-In Center"
        description="Log your daily attendance and share how you're feeling today."
      />

      <div className="flex-1 flex items-center justify-center">
        <AttendanceClockCard
          time={time}
          status={status}
          selectedMood={selectedMood}
          isLoading={isLoading}
          isSubmittingMood={isSubmittingMood}
          isBreakLoading={isBreakLoading}
          handleAttendance={handleAttendance}
          handleBreak={handleBreak}
          logMood={logMood}
        />
      </div>
    </div>
  );
}
