import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from '@/components/ui/composed/Dialog';
import { AttendanceStats } from './components/AttendanceStats';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendancePlanner } from './components/AttendancePlanner';
import { AttendanceRequestForm } from './components/AttendanceRequestForm';
import { RecentRequests } from './components/RecentRequests';
import { useAttendancePage } from './hooks/useAttendancePage';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

export function AttendancePage() {
  const {
    isAdmin,
    records,
    requests,
    calendarRequests,
    isLoading,
    showRequestForm,
    setShowRequestForm,
    selectedDate,
    setSelectedDate,
    handleRequestSubmit,
  } = useAttendancePage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Attendance & Schedule"
        description="Monitor your presence, manage WFH requests, and stay updated with your professional timeline."
        primaryAction={{
          label: 'Request Day Off / WFH',
          onClick: () => setShowRequestForm(true),
          icon: 'pi pi-calendar-plus',
          className:
            'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      <AttendanceStats />

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1">
          <AttendanceCalendar
            records={records}
            requests={calendarRequests}
            onDateSelect={setSelectedDate}
          />
        </div>
        <div className="w-full xl:w-96">
          <AttendancePlanner selectedDate={selectedDate} />
        </div>
      </div>

      {!isAdmin && <RecentRequests requests={requests} />}

      <Dialog
        visible={showRequestForm}
        onHide={() => setShowRequestForm(false)}
        header="Apply for WFH / Leave"
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <AttendanceRequestForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
        />
      </Dialog>
    </div>
  );
}
