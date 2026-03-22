import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useState } from 'react';

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    contactNo: string;
    department: string;
    designation: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  { label: 'Executive', value: 'Executive' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Human Resources', value: 'Human Resources' },
];

export const ProfileForm = ({ initialData, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState(initialData);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Full Name" required>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name" 
          />
        </FormField>

        <FormField label="Work Email Address" required>
          <Input 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com" 
          />
        </FormField>

        <FormField label="Contact Number" required>
          <Input 
            value={formData.contactNo} 
            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
            placeholder="+1 (555) 000-0000" 
          />
        </FormField>

        <FormField label="Department" required>
          <Select 
            options={DEPARTMENTS}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.value })}
          />
        </FormField>

        <FormField label="Designation / Role" required>
          <Input 
            value={formData.designation} 
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Lead Designer" 
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button variant="ghost" onClick={onCancel} className="px-8! rounded-2xl! font-bold text-muted!">
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => onSave(formData)}
          className="px-10! h-12 rounded-2xl! font-black tracking-wide shadow-lg shadow-primary/20"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
