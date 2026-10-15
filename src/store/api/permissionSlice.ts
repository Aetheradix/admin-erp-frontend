import { apiSlice } from './apiSlice';

interface MyPermissionsResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    username: string;
    email: string;
    department: string;
    status: string;
    roles: string[];
    isSuperadmin: boolean;
    permissions: string[];
    teamScopes: {
      roleId: number;
      roleName: string;
      teamId: number | null;
      teamName: string | null;
    }[];
  };
}

export const permissionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeaturePermissions: builder.query<any[], void>({
      query: () => '/feature-permissions',
      providesTags: ['Permissions'],
    }),
    getMyPermissions: builder.query<MyPermissionsResponse, void>({
      query: () => '/feature-permissions/my',
      providesTags: ['Permissions'],
    }),

    toggleFeature: builder.mutation<
      any,
      { feature_name: string; department: string; is_enabled: boolean }
    >({
      query: (data) => ({
        url: '/feature-permissions/toggle',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permissions'],
    }),
    bulkUpdatePermissions: builder.mutation<any, { updates: any[] }>({
      query: (data) => ({
        url: '/feature-permissions/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
});

export const {
  useGetFeaturePermissionsQuery,
  useGetMyPermissionsQuery,
  useToggleFeatureMutation,
  useBulkUpdatePermissionsMutation,
} = permissionSlice;
