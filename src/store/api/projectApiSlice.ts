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
  client_name?: string;
  estimation_unit?: 'points' | 'hours';
  auto_shift_mode?: 'strict' | 'flexible' | 'off';
  color?: string;
  project_type?: string;
  mode?: 'simple' | 'advanced';
  steps?: string[];
  member_ids?: number[];
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
  milestone_id?: number | null;
  parent_task_id?: number | null;
  sprint_id?: number | null;
  estimate_points?: number;
  estimate_hours?: number;
  remaining_hours?: number;
  is_billable?: boolean | number;
  progress?: number;
  blocked_reason?: string | null;
}

export interface BackendMilestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  target_date?: string;
  owner_id?: number;
  owner_name?: string;
  is_fixed?: number | boolean;
  requires_signoff?: number | boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress?: number;
  sort_order?: number;
  task_count?: number;
  completed_task_count?: number;
  created_at?: string;
}

export interface BackendDependency {
  id: number;
  project_id: number;
  predecessor_id: number;
  successor_id: number;
  dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag_days: number;
  predecessor_title?: string;
  successor_title?: string;
  created_at?: string;
}

export interface BackendSprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  capacity_points?: number;
  capacity_hours?: number;
  status: 'planning' | 'active' | 'completed';
  is_active?: number | boolean;
  task_count?: number;
  completed_task_count?: number;
  total_points?: number;
  created_at?: string;
}

export interface BackendTimeEntry {
  id: number;
  user_id: number;
  user_name?: string;
  project_id?: number;
  project_name?: string;
  task_id?: number;
  task_title?: string;
  date: string;
  hours: number;
  description?: string;
  is_billable?: number | boolean;
  category?: string;
  timesheet_id?: number;
  is_running?: number | boolean;
  started_at?: string;
  created_at?: string;
}

export interface BackendTimesheet {
  id: number;
  user_id: number;
  user_name?: string;
  week_start_date: string;
  week_end_date: string;
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: number;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  is_locked?: number | boolean;
}

export interface BackendProjectDocument {
  id: number;
  project_id: number;
  name: string;
  phase?: string;
  owner_role?: string;
  assigned_user_id?: number;
  assigned_user_name?: string;
  due_date?: string;
  milestone_id?: number;
  status: 'not_started' | 'in_progress' | 'done' | 'not_needed';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  external_link?: string;
  not_needed_reason?: string;
  uploaded_at?: string;
  created_at?: string;
}

export interface BackendDocumentTemplate {
  id: number;
  name: string;
  phase?: string;
  owner_role?: string;
  format?: string;
  is_active?: number | boolean;
  version?: number;
  file_url?: string;
  created_at?: string;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Projects ─────────────────────────────────────────────────────────────
    getProjects: builder.query<
      Project[],
      { status?: string; search?: string; department_id?: number } | void
    >({
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
    getRawProjects: builder.query<
      BackendProject[],
      { status?: string; search?: string; department_id?: number } | void
    >({
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

    addProjectMember: builder.mutation<
      ProjectMember[],
      { projectId: number; user_id: number; role?: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: 'Projects', id: `members-${projectId}` },
        'Projects',
      ],
    }),

    removeProjectMember: builder.mutation<void, { projectId: number; userId: number }>({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: 'Projects', id: `members-${projectId}` },
        'Projects',
      ],
    }),

    // ── Ownership ─────────────────────────────────────────────────────────────
    transferOwnership: builder.mutation<
      BackendProject,
      { projectId: number; new_owner_id: number; reason?: string }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/transfer-ownership`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),

    updateProjectManager: builder.mutation<
      BackendProject,
      { projectId: number; manager_id: number }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/manager`,
        method: 'PUT',
        body,
      }),
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
    getProjectTasks: builder.query<
      BackendTask[],
      { projectId?: number; assignedTo?: number; status?: string; search?: string } | void
    >({
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

    reassignTask: builder.mutation<
      BackendTask,
      { id: number; new_user_id: number; new_manager_id?: number }
    >({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}/reassign`, method: 'POST', body }),
      invalidatesTags: ['Tasks'],
    }),

    getTaskStats: builder.query<
      { total: number; completed: number; pending: number; inProgress: number },
      { projectId?: number; assignedTo?: number } | void
    >({
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

    // ── Milestones ───────────────────────────────────────────────────────────
    getMilestones: builder.query<BackendMilestone[], number>({
      query: (projectId) => `/milestones?project_id=${projectId}`,
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendMilestone[] })?.data ?? res ?? []) as BackendMilestone[],
      providesTags: ['Projects'],
    }),
    createMilestone: builder.mutation<BackendMilestone, Partial<BackendMilestone>>({
      query: (data) => ({ url: '/milestones', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendMilestone })?.data ?? res) as BackendMilestone,
    }),
    updateMilestone: builder.mutation<BackendMilestone, { id: number; data: Partial<BackendMilestone> }>({
      query: ({ id, data }) => ({ url: `/milestones/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Projects'],
    }),
    deleteMilestone: builder.mutation<void, number>({
      query: (id) => ({ url: `/milestones/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
    }),
    signoffMilestone: builder.mutation<BackendMilestone, { id: number; approval_status?: string }>({
      query: ({ id, approval_status }) => ({ url: `/milestones/${id}/signoff`, method: 'POST', body: { approval_status } }),
      invalidatesTags: ['Projects'],
    }),

    // ── Dependencies ─────────────────────────────────────────────────────────
    getDependencies: builder.query<BackendDependency[], number>({
      query: (projectId) => `/dependencies?project_id=${projectId}`,
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendDependency[] })?.data ?? res ?? []) as BackendDependency[],
      providesTags: ['Tasks'],
    }),
    createDependency: builder.mutation<BackendDependency, Partial<BackendDependency>>({
      query: (data) => ({ url: '/dependencies', method: 'POST', body: data }),
      invalidatesTags: ['Tasks'],
    }),
    deleteDependency: builder.mutation<void, number>({
      query: (id) => ({ url: `/dependencies/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tasks'],
    }),

    // ── Sprints ──────────────────────────────────────────────────────────────
    getSprints: builder.query<BackendSprint[], number>({
      query: (projectId) => `/sprints?project_id=${projectId}`,
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendSprint[] })?.data ?? res ?? []) as BackendSprint[],
      providesTags: ['Projects', 'Tasks'],
    }),
    createSprint: builder.mutation<BackendSprint, Partial<BackendSprint>>({
      query: (data) => ({ url: '/sprints', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
    }),
    updateSprint: builder.mutation<BackendSprint, { id: number; data: Partial<BackendSprint> }>({
      query: ({ id, data }) => ({ url: `/sprints/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Projects'],
    }),
    startSprint: builder.mutation<BackendSprint, number>({
      query: (id) => ({ url: `/sprints/${id}/start`, method: 'POST' }),
      invalidatesTags: ['Projects', 'Tasks'],
    }),
    completeSprint: builder.mutation<BackendSprint, { id: number; move_to_sprint_id?: number | null }>({
      query: ({ id, move_to_sprint_id }) => ({
        url: `/sprints/${id}/complete`,
        method: 'POST',
        body: { move_to_sprint_id },
      }),
      invalidatesTags: ['Projects', 'Tasks'],
    }),
    assignTaskToSprint: builder.mutation<void, { sprintId: number | 'backlog'; taskId: number }>({
      query: ({ sprintId, taskId }) => ({
        url: `/sprints/${sprintId}/assign-task`,
        method: 'POST',
        body: { task_id: taskId },
      }),
      invalidatesTags: ['Projects', 'Tasks'],
    }),

    // ── Time Tracking & Timesheets ───────────────────────────────────────────
    getTimeSetting: builder.query<{ enabled: boolean }, void>({
      query: () => '/time/settings',
      transformResponse: (res: unknown) =>
        ((res as { data?: { enabled: boolean } })?.data ?? { enabled: true }) as { enabled: boolean },
      providesTags: ['Projects'],
    }),
    updateTimeSetting: builder.mutation<{ enabled: boolean }, { enabled: boolean }>({
      query: (body) => ({ url: '/time/settings', method: 'PUT', body }),
      invalidatesTags: ['Projects'],
    }),
    getTimeEntries: builder.query<BackendTimeEntry[], { project_id?: number; user_id?: number; task_id?: number } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.project_id) params.set('project_id', String(filters.project_id));
          if (filters.user_id) params.set('user_id', String(filters.user_id));
          if (filters.task_id) params.set('task_id', String(filters.task_id));
        }
        const qs = params.toString();
        return `/time/entries${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendTimeEntry[] })?.data ?? res ?? []) as BackendTimeEntry[],
      providesTags: ['Projects'],
    }),
    createTimeEntry: builder.mutation<BackendTimeEntry, Partial<BackendTimeEntry>>({
      query: (data) => ({ url: '/time/entries', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
    }),
    updateTimeEntry: builder.mutation<BackendTimeEntry, { id: number; data: Partial<BackendTimeEntry> }>({
      query: ({ id, data }) => ({ url: `/time/entries/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Projects'],
    }),
    stopTimer: builder.mutation<BackendTimeEntry, number>({
      query: (id) => ({ url: `/time/entries/${id}/stop`, method: 'POST' }),
      invalidatesTags: ['Projects'],
    }),
    deleteTimeEntry: builder.mutation<void, number>({
      query: (id) => ({ url: `/time/entries/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
    }),
    getTimesheets: builder.query<BackendTimesheet[], { user_id?: number; status?: string } | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === 'object') {
          if (filters.user_id) params.set('user_id', String(filters.user_id));
          if (filters.status) params.set('status', filters.status);
        }
        const qs = params.toString();
        return `/time/timesheets${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendTimesheet[] })?.data ?? res ?? []) as BackendTimesheet[],
      providesTags: ['Projects'],
    }),
    submitTimesheet: builder.mutation<BackendTimesheet, { week_start_date: string; week_end_date: string }>({
      query: (body) => ({ url: '/time/timesheets/submit', method: 'POST', body }),
      invalidatesTags: ['Projects'],
    }),
    approveTimesheet: builder.mutation<BackendTimesheet, number>({
      query: (id) => ({ url: `/time/timesheets/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Projects'],
    }),
    rejectTimesheet: builder.mutation<BackendTimesheet, { id: number; rejection_reason: string }>({
      query: ({ id, rejection_reason }) => ({
        url: `/time/timesheets/${id}/reject`,
        method: 'POST',
        body: { rejection_reason },
      }),
      invalidatesTags: ['Projects'],
    }),
    reopenTimesheet: builder.mutation<BackendTimesheet, number>({
      query: (id) => ({ url: `/time/timesheets/${id}/reopen`, method: 'POST' }),
      invalidatesTags: ['Projects'],
    }),

    // ── Project Documents & Templates ────────────────────────────────────────
    getProjectDocuments: builder.query<BackendProjectDocument[], number>({
      query: (projectId) => `/project-documents?project_id=${projectId}`,
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendProjectDocument[] })?.data ?? res ?? []) as BackendProjectDocument[],
      providesTags: ['Projects'],
    }),
    createProjectDocument: builder.mutation<BackendProjectDocument, Partial<BackendProjectDocument>>({
      query: (data) => ({ url: '/project-documents', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
    }),
    updateProjectDocument: builder.mutation<BackendProjectDocument, { id: number; data: Partial<BackendProjectDocument> }>({
      query: ({ id, data }) => ({ url: `/project-documents/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Projects'],
    }),
    deleteProjectDocument: builder.mutation<void, number>({
      query: (id) => ({ url: `/project-documents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
    }),
    getDocumentTemplates: builder.query<BackendDocumentTemplate[], void>({
      query: () => '/project-documents/templates',
      transformResponse: (res: unknown) =>
        ((res as { data?: BackendDocumentTemplate[] })?.data ?? res ?? []) as BackendDocumentTemplate[],
      providesTags: ['Projects'],
    }),
    createDocumentTemplate: builder.mutation<BackendDocumentTemplate, Partial<BackendDocumentTemplate>>({
      query: (data) => ({ url: '/project-documents/templates', method: 'POST', body: data }),
      invalidatesTags: ['Projects'],
    }),
    deleteDocumentTemplate: builder.mutation<void, number>({
      query: (id) => ({ url: `/project-documents/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
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
  useGetMilestonesQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useSignoffMilestoneMutation,
  useGetDependenciesQuery,
  useCreateDependencyMutation,
  useDeleteDependencyMutation,
  useGetSprintsQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
  useStartSprintMutation,
  useCompleteSprintMutation,
  useAssignTaskToSprintMutation,
  useGetTimeSettingQuery,
  useUpdateTimeSettingMutation,
  useGetTimeEntriesQuery,
  useCreateTimeEntryMutation,
  useUpdateTimeEntryMutation,
  useStopTimerMutation,
  useDeleteTimeEntryMutation,
  useGetTimesheetsQuery,
  useSubmitTimesheetMutation,
  useApproveTimesheetMutation,
  useRejectTimesheetMutation,
  useReopenTimesheetMutation,
  useGetProjectDocumentsQuery,
  useCreateProjectDocumentMutation,
  useUpdateProjectDocumentMutation,
  useDeleteProjectDocumentMutation,
  useGetDocumentTemplatesQuery,
  useCreateDocumentTemplateMutation,
  useDeleteDocumentTemplateMutation,
} = projectApiSlice;
