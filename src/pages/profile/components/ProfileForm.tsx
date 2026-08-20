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
  workLocation?: string;
  company?: string;
  country?: string;
  employeeType?: string;
  subOrganization?: string;
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ initialData, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map(
    ({ department_name }: { id: string; department_name: string }) => ({
      label: department_name,
      value: department_name,
    })
  );

  return (
    <div className="flex flex-col gap-8 bg-surface-subtle/50 p-8 rounded-3xl border border-border-subtle">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <h4 className="text-base font-black uppercase tracking-wider text-foreground">
          Edit Profile Information
        </h4>
        <span className="text-xs text-muted font-semibold">
          Changes will update your system record
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormField label="Contact / Mobile" required id="profile-phone">
          <Input
            id="profile-phone"
            value={formData.contactNo}
            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
            placeholder="+91 0000000000"
          />
        </FormField>

        <FormField label="Designation / Role" required id="profile-role">
          <Input
            id="profile-role"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Lead Engineer"
          />
        </FormField>

        <FormField label="Department" required id="profile-dept">
          {departmentOptions.length > 0 ? (
            <Select
              id="profile-dept"
              options={departmentOptions}
              value={formData.department}
              onChange={(e: { value: string }) => setFormData({ ...formData, department: e.value })}
              placeholder="Select department"
            />
          ) : (
            <Input
              id="profile-dept"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Department name"
            />
          )}
        </FormField>

        <FormField label="Work Location" id="profile-location">
          <Input
            id="profile-location"
            value={formData.workLocation || ''}
            onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
            placeholder="e.g. KATHA BADDI PLANT"
          />
        </FormField>

        <FormField label="Company" id="profile-company">
          <Input
            id="profile-company"
            value={formData.company || ''}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. SFA TECHNOLOGIES"
          />
        </FormField>

        <FormField label="Country" id="profile-country">
          <Input
            id="profile-country"
            value={formData.country || ''}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="Country"
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-6 rounded-2xl font-bold text-muted"
          aria-label="Cancel profile edits"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onSave(formData)}
          className="px-8 h-11 rounded-2xl font-black tracking-wide shadow-md shadow-primary/20"
          aria-label="Save profile changes"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
