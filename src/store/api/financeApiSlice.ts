import { apiSlice } from './apiSlice';

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReimbursements: builder.query<any[], void>({
      query: () => '/reimbursements',
      providesTags: ['Reimbursements'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((r: any) => ({
          ...r,
          item: r.title,
          date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : r.date,
          receiptUrl: r.receipt_url,
        }));
      },
    }),
    createReimbursement: builder.mutation<any, any>({
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
    updateReimbursementStatus: builder.mutation<any, { id: string; status: string }>({
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
