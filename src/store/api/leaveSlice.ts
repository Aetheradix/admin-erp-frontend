import type { AttendanceRequest } from '@/types/models';
import type { DayApproval } from '@/types/dayApproval';
import { apiSlice } from './apiSlice';

export const leaveSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<AttendanceRequest[], void>({
      query: () => '/leaves',
      providesTags: ['Leaves'],
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as AttendanceRequest[];
        const data = (response as { data?: AttendanceRequest[] })?.data;
        return Array.isArray(data) ? data : [];
      },
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
      invalidatesTags: ['Leaves', 'Attendance'],
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
      invalidatesTags: ['Leaves', 'Attendance', 'DayApprovals'],
    }),

    deleteLeaveRequest: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/leaves/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    // Day-Wise Approval Endpoints

    /** Fetch all day-level approval records for a specific leave request. GET /leaves/:id/days */
    getLeaveRequestDays: builder.query<DayApproval[], string | number>({
      query: (leaveRequestId) => `/leaves/${leaveRequestId}/days`,
      providesTags: (result, _err, leaveRequestId) =>
        result
          ? [
              ...result.map((d) => ({
                type: 'DayApprovals' as const,
                id: `${leaveRequestId}-${d.date}`,
              })),
              { type: 'DayApprovals', id: String(leaveRequestId) },
            ]
          : [{ type: 'DayApprovals', id: String(leaveRequestId) }],
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as DayApproval[];
        const data = (response as { data?: DayApproval[] })?.data;
        return Array.isArray(data) ? data : [];
      },
    }),

    /** Approve a single day. POST /leaves/:id/days/:date/approve  body: { remark? } */
    approveLeaveDay: builder.mutation<
      DayApproval,
      { leaveRequestId: string | number; date: string; remark?: string }
    >({
      query: ({ leaveRequestId, date, remark }) => ({
        url: `/leaves/${leaveRequestId}/days/${date}/approve`,
        method: 'POST',
        body: { remark: remark?.trim() || undefined },
      }),
      invalidatesTags: (_result, _err, { leaveRequestId }) => [
        { type: 'DayApprovals', id: String(leaveRequestId) },
        'Leaves',
      ],
    }),

    /** Reject a single day. POST /leaves/:id/days/:date/reject  body: { remark } */
    rejectLeaveDay: builder.mutation<
      DayApproval,
      { leaveRequestId: string | number; date: string; remark: string }
    >({
      query: ({ leaveRequestId, date, remark }) => ({
        url: `/leaves/${leaveRequestId}/days/${date}/reject`,
        method: 'POST',
        body: { remark: remark.trim() },
      }),
      invalidatesTags: (_result, _err, { leaveRequestId }) => [
        { type: 'DayApprovals', id: String(leaveRequestId) },
        'Leaves',
      ],
    }),

    /** Bulk-approve all pending days. POST /leaves/:id/days/bulk-approve  body: { remark? } */
    bulkApproveLeave: builder.mutation<
      { updated: number },
      { leaveRequestId: string | number; remark?: string }
    >({
      query: ({ leaveRequestId, remark }) => ({
        url: `/leaves/${leaveRequestId}/days/bulk-approve`,
        method: 'POST',
        body: { remark: remark?.trim() || undefined },
      }),
      invalidatesTags: (_result, _err, { leaveRequestId }) => [
        { type: 'DayApprovals', id: String(leaveRequestId) },
        'Leaves',
      ],
    }),

    /** Bulk-reject selected days. POST /leaves/:id/days/bulk-reject  body: { dates?, remark } */
    bulkRejectLeave: builder.mutation<
      { updated: number },
      { leaveRequestId: string | number; dates?: string[]; remark: string }
    >({
      query: ({ leaveRequestId, dates, remark }) => ({
        url: `/leaves/${leaveRequestId}/days/bulk-reject`,
        method: 'POST',
        body: { dates, remark: remark.trim() },
      }),
      invalidatesTags: (_result, _err, { leaveRequestId }) => [
        { type: 'DayApprovals', id: String(leaveRequestId) },
        'Leaves',
      ],
    }),
  }),
});

export const {
  useGetLeavesQuery,
  useGetLeaveStatsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveRequestMutation,
  useGetLeaveRequestDaysQuery,
  useApproveLeaveDayMutation,
  useRejectLeaveDayMutation,
  useBulkApproveLeaveMutation,
  useBulkRejectLeaveMutation,
} = leaveSlice;
