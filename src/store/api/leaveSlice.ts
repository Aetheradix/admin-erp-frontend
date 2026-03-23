import { apiSlice } from './apiSlice';

export const leaveSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<any[], void>({
      query: () => '/leaves',
      providesTags: ['Leaves'],
    }),
    createLeaveRequest: builder.mutation<any, any>({
      query: (leaveData) => ({
        url: '/leaves',
        method: 'POST',
        body: leaveData,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeaveStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/leaves/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Leaves'],
    }),
    deleteLeaveRequest: builder.mutation<any, string>({
      query: (id) => ({
        url: `/leaves/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),
  }),
});

export const {
  useGetLeavesQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveRequestMutation,
} = leaveSlice;
