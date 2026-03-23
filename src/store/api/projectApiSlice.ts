import { apiSlice } from './apiSlice';

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<any[], void>({
      query: () => '/projects',
      providesTags: ['Projects'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((p: any) => ({
          ...p,
          startDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2024-01-01',
          category: p.category || 'Enterprise',
        }));
      },
    }),
    createProject: builder.mutation<any, any>({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectStats: builder.query<any, void>({
      query: () => '/projects/summary',
      providesTags: ['Projects'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectStatsQuery,
} = projectApiSlice;
