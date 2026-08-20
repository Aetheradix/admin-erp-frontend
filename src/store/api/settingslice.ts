import { apiSlice } from './apiSlice';

export const settingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAutoApprove: builder.query<boolean, void>({
      query: () => '/settings/auto-approve',
      transformResponse: (response: unknown) => {
        const data = response as {
          data?: {
            autoapprove?: boolean;
          };
          autoapprove?: boolean;
        };

        return data.data?.autoapprove ?? data.autoapprove ?? false;
      },
      providesTags: ['Settings'],
    }),

    updateAutoApprove: builder.mutation<boolean, { autoapprove: boolean }>({
      query: (data) => ({
        url: '/settings/auto-approve',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const data = response as {
          data?: {
            autoapprove?: boolean;
          };
          autoapprove?: boolean;
        };

        return data.data?.autoapprove ?? data.autoapprove ?? false;
      },
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetAutoApproveQuery, useUpdateAutoApproveMutation } = settingSlice;
