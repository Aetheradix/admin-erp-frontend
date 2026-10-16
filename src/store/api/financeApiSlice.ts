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

    getAuditLogs: builder.query<any, void>({
      query: () => '/finance/audit-logs',
      transformResponse: (response: any) => {
        return response?.data ?? response?.result ?? response ?? [];
      },
      providesTags: ['ActivityLogs'],
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
} = financeApiSlice;