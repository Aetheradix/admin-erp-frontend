import { apiSlice } from './apiSlice';

/* ============================================================
   RESOURCE
============================================================ */

export interface Resource {
  id: number;
  name: string;
  type?: string | null;
  location?: string | null;
  description?: string | null;
  capacity?: number | null;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateResourceRequest {
  name: string;
  type?: string;
  location?: string;
  description?: string;
  capacity?: number | null;
  is_active?: boolean;
}

export interface ResourcesResponse {
  success: boolean;
  message?: string;
  data: Resource[];
}

export interface ResourceResponse {
  success: boolean;
  message: string;
  data?: Resource;
}

/* ============================================================
   RESOURCE BOOKING
============================================================ */

export interface ResourceBooking {
  id: number;
  resource_id: number;
  booked_by: number;
  calendar_event_id?: number | null;

  start_datetime: string;
  end_datetime: string;

  purpose?: string | null;
  notes?: string | null;

  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';

  created_at: string;
  updated_at: string;

  // Joined resource data
  resource_name?: string;
  resource_type?: string;
  location?: string | null;

  // Joined user data
  username?: string;
  email?: string;
}

export interface ResourceAvailability {
  available: boolean;
  conflict: boolean;
}

export interface CreateResourceBookingRequest {
  resource_id: number;
  start_datetime: string;
  end_datetime: string;
  purpose?: string;
  notes?: string;
  calendar_event_id?: number | null;
}

export interface ResourceBookingResponse {
  success: boolean;
  message: string;
  data?: ResourceBooking;
}

export interface ResourceBookingsResponse {
  success: boolean;
  message?: string;
  data: ResourceBooking[];
}

export interface ResourceBookingStats {
  byStatus: Record<string, number>;
  byResourceType: Record<string, number>;
  recent: ResourceBooking[];
}

export interface ResourceBookingStatsResponse {
  success: boolean;
  message?: string;
  data: ResourceBookingStats;
}

/* ============================================================
   API
============================================================ */

export const resourceBookingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ========================================================
       RESOURCES
    ======================================================== */

    getResources: builder.query<Resource[], void>({
      query: () => '/schedule/get-all',

      transformResponse: (response: ResourcesResponse) => {
        return response?.data ?? [];
      },

      providesTags: ['Resource'],
    }),

    createResource: builder.mutation<ResourceResponse, CreateResourceRequest>({
      query: (body) => ({
        url: '/schedule/create-resource',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['Resource'],
    }),

    /* ========================================================
       RESOURCE BOOKINGS
    ======================================================== */

    getAllResourceBookings: builder.query<ResourceBooking[], void>({
      query: () => '/schedule',

      transformResponse: (response: ResourceBookingsResponse) => {
        return response?.data ?? [];
      },

      providesTags: ['ResourceBooking'],
    }),

    getMyResourceBookings: builder.query<ResourceBooking[], void>({
      query: () => '/schedule/my',

      transformResponse: (response: ResourceBookingsResponse) => {
        return response?.data ?? [];
      },

      providesTags: ['ResourceBooking'],
    }),

    getResourceBookingById: builder.query<ResourceBooking, number>({
      query: (id) => `/schedule/${id}`,

      transformResponse: (response: ResourceBookingResponse) => {
        if (!response?.data) {
          throw new Error('Resource booking not found');
        }

        return response.data;
      },

      providesTags: (_result, _error, id) => [
        {
          type: 'ResourceBooking',
          id,
        },
      ],
    }),

    getResourceBookingsByResource: builder.query<ResourceBooking[], number>({
      query: (resourceId) => `/schedule/resource/${resourceId}`,

      transformResponse: (response: ResourceBookingsResponse) => {
        return response?.data ?? [];
      },

      providesTags: (_result, _error, resourceId) => [
        {
          type: 'ResourceBooking',
          id: `RESOURCE-${resourceId}`,
        },
      ],
    }),

    /* ========================================================
       CHECK AVAILABILITY
    ======================================================== */

    checkResourceAvailability: builder.query<
      ResourceAvailability,
      {
        resource_id: number;
        start_datetime: string;
        end_datetime: string;
      }
    >({
      query: ({ resource_id, start_datetime, end_datetime }) => ({
        url: '/schedule/availability',
        params: {
          resource_id,
          start_datetime,
          end_datetime,
        },
      }),

      transformResponse: (response: {
        success: boolean;
        message?: string;
        data?: ResourceAvailability;
      }) => {
        return (
          response?.data ?? {
            available: false,
            conflict: false,
          }
        );
      },

      providesTags: ['ResourceBooking'],
    }),

    /* ========================================================
       CREATE BOOKING
    ======================================================== */

    createResourceBooking: builder.mutation<ResourceBookingResponse, CreateResourceBookingRequest>({
      query: (body) => ({
        url: '/schedule',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['ResourceBooking'],
    }),

    /* ========================================================
       CANCEL BOOKING
    ======================================================== */

    cancelResourceBooking: builder.mutation<ResourceBookingResponse, number>({
      query: (id) => ({
        url: `/schedule/${id}/cancel`,
        method: 'PATCH',
      }),

      invalidatesTags: ['ResourceBooking'],
    }),

    /* ========================================================
       DELETE BOOKING
    ======================================================== */

    deleteResourceBooking: builder.mutation<
      {
        success: boolean;
        message: string;
        data?: unknown;
      },
      number
    >({
      query: (id) => ({
        url: `/schedule/${id}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['ResourceBooking'],
    }),

    /* ========================================================
       BOOKING STATS
    ======================================================== */

    getResourceBookingStats: builder.query<ResourceBookingStats, void>({
      query: () => '/schedule/stats',

      transformResponse: (response: ResourceBookingStatsResponse) => {
        return (
          response?.data ?? {
            byStatus: {},
            byResourceType: {},
            recent: [],
          }
        );
      },

      providesTags: ['ResourceBooking'],
    }),
  }),

  overrideExisting: false,
});

/* ============================================================
   HOOKS
============================================================ */

export const {
  // Resources
  useGetResourcesQuery,
  useCreateResourceMutation,

  // Bookings
  useGetAllResourceBookingsQuery,
  useGetMyResourceBookingsQuery,
  useGetResourceBookingByIdQuery,
  useGetResourceBookingsByResourceQuery,
  useCheckResourceAvailabilityQuery,
  useCreateResourceBookingMutation,
  useCancelResourceBookingMutation,
  useDeleteResourceBookingMutation,
  useGetResourceBookingStatsQuery,
} = resourceBookingSlice;
