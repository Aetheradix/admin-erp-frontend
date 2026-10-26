import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Calculator,
  ShieldCheck,
  Check,
  Building,
  Save,
  Loader2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { SettingSection } from '../SettingUI';
import {
  getStoredPayrollSettings,
  saveStoredPayrollSettings,
  AVAILABLE_PAY_PERIODS,
  type PayrollSettings,
  type PayPeriodType,
} from '@/types/payrollSettings';
import {
  useGetPayrollSettingsQuery,
  useUpdatePayrollSettingsMutation,
} from '@/store/api/settingslice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const PayrollSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<PayrollSettings>(getStoredPayrollSettings);
  const [customDays, setCustomDays] = useState<number>(10);
  const [financialYear, setFinancialYear] = useState<string>('2026-2027');
  const [cessPercent, setCessPercent] = useState<number>(4);

  const { data: backendData, isLoading: isFetching, refetch } = useGetPayrollSettingsQuery();
  const [updatePayrollSettings, { isLoading: isSaving }] = useUpdatePayrollSettingsMutation();

  // Populate from backend if available
  useEffect(() => {
    if (backendData) {
      const bData = backendData.data || backendData;
      setSettings((prev) => {
        const nextEnabled = { ...prev.enabledPayPeriods };
        if (Array.isArray(bData.enabledPayPeriods)) {
          nextEnabled.weekly = bData.enabledPayPeriods.includes('weekly');
          nextEnabled.biweekly = bData.enabledPayPeriods.includes('biweekly');
          nextEnabled.semiMonthly = bData.enabledPayPeriods.includes('semi-monthly');
          nextEnabled.monthly = bData.enabledPayPeriods.includes('monthly');
          nextEnabled.custom = bData.enabledPayPeriods.includes('custom');
        } else if (bData.payPeriodConfigs) {
          if (bData.payPeriodConfigs.weekly?.enabled !== undefined)
            nextEnabled.weekly = Boolean(bData.payPeriodConfigs.weekly.enabled);
          if (bData.payPeriodConfigs.biweekly?.enabled !== undefined)
            nextEnabled.biweekly = Boolean(bData.payPeriodConfigs.biweekly.enabled);
          if (bData.payPeriodConfigs['semi-monthly']?.enabled !== undefined)
            nextEnabled.semiMonthly = Boolean(bData.payPeriodConfigs['semi-monthly'].enabled);
          if (bData.payPeriodConfigs.monthly?.enabled !== undefined)
            nextEnabled.monthly = Boolean(bData.payPeriodConfigs.monthly.enabled);
          if (bData.payPeriodConfigs.custom?.enabled !== undefined)
            nextEnabled.custom = Boolean(bData.payPeriodConfigs.custom.enabled);
        }

        const tax = bData.taxSettings || {};
        if (tax.financialYear) setFinancialYear(tax.financialYear);
        if (tax.cessPercent !== undefined) setCessPercent(Number(tax.cessPercent));
        if (bData.payPeriodConfigs?.custom?.customDays) {
          setCustomDays(Number(bData.payPeriodConfigs.custom.customDays));
        }

        return {
          ...prev,
          enabledPayPeriods: nextEnabled,
          defaultPayPeriod: (bData.defaultPayPeriod as PayPeriodType) || prev.defaultPayPeriod,
          defaultTaxRegime:
            tax.defaultRegime === 'old' || tax.defaultRegime === 'Old Regime'
              ? 'Old Regime'
              : 'New Regime',
          standardDeductionNew: Number(tax.standardDeductionNew) || prev.standardDeductionNew,
          standardDeductionOld: Number(tax.standardDeductionOld) || prev.standardDeductionOld,
          rebateLimitNewRegime: Number(tax.rebateThresholdNew) || prev.rebateLimitNewRegime,
          rebateLimitOldRegime: Number(tax.rebateThresholdOld) || prev.rebateLimitOldRegime,
        };
      });
    }
  }, [backendData]);

  // Synchronize with external updates
  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getStoredPayrollSettings());
    };
    window.addEventListener('payroll_settings_updated', handleUpdate);
    return () => window.removeEventListener('payroll_settings_updated', handleUpdate);
  }, []);

  const updateSetting = <K extends keyof PayrollSettings>(key: K, value: PayrollSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
  };

  const togglePeriod = (periodId: keyof PayrollSettings['enabledPayPeriods']) => {
    const currentEnabled = settings.enabledPayPeriods[periodId];
    // Don't allow disabling all
    const activeCount = Object.values(settings.enabledPayPeriods).filter(Boolean).length;
    if (currentEnabled && activeCount <= 1) {
      showToast({
        severity: 'warn',
        summary: 'Cannot Disable',
        detail: 'At least one pay period schedule must remain enabled for the company.',
      });
      return;
    }

    const nextEnabled = {
      ...settings.enabledPayPeriods,
      [periodId]: !currentEnabled,
    };

    // If disabled period was the default, pick another enabled one
    let newDefault = settings.defaultPayPeriod;
    if (!nextEnabled[periodId] && settings.defaultPayPeriod === periodId) {
      const firstActive = Object.keys(nextEnabled).find(
        (k) => nextEnabled[k as keyof typeof nextEnabled]
      ) as PayPeriodType;
      newDefault = firstActive || 'monthly';
    }

    setSettings({
      ...settings,
      enabledPayPeriods: nextEnabled,
      defaultPayPeriod: newDefault,
    });
  };

  const handleSaveAll = async () => {
    const enabledList: string[] = [];
    if (settings.enabledPayPeriods.weekly) enabledList.push('weekly');
    if (settings.enabledPayPeriods.biweekly) enabledList.push('biweekly');
    if (settings.enabledPayPeriods.semiMonthly) enabledList.push('semi-monthly');
    if (settings.enabledPayPeriods.monthly) enabledList.push('monthly');
    if (settings.enabledPayPeriods.custom) enabledList.push('custom');

    const payload = {
      enabledPayPeriods: enabledList,
      defaultPayPeriod: settings.defaultPayPeriod,
      payPeriodConfigs: {
        weekly: {
          cyclesPerYear: 52,
          standardWorkingDays: 5,
          cutoffDay: 'Friday',
          enabled: settings.enabledPayPeriods.weekly,
        },
        biweekly: {
          cyclesPerYear: 26,
          standardWorkingDays: 10,
          enabled: settings.enabledPayPeriods.biweekly,
        },
        'semi-monthly': {
          cyclesPerYear: 24,
          standardWorkingDays: 15,
          enabled: settings.enabledPayPeriods.semiMonthly,
        },
        monthly: {
          cyclesPerYear: 12,
          standardWorkingDays: 30,
          enabled: settings.enabledPayPeriods.monthly,
        },
        custom: {
          customDays: Number(customDays) || 10,
          standardWorkingDays: 8,
          enabled: settings.enabledPayPeriods.custom,
        },
      },
      taxSettings: {
        defaultRegime: settings.defaultTaxRegime === 'Old Regime' ? 'old' : 'new',
        financialYear,
        standardDeductionNew: settings.standardDeductionNew || 75000,
        standardDeductionOld: settings.standardDeductionOld || 50000,
        rebateThresholdNew: settings.rebateLimitNewRegime || 1200000,
        rebateThresholdOld: settings.rebateLimitOldRegime || 500000,
        cessPercent,
      },
    };

    try {
      await updatePayrollSettings(payload).unwrap();
      saveStoredPayrollSettings(settings);
      showToast({
        severity: 'success',
        summary: 'Payroll Settings Saved',
        detail: 'Company payroll master toggles & tax rules updated successfully on backend.',
      });
      refetch();
    } catch (err: any) {
      console.warn('Backend save failed, saved locally:', err);
      saveStoredPayrollSettings(settings);
      showToast({
        severity: 'success',
        summary: 'Saved Locally',
        detail: 'Settings saved in local cache. Backend sync will retry on next connection.',
      });
    }
  };

  return (
    <SettingSection title="Payroll & Pay Periods Master">
      {/* Pay Periods Configuration Card */}
      <div className="p-6 bg-surface-elevated rounded-xl border border-border-subtle shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-foreground uppercase tracking-tight">
                  Company Allowed Pay Periods
                </span>
                {isFetching && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                    <Loader2 size={12} className="animate-spin text-primary" /> Syncing...
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
                Configure which payroll frequencies are permitted. Employees are assigned to one of
                these cycles on hire.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs disabled:opacity-60 shrink-0">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Checkbox / Selection Cards for Allowed Periods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {AVAILABLE_PAY_PERIODS.map((period) => {
            const key =
              period.id === 'semi-monthly'
                ? 'semiMonthly'
                : (period.id as keyof PayrollSettings['enabledPayPeriods']);
            const isEnabled = settings.enabledPayPeriods[key];
            const isDefault = settings.defaultPayPeriod === period.id;

            return (
              <div
                key={period.id}
                onClick={() => togglePeriod(key)}
                className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative select-none ${
                  isEnabled
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border-subtle bg-surface-subtle/50 opacity-60 hover:opacity-85'
                }`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{period.label}</span>
                    {period.isCommonInUS && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        US Common
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isEnabled
                        ? 'bg-primary text-white'
                        : 'border border-border-subtle bg-background'
                    }`}>
                    {isEnabled && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {period.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-border-subtle/60 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    {typeof period.periodsPerYear === 'number'
                      ? `${period.periodsPerYear} cycles/yr`
                      : period.periodsPerYear}
                  </span>
                  {isEnabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('defaultPayPeriod', period.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        isDefault
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:text-foreground bg-surface-subtle'
                      }`}>
                      {isDefault ? 'Default' : 'Set Default'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Default Frequency Selector & Custom Cycle Length */}
        <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Default Pay Frequency (For New Hires)
            </label>
            <select
              value={settings.defaultPayPeriod}
              onChange={(e) => updateSetting('defaultPayPeriod', e.target.value as PayPeriodType)}
              className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-semibold text-foreground focus:outline-none focus:border-primary">
              {AVAILABLE_PAY_PERIODS.filter((p) => {
                const k =
                  p.id === 'semi-monthly'
                    ? 'semiMonthly'
                    : (p.id as keyof PayrollSettings['enabledPayPeriods']);
                return settings.enabledPayPeriods[k];
              }).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.frequencyName})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pre-selected automatically on employee creation and salary slip generation.
            </p>
          </div>

          {settings.enabledPayPeriods.custom && (
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Custom Cycle Length (Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-semibold text-foreground focus:outline-none focus:border-primary font-mono"
                  placeholder="e.g. 10"
                />
                <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                  days/cycle
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Standard duration in days when running custom off-cycle payrolls.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tax Slabs & Compensation Master Card */}
      <div className="p-6 bg-surface-elevated rounded-xl border border-border-subtle shadow-xs">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <span className="text-base font-black text-foreground uppercase tracking-tight">
              Statutory Tax Rules & Regime Defaults
            </span>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
              Statutory deductions, section 87A rebate thresholds, and current financial year rules
              enforced by the backend calculation engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Default Regime Selection */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              Default Company Tax Regime
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('defaultTaxRegime', 'New Regime')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                  settings.defaultTaxRegime === 'New Regime'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground border-border-subtle hover:text-foreground'
                }`}>
                New Regime (Zero Tax &lt; 12L)
              </button>
              <button
                type="button"
                onClick={() => updateSetting('defaultTaxRegime', 'Old Regime')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                  settings.defaultTaxRegime === 'Old Regime'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground border-border-subtle hover:text-foreground'
                }`}>
                Old Regime (80C / HRA)
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Employees can individually choose or switch their preferred regime upon hire.
            </p>
          </div>

          {/* Standard Deductions Card */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col justify-between">
            <div>
              <span className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                Standard Deduction Limit
              </span>
              <p className="text-[11px] text-muted-foreground mb-3">
                Statutory annual deduction automatically subtracted before tax calculation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  New Regime
                </span>
                <span className="text-sm font-black text-foreground font-mono">
                  ₹{settings.standardDeductionNew.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  Old Regime
                </span>
                <span className="text-sm font-black text-foreground font-mono">
                  ₹{settings.standardDeductionOld.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 87A Rebate Thresholds Panel */}
        <div className="mt-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Section 87A Rebate Thresholds
            </span>
            <span className="text-[11px] font-bold text-primary font-mono">FY {financialYear}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                New Regime (Zero Tax)
              </span>
              <span className="text-sm font-black text-emerald-600 font-mono">
                Up to ₹{settings.rebateLimitNewRegime.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Old Regime (Rebate limit)
              </span>
              <span className="text-sm font-black text-foreground font-mono">
                Up to ₹{settings.rebateLimitOldRegime.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Health & Education Cess
              </span>
              <span className="text-sm font-black text-foreground font-mono">
                {cessPercent}% on total tax
              </span>
            </div>
          </div>
        </div>

        {/* Statutory Exemptions Checklist */}
        <div className="mt-4 pt-4 border-t border-border-subtle/80 flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck size={16} />
            <span>Employer PF exempt up to 12% of basic</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600">
            <ShieldCheck size={16} />
            <span>Section 80CCD(2) Employer NPS exempt</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <Building size={16} />
            <span>Fiscal Year: April - March ({financialYear})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={16} />
            <span>Standard Working Days: 30 / Month</span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Info size={13} className="text-primary" /> Changes take effect immediately across all
            newly created payroll cycles and salary slips.
          </p>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs disabled:opacity-60">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving Master Settings...' : 'Save Master Settings'}
          </button>
        </div>
      </div>
    </SettingSection>
  );
};
