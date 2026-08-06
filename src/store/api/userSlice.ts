import type { StaffMember } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapStaffMember } from './mappers';

export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<StaffMember[], void>({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapStaffMember(item as Record<string, unknown>))
          : [];
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
    updateUserRole: builder.mutation<
      { success: boolean },
      { id: string | number; role: 'admin' | 'user' }
    >({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userSlice;
