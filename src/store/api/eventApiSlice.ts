import { apiSlice } from './apiSlice';

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<any[], void>({
      query: () => '/events',
      providesTags: ['Event'],
      transformResponse: (response: any) => {
        const data = response.data || response;
        return data.map((event: any) => ({
          ...event,
          id: String(event.id),
          image: event.image_url || event.image,
        }));
      },
    }),
    createEvent: builder.mutation<any, any>({
      query: (eventData) => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<any, string>({
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
  useDeleteEventMutation,
} = eventApiSlice;
