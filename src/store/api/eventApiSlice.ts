import type { ERPEvent } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapEvent } from './mappers';

export type { ERPEvent };

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ERPEvent[], void>({
      query: () => '/events',
      providesTags: ['Event'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapEvent(item as Record<string, unknown>))
          : [];
      },
    }),
    createEvent: builder.mutation<ERPEvent, Partial<ERPEvent>>({
      query: (eventData) => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const { useGetEventsQuery, useCreateEventMutation, useDeleteEventMutation } = eventApiSlice;
