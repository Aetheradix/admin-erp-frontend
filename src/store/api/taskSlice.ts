import { apiSlice } from './apiSlice';
import type { Task, TaskStatsData } from '@/types/models';

export const taskSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => '/task',
      providesTags: ['Tasks'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;

        return Array.isArray(data) ? (data as Task[]) : [];
      },
    }),
    createTask: builder.mutation<{ data: Task }, Task>({
      query: (data) => ({
      url: '/task',
      method: 'POST',
      body: data,
     }),
     invalidatesTags: ['Tasks'],
    }),

    updateTask: builder.mutation<Task, { id: string; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/task/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/task/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),

    getTaskStats: builder.query<TaskStatsData, void>({
      query: () => '/task/summary',
      providesTags: ['Tasks'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskStatsQuery,
} = taskSlice;