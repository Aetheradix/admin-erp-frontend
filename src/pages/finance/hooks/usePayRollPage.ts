import { useMemo, useState } from 'react';
import {
  useGetAllSalarySlipsQuery,
  useCreateSalarySlipMutation,
} from '@/store/api/financeApiSlice';
import type { CreateSalarySlipPayload } from '@/store/api/financeApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export interface BreakdownItem {
  name: string;
  amount: number;
}

export interface PayrollRecord {
  id: number | string;
  employeeId: number | string;
  employeeName: string;
  position: string;
  base: number;
  bonus: number;
  total: number;
  date: string; // monthYear
  payPeriod?: string;
  paySlipNo?: string;
  accountNumber?: string;
  paidDays: number;
  lopDays: number;
  earnings: BreakdownItem[];
  deductions: BreakdownItem[];
  authorizedSignatory?: string;
  signatoryRole?: string;
  hrNote?: string;
}

export interface SalarySlipFormData {
  employeeId: number | string;
  employeeName: string;
  position?: string;
  monthYear: string;
  payPeriod?: string;
  paySlipNo?: string;
  accountNumber?: string;
  paidDays: number | string;
  lopDays?: number | string;
  basePay?: number;
  bonusPay?: number;
  earnings: BreakdownItem[];
  deductions: BreakdownItem[];
  authorizedSignatory?: string;
  signatoryRole?: string;
  hrNote?: string;
}

export interface PayrollStats {
  totalPayroll: number;
  totalBasePay: number;
  totalBonus: number;
  recordCount: number;
}

export const usePayrollPage = () => {
  // 1. Fetch Salary Slips Query
  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllSalarySlipsQuery();

  // 2. Create Salary Slip Mutation
  const [createSalarySlip, { isLoading: isCreatingSlip }] = useCreateSalarySlipMutation();

  // 3. Local UI States
  const [showSalarySlipForm, setShowSalarySlipForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);

  // 4. Memoized Formatting for Database Records
  const payrollRecords: PayrollRecord[] = useMemo(() => {
    const itemsList = rawData?.data || (Array.isArray(rawData) ? rawData : []);
    if (!Array.isArray(itemsList)) return [];

    return itemsList.map((item: any) => {
      const rawEarnings: BreakdownItem[] = Array.isArray(item.earnings) ? item.earnings : [];
      const rawDeductions: BreakdownItem[] = Array.isArray(item.deductions) ? item.deductions : [];

      const basePay = Number(
        item.base_amount ||
          item.basePay ||
          rawEarnings.find((e) => e.name?.toLowerCase().includes('basic'))?.amount ||
          0
      );

      const bonusPay = Number(
        item.bonus_amount ||
          item.bonusPay ||
          rawEarnings.find((e) => e.name?.toLowerCase().includes('bonus'))?.amount ||
          0
      );

      const netSalary = Number(item.total_amount || item.net_salary || item.netSalary || 0);
      const monthYear = String(item.month_year || item.monthYear || item.created_at || 'N/A');

      return {
        id: item.id || Date.now(),
        employeeId: item.employee_id || item.employeeId || item.user_id || '0',
        employeeName: item.employee_name || item.employeeName || 'Unnamed Employee',
        position: item.position || item.employee_position || 'Employee',
        base: basePay,
        bonus: bonusPay,
        total: netSalary,
        date: monthYear,
        payPeriod: item.pay_period || item.payPeriod || monthYear,
        paySlipNo: item.pay_slip_no || item.paySlipNo || `SLIP-${item.id}`,
        accountNumber: item.account_number || item.accountNumber || 'N/A',
        paidDays: Number(item.paid_days || item.paidDays || 0),
        lopDays: Number(item.lop_days || item.lopDays || 0),
        earnings: rawEarnings.length > 0 ? rawEarnings : [{ name: 'Basic Pay', amount: basePay }],
        deductions: rawDeductions,
        authorizedSignatory: item.authorized_signatory || item.authorizedSignatory,
        signatoryRole: item.signatory_role || item.signatoryRole,
        hrNote: item.hr_note || item.hrNote,
      };
    });
  }, [rawData]);

  // 5. Search Filtering
  const filteredPayroll = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return payrollRecords;

    return payrollRecords.filter((record) => {
      return (
        record.employeeName?.toLowerCase().includes(searchLower) ||
        record.position?.toLowerCase().includes(searchLower) ||
        record.date?.toLowerCase().includes(searchLower) ||
        String(record.total).includes(searchLower)
      );
    });
  }, [payrollRecords, searchQuery]);

  // 6. Summary Stats
  const stats: PayrollStats = useMemo(() => {
    return payrollRecords.reduce(
      (acc, curr) => {
        acc.totalPayroll += Number(curr.total || 0);
        acc.totalBasePay += Number(curr.base || 0);
        acc.totalBonus += Number(curr.bonus || 0);
        acc.recordCount += 1;
        return acc;
      },
      {
        totalPayroll: 0,
        totalBasePay: 0,
        totalBonus: 0,
        recordCount: 0,
      }
    );
  }, [payrollRecords]);

  // 7. Handler for Form Submit -> Triggers DB Insertion Network Call
  const handleCreateSalarySlip = async (formData: SalarySlipFormData) => {
    try {
      const safeEarnings = Array.isArray(formData.earnings) ? formData.earnings : [];
      const safeDeductions = Array.isArray(formData.deductions) ? formData.deductions : [];

      const totalEarnings = safeEarnings.reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const totalDeductions = safeDeductions.reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const netSalary = Math.max(0, totalEarnings - totalDeductions);

      const basePay =
        formData.basePay ??
        Number(safeEarnings.find((i) => i.name?.toLowerCase().includes('basic'))?.amount || 0);
      const bonusPay =
        formData.bonusPay ??
        Number(safeEarnings.find((i) => i.name?.toLowerCase().includes('bonus'))?.amount || 0);

      // Prevent NaN values by ensuring fallback to 0
      const parsedEmpId = Number(formData.employeeId) || 0;

      const payload: CreateSalarySlipPayload = {
        userId: parsedEmpId,
        employeeId: parsedEmpId,
        employeeName: formData.employeeName,
        position: formData.position || 'Employee',
        monthYear: formData.monthYear,
        payPeriod: formData.payPeriod || formData.monthYear,
        paySlipNo: formData.paySlipNo || `SLIP-${Date.now()}`,
        accountNumber: formData.accountNumber || 'N/A',
        paidDays: Number(formData.paidDays) || 0,
        lopDays: Number(formData.lopDays) || 0,
        basePay: basePay,
        bonusPay: bonusPay,
        netSalary: netSalary,
        earnings: safeEarnings,
        deductions: safeDeductions,
        authorizedSignatory: formData.authorizedSignatory,
        signatoryRole: formData.signatoryRole,
        hrNote: formData.hrNote,
      };

      // Direct RTK Query Mutation Call
      const response = await createSalarySlip(payload).unwrap();

      setShowSalarySlipForm(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Salary slip created successfully in the database.',
        life: 3000,
      });

      return response;
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to create salary slip:', err);

      showToast({
        severity: 'error',
        summary: 'Creation Error',
        detail: apiError.data?.message || 'Failed to create salary slip record.',
        life: 3000,
      });

      throw err;
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
  };

  const openSlipDetail = (record: PayrollRecord) => {
    setSelectedSlip(record);
    setShowSlipModal(true);
  };

  const closeSlipDetail = () => {
    setSelectedSlip(null);
    setShowSlipModal(false);
  };

  return {
    // Data & Metrics
    payrollRecords,
    filteredPayroll,
    stats,

    // Query States
    isLoading,
    isFetching,
    isCreatingSlip,
    isError,
    error,

    // Actions & Mutation
    handleCreateSalarySlip,
    refetch,

    // Form Modal State
    showSalarySlipForm,
    setShowSalarySlipForm,

    // Detail Modal State
    selectedSlip,
    setSelectedSlip,
    showSlipModal,
    setShowSlipModal,
    openSlipDetail,
    closeSlipDetail,

    // Search & Helpers
    searchQuery,
    setSearchQuery,
    resetFilters,
  };
};
