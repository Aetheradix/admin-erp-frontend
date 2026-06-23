import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    promoteToAdmin: builder.mutation({

      query: (userId) => ({
        url: '/auth/promote-to-admin',
        method: 'POST',
        body: { userId },
      }),
    }),
    updateProfile: builder.mutation({


      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
    }),
    requestOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/request-otp',
        method: 'POST',
        body: data,
      }),
    }),
    loginWithOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/login-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    getDepartments: builder.query({
      query: () => '/metadata/departments',
    }),
    requestAdminElevation: builder.mutation({
      query: (data) => ({
        url: '/auth/request-elevation',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getAdminElevationRequests: builder.query<any[], void>({
      query: () => '/auth/elevation-requests',
      providesTags: ['User'],
    }),
    processAdminElevation: builder.mutation({
      query: (data) => ({
        url: '/auth/elevation-requests/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  usePromoteToAdminMutation,
  useUpdateProfileMutation,
  useRequestOTPMutation,
  useLoginWithOTPMutation,
  useResetPasswordMutation,
  useGetDepartmentsQuery,
  useRequestAdminElevationMutation,
  useGetAdminElevationRequestsQuery,
  useProcessAdminElevationMutation,
  useLogoutMutation,
} = authApiSlice;





