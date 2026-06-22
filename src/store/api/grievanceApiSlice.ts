import type { Grievance } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapGrievance } from './mappers';

export type { Grievance };

export const grievanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGrievances: builder.query<Grievance[], void>({
      query: () => '/grievances',
      providesTags: ['Grievances'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapGrievance(item as Record<string, unknown>)) : [];
      },
    }),
    submitGrievance: builder.mutation<Grievance, Partial<Grievance>>({
      query: (grievanceData) => ({
        url: '/grievances',
        method: 'POST',
        body: {
          subject: grievanceData.title,
          description: grievanceData.description,
          category: grievanceData.category,
          is_anonymous: grievanceData.isAnonymous ? 1 : 0,
        },
      }),
      invalidatesTags: ['Grievances'],
    }),
    updateGrievanceStatus: builder.mutation<Grievance, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/grievances/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Grievances'],
    }),
  }),
});

export const {
  useGetGrievancesQuery,
  useSubmitGrievanceMutation,
  useUpdateGrievanceStatusMutation,
} = grievanceApiSlice;
