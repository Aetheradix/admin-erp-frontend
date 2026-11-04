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


export interface CalendarHoliday {
  id: number;
  calendar_id: number;
  name: string;
  holiday_date: string;
  holiday_type: 'PUBLIC' | 'COMPANY' | 'RESTRICTED' | 'OPTIONAL';
  is_half_day: boolean | number;
  description?: string | null;
}

export interface UpcomingHolidayItem extends CalendarHoliday {
  days_away: number;
}

export interface UpcomingHolidaysResponse {
  calendar: {
    id: number;
    name: string;
    year: number;
    country_code: string;
    weekend_mask: number;
  } | null;
  upcomingHolidays: UpcomingHolidayItem[];
  allHolidays: CalendarHoliday[];
}

export interface CompanyCalendar {
  id: number;
  name: string;
  year: number;
  country_code: string;
  weekend_mask: number;
  alternate_saturday_mask: number;
  is_default: boolean | number;
  holiday_count?: number;
  assigned_users_count?: number;
  holidays?: CalendarHoliday[];
}

export interface LeaveType {
  id: number;
  code: string;
  name: string;
  category: 'PAID' | 'UNPAID' | 'STATUTORY' | 'COMP_OFF' | 'SPECIAL';
  is_active: boolean | number;
  policies_count?: number;
}

export interface LeavePolicy {
  id: number;
  leave_type_id: number;
  leave_type_code?: string;
  leave_type_name?: string;
  name: string;
  effective_from: string;
  effective_to?: string | null;
  yearly_quota: number;
  accrual_frequency: 'YEARLY_UPFRONT' | 'MONTHLY_PRORATA' | 'QUARTERLY' | 'NONE';
  accrual_timing: 'START_OF_PERIOD' | 'END_OF_PERIOD';
  prorata_first_month: boolean | number;
  prorata_cutoff_day: number;
  allow_half_day: boolean | number;
  min_service_days: number;
  max_consecutive_days?: number | null;
  min_notice_days: number;
  requires_attachment_after_days?: number | null;
  apply_sandwich_rule: boolean | number;
  allow_negative_balance: boolean | number;
  max_negative_balance: number;
  allow_carry_forward: boolean | number;
  max_carry_forward_days: number;
  carry_forward_expiry_months?: number | null;
  allow_encashment: boolean | number;
  min_balance_for_encashment: number;
  max_encashment_days: number;
  encashment_payout_rate: number;
  applicability?: Array<{
    id?: number;
    department_id?: number | null;
    office_id?: number | null;
    grade_id?: number | null;
    gender?: string;
    employment_type?: string;
  }>;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type_id: number;
  leave_type_code: string;
  leave_type_name: string;
  leave_category: string;
  calendar_year: number;
  opening_balance: string | number;
  accrued_balance: string | number;
  used_balance: string | number;
  pending_approval_balance: string | number;
  carried_over_balance: string | number;
  encashed_balance: string | number;
  expired_balance: string | number;
  lop_balance: string | number;
  available_balance: number;
  raw_available_balance: number;
}

export interface LeaveDeductionPreview {
  calendarId: number;
  calendarName: string;
  policyName: string;
  totalDays: number;
  paidDays: number;
  lopDays: number;
  availableBalance: number;
  applySandwichRule: boolean;
  days: Array<{
    date: string;
    dayFraction: string;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string | null;
    isSandwichApplied: boolean;
    deductionUnits: number;
    isLop?: boolean;
  }>;
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

    
    // ─── Calendars & Holidays ───────────────────────────────────────
    getUpcomingHolidays: builder.query<UpcomingHolidaysResponse, { limit?: number } | void>({
      query: (params) => ({
        url: '/calendars/upcoming-holidays',
        params: params || {},
      }),
      transformResponse: (res: { data?: UpcomingHolidaysResponse } | UpcomingHolidaysResponse) => {
        return (res as { data?: UpcomingHolidaysResponse })?.data ?? (res as UpcomingHolidaysResponse);
      },
      providesTags: ['Leaves'],
    }),

    getMyEffectiveCalendar: builder.query<CompanyCalendar, void>({
      query: () => '/calendars/my-calendar',
      transformResponse: (res: { data?: CompanyCalendar } | CompanyCalendar) => {
        return (res as { data?: CompanyCalendar })?.data ?? (res as CompanyCalendar);
      },
      providesTags: ['Leaves'],
    }),

    getCalendars: builder.query<CompanyCalendar[], { year?: number } | void>({
      query: (params) => ({
        url: '/calendars',
        params: params || {},
      }),
      transformResponse: (res: { data?: CompanyCalendar[] } | CompanyCalendar[]) => {
        return (res as { data?: CompanyCalendar[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Leaves'],
    }),

    getCalendarById: builder.query<CompanyCalendar, number | string>({
      query: (id) => '/calendars/' + id,
      transformResponse: (res: { data?: CompanyCalendar } | CompanyCalendar) => {
        return (res as { data?: CompanyCalendar })?.data ?? (res as CompanyCalendar);
      },
      providesTags: ['Leaves'],
    }),

    createCalendar: builder.mutation<CompanyCalendar, Partial<CompanyCalendar>>({
      query: (body) => ({
        url: '/calendars',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    updateCalendar: builder.mutation<CompanyCalendar, { id: number | string } & Partial<CompanyCalendar>>({
      query: ({ id, ...body }) => ({
        url: '/calendars/' + id,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    deleteCalendar: builder.mutation<{ success: boolean; message: string }, number | string>({
      query: (id) => ({
        url: '/calendars/' + id,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    addHoliday: builder.mutation<CalendarHoliday, { calendarId: number | string } & Partial<CalendarHoliday>>({
      query: ({ calendarId, ...body }) => ({
        url: '/calendars/' + calendarId + '/holidays',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    updateHoliday: builder.mutation<
      CalendarHoliday,
      { holidayId: number | string } & Partial<CalendarHoliday>
    >({
      query: ({ holidayId, ...body }) => ({
        url: '/calendars/holidays/' + holidayId,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    deleteHoliday: builder.mutation<{ success: boolean; message: string }, number | string>({
      query: (holidayId) => ({
        url: '/calendars/holidays/' + holidayId,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    // ─── Leave Types & Policies ─────────────────────────────────────
    getLeaveTypes: builder.query<LeaveType[], void>({
      query: () => '/leaves/types',
      transformResponse: (res: { data?: LeaveType[] } | LeaveType[]) => {
        return (res as { data?: LeaveType[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Leaves'],
    }),

    createLeaveType: builder.mutation<LeaveType, Partial<LeaveType>>({
      query: (body) => ({
        url: '/leaves/types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    getLeavePolicies: builder.query<LeavePolicy[], void>({
      query: () => '/leaves/policies',
      transformResponse: (res: { data?: LeavePolicy[] } | LeavePolicy[]) => {
        return (res as { data?: LeavePolicy[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Leaves'],
    }),

    createLeavePolicy: builder.mutation<LeavePolicy, Partial<LeavePolicy>>({
      query: (body) => ({
        url: '/leaves/policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    updateLeavePolicy: builder.mutation<LeavePolicy, { id: number | string } & Partial<LeavePolicy>>({
      query: ({ id, ...body }) => ({
        url: '/leaves/policies/' + id,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Leaves'],
    }),

    deleteLeavePolicy: builder.mutation<{ success: boolean; message: string }, number | string>({
      query: (id) => ({
        url: '/leaves/policies/' + id,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),

    // ─── Balances & Preview ─────────────────────────────────────────
    getMyBalances: builder.query<LeaveBalance[], { year?: number } | void>({
      query: (params) => ({
        url: '/leaves/balances/my',
        params: params || {},
      }),
      transformResponse: (res: { data?: LeaveBalance[] } | LeaveBalance[]) => {
        return (res as { data?: LeaveBalance[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Leaves'],
    }),

    previewLeaveDeduction: builder.mutation<
      LeaveDeductionPreview,
      { leave_type_id: number; start_date: string; end_date: string; day_fraction?: string }
    >({
      query: (body) => ({
        url: '/leaves/validate-preview',
        method: 'POST',
        body,
      }),
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
  useGetUpcomingHolidaysQuery,
  useGetMyEffectiveCalendarQuery,
  useGetCalendarsQuery,
  useGetCalendarByIdQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useAddHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
  useGetMyBalancesQuery,
  usePreviewLeaveDeductionMutation,

} = leaveSlice;
