import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useState } from 'react';
import { Key } from 'lucide-react';
import type { GuestPass } from '../hooks/mockGuestPass';

interface GuestPassFormProps {
  onSubmit: (data: Partial<GuestPass>) => void;
  onCancel: () => void;
}

const PURPOSES = [
  { label: 'Technical Interview', value: 'Technical Interview' },
  { label: 'Vendor Consultation', value: 'Vendor Consultation' },
  { label: 'Client Meeting', value: 'Client Meeting' },
  { label: 'Personal Visit', value: 'Personal Visit' },
  { label: 'Maintenance / Support', value: 'Maintenance / Support' },
];

export const GuestPassForm = ({ onSubmit, onCancel }: GuestPassFormProps) => {
  const [formData, setFormData] = useState<Partial<GuestPass>>({
    guestName: '',
    hostName: '',
    purpose: 'Technical Interview',
    visitDate: new Date().toISOString().split('T')[0],
  });

  const handleApply = () => {
    if (!formData.guestName || !formData.hostName) return;
    onSubmit({
      ...formData,
      status: 'Pending',
      accessCode: `AX-${Math.floor(1000 + Math.random() * 9000)}-${formData.guestName.charAt(0).toUpperCase()}`
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Guest Full Name" required>
            <Input 
              value={formData.guestName} 
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              placeholder="e.g. Robert Vance" 
            />
          </FormField>

          <FormField label="Host Name (Employee)" required>
            <Input 
              value={formData.hostName} 
              onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
              placeholder="e.g. Sarah Chen" 
            />
          </FormField>

          <FormField label="Purpose of Visit" required>
            <Select 
              options={PURPOSES}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.value })}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Visit Date" required>
            <Calendar 
              value={formData.visitDate ? new Date(formData.visitDate) : null}
              onChange={(e) => setFormData({ ...formData, visitDate: e.value?.toISOString().split('T')[0] || '' })}
              placeholder="Select date" 
              dateFormat="yy-mm-dd"
              minDate={new Date()}
            />
          </FormField>

          <FormField label="Additional Notes">
            <Textarea 
              placeholder="Any specific access requirements or instructions for the visitor..." 
              rows={5}
            />
          </FormField>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-primary/5 border border-dashed border-primary/20 flex items-center gap-4">
        <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center text-primary shadow-sm">
          <Key size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-primary uppercase tracking-widest">Entry Authorization</span>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            By issuing this pass, you authorize the guest's entry for the specified duration. 
            An access code will be generated upon approval.
          </p>
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
          Issue Guest Pass
        </Button>
      </div>
    </div>
  );
};
