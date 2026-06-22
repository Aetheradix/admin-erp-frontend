import type { Reimbursement } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapReimbursement } from './mappers';

export type { Reimbursement };

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReimbursements: builder.query<Reimbursement[], void>({
      query: () => '/reimbursements',
      providesTags: ['Reimbursements'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapReimbursement(item as Record<string, unknown>)) : [];
      },
    }),
    createReimbursement: builder.mutation<Reimbursement, Partial<Reimbursement>>({
      query: (reimbursementData) => ({
        url: '/reimbursements',
        method: 'POST',
        body: {
          title: reimbursementData.item,
          amount: reimbursementData.amount,
          category: reimbursementData.category,
          description: reimbursementData.description,
          receipt_url: reimbursementData.receiptUrl || '',
        },
      }),
      invalidatesTags: ['Reimbursements'],
    }),
    updateReimbursementStatus: builder.mutation<Reimbursement, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/reimbursements/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Reimbursements'],
    }),
  }),
});

export const {
  useGetReimbursementsQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
} = financeApiSlice;
