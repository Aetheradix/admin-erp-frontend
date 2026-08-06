import { API_URL } from '@/config/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
  ],

  endpoints: () => ({}),
});
