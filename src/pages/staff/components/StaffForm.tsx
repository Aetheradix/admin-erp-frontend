import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useEffect, useState, useMemo } from 'react';
import { Calculator, Info, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useGetDepartmentsQuery } from '@/store/api/authApiSlice';
import {
  usePreviewEmployeeCompensationMutation,
  useLazyGetEmployeeCompensationQuery,
} from '@/store/api/financeApiSlice';
import { getStoredPayrollSettings, AVAILABLE_PAY_PERIODS } from '@/types/payrollSettings';
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
    value: d.department_name,
  }));

  const companyPayrollSettings = useMemo(() => getStoredPayrollSettings(), []);

  const payFrequencyOptions = useMemo(() => {
    return AVAILABLE_PAY_PERIODS.filter((p) => {
      const key =
        p.id === 'semi-monthly'
          ? 'semiMonthly'
          : (p.id as keyof typeof companyPayrollSettings.enabledPayPeriods);
      return companyPayrollSettings.enabledPayPeriods[key] !== false;
    }).map((p) => ({
      label: p.label,
      value: p.id,
    }));
  }, [companyPayrollSettings]);

  const [previewCompensation, { isLoading: isCalculatingPreview }] =
    usePreviewEmployeeCompensationMutation();
  const [fetchCompensation] = useLazyGetEmployeeCompensationQuery();

  const [calculatedPreview, setCalculatedPreview] = useState<any | null>(null);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    skills: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
    totalCompensation: '',
    taxRegime: companyPayrollSettings.defaultTaxRegime || 'New Regime',
    payFrequency: companyPayrollSettings.defaultPayPeriod || 'monthly',
    isMidYearJoiner: false,
    panNumber: '',
    previousEmployerStandardDeduction: 0,
    section80c: 150000,
    section80d: 25000,
    hraExemption: 0,
    previousEmployerYtd: {
      grossPay: 0,
      tdsDeducted: 0,
      pfDeducted: 0,
      ptDeducted: 0,
      standardDeduction: 0,
    },
  });

  const [skillsString, setSkillsString] = useState('');

  // Fetch existing compensation if editing
  useEffect(() => {
    if (initialData?.id) {
      fetchCompensation(initialData.id)
        .unwrap()
        .then((comp) => {
          if (comp) {
            setFormData((prev) => ({
              ...prev,
              totalCompensation: comp.ctcAnnual || comp.ctc_annual || prev.totalCompensation,
              taxRegime: comp.taxRegime === 'old' || comp.tax_regime === 'old' ? 'Old Regime' : 'New Regime',
              payFrequency: comp.payFrequency || comp.pay_frequency || prev.payFrequency,
              isMidYearJoiner: Boolean(comp.isMidYearJoiner ?? comp.is_mid_year_joiner ?? prev.isMidYearJoiner),
              effectiveDate: comp.effectiveDate || comp.effective_date || prev.effectiveDate,
              previousEmployerStandardDeduction:
                comp.previousEmployerStandardDeduction ?? comp.previous_employer_standard_deduction ?? prev.previousEmployerStandardDeduction,
              section80c: comp.section80c ?? comp.section_80c ?? prev.section80c,
              section80d: comp.section80d ?? comp.section_80d ?? prev.section80d,
              hraExemption: comp.hraExemption ?? comp.hra_exemption ?? prev.hraExemption,
              previousEmployerYtd: {
                grossPay: comp.previousEmployerGross ?? comp.previous_employer_gross ?? prev.previousEmployerYtd?.grossPay ?? 0,
                tdsDeducted: comp.previousEmployerTds ?? comp.previous_employer_tds ?? prev.previousEmployerYtd?.tdsDeducted ?? 0,
                pfDeducted: comp.previousEmployerPf ?? comp.previous_employer_pf ?? prev.previousEmployerYtd?.pfDeducted ?? 0,
                ptDeducted: prev.previousEmployerYtd?.ptDeducted ?? 0,
                standardDeduction: comp.previousEmployerStandardDeduction ?? comp.previous_employer_standard_deduction ?? 0,
              },
            }));
          }
        })
        .catch(() => {
          // Ignore if no dedicated compensation record exists yet
        });
    }
  }, [initialData, fetchCompensation]);

  useEffect(() => {
    if (initialData) {
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          ...initialData,
          totalCompensation:
            initialData.totalCompensation ||
            initialData.total_compensation ||
            initialData.annualCtc ||
            initialData.annual_ctc ||
            prev.totalCompensation ||
            '',
          taxRegime: (initialData.taxRegime || initialData.tax_regime || prev.taxRegime || 'New Regime') as any,
          payFrequency: initialData.payFrequency || initialData.pay_frequency || prev.payFrequency || 'monthly',
          isMidYearJoiner: Boolean(initialData.isMidYearJoiner ?? initialData.is_mid_year_joiner ?? prev.isMidYearJoiner),
          panNumber: initialData.panNumber || initialData.pan_number || prev.panNumber || '',
          effectiveDate: initialData.effectiveDate || initialData.effective_date || prev.effectiveDate,
          previousEmployerStandardDeduction:
            initialData.previousEmployerStandardDeduction ?? initialData.previous_employer_standard_deduction ?? prev.previousEmployerStandardDeduction ?? 0,
          section80c: initialData.section80c ?? initialData.section_80c ?? prev.section80c ?? 150000,
          section80d: initialData.section80d ?? initialData.section_80d ?? prev.section80d ?? 25000,
          hraExemption: initialData.hraExemption ?? initialData.hra_exemption ?? prev.hraExemption ?? 0,
          previousEmployerYtd: initialData.previousEmployerYtd ||
            initialData.previous_employer_ytd || {
            grossPay: 0,
            tdsDeducted: 0,
            pfDeducted: 0,
            ptDeducted: 0,
            standardDeduction: 0,
          },
        }));
        setSkillsString(initialData.skills ? initialData.skills.join(', ') : '');
      });
    }
  }, [initialData]);

  // Handle Auto-Calculate from CTC via Preview Endpoint
  const handleAutoCalculatePreview = async () => {
    const ctc = Number(formData.totalCompensation || 0);
    if (!ctc || ctc <= 0) return;

    try {
      const res = await previewCompensation({ ctcAnnual: ctc }).unwrap();
      const previewData = res?.data || res;
      setCalculatedPreview(previewData);

      // Auto-populate base salary approximation
      if (previewData?.components?.basicSalary?.annual) {
        setFormData((prev) => ({
          ...prev,
          base_salary: previewData.components.basicSalary.annual / 12,
        }));
      }
    } catch {
      // Fallback local rule: Basic (40%), HRA (50% of Basic = 20%), Employer PF (12% of Basic = 4.8%), Special = remainder
      const basic = Math.round(ctc * 0.4);
      const hra = Math.round(basic * 0.5);
      const pf = Math.round(basic * 0.12);
      const special = Math.max(0, ctc - basic - hra - pf);
      setCalculatedPreview({
        ctcAnnual: ctc,
        components: {
          basicSalary: { annual: basic, monthly: Math.round(basic / 12) },
          houseRentAllowance: { annual: hra, monthly: Math.round(hra / 12) },
          specialAllowance: { annual: special, monthly: Math.round(special / 12) },
        },
        employerContributions: {
          employerPf: { annual: pf, monthly: Math.round(pf / 12) },
        },
      });
    }
  };

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

          <div className="grid grid-cols-2 gap-4">
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

            <FormField label="Effective Date" id="staff-effective-date">
              <Calendar
                id="staff-effective-date"
                value={formData.effectiveDate ? new Date(formData.effectiveDate) : null}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveDate: e.value?.toISOString().split('T')[0] || '' })
                }
                placeholder="Select effective date"
                dateFormat="yy-mm-dd"
              />
            </FormField>
          </div>

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Compensation (CTC) + Auto-Calculate */}
          <div className="md:col-span-2">
            <FormField label="Total Annual Compensation (CTC ₹)" id="staff-ctc">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
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
                        base_salary: val ? Math.round(Number(val) * 0.4 / 12) : '',
                      });
                    }}
                    className="pl-8!"
                    placeholder="e.g. 1500000"
                  />
                </div>
                <button
                  type="button"
                  disabled={!formData.totalCompensation || isCalculatingPreview}
                  onClick={handleAutoCalculatePreview}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50">
                  <Sparkles size={14} className="text-amber-400" />
                  {isCalculatingPreview ? 'Calculating...' : 'Auto-Calculate'}
                </button>
              </div>

              {Boolean(formData.totalCompensation) && (
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  ≈ ₹{Math.round(Number(formData.totalCompensation) / 12).toLocaleString('en-IN')}/mo gross
                </p>
              )}
            </FormField>
          </div>

          <FormField label="PAN Card Number" id="staff-pan">
            <Input
              id="staff-pan"
              value={formData.panNumber || ''}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
            />
          </FormField>

          <FormField label="Pay Frequency" id="staff-frequency">
            <Select
              id="staff-frequency"
              options={payFrequencyOptions}
              value={formData.payFrequency || 'monthly'}
              onChange={(e: { value: string }) =>
                setFormData({
                  ...formData,
                  payFrequency: e.value,
                })
              }
              placeholder="Select pay frequency"
            />
          </FormField>
        </div>

        {/* Calculated Structure Preview Card */}
        {calculatedPreview && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-primary/10">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Auto-Calculated Structure (40% Basic, 50% HRA, 12% PF)
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                Annual CTC: ₹{Number(formData.totalCompensation || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Basic Salary (40%)</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{Number(calculatedPreview?.components?.basicSalary?.annual || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ₹{Number(calculatedPreview?.components?.basicSalary?.monthly || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>

              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">HRA (50% Basic)</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{Number(calculatedPreview?.components?.houseRentAllowance?.annual || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ₹{Number(calculatedPreview?.components?.houseRentAllowance?.monthly || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>

              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Employer PF (12%)</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{Number(calculatedPreview?.employerContributions?.employerPf?.annual || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ₹{Number(calculatedPreview?.employerContributions?.employerPf?.monthly || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>

              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Special Allowance</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{Number(calculatedPreview?.components?.specialAllowance?.annual || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ₹{Number(calculatedPreview?.components?.specialAllowance?.monthly || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tax Regime Selector */}
        <div className="pt-2">
          <FormField label="Income Tax Regime (India)" id="staff-regime">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taxRegime: 'New Regime' })}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  formData.taxRegime === 'New Regime'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-border-subtle bg-background hover:bg-surface-subtle'
                }`}>
                <div>
                  <span className="text-xs font-bold text-foreground block">New Regime (Default)</span>
                  <span className="text-[11px] text-muted-foreground">Zero tax up to ₹12 Lakh, standard ₹75,000</span>
                </div>
                {formData.taxRegime === 'New Regime' && <ShieldCheck size={18} className="text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, taxRegime: 'Old Regime' })}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  formData.taxRegime === 'Old Regime'
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-border-subtle bg-background hover:bg-surface-subtle'
                }`}>
                <div>
                  <span className="text-xs font-bold text-foreground block">Old Regime</span>
                  <span className="text-[11px] text-muted-foreground">Section 80C, 80D, HRA declarations</span>
                </div>
                {formData.taxRegime === 'Old Regime' && <ShieldCheck size={18} className="text-primary" />}
              </button>
            </div>
          </FormField>
        </div>

        {/* Old Regime Declarations (if Old Regime selected) */}
        {formData.taxRegime === 'Old Regime' && (
          <div className="p-4 rounded-xl bg-background border border-border-subtle animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-3">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span>Old Regime Statutory Declarations (India)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Section 80C (Max ₹1.5L)
                </label>
                <Input
                  type="number"
                  value={formData.section80c ?? 150000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      section80c: Number(e.target.value || 0),
                    })
                  }
                  placeholder="150000"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">LIC, PPF, ELSS, EPF</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Section 80D (Health Ins.)
                </label>
                <Input
                  type="number"
                  value={formData.section80d ?? 25000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      section80d: Number(e.target.value || 0),
                    })
                  }
                  placeholder="25000"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Medical insurance premium</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  HRA Exemption Amount
                </label>
                <Input
                  type="number"
                  value={formData.hraExemption ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hraExemption: Number(e.target.value || 0),
                    })
                  }
                  placeholder="0"
                />
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Rent receipts exemption</span>
              </div>
            </div>
          </div>
        )}

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
                    Std. Deduction Claimed (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.previousEmployerStandardDeduction ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previousEmployerStandardDeduction: Number(e.target.value || 0),
                        previousEmployerYtd: {
                          ...formData.previousEmployerYtd,
                          standardDeduction: Number(e.target.value || 0),
                        },
                      })
                    }
                    placeholder="50000"
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
