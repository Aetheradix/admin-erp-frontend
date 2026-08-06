import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import { useState } from 'react';

interface ProfileFormData {
  name: string;
  email: string;
  contactNo: string;
  department: string;
  designation: string;
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ initialData, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map(
    ({ department_name }: { id: string; department_name: string }) => ({
      label: department_name,
      value: department_name,
    })
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Full Name" required id="profile-name">
          <Input
            id="profile-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Work Email Address" required id="profile-email">
          <Input
            id="profile-email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </FormField>

        <FormField label="Contact Number" required id="profile-phone">
          <Input
            id="profile-phone"
            value={formData.contactNo}
            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </FormField>

        <FormField label="Department" required id="profile-dept">
          <Select
            id="profile-dept"
            options={departmentOptions}
            value={formData.department}
            onChange={(e: { value: string }) => setFormData({ ...formData, department: e.value })}
            placeholder="Select department"
          />
        </FormField>

        <FormField label="Designation / Role" required id="profile-role">
          <Input
            id="profile-role"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Lead Designer"
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Cancel profile edits"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onSave(formData)}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label="Save profile changes"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
