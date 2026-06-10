import { apiSlice } from './apiSlice';

export const guestpassSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPasses: builder.query<any[], void>({
      query: () => '/guestpasses',
      providesTags: ['GuestPasses'],
    }),
    issuePass: builder.mutation<any, any>({
      query: (data) => ({
        url: '/guestpasses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GuestPasses'],
    }),
    revokePass: builder.mutation<any, string>({
      query: (id) => ({
        url: `/guestpasses/${id}/revoke`,
        method: 'PUT',
      }),
      invalidatesTags: ['GuestPasses'],
    }),
    useGetGuestPassesRecords: builder.query<any[], void>({
      query: () => '/guestpasses',
      providesTags: ['GuestPasses'],
    }),

  }),
});

export const {
  useGetPassesQuery,
  useIssuePassMutation,
  useRevokePassMutation,
  useUseGetGuestPassesRecordsQuery,
} = guestpassSlice;
