import { apiSlice } from './apiSlice';

export interface HierarchyNodeUser {
  id: number;
  username: string;
  email: string;
  role: string;
  roles?: Array<{ id: number; name: string; is_system: boolean }>;
  department: string;
  department_id?: number | null;
  designation?: string | null;
  employee_code?: string | null;
  image_url?: string | null;
  contact_number?: string | null;
  reporting_manager_id?: number | null;
  reporting_manager_name?: string | null;
  reporting_manager_email?: string | null;
  reporting_manager_role?: string | null;
  directReports: HierarchyNodeUser[];
  subordinatesCount: number;
}

export interface DepartmentHierarchyItem {
  id: number;
  department_name: string;
  parent_department_id?: number | null;
  parent_department_name?: string | null;
  head_user_id?: number | null;
  head_name?: string | null;
  head_email?: string | null;
  head_role?: string | null;
  head_image?: string | null;
  member_count: number;
  is_active: number | boolean;
}

export interface OrganizationHierarchyData {
  tree: HierarchyNodeUser[];
  flatUsers: HierarchyNodeUser[];
  departments: DepartmentHierarchyItem[];
  stats: {
    totalEmployees: number;
    totalManagers: number;
    totalDepartments: number;
    hierarchyDepth: number;
  };
}

export interface MatrixManagerRelation {
  relation_id: number;
  matrix_manager_id: number;
  relationship_type: string;
  reason?: string | null;
  effective_date?: string | null;
  manager_name: string;
  manager_email: string;
  manager_designation?: string | null;
  manager_role?: string | null;
}

export interface MatrixReportRelation {
  relation_id: number;
  user_id: number;
  relationship_type: string;
  reason?: string | null;
  effective_date?: string | null;
  employee_name: string;
  employee_email: string;
  employee_designation?: string | null;
  employee_role?: string | null;
}

export interface UserMatrixData {
  userId: number;
  matrixManagers: MatrixManagerRelation[];
  matrixReports: MatrixReportRelation[];
}

export interface HierarchyAuditLogItem {
  id: number;
  action_type: string;
  reason: string | null;
  effective_date: string | null;
  affected_count: number;
  metadata: any;
  created_at: string;
  actor_id: number | null;
  actor_name: string | null;
  actor_email: string | null;
  target_user_id: number | null;
  target_user_name: string | null;
  target_user_email: string | null;
  from_manager_id: number | null;
  from_manager_name: string | null;
  to_manager_id: number | null;
  to_manager_name: string | null;
}

export interface HierarchyAuditTrailResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  logs: HierarchyAuditLogItem[];
}

export interface ChangeReportingManagerPayload {
  userId: number;
  reportingManagerId: number | null;
  reason?: string;
  effectiveDate?: string;
}

export interface BulkHandoverPayload {
  fromManagerId: number;
  toManagerId: number;
  reason: string;
  effectiveDate?: string;
}

export interface ReplaceManagerPayload {
  currentManagerId: number;
  newManagerId: number;
  reason: string;
  effectiveDate?: string;
}

export interface OffboardRollupPayload {
  terminatingUserId: number;
  reason: string;
  effectiveDate?: string;
}

export interface AddMatrixManagerPayload {
  userId: number;
  matrixManagerId: number;
  relationshipType?: string;
  reason?: string;
  effectiveDate?: string;
}

export interface RemoveMatrixManagerPayload {
  userId: number;
  matrixManagerId: number;
  reason?: string;
}

export interface AuditTrailQueryParams {
  page?: number;
  limit?: number;
  actionType?: string;
  targetUserId?: number;
  actorId?: number;
  startDate?: string;
  endDate?: string;
}

export const organizationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationHierarchy: builder.query<
      { success: boolean; data: OrganizationHierarchyData },
      void
    >({
      query: () => '/organization/hierarchy',
      providesTags: ['OrganizationHierarchy', 'User', 'Departments'],
    }),

    // Flow A: Change Reporting Manager
    updateReportingManager: builder.mutation<
      { success: boolean; message: string; data: any },
      ChangeReportingManagerPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/reporting-manager',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User', 'RoleAuditLogs'],
    }),

    // Flow B.1: Bulk Team Handover
    bulkHandover: builder.mutation<
      { success: boolean; message: string; data: any },
      BulkHandoverPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/bulk-handover',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User', 'RoleAuditLogs'],
    }),

    // Flow B.2: Replace Manager
    replaceManager: builder.mutation<
      { success: boolean; message: string; data: any },
      ReplaceManagerPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/replace-manager',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User', 'RoleAuditLogs'],
    }),

    // Flow B.3: Offboard Rollup
    offboardRollup: builder.mutation<
      { success: boolean; message: string; data: any },
      OffboardRollupPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/offboard-rollup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User', 'RoleAuditLogs'],
    }),

    // Flow C: Add Matrix Manager
    addMatrixManager: builder.mutation<
      { success: boolean; message: string; data: any },
      AddMatrixManagerPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/matrix-manager',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User'],
    }),

    // Flow C: Remove Matrix Manager
    removeMatrixManager: builder.mutation<
      { success: boolean; message: string; data: any },
      RemoveMatrixManagerPayload
    >({
      query: (body) => ({
        url: '/organization/hierarchy/matrix-manager',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User'],
    }),

    // Flow C: Get Matrix Managers for User
    getMatrixManagersForUser: builder.query<
      { success: boolean; message: string; data: UserMatrixData },
      number | string
    >({
      query: (userId) => `/organization/hierarchy/matrix-managers/${userId}`,
      providesTags: ['OrganizationHierarchy'],
    }),

    // Flow D: Audit Trail
    getHierarchyAuditTrail: builder.query<
      { success: boolean; message: string; data: HierarchyAuditTrailResponse },
      AuditTrailQueryParams | void
    >({
      query: (params) => ({
        url: '/organization/hierarchy/audit-trail',
        params: params || {},
      }),
      providesTags: ['RoleAuditLogs', 'OrganizationHierarchy'],
    }),

    // Rebuild Closure Table Maintenance
    rebuildClosureTable: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: '/organization/hierarchy/closure/rebuild',
        method: 'POST',
      }),
      invalidatesTags: ['OrganizationHierarchy'],
    }),

    updateDepartmentHierarchy: builder.mutation<
      { success: boolean; message: string; data: any },
      { departmentId: number; parentDepartmentId?: number | null; headUserId?: number | null }
    >({
      query: (body) => ({
        url: '/organization/hierarchy/department',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'Departments', 'RoleAuditLogs'],
    }),
  }),
});

export const {
  useGetOrganizationHierarchyQuery,
  useUpdateReportingManagerMutation,
  useBulkHandoverMutation,
  useReplaceManagerMutation,
  useOffboardRollupMutation,
  useAddMatrixManagerMutation,
  useRemoveMatrixManagerMutation,
  useGetMatrixManagersForUserQuery,
  useGetHierarchyAuditTrailQuery,
  useRebuildClosureTableMutation,
  useUpdateDepartmentHierarchyMutation,
} = organizationApiSlice;
