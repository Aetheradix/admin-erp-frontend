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
  userId: number;
  employeeId: number;
  employeeName: string;
  position: string;
  monthYear: string;
  payPeriod: string;
  paySlipNo: string;
  accountNumber?: string;
  paidDays: number;
  lopDays: number;
  basePay: number;
  bonusPay: number;
  netSalary: number;
  earnings: SalaryBreakdownItem[];
  deductions: SalaryBreakdownItem[];
  authorizedSignatory?: string;
  signatoryRole?: string;
  hrNote?: string;
}

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

    // Create a reimbursement claim (FormData or Object)
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

    // Fetch all salary slips (JSON data records)
    getAllSalarySlips: builder.query<any, void>({
      query: () => '/finance/salary-slips',
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((item: any) => ({ type: 'SalarySlips' as const, id: item.id })),
              { type: 'SalarySlips', id: 'LIST' },
            ]
          : [{ type: 'SalarySlips', id: 'LIST' }],
    }),

    // Fetch single salary slip by slip ID (for on-demand PDF generation)
    getSalarySlipById: builder.query<any, string | number>({
  query: (id) => `/finance/salary-slips/${id}`,
  // Normalize response: if it's a single object, wrap it in an array
  transformResponse: (response: any) => {
    // 1. Un-wrap common backend envelopes if present
    const payload = response?.data ?? response?.result ?? response;

    // 2. If it's already an array, return it directly
    if (Array.isArray(payload)) {
      return payload;
    }

    // 3. If it's a single non-null object, wrap it into an array
    if (payload && typeof payload === 'object') {
      return [payload];
    }

    return [];
  },
  providesTags: (_result, _error, id) => [{ type: 'SalarySlips', id }],
}),

    // Fetch salary slips by employee ID
    getSalarySlipsByEmployeeId: builder.query<any, string | number>({
      query: (employeeId) => `/finance/salary-slips/employee/${employeeId}`,
      providesTags: (_result, _error, employeeId) => [
        { type: 'SalarySlips', id: `EMP-${employeeId}` },
      ],
    }),

    // Create salary slip record as JSON payload
    // createSalarySlip: builder.mutation<any, CreateSalarySlipPayload>({
    //   query: (payload) => ({
    //     url: '/finance/create-salary-slip',
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: {
    //       user_id: payload.userId,
    //       employee_id: payload.employeeId,
    //       employee_name: payload.employeeName,
    //       position: payload.position,
    //       month_year: payload.monthYear,
    //       pay_period: payload.payPeriod,
    //       pay_slip_no: payload.paySlipNo,
    //       account_number: payload.accountNumber,
    //       paid_days: payload.paidDays,
    //       lop_days: payload.lopDays,
    //       base_amount: payload.basePay,
    //       bonus_amount: payload.bonusPay,
    //       total_amount: payload.netSalary,
    //       earnings: payload.earnings,
    //       deductions: payload.deductions,
    //       authorized_signatory: payload.authorizedSignatory,
    //       signatory_role: payload.signatoryRole,
    //       hr_note: payload.hrNote,
    //     },
    //   }),
    //   invalidatesTags: [{ type: 'SalarySlips', id: 'LIST' }],
    // }),

    createSalarySlip: builder.mutation<any, any>({
      query: (payload) => {
        // Standardize user_id so backend destructuring gets user_id regardless of form key naming
        const formattedPayload = {
          ...payload,
          user_id: payload.user_id || payload.userId,
        };

        console.log('RTK Query Sending Body to Backend:', formattedPayload);

        return {
          url: '/finance/create-salary-slip',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: formattedPayload, // 👈 Directly sends the complete payload object
        };
      },
      invalidatesTags: [{ type: 'SalarySlips', id: 'LIST' }],
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
  useLazyGetSalarySlipByIdQuery, // 👈 ADD THIS LINE HERE
  useGetSalarySlipsByEmployeeIdQuery,
  useCreateSalarySlipMutation,
} = financeApiSlice;
