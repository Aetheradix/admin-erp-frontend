import { useState } from 'react';
import { useRequestAdminElevationMutation } from '@/store/api/authApiSlice';
import { Shield, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { InputTextarea } from '@/components/ui/primitives/Textarea';
import { Message } from '@/components/ui/composed/Message';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface AdminElevationRequestProps {
  onSuccess?: () => void;
}

export function AdminElevationRequest({ onSuccess }: AdminElevationRequestProps) {
  const [reason, setReason] = useState('');
  const [requestElevation, { isLoading, isSuccess, isError, error }] =
    useRequestAdminElevationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      await requestElevation({ reason }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Elevation request submitted.',
        life: 3000,
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Elevation request failed:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.data?.message || 'Failed to submit request.',
        life: 3000,
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="p-10 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success">
          <Shield size={40} />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
            Request Submitted
          </h3>
          <p className="text-sm font-bold text-muted max-w-xs italic">
            Your application for administrative access is now under review. You will be notified
            once a decision is made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-10 animate-in fade-in duration-700"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2 text-primary">
          <Shield size={24} />
          <h2 className="text-2xl font-black uppercase tracking-tight">Administrative Access</h2>
        </div>
        <p className="text-xs font-bold text-muted leading-relaxed">
          Please provide a clear justification for why you require administrative privileges. This
          request will be reviewed by the current admin team.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
          <AlertCircle size={10} /> Justification / Reason
        </label>
        <InputTextarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="e.g., I need access to manage payroll and employee records for the HR department..."
          className="w-full p-6 p-textarea-premium rounded-3xl border border-border-subtle focus:border-primary transition-all text-sm font-medium italic"
          required
        />
      </div>

      {isError && (
        <div className="animate-in slide-in-from-top-2">
          <Message
            severity="error"
            text={
              (error as any)?.data?.message || 'Failed to submit request. Please try again later.'
            }
            className="w-full rounded-2xl p-4 border border-error/10 font-bold"
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!reason.trim()}
          className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Send size={16} /> Submit Elevation Request
        </Button>
        <span className="text-[10px] text-center font-bold text-muted/60 uppercase tracking-widest italic flex items-center justify-center gap-2">
          <ClockIcon size={10} /> Standard review time: 24-48 hours
        </span>
      </div>
    </form>
  );
}

const ClockIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
