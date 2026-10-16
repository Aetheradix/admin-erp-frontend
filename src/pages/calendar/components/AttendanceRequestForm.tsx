import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AttendanceRequestFormProps {
  onSubmit: (data: {
    type: string;
    reason: string;
    startDate: string;
    endDate: string;
    appliedDate: string;
    status: string;
  }) => void;
  onCancel: () => void;
}

const REQUEST_TYPES = [
  { label: 'Work from Home', value: 'Work from home' },
  { label: 'Day Off / Leave', value: 'Day Off/Leave' },
  { label: 'Sick Leave', value: 'Sick Leave' },
  { label: 'Holiday / Special', value: 'Holiday' },
];

const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AttendanceRequestForm = ({ onSubmit, onCancel }: AttendanceRequestFormProps) => {
  const [formData, setFormData] = useState({
    type: 'Work from home',
    reason: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApply = () => {
    setErrorMsg(null);
    if (!formData.startDate) {
      setErrorMsg('Please select a start date.');
      return;
    }
    if (!formData.reason.trim()) {
      setErrorMsg('Please provide a reason for your request.');
      return;
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      setErrorMsg('End date cannot be earlier than start date.');
      return;
    }

    const startStr = formatLocalDate(formData.startDate);
    const endStr = formData.endDate ? formatLocalDate(formData.endDate) : startStr;
    const todayStr = formatLocalDate(new Date());

    onSubmit({
      ...formData,
      reason: formData.reason.trim(),
      startDate: startStr,
      endDate: endStr,
      appliedDate: todayStr,
      status: 'Pending',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Request Type" required>
            <Select
              options={REQUEST_TYPES}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
            />
          </FormField>

          <FormField label="Reason for Request" required>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Briefly explain the reason for this request..."
              rows={4}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Start Date" required>
            <Calendar
              value={formData.startDate}
              onChange={(e) => {
                const newStart = e.value as Date;
                setFormData((prev) => ({
                  ...prev,
                  startDate: newStart,
                  endDate: prev.endDate && newStart && prev.endDate < newStart ? null : prev.endDate,
                }));
                setErrorMsg(null);
              }}
              placeholder="Select start date"
              dateFormat="yy-mm-dd"
              minDate={new Date()}
            />
          </FormField>

          <FormField label="End Date (Optional)">
            <Calendar
              value={formData.endDate}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.value as Date });
                setErrorMsg(null);
              }}
              placeholder="Select end date (if multiple days)"
              dateFormat="yy-mm-dd"
              minDate={formData.startDate || new Date()}
            />
          </FormField>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-2xl! font-bold text-muted!">
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          className="px-10! h-12 rounded-2xl! font-black tracking-wide shadow-lg shadow-primary/20">
          Submit Request
        </Button>
      </div>
    </div>
  );
};
