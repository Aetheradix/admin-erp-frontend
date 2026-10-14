import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export interface ProfileFormData {
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
  address?: string;
}

interface ProfileFormProps {
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
}

export const ProfileForm = ({ initialData, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map(
    ({ department_name }: { id: string; department_name: string }) => ({
      label: department_name,
      value: department_name,
    })
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // Contact number validation
    const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
    if (!formData.contactNo || !phoneRegex.test(formData.contactNo.trim())) {
      newErrors.contactNo = 'Please enter a valid phone number (at least 7 digits).';
    }

    // Designation validation
    if (!formData.designation || formData.designation.trim().length < 2) {
      newErrors.designation = 'Designation/role is required.';
    }

    // Department validation
    if (!formData.department || formData.department.trim().length < 2) {
      newErrors.department = 'Department is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-surface-subtle/50 p-8 rounded-3xl border border-border-subtle">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h4 className="text-base font-black uppercase tracking-wider text-foreground">
            Edit Profile Information
          </h4>
          <p className="text-xs text-muted font-medium mt-0.5">
            Updated details are validated and recorded into the security audit history.
          </p>
        </div>
        <span className="text-xs text-muted font-semibold hidden sm:inline">
          Required fields marked with *
        </span>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-xs text-error font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>Please correct the highlighted errors before saving changes.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <FormField label="Full Name" required id="profile-name">
            <Input
              id="profile-name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Your full name"
              className={errors.name ? 'border-error ring-1 ring-error/30' : ''}
            />
          </FormField>
          {errors.name && <span className="text-[11px] text-error font-medium">{errors.name}</span>}
        </div>

        {/* Work Email Address */}
        <div className="flex flex-col gap-1">
          <FormField label="Work Email Address" required id="profile-email">
            <Input
              id="profile-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="email@example.com"
              className={errors.email ? 'border-error ring-1 ring-error/30' : ''}
            />
          </FormField>
          {errors.email && (
            <span className="text-[11px] text-error font-medium">{errors.email}</span>
          )}
        </div>

        {/* Contact No */}
        <div className="flex flex-col gap-1">
          <FormField label="Contact / Mobile" required id="profile-phone">
            <Input
              id="profile-phone"
              value={formData.contactNo}
              onChange={(e) => {
                setFormData({ ...formData, contactNo: e.target.value });
                if (errors.contactNo) setErrors({ ...errors, contactNo: '' });
              }}
              placeholder="+1 (555) 000-0000"
              className={errors.contactNo ? 'border-error ring-1 ring-error/30' : ''}
            />
          </FormField>
          {errors.contactNo && (
            <span className="text-[11px] text-error font-medium">{errors.contactNo}</span>
          )}
        </div>

        {/* Designation / Role */}
        <div className="flex flex-col gap-1">
          <FormField label="Designation / Role" required id="profile-role">
            <Input
              id="profile-role"
              value={formData.designation}
              onChange={(e) => {
                setFormData({ ...formData, designation: e.target.value });
                if (errors.designation) setErrors({ ...errors, designation: '' });
              }}
              placeholder="e.g. Lead Engineer"
              className={errors.designation ? 'border-error ring-1 ring-error/30' : ''}
            />
          </FormField>
          {errors.designation && (
            <span className="text-[11px] text-error font-medium">{errors.designation}</span>
          )}
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1">
          <FormField label="Department" required id="profile-dept">
            {departmentOptions.length > 0 ? (
              <Select
                id="profile-dept"
                options={departmentOptions}
                value={formData.department}
                onChange={(e: { value: string }) => {
                  setFormData({ ...formData, department: e.value });
                  if (errors.department) setErrors({ ...errors, department: '' });
                }}
                placeholder="Select department"
              />
            ) : (
              <Input
                id="profile-dept"
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value });
                  if (errors.department) setErrors({ ...errors, department: '' });
                }}
                placeholder="Department name"
                className={errors.department ? 'border-error ring-1 ring-error/30' : ''}
              />
            )}
          </FormField>
          {errors.department && (
            <span className="text-[11px] text-error font-medium">{errors.department}</span>
          )}
        </div>

        {/* Address Field */}
        <FormField label="Residential / Postal Address" id="profile-address">
          <Input
            id="profile-address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 100 Innovation Way, Suite 400"
          />
        </FormField>

        {/* Work Location */}
        <FormField label="Work Location / Office" id="profile-location">
          <Input
            id="profile-location"
            value={formData.workLocation || ''}
            onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
            placeholder="e.g. Headquarters / Plant"
          />
        </FormField>

        {/* Company */}
        <FormField label="Company Entity" id="profile-company">
          <Input
            id="profile-company"
            value={formData.company || ''}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. AetherAdix Technologies"
          />
        </FormField>

        {/* Country */}
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
          aria-label="Cancel profile edits">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          className="px-8 h-11 rounded-2xl font-black tracking-wide shadow-md shadow-primary/20"
          aria-label="Save profile changes">
          Save Changes
        </Button>
      </div>
    </div>
  );
};
