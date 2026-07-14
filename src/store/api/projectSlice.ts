import type { Project, ProjectStatsData } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapProject } from './mappers';

export const projectSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/project',
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapProject(item as Record<string, unknown>)) : [];
      },
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (data) => ({
        url: '/project',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectStats: builder.query<ProjectStatsData, void>({
      query: () => '/project/summary',
      providesTags: ['Projects'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetProjectStatsQuery,
} = projectSlice;
