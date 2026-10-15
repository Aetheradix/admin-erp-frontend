import { apiSlice } from './apiSlice';

export interface PermissionItem {
  id: number;
  name: string;
  module: string;
  action: string;
  description: string;
}

export interface RoleItem {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  user_count: number;
  permissions: PermissionItem[];
  created_at: string;
  updated_at?: string;
}

export interface RbacAuditLogItem {
  id: number;
  action_type: string;
  actor_id: number;
  actor_name: string;
  actor_email: string;
  target_user_id?: number | null;
  target_user_name?: string | null;
  target_user_email?: string | null;
  target_role_id?: number | null;
  target_role_name?: string | null;
  before_state?: any;
  after_state?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<{ success: boolean; data: RoleItem[] }, void>({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),

    getRoleById: builder.query<{ success: boolean; data: RoleItem }, number | string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Roles', id }],
    }),

    createRole: builder.mutation<
      { success: boolean; message: string; data: RoleItem },
      { name: string; description: string; permissionIds: number[] }
    >({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles', 'RoleAuditLogs', 'Permissions'],
    }),

    updateRole: builder.mutation<
      { success: boolean; message: string; data: RoleItem },
      { id: number | string; name?: string; description?: string; permissionIds?: number[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Roles', id },
        'Roles',
        'RoleAuditLogs',
        'Permissions',
        'User',
      ],
    }),

    deleteRole: builder.mutation<{ success: boolean; message: string }, number | string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles', 'RoleAuditLogs'],
    }),

    assignRole: builder.mutation<
      { success: boolean; message: string; data: any },
      { targetUserId: number; roleId: number; teamId?: number | null }
    >({
      query: (body) => ({
        url: '/roles/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles', 'User', 'RoleAuditLogs'],
    }),

    revokeRole: builder.mutation<
      { success: boolean; message: string; data: any },
      { targetUserId: number; roleId: number }
    >({
      query: (body) => ({
        url: '/roles/revoke',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles', 'User', 'RoleAuditLogs'],
    }),

    getUserRoles: builder.query<{ success: boolean; data: any[] }, number | string>({
      query: (userId) => `/roles/user/${userId}`,
      providesTags: ['Roles', 'User'],
    }),

    getPermissions: builder.query<
      {
        success: boolean;
        data: {
          total: number;
          permissions: PermissionItem[];
          modules: Record<string, PermissionItem[]>;
        };
      },
      void
    >({
      query: () => '/permissions',
      providesTags: ['Permissions'],
    }),

    getRbacAuditLogs: builder.query<
      { success: boolean; data: RbacAuditLogItem[] },
      { limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: '/roles/audit/logs',
        params: params || {},
      }),
      providesTags: ['RoleAuditLogs'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleMutation,
  useRevokeRoleMutation,
  useGetUserRolesQuery,
  useGetPermissionsQuery,
  useGetRbacAuditLogsQuery,
} = roleApiSlice;
