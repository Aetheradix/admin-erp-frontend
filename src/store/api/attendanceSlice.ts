import type { AttendanceRecord, AttendanceStatus,BreakRecord,AttendanceStatsData } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapAttendanceRecord } from './mappers';

export type { AttendanceRecord, AttendanceStatsData };

export const attendanceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // getAttendanceStatus: builder.query<{ status: 'checked-in' | 'checked-out' | null; lastAction?: string | null; dbStatus?: string | null }, void>({
    //   query: () => '/attendance/status',
    //   transformResponse: (response: { data?: { status: string; record?: { check_in_time?: string } } }) => {
    //     if (!response.data || !response.data.status) {
    //       return { status: null, lastAction: null, dbStatus: null };
    //     }
    //     return {
    //       status: response.data.status === 'CHECKED_IN' ? 'checked-in' : 'checked-out',
    //       lastAction: response.data.record?.check_in_time ? new Date(response.data.record.check_in_time).toISOString() : null,
    //       dbStatus: response.data.status
    //     };
    //   },
    //   providesTags: ['Attendance'],
    // }),


  getAttendanceStatus: builder.query<AttendanceStatus, void>({
    query: () => '/attendance/status',

    transformResponse: (response: {
       data?: {
      status: string;
      onBreak?: boolean;
      activeBreak?: BreakRecord | null;
      record?: {
        check_in_time?: string;
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
      };
    }

    return {
      status:
        response.data.status === 'CHECKED_IN'
          ? 'checked-in'
          : 'checked-out',

      onBreak: response.data.onBreak ?? false,

      activeBreak: response.data.activeBreak ?? null,

      lastAction: response.data.record?.check_in_time
        ? new Date(
            response.data.record.check_in_time
          ).toISOString()
        : null,

      dbStatus: response.data.status,
    };
  },

  providesTags: ['Attendance'],
}),
    checkIn: builder.mutation<{ success: boolean; message: string; id: number }, { remark?: string }>({
      query: (arg) => ({
        url: '/attendance/checkin',
        method: 'POST',
        body: arg,
      }),
      invalidatesTags: ['Attendance'],
    }),
    checkOut: builder.mutation<{ success: boolean; message: string; id: number }, void>({
      query: () => ({
        url: '/attendance/checkout',
        method: 'POST',
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
        return Array.isArray(data) ? data.map((item) => mapAttendanceRecord(item as Record<string, unknown>)) : [];
      },
    }),

    takeBreak: builder.mutation<
      { success: boolean; message: string; data: BreakRecord },
      { remark?: string }
    >({
        query: (body) => ({
          url: '/attendance/break/start',
          method: 'POST',
          body,
        }),
           invalidatesTags: ['Attendance'],
         }),

        endBreak: builder.mutation<
          { success: boolean; message: string; data: BreakRecord },
          void
        >({
          query: () => ({
            url: '/attendance/break/end',
            method: 'POST',
          }),
          invalidatesTags: ['Attendance'],
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
  useTakeBreakMutation
} = attendanceSlice;
