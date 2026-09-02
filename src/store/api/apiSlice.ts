import { API_URL } from '@/config/env';
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
    } catch {
      // Ignore localStorage access restrictions in restricted frames
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // Ignore
    }
    // If not already on auth page, redirect cleanly
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Blog',
    'Career',
    'Event',
    'Gallery',
    'User',
    'Attendance',
    'Leaves',
    'Mood',
    'Reimbursements',
    'Grievances',
    'GuestPasses',
    'Projects',
    'Permissions',
    'Tasks',
    'Settings',
  ],
  endpoints: () => ({}),
});
