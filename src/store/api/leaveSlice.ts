import { apiSlice } from './apiSlice';

export const leaveSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<any[], void>({
      query: () => '/leaves',
      providesTags: ['Leaves'],
    }),
    createLeave: builder.mutation<any, any>({
      query: (data) => ({
        url: '/leaves',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeaveStatus: builder.mutation<any, { id: string, status: string }>({
      query: ({ id, status }) => ({
        url: `/leaves/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Leaves'],
    }),
  }),
});

export const {
  useGetLeavesQuery,
  useCreateLeaveMutation,
  useUpdateLeaveStatusMutation,
} = leaveSlice;
