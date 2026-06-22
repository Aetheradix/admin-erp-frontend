import type { ERPEvent } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapEvent } from './mappers';

export const eventSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ERPEvent[], void>({
      query: () => '/events',
      providesTags: ['Event'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data) ? data.map((item) => mapEvent(item as Record<string, unknown>)) : [];
      },
    }),
    createEvent: builder.mutation<ERPEvent, Partial<ERPEvent>>({
      query: (event) => ({
        url: '/events',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<ERPEvent, { id: string | number; data: Partial<ERPEvent> }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<{ success: boolean }, string | number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventSlice;
