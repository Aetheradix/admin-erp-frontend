import type { Reimbursement } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapReimbursement } from './mappers';

export type { Reimbursement };

export interface UpdateStatusPayload {
  id: string | number;
  status: string;
  rejectionReason?: string;
}

export interface SalaryBreakdownItem {
  name: string;
  amount: number;
}

export interface CreateSalarySlipPayload {
  // Target Employee (Recipient receiving slip)
  user_id: number;

  // Creator (Admin/HR issuing the slip)
  created_by?: number | null;

  // Pay Period & Schedule
  month_year: string; // e.g., "OCTOBER 2026"
  pay_frequency?: string; // "monthly", "biweekly", etc.
  cycle_number?: number; // 1 or 2 (for biweekly)

  // Attendance
  paid_days: number;
  lop_days: number;
  totalWorkingDays?: number;

  // Optional Employee Profile Overrides (falls back to DB user record if omitted)
  employee_code?: string | null;
  designation?: string | null; // Maps to position
  department?: string | null;
  pan_number?: string | null;
  bank_account_number?: string | null;

  // Financial Breakdown Arrays
  earnings: SalaryBreakdownItem[];
  deductions: SalaryBreakdownItem[];

  // Parsed Numerical Breakdown
  basicSalary?: number;
  houseRentAllowance?: number;
  specialAllowance?: number;
  conveyanceAllowance?: number;
  bonus?: number;
  otherEarnings?: number;
  providentFund?: number;
  professionalTax?: number;
  incomeTaxTds?: number;
  otherDeductions?: number;

  // Metadata & Status
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentDate?: string;
  remarks?: string | null; // Maps to hrNote
}

export interface EmployeeCompensationPayload {
  userId: number;
  ctcAnnual: number;
  taxRegime: 'new' | 'old' | string;
  payFrequency?: string;
  effectiveDate?: string;
  isMidYearJoiner?: boolean;
  previousEmployerGross?: number;
  previousEmployerTds?: number;
  previousEmployerPf?: number;
  previousEmployerStandardDeduction?: number;
  section80c?: number;
  section80d?: number;
  hraExemption?: number;
}

export interface TaxProjectionResponse {
  employee?: {
    name: string;
    employeeCode: string;
    department: string;
    designation: string;
    panNumber: string;
  };
  financialYear: string;
  selectedRegime: string;
  annualCompensation: {
    ctcAnnual: number;
    grossSalaryAnnual: number;
    grossSalaryMonthly: number;
    components: {
      basicSalary: { annual: number; monthly: number };
      houseRentAllowance: { annual: number; monthly: number };
      specialAllowance: { annual: number; monthly: number };
      [key: string]: { annual: number; monthly: number };
    };
    employerContributions: {
      employerPf: { annual: number; monthly: number };
      employerNps?: { annual: number; monthly: number };
      [key: string]: { annual: number; monthly: number } | undefined;
    };
  };
  expectedMonthlyPay: {
    grossPay: number;
    deductions: {
      employeePf: number;
      professionalTax: number;
      incomeTaxTds: number;
      totalDeductions: number;
    };
    netTakeHomePay: number;
  };
  taxCalculation: {
    totalGrossIncome: number;
    exemptionsAndDeductions: {
      standardDeduction: number;
      employerPf: number;
      employerNps?: number;
      totalDeductions: number;
    };
    netTaxableIncome: number;
    slabs: Array<{
      slab: string;
      ratePercentage: string;
      taxableAmount: number;
      tax: number;
    }>;
    grossTaxBeforeRebate: number;
    section87aRebate: number;
    cessPercent: number;
    cessAmount: number;
    totalAnnualTax: number;
    credits: {
      previousEmployerTds: number;
      currentEmployerYtdTds: number;
      totalTdsAlreadyPaid: number;
    };
    netRemainingTax: number;
    remainingPeriods: number;
    projectedPeriodicTds: number;
  };
  regimeComparison: {
    newRegime: { taxableIncome: number; annualTax: number };
    oldRegime: { taxableIncome: number; annualTax: number };
    recommendedRegime: string;
    annualSavings: number;
    explanation: string;
  };
  monthlySchedule: Array<{
    sequence: number;
    monthName: string;
    year: number;
    status: 'actual' | 'projected' | string;
    grossPay: number;
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    employeePf: number;
    professionalTax: number;
    incomeTaxTds: number;
    totalDeductions: number;
    netPay: number;
    cumulativeGross: number;
    cumulativeTds: number;
    cumulativeNet: number;
  }>;
}

export interface PayrollAdjustmentPayload {
  userId: number;
  payrollType?: 'adjustment' | string;
  adjustmentType: string;
  adjustmentAmount: number;
  adjustmentReason: string;
  referencePeriod?: string;
  referenceSalarySlipId?: number;
  payFrequency?: string;
  month?: number;
  year?: number;
  cycleNumber?: number;
}

// Helper to normalize and map flat DB records into structured template data
const mapSalarySlipResponse = (payload: any) => {
  const normalize = (slip: any) => {
    if (!slip) return slip;
    return {
      ...slip,
      employeeName: slip.username || slip.employeeName,
      paySlipNo: slip.payslipNo || slip.pay_slip_no,
      earnings: [
        { name: 'Basic Salary', amount: Number(slip.basic_salary || 0) },
        { name: 'House Rent Allowance (HRA)', amount: Number(slip.house_rent_allowance || 0) },
        { name: 'Special Allowance', amount: Number(slip.special_allowance || 0) },
        { name: 'Conveyance Allowance', amount: Number(slip.conveyance_allowance || 0) },
        { name: 'Bonus', amount: Number(slip.bonus || 0) },
        { name: 'Other Earnings', amount: Number(slip.other_earnings || 0) },
      ],
      deductions: [
        { name: 'Provident Fund (PF)', amount: Number(slip.provident_fund || 0) },
        { name: 'Professional Tax', amount: Number(slip.professional_tax || 0) },
        { name: 'Income Tax (TDS)', amount: Number(slip.income_tax_tds || 0) },
        { name: 'Other Deductions', amount: Number(slip.other_deductions || 0) },
      ],
    };
  };

  if (Array.isArray(payload)) {
    return payload.map(normalize);
  }
  return normalize(payload);
};

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all reimbursements
    getReimbursements: builder.query<Reimbursement[], void>({
      query: () => '/reimbursements/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reimbursements' as const, id })),
              { type: 'Reimbursements', id: 'LIST' },
            ]
          : [{ type: 'Reimbursements', id: 'LIST' }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapReimbursement(item as Record<string, unknown>))
          : [];
      },
    }),

    // Fetch single reimbursement by ID
    getReimbursementById: builder.query<Reimbursement, string | number>({
      query: (id) => `/reimbursements/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Reimbursements', id }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown })?.data ?? response;
        return mapReimbursement(data as Record<string, unknown>);
      },
    }),

    // Create a reimbursement claim
    createReimbursement: builder.mutation<
      Reimbursement,
      FormData | Partial<Omit<Reimbursement, 'id' | 'created_at' | 'updated_at' | 'approved_at'>>
    >({
      query: (data) => ({
        url: '/reimbursements/create-claim',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown })?.data ?? response;
        return mapReimbursement(data as Record<string, unknown>);
      },
      invalidatesTags: [{ type: 'Reimbursements', id: 'LIST' }],
    }),

    // Update reimbursement status
    updateReimbursementStatus: builder.mutation<Reimbursement, UpdateStatusPayload>({
      query: ({ id, status, rejectionReason }) => ({
        url: `/reimbursements/${id}/status`,
        method: 'PATCH',
        body: {
          status,
          ...(rejectionReason ? { rejection_reason: rejectionReason, rejectionReason } : {}),
        },
      }),
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown })?.data ?? response;
        return mapReimbursement(data as Record<string, unknown>);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Reimbursements', id },
        { type: 'Reimbursements', id: 'LIST' },
      ],
    }),

    // Delete reimbursement claim
    deleteReimbursement: builder.mutation<
      { success: boolean; id: string | number },
      string | number
    >({
      query: (id) => ({
        url: `/reimbursements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Reimbursements', id },
        { type: 'Reimbursements', id: 'LIST' },
      ],
    }),
    
    // Fetch all salary slips
    getAllSalarySlips: builder.query<any, void>({
      query: () => '/finance/salary-slips',
      transformResponse: (response: any) => {
        const payload = response?.data ?? response?.result ?? response;
        return mapSalarySlipResponse(payload);
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((item: any) => ({ type: 'SalarySlips' as const, id: item.id })),
              { type: 'SalarySlips', id: 'LIST' },
            ]
          : [{ type: 'SalarySlips', id: 'LIST' }],
    }),

    // Fetch single salary slip by slip ID
    getSalarySlipById: builder.query<any, string | number>({
      query: (id) => `/finance/salary-slips/${id}`,
      transformResponse: (response: any) => {
        const payload = response?.data ?? response?.result ?? response;
        const mapped = mapSalarySlipResponse(payload);
        return Array.isArray(mapped) ? mapped : [mapped];
      },
      providesTags: (_result, _error, id) => [{ type: 'SalarySlips', id }],
    }),

    // Fetch salary slips by employee ID
    getSalarySlipsByEmployeeId: builder.query<any, string | number>({
      query: (employeeId) => `/finance/salary-slips/employee/${employeeId}`,
      transformResponse: (response: any) => {
        const payload = response?.data ?? response?.result ?? response;
        return mapSalarySlipResponse(payload);
      },
      providesTags: (_result, _error, employeeId) => [
        { type: 'SalarySlips', id: `EMP-${employeeId}` },
      ],
    }),

    createSalarySlip: builder.mutation<any, any>({
      query: (payload) => {
        const formattedPayload = {
          ...payload,
          user_id: payload.user_id || payload.userId,
        };
        return {
          url: '/finance/create-salary-slip',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: formattedPayload,
        };
      },
      // 💡 Automatically invalidates both SalarySlips and ActivityLogs so both tables update!
      invalidatesTags: [{ type: 'SalarySlips', id: 'LIST' }, 'ActivityLogs'],
    }),

    // Salary Slip Audit Logs (Activity Logs)
    getSalarySlipAuditLogs: builder.query<any, void>({
      query: () => '/finance/audit-logs?type=salary_slip',
      transformResponse: (response: any) => {
        return response?.data ?? response?.result ?? response ?? [];
      },
      providesTags: ['ActivityLogs'],
    }),

    // Invoice Audit Logs (Dedicated query for Invoice operations)
    getInvoiceAuditLogs: builder.query<any, void>({
      query: () => '/finance/invoices/audit-logs',
      transformResponse: (response: any) => {
        const list = response?.data ?? response?.result ?? response ?? [];
        return Array.isArray(list) ? list : [];
      },
      providesTags: ['InvoiceAuditLogs'],
    }),

    createInvoiceAuditLog: builder.mutation<
      any,
      {
        action: string;
        description: string;
        invoiceId?: string;
        username?: string;
        client?: string;
        amount?: number;
      }
    >({
      query: (data) => ({
        url: '/finance/invoices/audit-logs',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      }),
      invalidatesTags: ['InvoiceAuditLogs'],
    }),

    // Generic Audit Logs query (supports ?type=invoice or ?type=salary_slip)
    getAuditLogs: builder.query<any, string | void>({
      query: (type) => `/finance/audit-logs${type ? `?type=${encodeURIComponent(type)}` : ''}`,
      transformResponse: (response: any) => {
        return response?.data ?? response?.result ?? response ?? [];
      },
      providesTags: ['ActivityLogs'],
    }),

    // Invoices CRUD Endpoints
    getInvoices: builder.query<any[], void>({
      query: () => '/finance/invoices',
      transformResponse: (response: any) => {
        const data = response?.data ?? response ?? [];
        return Array.isArray(data) ? data : [];
      },
      providesTags: ['Invoices'],
    }),

    getInvoiceDetails: builder.query<any, string | number>({
      query: (id) => `/finance/invoices/${id}`,
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_result, _error, id) => [{ type: 'Invoices', id }],
    }),

    createInvoice: builder.mutation<any, FormData | Record<string, any>>({
      query: (body) => ({
        url: '/finance/invoices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoices', 'InvoiceAuditLogs'],
    }),

    updateInvoice: builder.mutation<any, { id: string | number; [key: string]: any }>({
      query: ({ id, ...body }) => ({
        url: `/finance/invoices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Invoices', 'InvoiceAuditLogs'],
    }),

    deleteInvoice: builder.mutation<any, string | number>({
      query: (id) => ({
        url: `/finance/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoices', 'InvoiceAuditLogs'],
    }),

    updateSalarySlip: builder.mutation<any, { id: string | number; [key: string]: any }>({
      query: ({ id, ...payload }) => {
        const formattedPayload = {
          ...payload,
          ...(payload.userId || payload.user_id
            ? { user_id: payload.user_id || payload.userId }
            : {}),
        };
        return {
          url: `/finance/salary-slips/${id}`,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: formattedPayload,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SalarySlips', id },
        { type: 'SalarySlips', id: 'LIST' },
        'ActivityLogs',
      ],
    }),

    deleteSalarySlip: builder.mutation<any, string | number>({
      query: (id) => ({
        url: `/finance/salary-slips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SalarySlips', id },
        { type: 'SalarySlips', id: 'LIST' },
        'ActivityLogs',
      ],
    }),

    // Employee Compensation & Structure
    getEmployeeCompensation: builder.query<any, string | number>({
      query: (userId) => `/finance/employee-compensation/${userId}`,
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_res, _err, userId) => [{ type: 'EmployeeCompensation', id: userId }],
    }),

    saveEmployeeCompensation: builder.mutation<any, Partial<EmployeeCompensationPayload>>({
      query: (payload) => ({
        url: `/finance/employee-compensation/${payload.userId || ''}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: (_res, _err, { userId }) => [
        { type: 'EmployeeCompensation', id: userId },
        'TaxProjection',
      ],
    }),

    previewEmployeeCompensation: builder.mutation<any, { ctcAnnual: number }>({
      query: (body) => ({
        url: '/finance/employee-compensation/preview',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    // Tax Projection Sheets
    getTaxProjection: builder.query<
      TaxProjectionResponse,
      { userId: string | number; financialYear?: string; regime?: string }
    >({
      query: ({ userId, financialYear, regime }) => {
        const params = new URLSearchParams();
        if (financialYear) params.append('financialYear', financialYear);
        if (regime) params.append('regime', regime);
        const q = params.toString();
        return `/finance/tax-projection/${userId}${q ? `?${q}` : ''}`;
      },
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_res, _err, { userId }) => [{ type: 'TaxProjection', id: userId }],
    }),

    getMyTaxProjection: builder.query<
      TaxProjectionResponse,
      { financialYear?: string; regime?: string } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.financialYear) params.append('financialYear', args.financialYear);
        if (args?.regime) params.append('regime', args.regime);
        const q = params.toString();
        return `/finance/tax-projection/my${q ? `?${q}` : ''}`;
      },
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ['TaxProjection'],
    }),

    simulateTaxProjection: builder.mutation<TaxProjectionResponse, any>({
      query: (body) => ({
        url: '/finance/tax-projection/simulate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    // Payroll Adjustments
    createPayrollAdjustment: builder.mutation<any, PayrollAdjustmentPayload>({
      query: (payload) => ({
        url: '/payroll/adjustments',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: [
        { type: 'SalarySlips', id: 'LIST' },
        'PayrollAdjustments',
        'ActivityLogs',
      ],
    }),

    getPayrollAdjustments: builder.query<
      any[],
      { userId?: number | string; adjustmentType?: string } | void
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.userId) search.append('userId', String(params.userId));
        if (params?.adjustmentType) search.append('adjustmentType', params.adjustmentType);
        const q = search.toString();
        return `/payroll/adjustments${q ? `?${q}` : ''}`;
      },
      transformResponse: (response: any) => response?.data ?? response ?? [],
      providesTags: ['PayrollAdjustments'],
    }),
  }),
});

export const {
  // Reimbursement Hooks
  useGetReimbursementsQuery,
  useGetReimbursementByIdQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
  useDeleteReimbursementMutation,

  // Salary Slip Hooks
  useGetAllSalarySlipsQuery,
  useGetSalarySlipByIdQuery,
  useLazyGetSalarySlipByIdQuery,
  useGetSalarySlipsByEmployeeIdQuery,
  useCreateSalarySlipMutation,
  useUpdateSalarySlipMutation,
  useDeleteSalarySlipMutation,

  // Audit Logs Hooks
  useGetAuditLogsQuery,
  useGetSalarySlipAuditLogsQuery,
  useGetInvoiceAuditLogsQuery,
  useLazyGetInvoiceAuditLogsQuery,
  useCreateInvoiceAuditLogMutation,

  // Invoice CRUD Hooks
  useGetInvoicesQuery,
  useLazyGetInvoicesQuery,
  useGetInvoiceDetailsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  // Employee Compensation Hooks
  useGetEmployeeCompensationQuery,
  useLazyGetEmployeeCompensationQuery,
  useSaveEmployeeCompensationMutation,
  usePreviewEmployeeCompensationMutation,

  // Tax Projection Hooks
  useGetTaxProjectionQuery,
  useLazyGetTaxProjectionQuery,
  useGetMyTaxProjectionQuery,
  useLazyGetMyTaxProjectionQuery,
  useSimulateTaxProjectionMutation,

  // Payroll Adjustment Hooks
  useCreatePayrollAdjustmentMutation,
  useGetPayrollAdjustmentsQuery,
  useLazyGetPayrollAdjustmentsQuery,
} = financeApiSlice;