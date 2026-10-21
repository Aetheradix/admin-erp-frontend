import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useEffect, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
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

const TAX_REGIME_OPTIONS = [
  { label: 'New Regime (Zero Tax up to ₹12 Lakh)', value: 'New Regime' },
  { label: 'Old Regime (Standard ₹50k + 80C Exemptions)', value: 'Old Regime' },
];

export const StaffForm = ({ initialData, onSubmit, onCancel }: StaffFormProps) => {
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const departments = departmentsData?.data ?? [];
  const departmentOptions = departments.map((d: { department_name: string }) => ({
    label: d.department_name,
    value: d.department_name,
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
    totalCompensation: '',
    taxRegime: 'New Regime',
    isMidYearJoiner: false,
    panNumber: '',
    previousEmployerYtd: {
      grossPay: 0,
      tdsDeducted: 0,
      pfDeducted: 0,
      ptDeducted: 0,
    },
  });

  const [skillsString, setSkillsString] = useState('');

  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        setFormData({
          ...initialData,
          totalCompensation:
            initialData.totalCompensation ||
            initialData.total_compensation ||
            initialData.annualCtc ||
            initialData.annual_ctc ||
            '',
          taxRegime: initialData.taxRegime || initialData.tax_regime || 'New Regime',
          isMidYearJoiner: Boolean(initialData.isMidYearJoiner ?? initialData.is_mid_year_joiner),
          panNumber: initialData.panNumber || initialData.pan_number || '',
          previousEmployerYtd: initialData.previousEmployerYtd ||
            initialData.previous_employer_ytd || {
            grossPay: 0,
            tdsDeducted: 0,
            pfDeducted: 0,
            ptDeducted: 0,
          },
        });
        setSkillsString(initialData.skills ? initialData.skills.join(', ') : '');
      });
    }
  }, [initialData]);

  const handleApply = () => {
    const dataToSend = {
      ...formData,
      skills: skillsString
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
                onChange={(e: { value: string }) =>
                  setFormData({ ...formData, department: e.value })
                }
                placeholder="Select department"
              />
            </FormField>
            <FormField label="Status" id="staff-status">
              <Select
                id="staff-status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e: { value: string }) =>
                  setFormData({ ...formData, status: e.value as StaffMember['status'] })
                }
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
              onChange={(e) =>
                setFormData({ ...formData, joinDate: e.value?.toISOString().split('T')[0] || '' })
              }
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

      {/* Compensation, Tax Regime & Mid-Year Joiner Details */}
      <div className="p-6 rounded-2xl bg-surface-subtle/70 border border-border-subtle flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border-subtle">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Total Compensation & Tax Setup
            </h3>
            <p className="text-xs text-muted-foreground">
              Stored upon hire. Used as ground-truth for monthly payroll and slab-based statutory tax calculations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Total Compensation (Annual CTC ₹)" id="staff-ctc">
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground text-sm font-bold">₹</span>
              <Input
                id="staff-ctc"
                type="number"
                value={formData.totalCompensation ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setFormData({
                    ...formData,
                    totalCompensation: val,
                    base_salary: val ? Math.round(Number(val) / 24) : '', // Standard biweekly or ~monthly / 2
                  });
                }}
                className="pl-8!"
                placeholder="e.g. 1200000"
              />
            </div>
            {Boolean(formData.totalCompensation) && (
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                ≈ ₹{Math.round(Number(formData.totalCompensation) / 12).toLocaleString('en-IN')}/mo gross
              </p>
            )}
          </FormField>

          <FormField label="PAN Card Number" id="staff-pan">
            <Input
              id="staff-pan"
              value={formData.panNumber || ''}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
            />
          </FormField>

          <FormField label="Income Tax Regime (India)" id="staff-regime">
            <Select
              id="staff-regime"
              options={TAX_REGIME_OPTIONS}
              value={formData.taxRegime || 'New Regime'}
              onChange={(e: { value: string }) =>
                setFormData({
                  ...formData,
                  taxRegime: e.value as 'New Regime' | 'Old Regime',
                })
              }
              placeholder="Select tax regime"
            />
          </FormField>
        </div>

        {/* Mid-Year Joiner YTD Section */}
        <div className="pt-4 border-t border-border-subtle/60 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mid-year-toggle"
                checked={Boolean(formData.isMidYearJoiner)}
                onChange={(e) =>
                  setFormData({ ...formData, isMidYearJoiner: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <label
                htmlFor="mid-year-toggle"
                className="text-xs font-bold text-foreground cursor-pointer select-none">
                Mid-Year Joiner (Collect Year-to-Date data from previous employer)
              </label>
            </div>
            {formData.isMidYearJoiner && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Active YTD Tax Credit
              </span>
            )}
          </div>

          {formData.isMidYearJoiner && (
            <div className="p-4 rounded-xl bg-background border border-border-subtle animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
                <Info size={14} className="text-primary shrink-0" />
                <span>
                  Previous employer YTD data ensures accurate progressive slab calculation and gives the employee full credit for taxes already deducted.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Previous Gross Pay (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.previousEmployerYtd?.grossPay ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousEmployerYtd: {
                          ...formData.previousEmployerYtd,
                          grossPay: Number(e.target.value || 0),
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Previous TDS Deducted (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.previousEmployerYtd?.tdsDeducted ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousEmployerYtd: {
                          ...formData.previousEmployerYtd,
                          tdsDeducted: Number(e.target.value || 0),
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Previous PF Deducted (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.previousEmployerYtd?.pfDeducted ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousEmployerYtd: {
                          ...formData.previousEmployerYtd,
                          pfDeducted: Number(e.target.value || 0),
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Previous PT Deducted (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.previousEmployerYtd?.ptDeducted ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousEmployerYtd: {
                          ...formData.previousEmployerYtd,
                          ptDeducted: Number(e.target.value || 0),
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Discard changes">
          Discard
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label={initialData ? 'Update staff member profile' : 'Add new staff member to team'}>
          {initialData ? 'Update Member' : 'Add to Team'}
        </Button>
      </div>
    </div>
  );
};
