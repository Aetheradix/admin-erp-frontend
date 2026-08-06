import type { AttendanceRequest } from '@/types/models';
import { apiSlice } from './apiSlice';

export const leaveSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<AttendanceRequest[], void>({
      query: () => '/leaves',
      providesTags: ['Leaves'],
      transformResponse: (response: { data: AttendanceRequest[] }) => response.data,
    }),
    getLeaveStats: builder.query<{ total: number; used: number; remaining: number }, void>({
      query: () => '/leaves/stats',
      providesTags: ['Leaves'],
    }),

    createLeaveRequest: builder.mutation<AttendanceRequest, Partial<AttendanceRequest>>({
      query: (leaveData) => ({
        url: '/leaves',
        method: 'POST',
        body: leaveData,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeaveStatus: builder.mutation<
      AttendanceRequest,
      { id: number | string; status: string; comment?: string }
    >({
      query: ({ id, status, comment }) => ({
        url: `/leaves/${id}/status`,
        method: 'PUT',
        body: { status, comment },
      }),
      invalidatesTags: ['Leaves'],
    }),

    deleteLeaveRequest: builder.mutation<{ success: boolean }, string | number>({
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
