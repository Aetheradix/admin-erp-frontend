import type { AttendanceRequest } from '@/types/models';
import type { DayApproval } from '@/types/dayApproval';
import { apiSlice } from './apiSlice';

export interface LeaveApproverConfig {
  id: number | null;
  rule_type: 'default_founder' | 'hr' | 'reporting_manager' | 'specific_user' | 'role';
  target_role_id?: number | null;
  target_role_name?: string | null;
  specific_user_id?: number | null;
  specific_user_name?: string | null;
  specific_user_email?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  is_active: boolean | number;
  priority: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ResolvedLeaveApprover {
  ruleType: string;
  approverIds: number[];
  approvers: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    department?: string;
    designation?: string;
    image_url?: string;
    reason: string;
  }>;
}

export interface LeaveApprovalHistoryItem {
  id: number;
  leave_request_id: number;
  approver_id: number;
  action: string;
  comments?: string | null;
  created_at: string;
  approver_name?: string;
  approver_email?: string;
  approver_role?: string;
  approver_image?: string;
}

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
      invalidatesTags: ['Leaves', 'Attendance', 'DayApprovals', 'ApprovalLogs'],
    }),

    deleteLeaveRequest: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/leaves/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    // Day-Wise Approval Endpoints
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

    // Leave Approver Configuration Endpoints
    getLeaveApproverConfig: builder.query<
      { success: boolean; data: LeaveApproverConfig },
      { departmentId?: number } | void
    >({
      query: (params) => ({
        url: '/leaves/approver-config',
        params: params || {},
      }),
      providesTags: ['LeaveApproverConfig'],
    }),

    updateLeaveApproverConfig: builder.mutation<
      { success: boolean; message: string; data: LeaveApproverConfig },
      {
        rule_type: string;
        target_role_id?: number | null;
        specific_user_id?: number | null;
        department_id?: number | null;
        description?: string | null;
      }
    >({
      query: (body) => ({
        url: '/leaves/approver-config',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LeaveApproverConfig', 'Leaves', 'RoleAuditLogs'],
    }),

    getLeaveApproverForUser: builder.query<
      { success: boolean; data: ResolvedLeaveApprover },
      number | string | void
    >({
      query: (userId) => (userId ? `/leaves/approver-for-user/${userId}` : '/leaves/approver-for-me'),
      providesTags: ['LeaveApproverConfig', 'User'],
    }),

    getLeaveHistory: builder.query<
      { success: boolean; data: LeaveApprovalHistoryItem[] },
      number | string
    >({
      query: (id) => `/leaves/${id}/history`,
      providesTags: (_res, _err, id) => [{ type: 'Leaves', id }],
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
  useGetLeaveApproverConfigQuery,
  useUpdateLeaveApproverConfigMutation,
  useGetLeaveApproverForUserQuery,
  useGetLeaveHistoryQuery,
} = leaveSlice;
