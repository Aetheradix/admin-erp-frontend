import { apiSlice } from './apiSlice';

export const attendanceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceStatus: builder.query<{ status: 'checked-in' | 'checked-out' | null; lastAction?: string | null; dbStatus?: string | null }, void>({
      query: () => '/attendance/status',
      transformResponse: (response: any) => {
        if (!response.data || !response.data.status) {
          return { status: null, lastAction: null, dbStatus: null };
        }
        return {
          status: response.data.status === 'CHECKED_IN' ? 'checked-in' : 'checked-out',
          lastAction: response.data.record?.check_in_time ? new Date(response.data.record.check_in_time).toISOString() : null,
          dbStatus: response.data.status
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
    getAttendanceStats: builder.query<any, void>({
      query: () => '/attendance/stats',
      transformResponse: (response: any) => response.data,
      providesTags: ['Attendance'],
    }),
    getAttendanceHistory: builder.query<any[], void>({
      query: () => '/attendance/history',
      providesTags: ['Attendance'],
      transformResponse: (response: any) => response.data || response,
    }),
    getAttendanceRecords: builder.query<any[], void>({
      query: () => '/attendance/get-info',
      providesTags: ['Attendance'],
      transformResponse: (response: any) => response.data || response,
    }),
    
    
  }),
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceStatusQuery,
  useGetAttendanceHistoryQuery,
  useGetAttendanceStatsQuery,
  useGetAttendanceRecordsQuery,
} = attendanceSlice;
