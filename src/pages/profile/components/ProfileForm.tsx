import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import { AlertCircle, Briefcase, Mail, MapPin, Save, User, X } from 'lucide-react';
import { useState } from 'react';

export interface ProfileFormData {
  name: string;
  email: string;
  contactNo: string;
  department: string;
  designation: string;
  employeeCode?: string;
  employeeId?: string;
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Edit Profile Information
            </h3>
            <p className="text-xs text-muted font-medium mt-0.5">
              Update your personal credentials, contact matrix, and organizational details
            </p>
          </div>
        </div>
        <span className="text-xs text-muted font-bold hidden sm:inline px-3 py-1 rounded-xl bg-surface-subtle border border-border-subtle">
          * Required fields
        </span>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-xs text-error font-bold animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0" />
          <span>Please correct the highlighted fields before saving your profile.</span>
        </div>
      )}

      {/* Section 1: Contact & Personal Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
          <Mail size={14} className="text-primary" />
          <span>Contact & Identity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormField label="Employee Code" id="profile-code" className="mb-0">
            <Input
              id="profile-code"
              value={formData.employeeCode || formData.employeeId || 'N/A'}
              disabled
              title="Employee Code is managed by system administrators"
              className="h-11 rounded-xl font-mono bg-surface-subtle opacity-75 cursor-not-allowed"
            />
          </FormField>

          <FormField
            label="Full Name"
            required
            id="profile-name"
            error={errors.name}
            className="mb-0">
            <Input
              id="profile-name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Your full name"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField
            label="Work Email Address"
            required
            id="profile-email"
            error={errors.email}
            className="mb-0">
            <Input
              id="profile-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="name@company.com"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField
            label="Contact / Mobile"
            required
            id="profile-phone"
            error={errors.contactNo}
            className="mb-0">
            <Input
              id="profile-phone"
              value={formData.contactNo}
              onChange={(e) => {
                setFormData({ ...formData, contactNo: e.target.value });
                if (errors.contactNo) setErrors({ ...errors, contactNo: '' });
              }}
              placeholder="+1 (555) 000-0000"
              className="h-11 rounded-xl font-mono"
            />
          </FormField>
        </div>
      </div>

      {/* Section 2: Role & Department */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
          <Briefcase size={14} className="text-primary" />
          <span>Role & Organizational Placement</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Designation / Role"
            required
            id="profile-role"
            error={errors.designation}
            className="mb-0">
            <Input
              id="profile-role"
              value={formData.designation}
              onChange={(e) => {
                setFormData({ ...formData, designation: e.target.value });
                if (errors.designation) setErrors({ ...errors, designation: '' });
              }}
              placeholder="e.g. SuperAdmin / Lead Architect"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField
            label="Department"
            required
            id="profile-dept"
            error={errors.department}
            className="mb-0">
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
                className="h-11 rounded-xl"
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
                className="h-11 rounded-xl"
              />
            )}
          </FormField>
        </div>
      </div>

      {/* Section 3: Workplace & Location */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
          <MapPin size={14} className="text-primary" />
          <span>Workplace & Location</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            label="Residential / Postal Address"
            id="profile-address"
            className="mb-0 md:col-span-2">
            <Input
              id="profile-address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 100 Innovation Way, Suite 400"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField label="Work Location / Office" id="profile-location" className="mb-0">
            <Input
              id="profile-location"
              value={formData.workLocation || ''}
              onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
              placeholder="e.g. HQ - Executive Wing"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField label="Company Entity" id="profile-company" className="mb-0">
            <Input
              id="profile-company"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Aetheradix Technologies"
              className="h-11 rounded-xl"
            />
          </FormField>

          <FormField label="Country" id="profile-country" className="mb-0">
            <Input
              id="profile-country"
              value={formData.country || ''}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. India / United States"
              className="h-11 rounded-xl"
            />
          </FormField>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle mt-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-6 h-11 rounded-xl font-bold text-muted hover:text-foreground">
          <X size={15} className="mr-1" /> Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          className="px-8 h-11 rounded-xl font-black tracking-wide shadow-md shadow-primary/20 flex items-center gap-2">
          <Save size={15} /> Save Changes
        </Button>
      </div>
    </div>
  );
};
