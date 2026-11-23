import type { Project, ProjectStatsData } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapProject } from './mappers';

export type { Project, ProjectStatsData };

// ─── Extended types for real backend ──────────────────────────────────────────

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  name?: string;
  email?: string;
  designation?: string;
  department?: string;
  image_url?: string;
  added_at?: string;
}

export interface ProjectActivity {
  id: number;
  project_id: number;
  task_id?: number;
  actor_id?: number;
  actor_name?: string;
  actor_image?: string;
  action: string;
  entity_type?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface BackendProject {
  project_id: number;
  project_name: string;
  project_description?: string;
  project_key?: string;
  project_status?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  priority?: string;
  methodology?: string;
  health?: string;
  visibility?: string;
  owner_user_id?: number;
  owner_name?: string;
  owner_email?: string;
  project_manager_id?: number;
  project_manager_name?: string;
  department_id?: number;
  department_name?: string;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  member_count?: number;
  task_count?: number;
  completed_task_count?: number;
  progress?: number;
}

export interface BackendTask {
  task_id: number;
  task_title: string;
  task_description?: string;
  allocated_to?: number;
  allocated_to_name?: string;
  allocated_to_email?: string;
  allocated_to_image?: string;
  allocated_to_designation?: string;
  allocated_by?: number;
  allocated_by_name?: string;
  task_status?: string;
  priority?: string;
  remark?: string;
  allotment_date?: string;
  start_date?: string;
  due_date?: string;
  duration?: number;
  project_id?: number;
  project_name?: string;
  department_id?: number;
  department_name?: string;
  reporting_manager_id?: number;
  reporting_manager_name?: string;
  dept_head_id?: number;
  dept_head_name?: string;
  task_type?: string;
  created_at?: string;
  is_deleted?: number;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Projects ─────────────────────────────────────────────────────────────
    getProjects: builder.query<Project[], { status?: string; search?: string; department_id?: number } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.status) params.set('status', filters.status);
          if (filters.search) params.set('search', filters.search);
          if (filters.department_id) params.set('department_id', String(filters.department_id));
        }
        const qs = params.toString();
        return `/projects${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapProject(item as Record<string, unknown>))
          : [];
      },
    }),

    // Raw backend projects (no field mapping)
    getRawProjects: builder.query<BackendProject[], { status?: string; search?: string; department_id?: number } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.status) params.set('status', filters.status);
          if (filters.search) params.set('search', filters.search);
          if (filters.department_id) params.set('department_id', String(filters.department_id));
        }
        const qs = params.toString();
        return `/projects${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: BackendProject[] })?.data ?? response;
        return Array.isArray(data) ? (data as BackendProject[]) : [];
      },
    }),

    getProjectById: builder.query<BackendProject, number>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Projects', id }],
      transformResponse: (response: unknown) =>
        ((response as { data?: BackendProject })?.data ?? response) as BackendProject,
    }),

    createProject: builder.mutation<BackendProject, Partial<BackendProject>>({
      query: (data) => ({ url: '/projects', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
      transformResponse: (response: unknown) =>
        ((response as { data?: BackendProject })?.data ?? response) as BackendProject,
    }),

    updateProject: builder.mutation<BackendProject, { id: number; data: Partial<BackendProject> }>({
      query: ({ id, data }) => ({ url: `/projects/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Projects', id }, 'Projects'],
      transformResponse: (response: unknown) =>
        ((response as { data?: BackendProject })?.data ?? response) as BackendProject,
    }),

    deleteProject: builder.mutation<void, number>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
    }),

    restoreProject: builder.mutation<BackendProject, number>({
      query: (id) => ({ url: `/projects/${id}/restore`, method: 'POST' }),
      invalidatesTags: ['Projects'],
    }),

    // ── Members ───────────────────────────────────────────────────────────────
    getProjectMembers: builder.query<ProjectMember[], number>({
      query: (id) => `/projects/${id}/members`,
      providesTags: (_r, _e, id) => [{ type: 'Projects', id: `members-${id}` }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ProjectMember[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
    }),

    addProjectMember: builder.mutation<ProjectMember[], { projectId: number; user_id: number; role?: string }>({
      query: ({ projectId, ...body }) => ({ url: `/projects/${projectId}/members`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Projects', id: `members-${projectId}` }, 'Projects'],
    }),

    removeProjectMember: builder.mutation<void, { projectId: number; userId: number }>({
      query: ({ projectId, userId }) => ({ url: `/projects/${projectId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Projects', id: `members-${projectId}` }, 'Projects'],
    }),

    // ── Ownership ─────────────────────────────────────────────────────────────
    transferOwnership: builder.mutation<BackendProject, { projectId: number; new_owner_id: number; reason?: string }>({
      query: ({ projectId, ...body }) => ({ url: `/projects/${projectId}/transfer-ownership`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),

    updateProjectManager: builder.mutation<BackendProject, { projectId: number; manager_id: number }>({
      query: ({ projectId, ...body }) => ({ url: `/projects/${projectId}/manager`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),

    // ── Activity ──────────────────────────────────────────────────────────────
    getProjectActivity: builder.query<ProjectActivity[], { id: number; limit?: number }>({
      query: ({ id, limit = 50 }) => `/projects/${id}/activity?limit=${limit}`,
      providesTags: (_r, _e, { id }) => [{ type: 'Projects', id: `activity-${id}` }],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ProjectActivity[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
    }),

    // ── Stats ─────────────────────────────────────────────────────────────────
    getProjectStats: builder.query<ProjectStatsData, void>({
      query: () => '/projects/summary',
      providesTags: ['Projects'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: ProjectStatsData })?.data ?? response;
        return (data ?? {}) as ProjectStatsData;
      },
    }),

    // ── Tasks ─────────────────────────────────────────────────────────────────
    getProjectTasks: builder.query<BackendTask[], { projectId?: number; assignedTo?: number; status?: string; search?: string } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.projectId) params.set('project_id', String(filters.projectId));
          if (filters.assignedTo) params.set('assigned_to', String(filters.assignedTo));
          if (filters.status) params.set('status', filters.status);
          if (filters.search) params.set('search', filters.search);
        }
        const qs = params.toString();
        return `/tasks${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Tasks'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: BackendTask[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
    }),

    getMyTasks: builder.query<BackendTask[], void>({
      query: () => '/tasks/my',
      providesTags: ['Tasks'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: BackendTask[] })?.data ?? response;
        return Array.isArray(data) ? data : [];
      },
    }),

    createTaskReal: builder.mutation<BackendTask, Partial<BackendTask>>({
      query: (data) => ({ url: '/tasks', method: 'POST', body: data }),
      invalidatesTags: ['Tasks', 'Projects'],
      transformResponse: (response: unknown) =>
        ((response as { data?: BackendTask })?.data ?? response) as BackendTask,
    }),

    updateTaskReal: builder.mutation<BackendTask, { id: number; data: Partial<BackendTask> }>({
      query: ({ id, data }) => ({ url: `/tasks/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTaskReal: builder.mutation<void, number>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tasks'],
    }),

    reassignTask: builder.mutation<BackendTask, { id: number; new_user_id: number; new_manager_id?: number }>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}/reassign`, method: 'POST', body }),
      invalidatesTags: ['Tasks'],
    }),

    getTaskStats: builder.query<{ total: number; completed: number; pending: number; inProgress: number }, { projectId?: number; assignedTo?: number } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.projectId) params.set('project_id', String(filters.projectId));
          if (filters.assignedTo) params.set('assigned_to', String(filters.assignedTo));
        }
        const qs = params.toString();
        return `/tasks/summary${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Tasks'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetRawProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useRestoreProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useTransferOwnershipMutation,
  useUpdateProjectManagerMutation,
  useGetProjectActivityQuery,
  useGetProjectStatsQuery,
  useGetProjectTasksQuery,
  useGetMyTasksQuery,
  useCreateTaskRealMutation,
  useUpdateTaskRealMutation,
  useDeleteTaskRealMutation,
  useReassignTaskMutation,
  useGetTaskStatsQuery,
} = projectApiSlice;
