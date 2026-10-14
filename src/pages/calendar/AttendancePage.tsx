import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from '@/components/ui/composed/Dialog';
import { AttendanceStats } from './components/AttendanceStats';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { AttendancePlanner } from './components/AttendancePlanner';
import { AttendanceRequestForm } from './components/AttendanceRequestForm';
import { RecentRequests } from './components/RecentRequests';
import { useAttendancePage } from './hooks/useAttendancePage';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Globe, Lock, Check, Share2, ArrowLeft } from 'lucide-react';

export function AttendancePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUser = searchParams.get('user');

  const [isPublic, setIsPublic] = useState(() => {
    return localStorage.getItem('user_calendar_is_public') === 'true';
  });
  const [copied, setCopied] = useState(false);

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

  const handleTogglePublic = () => {
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    localStorage.setItem('user_calendar_is_public', String(nextVal));
    showToast({
      severity: nextVal ? 'success' : 'info',
      summary: 'Calendar Visibility',
      detail: nextVal
        ? 'Your schedule is now public to teammates.'
        : 'Your schedule is now private.',
    });
  };

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/calendar?user=${encodeURIComponent(user?.username || 'me')}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast({
        severity: 'success',
        summary: 'Link Copied',
        detail: 'Shareable schedule link copied to clipboard!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        severity: 'warn',
        summary: 'Copy Failed',
        detail: shareUrl,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {targetUser && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <Globe className="text-primary" size={20} />
            <div>
              <p className="text-sm font-black text-foreground">
                Viewing Public Schedule for @{targetUser}
              </p>
              <p className="text-xs text-muted">
                Displaying shared calendar availability and work status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-xs font-black text-primary border border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
            <ArrowLeft size={14} /> Back to My Schedule
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title={targetUser ? `${targetUser}'s Schedule` : 'Attendance & Schedule'}
          description={
            targetUser
              ? `Public work presence and availability timeline for @${targetUser}.`
              : 'Monitor your presence, manage WFH requests, and stay updated with your professional timeline.'
          }
          primaryAction={
            !targetUser
              ? {
                  label: 'Request Day Off / WFH',
                  onClick: () => setShowRequestForm(true),
                  icon: 'pi pi-calendar-plus',
                  className:
                    'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
                }
              : undefined
          }
        />

        {!targetUser && (
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-surface-subtle border border-border-subtle shrink-0">
            <button
              type="button"
              id="calendar-public-toggle"
              onClick={handleTogglePublic}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isPublic
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white text-muted hover:text-foreground border border-border-subtle'
              }`}>
              {isPublic ? <Globe size={14} /> : <Lock size={14} />}
              <span>{isPublic ? 'Public to Team' : 'Private'}</span>
            </button>

            {isPublic && (
              <button
                type="button"
                id="calendar-share-btn"
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-bold text-foreground border border-border-subtle hover:bg-surface-elevated transition-all cursor-pointer"
                title="Copy shareable link">
                {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!targetUser && <AttendanceStats />}

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
        }}>
        <AttendanceRequestForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
        />
      </Dialog>
    </div>
  );
}
