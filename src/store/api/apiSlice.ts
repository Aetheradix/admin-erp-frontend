import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl:  'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Blog', 'Career', 'Event', 'Gallery', 'User', 'Attendance', 'Leaves', 'Mood', 'Reimbursements', 'Grievances', 'GuestPasses', 'Projects', 'Permissions'],

  endpoints: () => ({}),
});
