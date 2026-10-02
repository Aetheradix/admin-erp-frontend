import { useMemo, useState } from 'react';
import {
  useGetSalarySlipsQuery,
  useUploadSalarySlipMutation,
} from '@/store/api/uploadSlice'; // Adjust import path to match your slice location
import { showToast } from '@/components/ui/composed/Toast.utils'; // Adjust import path

// =========================================================
// TYPES & INTERFACES
// =========================================================

export interface PayrollRecord {
  id: number | string;
  employeeId?: number;
  employeeName: string;
  position?: string;
  base: number;
  bonus: number;
  total: number;
  date: string;
  salarySlipUrl?: string;
  paidDays?: number;
  earnings?: Array<{ name: string; amount: number }>;
  deductions?: Array<{ name: string; amount: number }>;
}

export interface SalarySlipData {
  employeeId: number | string;
  employeeName: string;
  monthYear: string;
  paidDays: number;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
}

export interface PayrollStats {
  totalPayroll: number;
  totalBasePay: number;
  totalBonus: number;
  recordCount: number;
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export const usePayrollPage = (userId?: number | string) => {
  // ---------------------------------------------------------
  // RTK QUERY HOOKS
  // ---------------------------------------------------------
  const {
    data: salarySlipsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSalarySlipsQuery(userId ?? '', {
    skip: !userId, // Skip execution if no userId is supplied
  });

  const [uploadSalarySlip, { isLoading: isUploadingPdf }] =
    useUploadSalarySlipMutation();

  // ---------------------------------------------------------
  // LOCAL UI STATE
  // ---------------------------------------------------------
  const [showSalarySlipForm, setShowSalarySlipForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);

  // ---------------------------------------------------------
  // MAP API DATA TO LOCAL RECORD TYPE
  // ---------------------------------------------------------
  const payrollRecords: PayrollRecord[] = useMemo(() => {
    if (!salarySlipsData?.data) return [];

    return salarySlipsData.data.map((item: any) => ({
      id: item.id,
      employeeId: item.user_id,
      employeeName: item.employee_name || 'Unnamed Employee',
      position: item.position || 'Employee',
      base: Number(item.base_amount || 0),
      bonus: Number(item.bonus_amount || 0),
      total: Number(item.net_salary || item.total_amount || 0),
      date: item.month_year || item.created_at || 'N/A',
      salarySlipUrl: item.salary_slip_url,
      paidDays: item.paid_days || 0,
    }));
  }, [salarySlipsData]);

  // ---------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // FINANCIAL METRICS & SUMMARY
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // ACTION HANDLERS
  // ---------------------------------------------------------
  const handleUploadSalarySlip = async (payload: {
    file: Blob;
    employeeId: number;
    employeeName: string;
    monthYear: string;
    netSalary: number;
    paidDays: number;
  }) => {
    try {
      const response = await uploadSalarySlip({
        file: payload.file,
        userId: payload.employeeId,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        monthYear: payload.monthYear,
        netSalary: payload.netSalary,
        paidDays: payload.paidDays,
      }).unwrap();

      setShowSalarySlipForm(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Salary slip uploaded and created successfully.',
        life: 3000,
      });

      return response;
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to upload salary slip:', err);

      showToast({
        severity: 'error',
        summary: 'Upload Error',
        detail: apiError.data?.message || 'Failed to create salary slip.',
        life: 3000,
      });

      throw err;
    }
  };

  // ---------------------------------------------------------
  // UTILITY HELPERS
  // ---------------------------------------------------------
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
    isUploadingPdf,
    isError,
    error,

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

    // Handlers
    handleUploadSalarySlip,
    refetch,
  };
};