import { apiSlice } from './apiSlice';

export const reimbursementSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReimbursements: builder.query<any[], void>({
      query: () => '/reimbursements',
      providesTags: ['Reimbursements'],
    }),
    createReimbursement: builder.mutation<any, any>({
      query: (data) => ({
        url: '/reimbursements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reimbursements'],
    }),
    updateReimbursementStatus: builder.mutation<any, { id: string, status: string }>({
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
} = reimbursementSlice;
