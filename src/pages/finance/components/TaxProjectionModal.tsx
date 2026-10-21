import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Printer,
  Calculator,
  User,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  Wallet,
  Loader2,
} from 'lucide-react';
import {
  calculateTaxForEmployee,
  compareRegimes,
  generateMonthlyProjectionSchedule,
  type TaxRegime,
  type TaxCalculationResult,
  type RegimeComparison,
} from '@/utils/taxCalculation';
import { useGetUsersQuery } from '@/store/api/userSlice';
import {
  useGetTaxProjectionQuery,
  useGetMyTaxProjectionQuery,
  useSimulateTaxProjectionMutation,
  type TaxProjectionResponse,
} from '@/store/api/financeApiSlice';

export interface TaxProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmployee?: any;
  isSelfService?: boolean;
}

export const TaxProjectionModal: React.FC<TaxProjectionModalProps> = ({
  isOpen,
  onClose,
  initialEmployee,
  isSelfService = false,
}) => {
  const { data: usersData } = useGetUsersQuery(undefined, { skip: isSelfService });
  const usersList: any[] = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    if (usersData && Array.isArray((usersData as any).data)) return (usersData as any).data;
    return [];
  }, [usersData]);

  // Selected Employee
  const [selectedUserId, setSelectedUserId] = useState<string | number>(() => {
    if (initialEmployee?.userId || initialEmployee?.user_id) {
      return initialEmployee.userId || initialEmployee.user_id;
    }
    if (initialEmployee?.id) return initialEmployee.id;
    return '';
  });

  // Find active employee record
  const currentEmployee = useMemo(() => {
    if (selectedUserId && usersList.length > 0) {
      const match = usersList.find(
        (u) =>
          String(u.id) === String(selectedUserId) ||
          String(u.employeeId) === String(selectedUserId) ||
          String(u.employee_id) === String(selectedUserId) ||
          String(u.employee_code) === String(selectedUserId)
      );
      if (match) return match;
    }
    return initialEmployee || (usersList.length > 0 ? usersList[0] : null);
  }, [selectedUserId, usersList, initialEmployee]);

  // Derive parameters from current employee
  const annualGrossFromEmp = useMemo(() => {
    if (!currentEmployee) return 1200000;
    const ctc =
      currentEmployee.totalCompensation ||
      currentEmployee.total_compensation ||
      currentEmployee.annualCtc ||
      currentEmployee.annual_ctc;
    if (ctc && Number(ctc) > 0) return Number(ctc);

    const baseSalary =
      currentEmployee.base_salary ||
      currentEmployee.basic_salary ||
      currentEmployee.base ||
      currentEmployee.salary;
    if (baseSalary && Number(baseSalary) > 0) {
      return Number(baseSalary) * 12 * 2;
    }
    return 1200000;
  }, [currentEmployee]);

  // Form State
  const [annualGross, setAnnualGross] = useState<number>(annualGrossFromEmp);
  const [activeRegime, setActiveRegime] = useState<TaxRegime>(
    (currentEmployee?.taxRegime || currentEmployee?.tax_regime || 'New Regime') as TaxRegime
  );
  const financialYear = '2026-2027';
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [isMidYearJoiner, setIsMidYearJoiner] = useState<boolean>(
    Boolean(currentEmployee?.isMidYearJoiner ?? currentEmployee?.is_mid_year_joiner)
  );

  const prevYtd = currentEmployee?.previousEmployerYtd || currentEmployee?.previous_employer_ytd || {};
  const [prevGross, setPrevGross] = useState<number>(Number(prevYtd.grossPay || 0));
  const [prevTds, setPrevTds] = useState<number>(Number(prevYtd.tdsDeducted || 0));
  const [prevPf, setPrevPf] = useState<number>(Number(prevYtd.pfDeducted || 0));

  // Sync when currentEmployee changes
  useEffect(() => {
    if (currentEmployee) {
      const ctc =
        currentEmployee.totalCompensation ||
        currentEmployee.total_compensation ||
        currentEmployee.annualCtc ||
        currentEmployee.annual_ctc;
      if (ctc && Number(ctc) > 0) {
        setAnnualGross(Number(ctc));
      }
      if (currentEmployee.taxRegime || currentEmployee.tax_regime) {
        const r = currentEmployee.taxRegime || currentEmployee.tax_regime;
        setActiveRegime(r === 'old' || r === 'Old Regime' ? 'Old Regime' : 'New Regime');
      }
      const isMid = Boolean(currentEmployee.isMidYearJoiner ?? currentEmployee.is_mid_year_joiner);
      setIsMidYearJoiner(isMid);
      const ytd = currentEmployee.previousEmployerYtd || currentEmployee.previous_employer_ytd || {};
      setPrevGross(Number(ytd.grossPay || 0));
      setPrevTds(Number(ytd.tdsDeducted || 0));
      setPrevPf(Number(ytd.pfDeducted || 0));
    }
  }, [currentEmployee]);

  // Backend API Queries
  const targetUserId = isSelfService ? undefined : (selectedUserId || currentEmployee?.id);
  const regimeParam = activeRegime === 'Old Regime' ? 'old' : 'new';

  const { data: adminProjectionData, isFetching: isFetchingAdminProj } = useGetTaxProjectionQuery(
    {
      userId: targetUserId!,
      financialYear,
      regime: regimeParam,
    },
    { skip: !isOpen || isSelfService || !targetUserId }
  );

  const { data: myProjectionData, isFetching: isFetchingMyProj } = useGetMyTaxProjectionQuery(
    { financialYear, regime: regimeParam },
    { skip: !isOpen || !isSelfService }
  );

  const [simulateTax, { data: simulatedData }] = useSimulateTaxProjectionMutation();

  // Active projection payload from API
  const activeBackendData: TaxProjectionResponse | undefined = useMemo(() => {
    if (simulatedData) return simulatedData;
    if (isSelfService) return myProjectionData;
    return adminProjectionData;
  }, [simulatedData, isSelfService, myProjectionData, adminProjectionData]);

  // Fallback / Instant local calculations
  const taxParams = useMemo(() => {
    return {
      annualGrossSalary: annualGross,
      basicSalary: Math.round(annualGross * 0.4),
      regime: activeRegime,
      deduction80C,
      deduction80D,
      hraExemption,
      isMidYearJoiner,
      previousEmployerYtd: isMidYearJoiner
        ? { grossPay: prevGross, tdsDeducted: prevTds, pfDeducted: prevPf }
        : undefined,
    };
  }, [annualGross, activeRegime, deduction80C, deduction80D, hraExemption, isMidYearJoiner, prevGross, prevTds, prevPf]);

  const clientTaxResult: TaxCalculationResult = useMemo(() => {
    return calculateTaxForEmployee(taxParams);
  }, [taxParams]);

  const clientComparison: RegimeComparison = useMemo(() => {
    return compareRegimes({
      annualGrossSalary: annualGross,
      basicSalary: Math.round(annualGross * 0.4),
      deduction80C,
      deduction80D,
      hraExemption,
      isMidYearJoiner,
      previousEmployerYtd: isMidYearJoiner
        ? { grossPay: prevGross, tdsDeducted: prevTds, pfDeducted: prevPf }
        : undefined,
    });
  }, [annualGross, deduction80C, deduction80D, hraExemption, isMidYearJoiner, prevGross, prevTds, prevPf]);

  // Trigger backend simulator when parameters change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      simulateTax({
        annualGrossSalary: annualGross,
        regime: regimeParam,
        financialYear,
        section80c: deduction80C,
        section80d: deduction80D,
        hraExemption,
        isMidYearJoiner,
        previousEmployerGross: prevGross,
        previousEmployerTds: prevTds,
        previousEmployerPf: prevPf,
      }).catch(() => {
        // Silently use client fallback
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [annualGross, regimeParam, deduction80C, deduction80D, hraExemption, isMidYearJoiner, prevGross, prevTds, prevPf, isOpen, simulateTax]);

  // Extract display metrics (prioritizing backend when available)
  const totalGrossIncome =
    activeBackendData?.taxCalculation?.totalGrossIncome ?? clientTaxResult.totalCumulativeGross;
  const netTaxableIncome =
    activeBackendData?.taxCalculation?.netTaxableIncome ?? clientTaxResult.netTaxableIncome;
  const totalAnnualTax =
    activeBackendData?.taxCalculation?.totalAnnualTax ?? clientTaxResult.totalAnnualTax;
  const projectedPeriodicTds =
    activeBackendData?.taxCalculation?.projectedPeriodicTds ?? clientTaxResult.projectedMonthlyTds;
  const standardDeduction =
    activeBackendData?.taxCalculation?.exemptionsAndDeductions?.standardDeduction ??
    clientTaxResult.standardDeduction;
  const totalExemptions =
    activeBackendData?.taxCalculation?.exemptionsAndDeductions?.totalDeductions ??
    clientTaxResult.totalExemptionsAndDeductions;

  // Expected monthly pay card
  const expectedMonthlyPay = activeBackendData?.expectedMonthlyPay ?? {
    grossPay: Math.round(annualGross / 12),
    deductions: {
      employeePf: Math.round((annualGross * 0.4 * 0.12) / 12),
      professionalTax: 200,
      incomeTaxTds: projectedPeriodicTds,
      totalDeductions: Math.round((annualGross * 0.4 * 0.12) / 12 + 200 + projectedPeriodicTds),
    },
    netTakeHomePay: Math.round(
      annualGross / 12 - ((annualGross * 0.4 * 0.12) / 12 + 200 + projectedPeriodicTds)
    ),
  };

  // Regime comparison
  const comparison = activeBackendData?.regimeComparison
    ? {
        recommendedRegime:
          activeBackendData.regimeComparison.recommendedRegime === 'old'
            ? ('Old Regime' as TaxRegime)
            : ('New Regime' as TaxRegime),
        taxDifference: activeBackendData.regimeComparison.annualSavings,
        savingsMessage: activeBackendData.regimeComparison.explanation,
      }
    : clientComparison;

  // Monthly Schedule (12 months from backend or client generator)
  const monthlyScheduleRows = useMemo(() => {
    if (activeBackendData?.monthlySchedule && activeBackendData.monthlySchedule.length > 0) {
      return activeBackendData.monthlySchedule.map((row) => ({
        monthName: row.monthName,
        year: row.year,
        status: row.status,
        basicSalary: row.basicSalary,
        hra: row.hra,
        otherAllowances: row.specialAllowance,
        grossPay: row.grossPay,
        pfDeduction: row.employeePf,
        professionalTax: row.professionalTax,
        projectedTds: row.incomeTaxTds,
        netTakeHome: row.netPay,
        cumulativeGross: row.cumulativeGross,
        cumulativeTds: row.cumulativeTds,
      }));
    }

    return generateMonthlyProjectionSchedule(
      annualGross,
      totalAnnualTax,
      isMidYearJoiner ? 7 : 1
    );
  }, [activeBackendData, annualGross, totalAnnualTax, isMidYearJoiner]);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const empName =
    activeBackendData?.employee?.name ||
    currentEmployee?.employeeName ||
    currentEmployee?.username ||
    currentEmployee?.name ||
    'Employee';
  const empCode =
    activeBackendData?.employee?.employeeCode ||
    currentEmployee?.employeeCode ||
    currentEmployee?.employee_code ||
    currentEmployee?.employeeId ||
    currentEmployee?.id ||
    'EMP-001';
  const designation =
    activeBackendData?.employee?.designation ||
    currentEmployee?.position ||
    currentEmployee?.designation ||
    currentEmployee?.role ||
    'Specialist';
  const panNumber =
    activeBackendData?.employee?.panNumber ||
    currentEmployee?.panNumber ||
    currentEmployee?.pan_number ||
    'ABCDE1234F';

  const isDataLoading = isFetchingAdminProj || isFetchingMyProj;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Statutory Tax Projection Sheet</h2>
                <span className="text-[11px] font-bold bg-white/10 text-white/90 px-2 py-0.5 rounded border border-white/10">
                  FY {financialYear}
                </span>
                {isDataLoading && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Loader2 size={13} className="animate-spin" /> Loading...
                  </span>
                )}
                {isSelfService && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Self-Service
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Annual tax projection for <span className="text-white font-bold">{empName}</span> ({empCode}) • Monthly TDS & statutory exemptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6" ref={printRef}>
          {/* Top Controls: Employee Selector & Regime Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Employee Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-primary" /> Employee Profile
              </label>
              {!isSelfService ? (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary">
                  {usersList.map((u) => {
                    const name = u.username || u.name || u.employeeName || 'Staff';
                    const code = u.employee_code || u.employeeId || u.id;
                    return (
                      <option key={u.id} value={u.id}>
                        {name} ({code})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800">
                  {empName} ({empCode})
                </div>
              )}
              <span className="text-[11px] text-slate-500 mt-1 block">
                {designation} • PAN: <span className="font-mono font-bold">{panNumber}</span>
              </span>
            </div>

            {/* Total Annual Compensation (CTC) Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calculator size={14} className="text-primary" /> Total Annual Compensation (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={annualGross}
                  onChange={(e) => setAnnualGross(Number(e.target.value || 0))}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Monthly Gross: ₹{Math.round(annualGross / 12).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Tax Regime Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Chosen Tax Regime
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRegime('New Regime')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                    activeRegime === 'New Regime'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}>
                  New Regime (12L Nil)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRegime('Old Regime')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                    activeRegime === 'Old Regime'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}>
                  Old Regime (80C/HRA)
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard Deduction: ₹{standardDeduction.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Regime Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Regime Recommendation: {comparison.recommendedRegime}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {comparison.taxDifference > 0
                      ? `Saves ₹${comparison.taxDifference.toLocaleString('en-IN')} / year`
                      : 'Equal Tax'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{comparison.savingsMessage}</p>
              </div>
            </div>

            {activeRegime !== comparison.recommendedRegime && (
              <button
                type="button"
                onClick={() => setActiveRegime(comparison.recommendedRegime)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs">
                Switch to {comparison.recommendedRegime}
              </button>
            )}
          </div>

          {/* Expected Monthly Take-Home Pay & KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Expected Monthly Pay Card */}
            <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-xs md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet size={13} /> Expected Monthly Take-Home Pay
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">
                    Net Take-Home
                  </span>
                </div>
                <span className="text-2xl font-black font-mono">
                  ₹{Number(expectedMonthlyPay.netTakeHomePay || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </span>
                <span className="text-[11px] text-emerald-100 block mt-0.5">
                  Gross Pay: ₹{Number(expectedMonthlyPay.grossPay || 0).toLocaleString('en-IN')} / month
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-400/40 grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-emerald-100 block">PF (12%)</span>
                  <span className="font-mono font-bold">
                    ₹{Number(expectedMonthlyPay.deductions?.employeePf || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-100 block">Prof. Tax</span>
                  <span className="font-mono font-bold">
                    ₹{Number(expectedMonthlyPay.deductions?.professionalTax || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-100 block">Projected TDS</span>
                  <span className="font-mono font-bold">
                    ₹{Number(expectedMonthlyPay.deductions?.incomeTaxTds || projectedPeriodicTds).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Gross Income */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Annual Gross
                </span>
                <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
                  ₹{Number(totalGrossIncome).toLocaleString('en-IN')}
                </span>
              </div>
              {isMidYearJoiner && prevGross > 0 && (
                <span className="text-[10px] font-medium text-slate-500 block mt-1">
                  Includes ₹{prevGross.toLocaleString('en-IN')} prev. employer
                </span>
              )}
            </div>

            {/* Exemptions & Deductions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Exemptions & Deductions
                </span>
                <span className="text-lg font-black text-emerald-600 font-mono mt-1 block">
                  ₹{Number(totalExemptions).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 block mt-1">
                Standard ₹{standardDeduction.toLocaleString('en-IN')} + PF/NPS
              </span>
            </div>

            {/* Net Annual Tax Liability */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Annual Tax
                </span>
                <span className="text-xl font-black text-white font-mono mt-1 block">
                  ₹{Number(totalAnnualTax).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 block mt-1">
                Monthly TDS: ₹{Number(projectedPeriodicTds).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Section: Slabs Breakdown & Deductions Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slab Calculation Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator size={15} className="text-primary" /> Progressive Slabs ({activeRegime})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Taxable Income: ₹{Number(netTaxableIncome).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2">Income Slab</th>
                      <th className="py-2 text-right">Tax Rate</th>
                      <th className="py-2 text-right">Taxable in Slab</th>
                      <th className="py-2 text-right">Tax Computed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(activeBackendData?.taxCalculation?.slabs || clientTaxResult.slabs).map((slab: any, i: number) => {
                      const slabLabel = slab.slab || slab.slabLabel;
                      const rateText = slab.ratePercentage || `${Math.round((slab.rate || 0) * 100)}%`;
                      const taxable = slab.taxableAmount ?? slab.taxableInSlab ?? 0;
                      const taxVal = slab.tax ?? slab.taxAmount ?? 0;

                      return (
                        <tr key={i} className={taxVal > 0 ? 'bg-slate-50/50' : ''}>
                          <td className="py-2">{slabLabel}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-600">
                            {rateText}
                          </td>
                          <td className="py-2 text-right font-mono">
                            ₹{Number(taxable).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            ₹{Number(taxVal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 text-slate-900 text-xs font-bold">
                    <tr>
                      <td colSpan={3} className="py-2">
                        Gross Tax before Rebate:
                      </td>
                      <td className="py-2 text-right font-mono">
                        ₹{Number(activeBackendData?.taxCalculation?.grossTaxBeforeRebate ?? clientTaxResult.baseTaxBeforeRebate).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {((activeBackendData?.taxCalculation?.section87aRebate ?? clientTaxResult.rebate87A) > 0) && (
                      <tr className="text-emerald-600">
                        <td colSpan={3} className="py-1">
                          Less: Rebate u/s 87A:
                        </td>
                        <td className="py-1 text-right font-mono">
                          - ₹{Number(activeBackendData?.taxCalculation?.section87aRebate ?? clientTaxResult.rebate87A).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="py-1">
                        Add: Health & Education Cess (4%):
                      </td>
                      <td className="py-1 text-right font-mono">
                        + ₹{Number(activeBackendData?.taxCalculation?.cessAmount ?? clientTaxResult.healthAndEducationCess).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 text-sm font-black">
                      <td colSpan={3} className="py-2 text-slate-900">
                        Total Annual Tax Liability:
                      </td>
                      <td className="py-2 text-right font-mono text-primary">
                        ₹{Number(totalAnnualTax).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {isMidYearJoiner && prevTds > 0 && (
                      <tr className="text-indigo-600 text-xs">
                        <td colSpan={3} className="py-1">
                          Less: Previous Employer TDS Credit:
                        </td>
                        <td className="py-1 text-right font-mono">
                          - ₹{Number(prevTds).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Statutory Exemptions & Mid-Year Data Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-600" /> Deductions & Exemptions Detail
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Statutory Compliant
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Standard Deduction (Statutory)</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{Number(standardDeduction).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Employer PF Contribution (Exempt)</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{Number(activeBackendData?.annualCompensation?.employerContributions?.employerPf?.annual ?? clientTaxResult.employerPfDeduction).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Section 80CCD(2) Employer NPS</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{Number(activeBackendData?.annualCompensation?.employerContributions?.employerNps?.annual ?? clientTaxResult.employerNpsDeduction).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {activeRegime === 'Old Regime' && (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Section 80C (PPF, EPF, ELSS)</span>
                        <input
                          type="number"
                          value={deduction80C}
                          onChange={(e) => setDeduction80C(Number(e.target.value || 0))}
                          className="w-24 text-right font-mono font-bold text-slate-900 border rounded px-1.5 py-0.5 text-xs"
                        />
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Section 80D (Health Insurance)</span>
                        <input
                          type="number"
                          value={deduction80D}
                          onChange={(e) => setDeduction80D(Number(e.target.value || 0))}
                          className="w-24 text-right font-mono font-bold text-slate-900 border rounded px-1.5 py-0.5 text-xs"
                        />
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">HRA Exemption (Sec 10(13A))</span>
                        <input
                          type="number"
                          value={hraExemption}
                          onChange={(e) => setHraExemption(Number(e.target.value || 0))}
                          className="w-24 text-right font-mono font-bold text-slate-900 border rounded px-1.5 py-0.5 text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mid-Year Joiner YTD Summary Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <User size={13} className="text-indigo-600" /> Mid-Year Joiner YTD Status
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isMidYearJoiner ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                    {isMidYearJoiner ? 'Mid-Year Joiner' : 'Full Year'}
                  </span>
                </div>

                {isMidYearJoiner ? (
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Prev. Gross</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{prevGross.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prev. TDS Credit</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ₹{prevTds.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prev. PF</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{prevPf.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Employee joined at beginning of financial year or previous employer data not applicable.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Month-by-Month Expected Pay & Tax Schedule (12 Months) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={15} className="text-primary" /> Month-by-Month Expected Pay & Tax Schedule
                </span>
                <p className="text-[11px] text-slate-500">
                  Standard employer projection showing expected monthly compensation, statutory PF, PT, and progressive TDS deductions.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Basic (40%)</th>
                    <th className="py-2.5 px-3 text-right">HRA</th>
                    <th className="py-2.5 px-3 text-right">Allowances</th>
                    <th className="py-2.5 px-3 text-right font-black text-slate-900">Gross Pay</th>
                    <th className="py-2.5 px-3 text-right">PF (12%)</th>
                    <th className="py-2.5 px-3 text-right">Prof. Tax</th>
                    <th className="py-2.5 px-3 text-right font-black text-primary">TDS (Tax)</th>
                    <th className="py-2.5 px-3 text-right font-black text-emerald-600">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {monthlyScheduleRows.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{row.monthName}</span>
                        {row.status === 'actual' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        ₹{Number(row.basicSalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        ₹{Number(row.hra || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        ₹{Number(row.otherAllowances || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{Number(row.grossPay || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        ₹{Number(row.pfDeduction || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        ₹{Number(row.professionalTax || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-primary">
                        ₹{Number(row.projectedTds || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-emerald-600">
                        ₹{Number(row.netTakeHome || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-black text-slate-900 text-xs">
                  <tr>
                    <td className="py-2.5 px-3">ANNUAL TOTALS</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.basicSalary || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.hra || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.otherAllowances || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.grossPay || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.pfDeduction || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.professionalTax || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-primary">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.projectedTds || 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                      ₹{monthlyScheduleRows.reduce((s: number, r: any) => s + Number(r.netTakeHome || 0), 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-slate-400" />
            <span>
              Generated in accordance with Indian Income Tax Act guidelines for FY {financialYear}.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition">
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs">
              <Download size={14} /> Download Projection PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxProjectionModal;
