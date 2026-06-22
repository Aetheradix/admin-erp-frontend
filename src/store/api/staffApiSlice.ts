import type { StaffMember } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapStaffMember } from './mappers';

export type { StaffMember };

export const staffApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffMember[], void>({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapStaffMember(item as Record<string, unknown>)) : [];
      },
    }),
    createStaff: builder.mutation<StaffMember, Partial<StaffMember>>({
      query: (staff) => ({
        url: '/users',
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: ['User'],
    }),
    updateStaff: builder.mutation<StaffMember, Partial<StaffMember> & { id: string | number }>({
      query: (staff) => ({
        url: `/users/${staff.id}`,
        method: 'PUT',
        body: staff,
      }),
      invalidatesTags: ['User'],
    }),
    deleteStaff: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApiSlice;
