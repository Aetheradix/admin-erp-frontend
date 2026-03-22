import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useEffect, useState } from 'react';
import type { StaffMember } from '../hooks/mockStaff';

interface StaffFormProps {
  initialData?: StaffMember | null;
  onSubmit: (data: Partial<StaffMember>) => void;
  onCancel: () => void;
}

const DEPARTMENTS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Product', value: 'Product' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Operations', value: 'Operations' },
  { label: 'HR', value: 'HR' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'On Leave', value: 'On Leave' },
  { label: 'Inactive', value: 'Inactive' },
];

export const StaffForm = ({ initialData, onSubmit, onCancel }: StaffFormProps) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: '',
    department: 'Engineering',
    email: '',
    phone: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    skills: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
  });

  const [skillsString, setSkillsString] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSkillsString(initialData.skills.join(', '));
    }
  }, [initialData]);

  const handleApply = () => {
    const dataToSend = {
      ...formData,
      skills: skillsString.split(',').map(s => s.trim()).filter(Boolean),
    };
    onSubmit(dataToSend);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Full Name" required>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarah Chen" 
            />
          </FormField>

          <FormField label="Job Role" required>
            <Input 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer" 
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department">
              <Select 
                options={DEPARTMENTS}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.value })}
              />
            </FormField>
            <FormField label="Status">
              <Select 
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.value })}
              />
            </FormField>
          </div>

          <FormField label="Skills (Comma-separated)">
            <Textarea 
              value={skillsString} 
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="React, TypeScript, Node.js..." 
              rows={3}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Email Address" required>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah.c@company.com" 
            />
          </FormField>

          <FormField label="Phone Number">
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000" 
            />
          </FormField>

          <FormField label="Join Date" required>
            <Calendar 
              value={formData.joinDate ? new Date(formData.joinDate) : null}
              onChange={(e) => setFormData({ ...formData, joinDate: e.value?.toISOString().split('T')[0] || '' })}
              placeholder="Select join date" 
              dateFormat="yy-mm-dd"
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
          {initialData ? 'Update Member' : 'Add to Team'}
        </Button>
      </div>
    </div>
  );
};
