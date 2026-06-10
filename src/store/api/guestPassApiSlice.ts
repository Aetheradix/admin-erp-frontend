import { apiSlice } from './apiSlice';

export const guestPassApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGuestPasses: builder.query<any[], void>({
      query: () => '/guest-passes/',
      providesTags: ['GuestPasses'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((pass: any) => ({
          ...pass,
          guestName: pass.guest_name,
          hostName: pass.username || 'Employee',
          purpose: pass.visit_purpose,
          visitDate: pass.visit_date,
          accessCode: pass.pass_code,
          status: pass.status,
        }));
      },
    }),
    issueGuestPass: builder.mutation<any, any>({
      query: (passData) => ({
        url: '/guest-passes/create',
        method: 'POST',
        body: {
          guest_name: passData.guestName,
          guest_email: passData.email || '',
          visit_purpose: passData.purpose,
          visit_date: passData.visitDate,
        },
      }),
      invalidatesTags: ['GuestPasses'],
    }),
    revokeGuestPass: builder.mutation<any, string>({
      query: (id) => ({
        url: `/guest-passes/${id}/revoke`,
        method: 'PUT',
      }),
      invalidatesTags: ['GuestPasses'],
    }),
     getGuestPassesRecords: builder.query<any[], void>({
      query: () => '/guest-passes/',
      providesTags: ['GuestPasses'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((pass: any) => ({
          ...pass,
          guestName: pass.guest_name,
          hostName: pass.username || 'Employee',
          purpose: pass.visit_purpose,
          visitDate: pass.visit_date,
          accessCode: pass.pass_code,
          status: pass.status,
        }));
      },
    }),
  }),
});

export const {
  useGetGuestPassesQuery,
  useIssueGuestPassMutation,
  useRevokeGuestPassMutation,
  useGetGuestPassesRecordsQuery,
} = guestPassApiSlice;
