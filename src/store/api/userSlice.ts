import { apiSlice } from './apiSlice';

export const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation<any, string>({
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
  useDeleteUserMutation,
} = userSlice;
