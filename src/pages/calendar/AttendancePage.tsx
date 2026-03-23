import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { AttendanceStats } from './components/AttendanceStats';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendancePlanner } from './components/AttendancePlanner';
import { AttendanceRequestForm } from './components/AttendanceRequestForm';
import { useGetAttendanceHistoryQuery } from '@/store/api/attendanceSlice';
import { useGetLeavesQuery, useCreateLeaveRequestMutation } from '@/store/api/leaveSlice';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { ProgressSpinner } from 'primereact/progressspinner';

export function AttendancePage() {
  const { data: records = [], isLoading: recordsLoading } = useGetAttendanceHistoryQuery();
  const { data: requests = [], isLoading: requestsLoading } = useGetLeavesQuery();
  const [createLeaveRequest] = useCreateLeaveRequestMutation();
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleRequestSubmit = async (data: any) => {
    try {
      await createLeaveRequest({
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason
      }).unwrap();
      setShowRequestForm(false);
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  if (recordsLoading || requestsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Attendance & Schedule"
        description="Monitor your presence, manage WFH requests, and stay updated with your professional timeline."
        primaryAction={{
          label: 'Request Day Off / WFH',
          onClick: () => setShowRequestForm(true),
          icon: 'pi pi-calendar-plus',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Stats Overview */}
      <AttendanceStats />

      {/* Main Content: Calendar + Planner Sidebar */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Calendar Area */}
        <div className="flex-1">
          <AttendanceCalendar 
            records={records} 
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Planner Sidebar */}
        <div className="w-full xl:w-96">
          <AttendancePlanner selectedDate={selectedDate} />
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-[40px] p-8 border border-border-subtle shadow-soft transition-all duration-500 hover:shadow-lg overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle/50">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Recent Requests</h3>
            <span className="text-xs font-bold text-muted italic">Track the status of your WFH and Leave applications</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase cursor-pointer hover:underline">
            View History
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="group relative bg-surface-subtle/50 rounded-3xl p-6 border border-border-subtle hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  request.status === 'Approved' ? 'bg-success/10 text-success' : 
                  request.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                }`}>
                  {request.status}
                </span>
                <span className="text-[10px] font-black text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-xl">{request.type}</span>
              </div>
              <h4 className="text-sm font-black text-foreground mb-2 group-hover:text-primary transition-colors">{request.reason}</h4>
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/30">
                <div className="flex items-center gap-2 text-[10px] text-muted font-bold">
                  <CalendarIcon size={12} className="text-primary/70" />
                  <span>{request.startDate} {request.endDate !== request.startDate ? `- ${request.endDate}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted font-bold">
                  <Clock size={12} className="text-primary/70" />
                  <span>Applied on {request.appliedDate}</span>
                </div>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
              <CalendarIcon size={48} />
              <p className="text-sm font-black">No active requests found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
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
          mask: { className: 'backdrop-blur-md bg-black/40' }
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
