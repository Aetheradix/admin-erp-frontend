import type {
  AttendanceRecord,
  AttendanceStatus,
  BreakRecord,
  AttendanceStatsData,
  TeamAvailabilityResponse,
} from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapAttendanceRecord } from './mappers';

export type { AttendanceRecord, AttendanceStatsData };

export interface Office {
  id: number;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  is_hq?: boolean;
  isHq?: boolean;
  isActive?: boolean;
  is_active?: boolean;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerifyLocationResponse {
  allowed: boolean;
  status: string;
  distance: number | null;
  accuracy?: number | null;
  office: Office | null;
  message: string;
}

export interface GeofenceAuditLog {
  id: number;
  user_id: number;
  username?: string;
  email?: string;
  employee_code?: string;
  office_id?: number | null;
  office_name?: string | null;
  action: string;
  attempted_latitude?: number | null;
  attempted_longitude?: number | null;
  location_accuracy?: number | null;
  distance_meters?: number | null;
  allowed_radius_meters?: number | null;
  status: string;
  failure_reason?: string | null;
  device_info?: string | null;
  ip_address?: string | null;
  created_at: string;
}


export interface CheckInPayload {
  remark?: string;
  work_mode?: 'office' | 'wfh' | 'field';
  is_wfh?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  check_in_latitude?: number | null;
  check_in_longitude?: number | null;
  location_name?: string | null;
  check_in_location?: string | null;
  device_info?: string | null;
  office_id?: number | null;
  officeId?: number | null;
  location_accuracy?: number | null;
  accuracy?: number | null;
}

export interface CheckOutPayload {
  latitude?: number | null;
  longitude?: number | null;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  location_name?: string | null;
  check_out_location?: string | null;
}

export const attendanceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceStatus: builder.query<AttendanceStatus, void>({
      query: () => '/attendance/status',

      transformResponse: (response: {
        data?: {
          status: string;
          onBreak?: boolean;
          activeBreak?: BreakRecord | null;
          record?: {
            id?: number;
            check_in_time?: string;
            check_out_time?: string;
            work_mode?: 'office' | 'wfh' | 'field';
            is_wfh?: boolean;
            check_in_latitude?: number | null;
            check_in_longitude?: number | null;
            check_in_location?: string | null;
            check_out_latitude?: number | null;
            check_out_longitude?: number | null;
            check_out_location?: string | null;
            break_note?: string | null;
          };
        };
      }) => {
        if (!response.data || !response.data.status) {
          return {
            status: null,
            onBreak: false,
            activeBreak: null,
            lastAction: null,
            dbStatus: null,
            work_mode: 'office',
            is_wfh: false,
            total_break_minutes: 0,
            breaks: [],
          };
        }

        const rec = response.data.record;

        const isCheckedIn = response.data.status === 'CHECKED_IN' || response.data.status === 'ON_BREAK';

        return {
          status: isCheckedIn ? 'checked-in' : 'checked-out',
          onBreak: response.data.onBreak ?? response.data.status === 'ON_BREAK',
          activeBreak: response.data.activeBreak ?? null,
          lastAction: rec?.check_in_time
            ? new Date(rec.check_in_time).toISOString()
            : null,
          dbStatus: response.data.status,
          work_mode: rec?.work_mode || (rec?.is_wfh ? 'wfh' : 'office'),
          is_wfh: Boolean(rec?.is_wfh || rec?.work_mode === 'wfh'),
          check_in_latitude: rec?.check_in_latitude,
          check_in_longitude: rec?.check_in_longitude,
          check_in_location: rec?.check_in_location,
          check_out_latitude: rec?.check_out_latitude,
          check_out_longitude: rec?.check_out_longitude,
          check_out_location: rec?.check_out_location,
          record: rec ? (rec as any) : null,
          total_break_minutes: (response.data as any).total_break_minutes ?? 0,
          breaks: (response.data as any).breaks ?? [],
        };
      },

      providesTags: ['Attendance'],
    }),
    checkIn: builder.mutation<
      { success: boolean; message: string; id: number },
      CheckInPayload | void
    >({
      query: (arg) => ({
        url: '/attendance/checkin',
        method: 'POST',
        body: arg || {},
      }),
      invalidatesTags: ['Attendance'],
    }),
    checkOut: builder.mutation<
      { success: boolean; message: string; id: number },
      CheckOutPayload | void
    >({
      query: (arg) => ({
        url: '/attendance/checkout',
        method: 'POST',
        body: arg || {},
      }),
      invalidatesTags: ['Attendance'],
    }),
    getAttendanceStats: builder.query<AttendanceStatsData, void>({
      query: () => '/attendance/stats',
      transformResponse: (response: unknown) => {
        const data = (response as { data?: AttendanceStatsData })?.data ?? response;
        return (data ?? {}) as AttendanceStatsData;
      },
      providesTags: ['Attendance'],
    }),

    getAttendanceHistory: builder.query<AttendanceRecord[], void>({
      query: () => '/attendance/history',
      providesTags: ['Attendance'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapAttendanceRecord(item as Record<string, unknown>))
          : [];
      },
    }),

    takeBreak: builder.mutation<
      { success: boolean; message: string; data: BreakRecord },
      { break_note?: string; break_type?: string; type?: string; break_status_message?: string } | void
    >({
      query: (body) => ({
        url: '/attendance/break/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance'],
    }),

    endBreak: builder.mutation<{ success: boolean; message: string; data: BreakRecord }, void>({
      query: () => ({
        url: '/attendance/break/end',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance'],
    }),

    
    getActiveOffices: builder.query<Office[], void>({
      query: () => '/attendance/offices',
      transformResponse: (res: { data?: Office[] } | Office[]) => {
        return (res as { data?: Office[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Offices'],
    }),

    getAllOffices: builder.query<Office[], void>({
      query: () => '/attendance/offices/all',
      transformResponse: (res: { data?: Office[] } | Office[]) => {
        return (res as { data?: Office[] })?.data ?? (Array.isArray(res) ? res : []);
      },
      providesTags: ['Offices'],
    }),

    createOffice: builder.mutation<Office, Partial<Office>>({
      query: (body) => ({
        url: '/attendance/offices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Offices'],
    }),

    updateOffice: builder.mutation<Office, { id: number } & Partial<Office>>({
      query: ({ id, ...body }) => ({
        url: `/attendance/offices/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Offices'],
    }),

    deleteOffice: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/attendance/offices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offices'],
    }),

    verifyLocation: builder.mutation<
      VerifyLocationResponse,
      { latitude: number; longitude: number; accuracy?: number | null; officeId?: number | null }
    >({
      query: (body) => ({
        url: '/attendance/verify-location',
        method: 'POST',
        body,
      }),
    }),

    getGeofenceLogs: builder.query<GeofenceAuditLog[], { limit?: number; offset?: number } | void>({
      query: (params) => ({
        url: '/attendance/geofence-logs',
        params: params || {},
      }),
      transformResponse: (res: { data?: GeofenceAuditLog[] } | GeofenceAuditLog[]) => {
        return (res as { data?: GeofenceAuditLog[] })?.data ?? (Array.isArray(res) ? res : []);
      },
    }),

    getTeamAvailability: builder.query<
      TeamAvailabilityResponse,
      { department?: string; status?: string; search?: string } | void
    >({
      query: (params) => ({
        url: '/attendance/team-availability',
        params: params || {},
      }),
      transformResponse: (response: { success: boolean; data: TeamAvailabilityResponse } | TeamAvailabilityResponse) => {
        return (response as { data: TeamAvailabilityResponse })?.data ?? response;
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceStatusQuery,
  useGetAttendanceHistoryQuery,
  useGetAttendanceStatsQuery,
  useEndBreakMutation,
  useTakeBreakMutation,
  useGetTeamAvailabilityQuery,
  useGetActiveOfficesQuery,
  useGetAllOfficesQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
  useVerifyLocationMutation,
  useGetGeofenceLogsQuery,
} = attendanceSlice;
