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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useRequestOTPMutation,
  useLoginWithOTPMutation,
} = authApiSlice;

