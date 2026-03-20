import { apiSlice } from './apiSlice';

export const projectSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<any[], void>({
      query: () => '/projects',
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation<any, any>({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
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
} = projectSlice;
