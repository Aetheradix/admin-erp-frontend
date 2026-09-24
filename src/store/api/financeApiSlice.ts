import type { Reimbursement } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapReimbursement } from './mappers';

export type { Reimbursement };

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReimbursements: builder.query<Reimbursement[], void>({
      query: () => '/reimbursements/',
      providesTags: ['Reimbursements'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapReimbursement(item as Record<string, unknown>))
          : [];
      },
    }),
    // Allow both FormData and object payloads for creation:
    createReimbursement: builder.mutation<
      Reimbursement,
      FormData | Partial<Omit<Reimbursement, 'id' | 'created_at' | 'updated_at' | 'approved_at'>>
    >({
      query: (data) => ({
        url: '/reimbursements',
        method: 'POST',
        body: data,
      }),
    }),

    // Allow 'id' to be string or number:
    updateReimbursementStatus: builder.mutation<
      Reimbursement,
      { id: string | number; status: string; rejectionReason?: string }
    >({
      query: ({ id, status }) => ({
        url: `/reimbursements/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
});

export const {
  useGetReimbursementsQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
} = financeApiSlice;
