import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useEffect, useState } from 'react';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import type { StaffMember } from '@/types/models';

interface StaffFormProps {
  initialData?: StaffMember | null;
  onSubmit: (data: Partial<StaffMember>) => void;
  onCancel: () => void;
}



const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'On Leave', value: 'On Leave' },
  { label: 'Inactive', value: 'Inactive' },
];

export const StaffForm = ({ initialData, onSubmit, onCancel }: StaffFormProps) => {
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map((d: { department_name: string }) => ({
    label: d.department_name,
    value: d.department_name
  }));

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: '',
    department: '',
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
      queueMicrotask(() => {
        setFormData(initialData);
        setSkillsString(initialData.skills.join(', '));
      });
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
          <FormField label="Full Name" required id="staff-name">
            <Input
              id="staff-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarah Chen"
            />
          </FormField>

          <FormField label="Job Role" required id="staff-role">
            <Input
              id="staff-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" id="staff-dept">
              <Select
                id="staff-dept"
                options={departmentOptions}
                value={formData.department}
                onChange={(e: { value: string }) => setFormData({ ...formData, department: e.value })}
                placeholder="Select department"
              />
            </FormField>
            <FormField label="Status" id="staff-status">
              <Select
                id="staff-status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e: { value: string }) => setFormData({ ...formData, status: e.value as StaffMember['status'] })}
                placeholder="Select status"
              />
            </FormField>
          </div>

          <FormField label="Skills (Comma-separated)" id="staff-skills">
            <Textarea
              id="staff-skills"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="React, TypeScript, Node.js..."
              rows={3}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Email Address" required id="staff-email">
            <Input
              id="staff-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah.c@company.com"
            />
          </FormField>

          <FormField label="Phone Number" id="staff-phone">
            <Input
              id="staff-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </FormField>

          <FormField label="Join Date" required id="staff-join-date">
            <Calendar
              id="staff-join-date"
              value={formData.joinDate ? new Date(formData.joinDate) : null}
              onChange={(e) => setFormData({ ...formData, joinDate: e.value?.toISOString().split('T')[0] || '' })}
              placeholder="Select join date"
              dateFormat="yy-mm-dd"
            />
          </FormField>

          {!initialData && (
            <FormField label="Assign Password" required id="staff-password">
              <Input
                id="staff-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set initial password"
              />
            </FormField>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Discard changes"
        >
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label={initialData ? 'Update staff member profile' : 'Add new staff member to team'}
        >
          {initialData ? 'Update Member' : 'Add to Team'}
        </Button>
      </div>
    </div>
  );
};
