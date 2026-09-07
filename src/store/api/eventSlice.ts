import type { ERPEvent, EventFilters, FilterOptions } from '@/types/models';
import { apiSlice } from './apiSlice';
import { mapEvent } from './mappers';

export interface EventPassData {
  passCode: string;
  eventId: number | string;
  eventTitle: string;
  category: string;
  eventDate: string;
  time: string;
  location: string;
  username: string;
  recipientEmail: string;
  emailSent: boolean;
}

export const eventSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<ERPEvent[], EventFilters | void>({
      query: (filters) => {
        if (!filters) return '/events';
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'All') {
          params.append('category', filters.category);
        }
        if (filters.categories && filters.categories.length > 0) {
          params.append('categories', filters.categories.join(','));
        }
        if (filters.tags && filters.tags.length > 0) {
          params.append('tags', filters.tags.join(','));
        }
        if (filters.employee_status) {
          params.append('employee_status', filters.employee_status);
        }
        if (filters.employee_statuses && filters.employee_statuses.length > 0) {
          params.append('employee_statuses', filters.employee_statuses.join(','));
        }
        if (filters.department) {
          params.append('department', filters.department);
        }
        if (filters.departments && filters.departments.length > 0) {
          params.append('departments', filters.departments.join(','));
        }
        if (filters.start_date) {
          params.append('start_date', filters.start_date);
        }
        if (filters.end_date) {
          params.append('end_date', filters.end_date);
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        if (filters.user_id) {
          params.append('user_id', String(filters.user_id));
        }
        const queryString = params.toString();
        return queryString ? `/events?${queryString}` : '/events';
      },
      providesTags: ['Event'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: unknown[] })?.data ?? response;
        return Array.isArray(data)
          ? data.map((item) => mapEvent(item as Record<string, unknown>))
          : [];
      },
    }),
    getFilterOptions: builder.query<FilterOptions, void>({
      query: () => '/events/filters',
      providesTags: ['Event'],
      transformResponse: (response: unknown) => {
        const data = (response as { data?: FilterOptions })?.data;
        return (
          data ?? {
            categories: [],
            tags: [],
            employeeStatuses: [],
            departments: [],
          }
        );
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
    registerEvent: builder.mutation<{ success: boolean; data: EventPassData }, string | number>({
      query: (id) => ({
        url: `/events/${id}/register`,
        method: 'POST',
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<ERPEvent, { id: string | number; data: Partial<ERPEvent> }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: `PUT`,
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
  useGetFilterOptionsQuery,
  useCreateEventMutation,
  useRegisterEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventSlice;

