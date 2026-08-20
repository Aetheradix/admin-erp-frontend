import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useEffect, useState } from 'react';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import type { Career } from '@/types/models';

interface CareerFormProps {
  initialData?: Career | null;
  onSubmit: (data: Partial<Career>) => void;
  onCancel: () => void;
}

const JOB_TYPES = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Internship', value: 'Internship' },
];

export const CareerForm = ({ initialData, onSubmit, onCancel }: CareerFormProps) => {
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map((d: { department_name: string }) => ({
    label: d.department_name,
    value: d.department_name,
  }));

  const [formData, setFormData] = useState<Partial<Career>>({
    title: '',
    department: '',
    location: 'Remote',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [],
    benefits: [],
    status: 'Open',
    postedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!initialData && departmentOptions.length > 0 && !formData.department) {
      queueMicrotask(() => {
        setFormData((prev) => ({ ...prev, department: departmentOptions[0].value }));
      });
    }
  }, [departmentOptions, initialData, formData.department]);

  const [reqsString, setReqsString] = useState('');
  const [benefitsString, setBenefitsString] = useState('');

  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        setFormData(initialData);
        const requirements = Array.isArray(initialData.requirements)
          ? initialData.requirements
          : initialData.requirements
            ? [initialData.requirements]
            : [];
        const benefits = Array.isArray(initialData.benefits)
          ? initialData.benefits
          : initialData.benefits
            ? [initialData.benefits]
            : [];
        setReqsString(requirements.join(', '));
        setBenefitsString(benefits.join(', '));
      });
    }
  }, [initialData]);

  const handleApply = () => {
    const dataToSend = {
      ...formData,
      requirements: reqsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      benefits: benefitsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSubmit(dataToSend);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Job Title" required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </FormField>

          <FormField label="Description" required>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the role and impact..."
              rows={4}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department">
              <Select
                options={departmentOptions}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.value })}
              />
            </FormField>
            <FormField label="Job Type">
              <Select
                options={JOB_TYPES}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.value })}
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location" required>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Remote / Hybrid"
              />
            </FormField>
            <FormField label="Salary/Compensation">
              <Input
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. $120k - $150k"
              />
            </FormField>
          </div>

          <FormField label="Requirements (Comma-separated)">
            <Textarea
              value={reqsString}
              onChange={(e) => setReqsString(e.target.value)}
              placeholder="React, TypeScript, 5+ yrs exp..."
              rows={3}
            />
          </FormField>

          <FormField label="Benefits (Comma-separated)">
            <Textarea
              value={benefitsString}
              onChange={(e) => setBenefitsString(e.target.value)}
              placeholder="Equity, Health Care, Flexible PTO..."
              rows={3}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-2xl! font-bold text-muted!"
        >
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          className="px-10! h-12 rounded-2xl! font-black tracking-wide shadow-lg shadow-primary/20"
        >
          {initialData ? 'Update Position' : 'Publish Opportunity'}
        </Button>
      </div>
    </div>
  );
};
