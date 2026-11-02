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

export const organizationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationHierarchy: builder.query<
      { success: boolean; data: OrganizationHierarchyData },
      void
    >({
      query: () => '/organization/hierarchy',
      providesTags: ['OrganizationHierarchy', 'User', 'Departments'],
    }),

    updateReportingManager: builder.mutation<
      { success: boolean; message: string; data: any },
      { userId: number; reportingManagerId: number | null }
    >({
      query: (body) => ({
        url: '/organization/hierarchy/reporting-manager',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OrganizationHierarchy', 'User', 'RoleAuditLogs'],
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
  useUpdateDepartmentHierarchyMutation,
} = organizationApiSlice;

