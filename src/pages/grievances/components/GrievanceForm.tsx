import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import type { Grievance } from '../hooks/mockGrievances';

interface GrievanceFormProps {
  onSubmit: (data: Partial<Grievance>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { label: 'Work Environment', value: 'Work Environment' },
  { label: 'Management', value: 'Management' },
  { label: 'Harassment', value: 'Harassment' },
  { label: 'Software/Tools', value: 'Software/Tools' },
  { label: 'Other', value: 'Other' },
];

export const GrievanceForm = ({ onSubmit, onCancel }: GrievanceFormProps) => {
  const [formData, setFormData] = useState<Partial<Grievance>>({
    title: '',
    category: 'Work Environment',
    description: '',
    isAnonymous: true,
  });

  const handleApply = () => {
    if (!formData.title || !formData.description) return;
    onSubmit({
      ...formData,
      status: 'Received',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <FormField label="Grievance Title" required id="grievance-title">
          <Input 
            id="grievance-title"
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="A brief summary of your concern..." 
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Category" required id="grievance-category">
            <Select 
              id="grievance-category"
              options={CATEGORIES}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.value })}
              placeholder="Select category"
            />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Anonymity Toggle</span>
            <button 
              onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
              className={`flex items-center gap-3 h-14 px-6 rounded-3xl border transition-all duration-300 ${
                formData.isAnonymous 
                ? 'bg-success/5 border-success/30 text-success' 
                : 'bg-surface-subtle border-border-subtle text-muted'
              }`}
              aria-label={formData.isAnonymous ? "Submission is currently anonymous. Click to share identity." : "Identity will be shared. Click to submit anonymously."}
            >
              {formData.isAnonymous ? <Shield size={18} /> : <ShieldOff size={18} />}
              <span className="font-bold text-sm">{formData.isAnonymous ? 'Submission is Anonymous' : 'Identity will be Shared'}</span>
            </button>
          </div>
        </div>

        <FormField label="Detailed Description" required id="grievance-description">
          <Textarea 
            id="grievance-description"
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide as much detail as possible to help us address the issue..." 
            rows={6}
          />
        </FormField>
      </div>

      <div className="p-6 rounded-3xl bg-error/5 border border-error/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error flex-shrink-0">
          <Shield size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-error uppercase tracking-widest">Safety Assurance</span>
          <p className="text-[11px] font-medium text-error/80 leading-relaxed">
            All grievances are handled with extreme confidentiality and strictly follow our non-retaliation policy. 
            Your well-being and psychological safety are our top priorities.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Discard grievance"
        >
          Discard
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApply}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label="Submit grievance report"
        >
          Submit Grievance
        </Button>
      </div>
    </div>
  );
};
