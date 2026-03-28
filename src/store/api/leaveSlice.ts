import { apiSlice } from './apiSlice';

export const leaveSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<any[], void>({
      query: () => '/leaves',
      providesTags: ['Leaves'],
    }),
    getLeaveStats: builder.query<any, void>({
      query: () => '/leaves/stats',
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
    updateLeaveStatus: builder.mutation<any, { id: number; status: string; comment?: string }>({
      query: ({ id, status, comment }) => ({
        url: `/leaves/${id}/status`,
        method: 'PUT',
        body: { status, comment },
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
  useGetLeaveStatsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveRequestMutation,
} = leaveSlice;

