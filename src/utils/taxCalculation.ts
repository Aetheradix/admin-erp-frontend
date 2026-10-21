/**
 * India Statutory Tax Calculation Engine (FY 2024-25 / 2025-26 & onward)
 * Supports New Tax Regime (Budget 2024-25 revision with 4L slab & 12L rebate) and Old Tax Regime.
 * Handles Mid-Year Joiner YTD data, Standard Deduction, Employer PF, Employer NPS (80CCD(2)),
 * Section 87A Rebate, and 4% Health & Education Cess.
 */

export type TaxRegime = 'New Regime' | 'Old Regime';

export interface PreviousEmployerYtd {
  grossPay: number;
  tdsDeducted: number;
  pfDeducted?: number;
  ptDeducted?: number;
}

export interface TaxInputParams {
  annualGrossSalary: number; // Annual Total Compensation / Gross
  regime: TaxRegime;
  basicSalary?: number; // Annual Basic (defaults to 50% of Gross)
  employerPf?: number; // Employer PF contribution (annual)
  employerNps?: number; // Employer NPS Section 80CCD(2) contribution (annual)
  standardDeduction?: number; // Override if needed (Default: 75,000 for New, 50,000 for Old)
  
  // Old Regime Deductions
  deduction80C?: number; // Up to 1,50,000
  deduction80D?: number; // Medical insurance (e.g. 25,000 - 75,000)
  hraExemption?: number; // HRA exempt portion
  otherExemptions?: number; // Sec 24(b), 80CCD(1B), etc.
  professionalTaxAnnual?: number; // Standard ₹2,400 or ₹2,500

  // Mid-Year Joiner & Current Company YTD
  isMidYearJoiner?: boolean;
  joiningMonthInFiscalYear?: number; // 1 = April, 7 = October, 12 = March
  previousEmployerYtd?: PreviousEmployerYtd;
  currentCompanyYtdTds?: number; // TDS already deducted in current company
  remainingMonthsInFiscalYear?: number; // Default computed or 12
}

export interface SlabBreakdown {
  slabLabel: string;
  min: number;
  max: number | null;
  rate: number; // e.g. 0.05 for 5%
  taxableInSlab: number;
  taxAmount: number;
}

export interface TaxCalculationResult {
  regime: TaxRegime;
  annualGross: number;
  previousEmployerGross: number;
  totalCumulativeGross: number;

  // Deductions
  standardDeduction: number;
  employerPfDeduction: number;
  employerNpsDeduction: number;
  professionalTax: number;
  deduction80C: number;
  deduction80D: number;
  hraExemption: number;
  otherExemptions: number;
  totalExemptionsAndDeductions: number;

  netTaxableIncome: number;

  // Slab Breakdown
  slabs: SlabBreakdown[];
  baseTaxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  healthAndEducationCess: number; // 4%
  totalAnnualTax: number;

  // Credits & Balances
  previousEmployerTdsCredit: number;
  currentCompanyYtdTds: number;
  totalTdsAlreadyPaid: number;
  netRemainingTaxPayable: number;
  remainingMonths: number;
  projectedMonthlyTds: number;

  // Recommendations
  effectiveTaxRate: number; // In %
}

export interface RegimeComparison {
  newRegime: TaxCalculationResult;
  oldRegime: TaxCalculationResult;
  recommendedRegime: TaxRegime;
  taxDifference: number; // How much is saved in the recommended regime
  savingsMessage: string;
}

export interface MonthlyPayScheduleRow {
  monthIndex: number; // 1 to 12 (Apr to Mar)
  monthName: string;
  financialYearMonth: string;
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  grossPay: number;
  pfDeduction: number;
  professionalTax: number;
  projectedTds: number;
  otherDeductions: number;
  totalDeductions: number;
  netTakeHome: number;
  isPastMonth?: boolean;
}

export const FISCAL_MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

/**
 * Calculates India Income Tax under New Regime:
 * - Up to 4 Lakh: Nil
 * - 4L to 8L: 5%
 * - 8L to 12L: 10%
 * - 12L to 16L: 15%
 * - 16L to 20L: 20%
 * - 20L to 24L: 25%
 * - Above 24L: 30%
 * - Section 87A: Nil tax if taxable income <= 12 Lakh
 * - Standard Deduction: ₹75,000
 * - Deductions allowed: Standard deduction + Employer PF + Section 80CCD(2) Employer NPS
 */
export function calculateNewRegimeTax(taxableIncome: number): {
  slabs: SlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
} {
  const roundedTaxable = Math.max(0, Math.round(taxableIncome));

  const slabRules = [
    { label: '₹0 - ₹4,00,000', min: 0, max: 400000, rate: 0.0 },
    { label: '₹4,00,001 - ₹8,00,000', min: 400000, max: 800000, rate: 0.05 },
    { label: '₹8,00,001 - ₹12,00,000', min: 800000, max: 1200000, rate: 0.10 },
    { label: '₹12,00,001 - ₹16,00,000', min: 1200000, max: 1600000, rate: 0.15 },
    { label: '₹16,00,001 - ₹20,00,000', min: 1600000, max: 2000000, rate: 0.20 },
    { label: '₹20,00,001 - ₹24,00,000', min: 2000000, max: 2400000, rate: 0.25 },
    { label: 'Above ₹24,00,000', min: 2400000, max: null, rate: 0.30 },
  ];

  const slabs: SlabBreakdown[] = [];
  let baseTax = 0;

  for (const rule of slabRules) {
    if (roundedTaxable <= rule.min) {
      slabs.push({
        slabLabel: rule.label,
        min: rule.min,
        max: rule.max,
        rate: rule.rate,
        taxableInSlab: 0,
        taxAmount: 0,
      });
      continue;
    }

    const applicableUpper = rule.max !== null ? Math.min(roundedTaxable, rule.max) : roundedTaxable;
    const taxableInSlab = Math.max(0, applicableUpper - rule.min);
    const taxInSlab = taxableInSlab * rule.rate;

    baseTax += taxInSlab;
    slabs.push({
      slabLabel: rule.label,
      min: rule.min,
      max: rule.max,
      rate: rule.rate,
      taxableInSlab: Math.round(taxableInSlab),
      taxAmount: Math.round(taxInSlab),
    });
  }

  // Section 87A Rebate in New Regime:
  // If taxable income is up to ₹12,00,000, total tax payable is nil!
  let rebate87A = 0;
  if (roundedTaxable <= 1200000) {
    rebate87A = baseTax; // Full rebate
  } else if (roundedTaxable > 1200000 && roundedTaxable <= 1275000) {
    // Marginal relief: tax should not exceed income over ₹12,00,000
    const excessIncome = roundedTaxable - 1200000;
    if (baseTax > excessIncome) {
      rebate87A = baseTax - excessIncome;
    }
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;

  return {
    slabs,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    cess,
    totalTax,
  };
}

/**
 * Calculates India Income Tax under Old Regime:
 * - Up to 2.5 Lakh: Nil
 * - 2.5L to 5L: 5%
 * - 5L to 10L: 20%
 * - Above 10L: 30%
 * - Section 87A: Nil tax if taxable income <= 5 Lakh
 * - Standard Deduction: ₹50,000
 * - Exemptions: 80C (up to 1.5L), 80D, HRA, 80CCD(2), PT, etc.
 */
export function calculateOldRegimeTax(taxableIncome: number): {
  slabs: SlabBreakdown[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
} {
  const roundedTaxable = Math.max(0, Math.round(taxableIncome));

  const slabRules = [
    { label: '₹0 - ₹2,50,000', min: 0, max: 250000, rate: 0.0 },
    { label: '₹2,50,001 - ₹5,00,000', min: 250000, max: 500000, rate: 0.05 },
    { label: '₹5,00,001 - ₹10,00,000', min: 500000, max: 1000000, rate: 0.20 },
    { label: 'Above ₹10,00,000', min: 1000000, max: null, rate: 0.30 },
  ];

  const slabs: SlabBreakdown[] = [];
  let baseTax = 0;

  for (const rule of slabRules) {
    if (roundedTaxable <= rule.min) {
      slabs.push({
        slabLabel: rule.label,
        min: rule.min,
        max: rule.max,
        rate: rule.rate,
        taxableInSlab: 0,
        taxAmount: 0,
      });
      continue;
    }

    const applicableUpper = rule.max !== null ? Math.min(roundedTaxable, rule.max) : roundedTaxable;
    const taxableInSlab = Math.max(0, applicableUpper - rule.min);
    const taxInSlab = taxableInSlab * rule.rate;

    baseTax += taxInSlab;
    slabs.push({
      slabLabel: rule.label,
      min: rule.min,
      max: rule.max,
      rate: rule.rate,
      taxableInSlab: Math.round(taxableInSlab),
      taxAmount: Math.round(taxInSlab),
    });
  }

  // Section 87A Rebate in Old Regime:
  // If taxable income is up to ₹5,00,000, rebate of max ₹12,500 applies
  let rebate87A = 0;
  if (roundedTaxable <= 500000) {
    rebate87A = Math.min(baseTax, 12500);
  }

  const taxAfterRebate = Math.max(0, baseTax - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const totalTax = taxAfterRebate + cess;

  return {
    slabs,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    cess,
    totalTax,
  };
}

/**
 * Main tax calculation entry point. Computes complete tax breakdown,
 * handles mid-year joiner previous employer credits, and returns monthly TDS projection.
 */
export function calculateTaxForEmployee(params: TaxInputParams): TaxCalculationResult {
  const {
    annualGrossSalary = 0,
    regime = 'New Regime',
    basicSalary = Math.round(annualGrossSalary * 0.5),
    isMidYearJoiner = false,
    previousEmployerYtd,
    currentCompanyYtdTds = 0,
    remainingMonthsInFiscalYear,
  } = params;

  // Previous employer earnings (mid-year joiners)
  const prevGross = isMidYearJoiner && previousEmployerYtd ? Number(previousEmployerYtd.grossPay || 0) : 0;
  const prevTds = isMidYearJoiner && previousEmployerYtd ? Number(previousEmployerYtd.tdsDeducted || 0) : 0;
  const prevPf = isMidYearJoiner && previousEmployerYtd ? Number(previousEmployerYtd.pfDeducted || 0) : 0;
  const prevPt = isMidYearJoiner && previousEmployerYtd ? Number(previousEmployerYtd.ptDeducted || 0) : 0;

  const totalCumulativeGross = annualGrossSalary + prevGross;

  // Standard deduction
  const standardDeduction =
    params.standardDeduction !== undefined
      ? params.standardDeduction
      : regime === 'New Regime'
      ? 75000
      : 50000;

  // Employer PF contribution (tax exempt up to 12% of basic or 7.5L combined)
  const calculatedEmployerPf = params.employerPf !== undefined
    ? params.employerPf
    : Math.round(basicSalary * 0.12);
  const employerPfDeduction = Math.min(calculatedEmployerPf, 750000);

  // Section 80CCD(2): Employer NPS contribution (tax exempt up to 10% or 14% of basic)
  const calculatedEmployerNps = params.employerNps !== undefined
    ? params.employerNps
    : 0;
  const employerNpsDeduction = Math.min(calculatedEmployerNps, Math.round(basicSalary * 0.14));

  // Professional Tax (allowed under Old Regime)
  const professionalTax = regime === 'Old Regime'
    ? (params.professionalTaxAnnual ?? 2500) + prevPt
    : 0;

  // 80C & 80D (allowed only under Old Regime)
  const raw80C = regime === 'Old Regime'
    ? (params.deduction80C !== undefined ? params.deduction80C : Math.round(basicSalary * 0.12) + prevPf)
    : 0;
  const deduction80C = Math.min(150000, Math.max(0, raw80C));

  const deduction80D = regime === 'Old Regime' ? Math.min(75000, Math.max(0, params.deduction80D || 0)) : 0;
  const hraExemption = regime === 'Old Regime' ? Math.max(0, params.hraExemption || 0) : 0;
  const otherExemptions = regime === 'Old Regime' ? Math.max(0, params.otherExemptions || 0) : 0;

  // Compute Total Deductions
  const totalExemptionsAndDeductions =
    standardDeduction +
    employerPfDeduction +
    employerNpsDeduction +
    professionalTax +
    deduction80C +
    deduction80D +
    hraExemption +
    otherExemptions;

  const netTaxableIncome = Math.max(0, totalCumulativeGross - totalExemptionsAndDeductions);

  // Slabs calculation
  const slabResult = regime === 'New Regime'
    ? calculateNewRegimeTax(netTaxableIncome)
    : calculateOldRegimeTax(netTaxableIncome);

  const totalTdsAlreadyPaid = prevTds + currentCompanyYtdTds;
  const netRemainingTaxPayable = Math.max(0, slabResult.totalTax - totalTdsAlreadyPaid);

  // Remaining months logic (April to March = 12 months)
  const remainingMonths = Math.max(1, remainingMonthsInFiscalYear !== undefined ? remainingMonthsInFiscalYear : 12);
  const projectedMonthlyTds = Math.round(netRemainingTaxPayable / remainingMonths);

  const effectiveTaxRate = totalCumulativeGross > 0
    ? Number(((slabResult.totalTax / totalCumulativeGross) * 100).toFixed(2))
    : 0;

  return {
    regime,
    annualGross: annualGrossSalary,
    previousEmployerGross: prevGross,
    totalCumulativeGross,

    standardDeduction,
    employerPfDeduction,
    employerNpsDeduction,
    professionalTax,
    deduction80C,
    deduction80D,
    hraExemption,
    otherExemptions,
    totalExemptionsAndDeductions,

    netTaxableIncome,

    slabs: slabResult.slabs,
    baseTaxBeforeRebate: slabResult.baseTax,
    rebate87A: slabResult.rebate87A,
    taxAfterRebate: slabResult.taxAfterRebate,
    healthAndEducationCess: slabResult.cess,
    totalAnnualTax: slabResult.totalTax,

    previousEmployerTdsCredit: prevTds,
    currentCompanyYtdTds,
    totalTdsAlreadyPaid,
    netRemainingTaxPayable,
    remainingMonths,
    projectedMonthlyTds,

    effectiveTaxRate,
  };
}

/**
 * Compare New Regime vs Old Regime side-by-side to determine which saves more tax for the employee
 */
export function compareRegimes(params: Omit<TaxInputParams, 'regime'>): RegimeComparison {
  const newRegime = calculateTaxForEmployee({ ...params, regime: 'New Regime' });
  const oldRegime = calculateTaxForEmployee({ ...params, regime: 'Old Regime' });

  const diff = Math.abs(newRegime.totalAnnualTax - oldRegime.totalAnnualTax);
  const recommendedRegime: TaxRegime =
    newRegime.totalAnnualTax <= oldRegime.totalAnnualTax ? 'New Regime' : 'Old Regime';

  let savingsMessage = '';
  if (diff === 0) {
    savingsMessage = 'Both regimes yield identical tax liability. New Regime is recommended for lower paperwork.';
  } else if (recommendedRegime === 'New Regime') {
    savingsMessage = `New Tax Regime saves ₹${diff.toLocaleString('en-IN')} more in annual taxes compared to Old Regime.`;
  } else {
    savingsMessage = `Old Tax Regime saves ₹${diff.toLocaleString('en-IN')} more in annual taxes due to your deductions & exemptions.`;
  }

  return {
    newRegime,
    oldRegime,
    recommendedRegime,
    taxDifference: diff,
    savingsMessage,
  };
}

/**
 * Generates an expected month-by-month projection schedule for 12 months (April - March)
 */
export function generateMonthlyProjectionSchedule(
  annualGross: number,
  annualTax: number,
  joiningMonth = 1, // 1 = April
  basicPercent = 0.5,
  hraPercent = 0.2
): MonthlyPayScheduleRow[] {
  const activeMonths = 12 - (joiningMonth - 1);
  const monthlyGross = activeMonths > 0 ? Math.round(annualGross / activeMonths) : Math.round(annualGross / 12);
  const monthlyBasic = Math.round(monthlyGross * basicPercent);
  const monthlyHra = Math.round(monthlyGross * hraPercent);
  const monthlyOther = Math.max(0, monthlyGross - (monthlyBasic + monthlyHra));
  const monthlyPf = Math.round(monthlyBasic * 0.12);
  const monthlyPt = 200; // Standard PT
  const monthlyTds = activeMonths > 0 ? Math.round(annualTax / activeMonths) : 0;

  return FISCAL_MONTHS.map((monthName, idx) => {
    const fiscalMonthNum = idx + 1;
    const isEmployed = fiscalMonthNum >= joiningMonth;

    const gross = isEmployed ? monthlyGross : 0;
    const basic = isEmployed ? monthlyBasic : 0;
    const hra = isEmployed ? monthlyHra : 0;
    const other = isEmployed ? monthlyOther : 0;
    const pf = isEmployed ? monthlyPf : 0;
    const pt = isEmployed ? (monthName === 'February' ? 300 : monthlyPt) : 0;
    const tds = isEmployed ? monthlyTds : 0;
    const otherDeductions = 0;
    const totalDeductions = pf + pt + tds + otherDeductions;
    const netTakeHome = Math.max(0, gross - totalDeductions);

    return {
      monthIndex: fiscalMonthNum,
      monthName,
      financialYearMonth: `Month ${fiscalMonthNum} (${monthName})`,
      basicSalary: basic,
      hra,
      otherAllowances: other,
      grossPay: gross,
      pfDeduction: pf,
      professionalTax: pt,
      projectedTds: tds,
      otherDeductions,
      totalDeductions,
      netTakeHome,
      isPastMonth: false,
    };
  });
}
