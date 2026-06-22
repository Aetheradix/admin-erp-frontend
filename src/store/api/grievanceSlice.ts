import type { Grievance } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapGrievance } from './mappers';

export const grievanceSlice = apiSlice.injectEndpoints({
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
      query: (data) => ({
        url: '/grievances',
        method: 'POST',
        body: {
          subject: data.title,
          description: data.description,
          category: data.category,
          is_anonymous: data.isAnonymous ? 1 : 0,
        },
      }),
      invalidatesTags: ['Grievances'],
    }),
    updateGrievanceStatus: builder.mutation<Grievance, { id: string | number; status: string }>({
      query: ({ id, status }) => ({
        url: `/grievances/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Grievances'],
    }),
    deleteGrievance: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/grievances/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Grievances'],
    }),
  }),
});

export const {
  useGetGrievancesQuery,
  useSubmitGrievanceMutation,
  useUpdateGrievanceStatusMutation,
  useDeleteGrievanceMutation,
} = grievanceSlice;
