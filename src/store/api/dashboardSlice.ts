import { apiSlice } from './apiSlice';
import type {
  DashboardSummaryData,
  AttendanceHeatmapData,
  NextSalarySchedule,
  ScanAssetPayload,
  ScanAssetResponse,
} from '@/types/dashboard';

export const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryData, void>({
      query: () => '/dashboard/summary',
      transformResponse: (response: { success: boolean; data: DashboardSummaryData }) => {
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    getAttendanceHeatmap: builder.query<AttendanceHeatmapData, number | void>({
      query: (monthsBack = 4) => `/dashboard/attendance-heatmap?monthsBack=${monthsBack || 4}`,
      transformResponse: (response: { success: boolean; data: AttendanceHeatmapData }) => {
        return response.data;
      },
      providesTags: ['Dashboard', 'Attendance'],
    }),

    getNextSalarySchedule: builder.query<NextSalarySchedule, string | void>({
      query: (date) => (date ? `/dashboard/next-salary-schedule?date=${date}` : '/dashboard/next-salary-schedule'),
      transformResponse: (response: { success: boolean; data: NextSalarySchedule }) => {
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    recordAssetScan: builder.mutation<ScanAssetResponse, ScanAssetPayload>({
      query: (body) => ({
        url: '/dashboard/scan-asset',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Inventory'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetAttendanceHeatmapQuery,
  useGetNextSalaryScheduleQuery,
  useRecordAssetScanMutation,
} = dashboardSlice;
