import React from 'react';
import { useAttendance } from './hooks/useAttendance';
import { TodayAttendanceSummary } from './components/TodayAttendanceSummary';
import { AttendanceInsights } from './components/AttendanceInsights';
import { AttendanceCalendarGrid } from './components/AttendanceCalendarGrid';
import { DailyTimelineCard } from './components/DailyTimelineCard';
import { AttendanceHistoryTable } from './components/AttendanceHistoryTable';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CheckInPage: React.FC = () => {
  const {
    time,
    status,
    selectedMood,
    isLoading,
    isBreakLoading,
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
    liveWorkingTime,
    checkInTimeDisplay,
    checkOutTimeDisplay,
    totalBreakDisplay,
    netWorkingDisplay,
    isLate,
    lateDurationDisplay,
    shiftTimingDisplay,
  } = useAttendance();

  const selectedMonthName = MONTH_NAMES[currentMonth.getMonth()];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* 1. Top Section: Today's Summary & Action Hub */}
      <TodayAttendanceSummary
        time={time}
        status={status}
        selectedMood={selectedMood}
        isLoading={isLoading}
        isBreakLoading={isBreakLoading}
        isSubmittingMood={isSubmittingMood}
        handleAttendance={handleAttendance}
        handleBreak={handleBreak}
        logMood={logMood}
        liveWorkingTime={liveWorkingTime}
        checkInTimeDisplay={checkInTimeDisplay}
        checkOutTimeDisplay={checkOutTimeDisplay}
        totalBreakDisplay={totalBreakDisplay}
        netWorkingDisplay={netWorkingDisplay}
        isLate={isLate}
        lateDurationDisplay={lateDurationDisplay}
        shiftTimingDisplay={shiftTimingDisplay}
      />

      {/* 2. Middle Section: Attendance Insights KPIs */}
      <AttendanceInsights
        summary={monthSummary}
        selectedMonthName={selectedMonthName}
      />

      {/* 3. Main Split View: Interactive Calendar (Left) & Selected Day Activity Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Calendar View (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AttendanceCalendarGrid
            currentMonth={currentMonth}
            onChangeMonth={setCurrentMonth}
            records={monthRecords}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Right: Daily Activity Timeline Card (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <DailyTimelineCard
            selectedDate={selectedDate}
            record={selectedDayRecord}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Searchable & Filterable Historical Attendance Table */}
      <AttendanceHistoryTable
        records={monthRecords}
        onSelectRecord={(record) => {
          setSelectedDate(new Date(record.date));
        }}
      />
    </div>
  );
};

export default CheckInPage;
