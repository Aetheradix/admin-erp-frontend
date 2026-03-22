import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useState } from 'react';

interface AttendanceRequestFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const REQUEST_TYPES = [
  { label: 'Work from Home', value: 'WFH' },
  { label: 'Day Off / Leave', value: 'Day Off' },
  { label: 'Sick Leave', value: 'Sick Leave' },
];

export const AttendanceRequestForm = ({ onSubmit, onCancel }: AttendanceRequestFormProps) => {
  const [formData, setFormData] = useState({
    type: 'WFH',
    reason: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const handleApply = () => {
    if (!formData.startDate || !formData.reason) return;
    onSubmit({
      ...formData,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : formData.startDate.toISOString().split('T')[0],
      appliedDate: new Date().toISOString().split('T')[0],
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
              onChange={(e) => setFormData({ ...formData, startDate: e.value as Date })}
              placeholder="Select start date" 
              dateFormat="yy-mm-dd"
              minDate={new Date()}
            />
          </FormField>

          <FormField label="End Date (Optional)">
            <Calendar 
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.value as Date })}
              placeholder="Select end date (if multiple days)" 
              dateFormat="yy-mm-dd"
              minDate={formData.startDate || new Date()}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button variant="ghost" onClick={onCancel} className="px-8! rounded-2xl! font-bold text-muted!">
          Discard
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApply}
          className="px-10! h-12 rounded-2xl! font-black tracking-wide shadow-lg shadow-primary/20"
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
};
