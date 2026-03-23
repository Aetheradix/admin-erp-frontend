import { apiSlice } from './apiSlice';

export const grievanceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGrievances: builder.query<any[], void>({
      query: () => '/grievances',
      providesTags: ['Grievances'],
    }),
    submitGrievance: builder.mutation<any, any>({
      query: (data) => ({
        url: '/grievances',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Grievances'],
    }),
    updateGrievanceStatus: builder.mutation<any, { id: string, status: string }>({
      query: ({ id, status }) => ({
        url: `/grievances/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Grievances'],
    }),
    deleteGrievance: builder.mutation<any, string>({
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
