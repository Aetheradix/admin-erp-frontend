import type { Project, ProjectStatsData } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapProject } from './mappers';

export type { Project, ProjectStatsData };

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapProject(item as Record<string, unknown>))
          : [];
      },
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectStats: builder.query<ProjectStatsData, void>({
      query: () => '/projects/summary',
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ProjectStatsData })?.data ?? response;
        return (data ?? {}) as ProjectStatsData;
      },
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation, useGetProjectStatsQuery } =
  projectApiSlice;
