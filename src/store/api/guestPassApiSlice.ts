import type { GuestPass } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapGuestPass } from './mappers';

export type { GuestPass };

export const guestPassApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGuestPasses: builder.query<GuestPass[], void>({
      query: () => '/guest-passes',
      providesTags: ['GuestPasses'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapGuestPass(item as Record<string, unknown>)) : [];
      },
    }),
    issueGuestPass: builder.mutation<GuestPass, Partial<GuestPass> & { email?: string }>({
      query: (passData) => ({
        url: '/guest-passes',
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
    revokeGuestPass: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/guest-passes/${id}/revoke`,
        method: 'PUT',
      }),
      invalidatesTags: ['GuestPasses'],
    }),
  }),
});

export const {
  useGetGuestPassesQuery,
  useIssueGuestPassMutation,
  useRevokeGuestPassMutation,
} = guestPassApiSlice;
