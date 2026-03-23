import { apiSlice } from './apiSlice';

export const grievanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGrievances: builder.query<any[], void>({
      query: () => '/grievances',
      providesTags: ['Grievances'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((g: any) => ({
          ...g,
          title: g.subject || g.title,
          isAnonymous: !!g.is_anonymous,
          date: g.created_at ? new Date(g.created_at).toISOString().split('T')[0] : g.date,
        }));
      },
    }),
    submitGrievance: builder.mutation<any, any>({
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
    updateGrievanceStatus: builder.mutation<any, { id: string; status: string }>({
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
