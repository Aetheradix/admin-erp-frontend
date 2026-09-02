import React, { useState } from 'react';
import { useAttendance } from './hooks/useAttendance';
import { TodayAttendanceSummary } from './components/TodayAttendanceSummary';
import { AttendanceInsights } from './components/AttendanceInsights';
import { AttendanceCalendarGrid } from './components/AttendanceCalendarGrid';
import { DailyTimelineCard } from './components/DailyTimelineCard';
import { AttendanceHistoryTable } from './components/AttendanceHistoryTable';
import { Clock, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const CheckInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'history'>('today');

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
    <div className="w-full  mx-auto space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Attendance Hub</h1>
          <p className="text-xs font-bold text-muted mt-0.5">Track your daily punches, breaks, and monthly attendance records</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-surface-elevated rounded-2xl border border-border-subtle shadow-sm">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'today'
              ? 'bg-primary text-white shadow-md'
              : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}
          >
            <Clock size={15} />
            <span>Today's Punch</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'calendar'
              ? 'bg-primary text-white shadow-md'
              : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}
          >
            <CalendarIcon size={15} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'history'
              ? 'bg-primary text-white shadow-md'
              : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}
          >
            <BarChart3 size={15} />
            <span>History & Stats</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Today's Punch & Timeline */}
      {activeTab === 'today' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <DailyTimelineCard
                selectedDate={new Date()}
                record={monthRecords.find((r) => r.date === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)}
              />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <AttendanceInsights
                summary={monthSummary}
                selectedMonthName={selectedMonthName}
                variant="sidebar"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Monthly Calendar & Day Details */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          <div className="lg:col-span-7 xl:col-span-8">
            <AttendanceCalendarGrid
              currentMonth={currentMonth}
              onChangeMonth={setCurrentMonth}
              records={monthRecords}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <DailyTimelineCard
              selectedDate={selectedDate}
              record={selectedDayRecord}
            />
          </div>
        </div>
      )}

      {/* Tab 3: History Log & Full Monthly Analytics */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <AttendanceInsights
            summary={monthSummary}
            selectedMonthName={selectedMonthName}
            variant="full"
          />
          <AttendanceHistoryTable
            records={monthRecords}
            onSelectRecord={(record) => {
              setSelectedDate(new Date(record.date));
              setActiveTab('calendar');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
