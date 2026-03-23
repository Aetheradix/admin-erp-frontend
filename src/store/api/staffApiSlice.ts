import { apiSlice } from './apiSlice';

export const staffApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((member: any) => ({
          ...member,
          skills: typeof member.skills === 'string' ? JSON.parse(member.skills) : (member.skills || [])
        }));
      },
    }),
    createStaff: builder.mutation<any, any>({
      query: (staff) => ({
        url: '/users',
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: ['User'],
    }),
    updateStaff: builder.mutation<any, any>({
      query: (staff) => ({
        url: `/users/${staff.id}`,
        method: 'PUT',
        body: staff,
      }),
      invalidatesTags: ['User'],
    }),
    deleteStaff: builder.mutation<any, string>({
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
