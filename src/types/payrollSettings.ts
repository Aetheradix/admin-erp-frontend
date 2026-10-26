export type PayPeriodType = 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly' | 'custom';

export interface PayPeriodConfig {
  id: PayPeriodType;
  label: string;
  description: string;
  frequencyName: string;
  periodsPerYear: number | string;
  isCommonInUS: boolean;
}

export const AVAILABLE_PAY_PERIODS: PayPeriodConfig[] = [
  {
    id: 'monthly',
    label: 'Monthly',
    description:
      'Calculated once per calendar month (1st to last day of month). Standard in India & Europe.',
    frequencyName: 'Monthly',
    periodsPerYear: 12,
    isCommonInUS: false,
  },
  {
    id: 'semi-monthly',
    label: 'Semi-Monthly',
    description: 'Twice a month: 1st–15th (1st half) and 16th–End (2nd half).',
    frequencyName: 'Semi-Monthly',
    periodsPerYear: 24,
    isCommonInUS: true,
  },
  {
    id: 'biweekly',
    label: 'Bi-Weekly',
    description: 'Every two weeks (14-day intervals, 26 pay cycles per year).',
    frequencyName: 'Bi-Weekly',
    periodsPerYear: 26,
    isCommonInUS: true,
  },
  {
    id: 'weekly',
    label: 'Weekly',
    description:
      'Every 7 days (52 pay cycles per year). Common in the US and with small shops & hourly workers.',
    frequencyName: 'Weekly',
    periodsPerYear: 52,
    isCommonInUS: true,
  },
  {
    id: 'custom',
    label: 'Custom Range',
    description: 'Custom start and end dates defined per payroll run.',
    frequencyName: 'Custom',
    periodsPerYear: 'Variable',
    isCommonInUS: false,
  },
];

export interface PayrollSettings {
  enabledPayPeriods: {
    weekly: boolean;
    biweekly: boolean;
    semiMonthly: boolean;
    monthly: boolean;
    custom: boolean;
  };
  defaultPayPeriod: PayPeriodType;
  defaultTaxRegime: 'New Regime' | 'Old Regime';
  standardDeductionNew: number; // ₹75,000 in India FY 2024-25 / 2025-26
  standardDeductionOld: number; // ₹50,000 in India Old Regime
  employerPfExemptPercent: number; // 12%
  employerNpsExemptPercent: number; // 10% (14% for govt)
  rebateLimitNewRegime: number; // ₹12,00,000
  rebateLimitOldRegime: number; // ₹5,00,000
  fiscalYearStartMonth: number; // 4 (April) for India
}

export const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  enabledPayPeriods: {
    weekly: true,
    biweekly: true,
    semiMonthly: true,
    monthly: true,
    custom: true,
  },
  defaultPayPeriod: 'monthly',
  defaultTaxRegime: 'New Regime',
  standardDeductionNew: 75000,
  standardDeductionOld: 50000,
  employerPfExemptPercent: 12,
  employerNpsExemptPercent: 10,
  rebateLimitNewRegime: 1200000,
  rebateLimitOldRegime: 500000,
  fiscalYearStartMonth: 4,
};

const PAYROLL_STORAGE_KEY = 'aether_payroll_settings';

export const getStoredPayrollSettings = (): PayrollSettings => {
  try {
    const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PAYROLL_SETTINGS,
        ...parsed,
        enabledPayPeriods: {
          ...DEFAULT_PAYROLL_SETTINGS.enabledPayPeriods,
          ...(parsed.enabledPayPeriods || {}),
        },
      };
    }
  } catch (e) {
    console.error('Error loading stored payroll settings:', e);
  }
  return DEFAULT_PAYROLL_SETTINGS;
};

export const saveStoredPayrollSettings = (settings: PayrollSettings): void => {
  try {
    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('payroll_settings_updated'));
  } catch (e) {
    console.error('Error saving payroll settings:', e);
  }
};
