import React, { useState, useEffect } from 'react';
import {
  Calendar,

  Calculator,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';
import { SettingSection } from '../SettingUI';
import {
  getStoredPayrollSettings,
  saveStoredPayrollSettings,
  AVAILABLE_PAY_PERIODS,
  type PayrollSettings,
  type PayPeriodType,
} from '@/types/payrollSettings';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const PayrollSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<PayrollSettings>(getStoredPayrollSettings);

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
    saveStoredPayrollSettings(next);
    showToast({
      severity: 'success',
      summary: 'Payroll Settings Saved',
      detail: 'Company payroll master preferences updated successfully.',
    });
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

    const next = {
      ...settings,
      enabledPayPeriods: nextEnabled,
      defaultPayPeriod: newDefault,
    };
    setSettings(next);
    saveStoredPayrollSettings(next);
    showToast({
      severity: 'info',
      summary: 'Pay Period Updated',
      detail: `${periodId.toUpperCase()} cycle ${!currentEnabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <SettingSection title="Payroll & Pay Periods Master">
      {/* Pay Periods Configuration Card */}
      <div className="p-6 bg-surface-elevated rounded-xl border border-border-subtle shadow-xs">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-base font-black text-foreground uppercase tracking-tight">
              Company Enabled Pay Periods
            </span>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
              Select which pay schedules your organization supports. Weekly is common in the US and with small shops, while monthly is standard in India and Europe.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {AVAILABLE_PAY_PERIODS.map((period) => {
            const key = period.id === 'semi-monthly' ? 'semiMonthly' : (period.id as keyof PayrollSettings['enabledPayPeriods']);
            const isEnabled = settings.enabledPayPeriods[key];
            const isDefault = settings.defaultPayPeriod === period.id;

            return (
              <div
                key={period.id}
                onClick={() => togglePeriod(key)}
                className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative select-none ${isEnabled
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border-subtle bg-surface-subtle/50 opacity-60 hover:opacity-85'
                  }`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {period.label}
                    </span>
                    {period.isCommonInUS && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        US Common
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isEnabled ? 'bg-primary text-white' : 'border border-border-subtle bg-background'
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
                      ? `${period.periodsPerYear} runs/yr`
                      : period.periodsPerYear}
                  </span>
                  {isEnabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('defaultPayPeriod', period.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${isDefault
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
      </div>

      {/* Tax Slabs & Compensation Master Card */}
      <div className="p-6 bg-surface-elevated rounded-xl border border-border-subtle shadow-xs">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <span className="text-base font-black text-foreground uppercase tracking-tight">
              Statutory Tax & Regime Defaults
            </span>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed mt-0.5">
              Default tax regimes for employees in India. New regime offers zero tax up to ₹12 Lakh with progressive slabs, while Old regime allows exemptions up to ₹5 Lakh.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              Default Employee Regime
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('defaultTaxRegime', 'New Regime')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${settings.defaultTaxRegime === 'New Regime'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground border-border-subtle hover:text-foreground'
                  }`}>
                New Regime (Zero Tax &lt; 12L)
              </button>
              <button
                type="button"
                onClick={() => updateSetting('defaultTaxRegime', 'Old Regime')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all border ${settings.defaultTaxRegime === 'Old Regime'
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
            <span>Fiscal Year: April - March</span>
          </div>
        </div>
      </div>
    </SettingSection>
  );
};
