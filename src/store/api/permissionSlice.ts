import { apiSlice } from './apiSlice';

export const permissionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeaturePermissions: builder.query<any[], void>({
      query: () => '/feature-permissions',
      providesTags: ['Permissions'],
    }),
    getMyPermissions: builder.query<Record<string, boolean>, void>({
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
