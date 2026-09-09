import { apiSlice } from './apiSlice';
import type {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceBooking,
  ResourceBookingStatus,
  ResourceAvailability,
  ResourceBookingStats,
  CreateResourceBookingRequest,
} from '../../pages/resourcebooking/types/index.types';

/* ============================================================
   TYPE RE-EXPORTS (Satisfies component imports from this slice)
============================================================ */

export type {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceBooking,
  ResourceBookingStatus,
  ResourceAvailability,
  ResourceBookingStats,
  CreateResourceBookingRequest,
};

export interface CreateResourceRequest {
  name: string;
  type?: string;
  location?: string;
  description?: string;
  capacity?: number | null;
  is_active?: boolean;
}

/* ============================================================
   HELPER TRANSFORMERS (Backend Raw -> Strict UI Types)
============================================================ */

const mapResourceType = (type?: string | null): ResourceType => {
  if (!type) return 'Other';
  const t = type.trim().toLowerCase();
  if (t === 'room') return 'Room';
  if (t === 'equipment') return 'Equipment';
  if (t === 'vehicle') return 'Vehicle';
  return 'Other';
};

const mapResourceStatus = (raw: { status?: string; is_active?: number | boolean }): ResourceStatus => {
  if (raw.status === 'Active' || raw.status === 'Inactive') {
    return raw.status;
  }
  return raw.is_active ? 'Active' : 'Inactive';
};

const mapBookingStatus = (status?: string): ResourceBookingStatus => {
  if (!status) return 'Pending';
  const s = status.trim().toLowerCase();
  switch (s) {
    case 'confirmed': return 'Confirmed';
    case 'rejected': return 'Rejected';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    default: return 'Pending';
  }
};

const transformResource = (raw: any): Resource => ({
  id: raw.id,
  name: raw.name ?? '',
  type: mapResourceType(raw.type),
  description: raw.description ?? null,
  location: raw.location ?? null,
  capacity: raw.capacity ?? null,
  status: mapResourceStatus(raw),
  image_url: raw.image_url ?? null,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

const transformBooking = (raw: any): ResourceBooking => ({
  id: raw.id,
  resource_id: raw.resource_id,
  user_id: raw.user_id ?? raw.booked_by ?? 0,
  start_datetime: raw.start_datetime,
  end_datetime: raw.end_datetime,
  purpose: raw.purpose ?? null,
  notes: raw.notes ?? null,
  status: mapBookingStatus(raw.status),
  approved_by: raw.approved_by ?? null,
  approved_at: raw.approved_at ?? null,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  resource_name: raw.resource_name,
  resource_type: raw.resource_type ? mapResourceType(raw.resource_type) : undefined,
  resource_location: raw.resource_location ?? raw.location ?? null,
  username: raw.username,
  email: raw.email,
});

/* ============================================================
   API SLICE
============================================================ */

export const resourceBookingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL RESOURCES
    getResources: builder.query<Resource[], void>({
      query: () => '/schedule/get-all',
      transformResponse: (response: { success: boolean; data: any[] }) => {
        const list = response?.data ?? [];
        return list.map(transformResource);
      },
      providesTags: ['Resource'],
    }),

    // CREATE RESOURCE
    createResource: builder.mutation<{ success: boolean; message: string; data?: Resource }, CreateResourceRequest>({
      query: (body) => ({
        url: '/schedule/create-resource',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Resource'],
    }),

    // GET ALL BOOKINGS
    getAllResourceBookings: builder.query<ResourceBooking[], void>({
      query: () => '/schedule',
      transformResponse: (response: { success: boolean; data: any[] }) => {
        const list = response?.data ?? [];
        return list.map(transformBooking);
      },
      providesTags: ['ResourceBooking'],
    }),

    // GET MY BOOKINGS
    getMyResourceBookings: builder.query<ResourceBooking[], void>({
      query: () => '/schedule/my',
      transformResponse: (response: { success: boolean; data: any[] }) => {
        const list = response?.data ?? [];
        return list.map(transformBooking);
      },
      providesTags: ['ResourceBooking'],
    }),

    // GET BOOKING BY ID
    getResourceBookingById: builder.query<ResourceBooking, number>({
      query: (id) => `/schedule/${id}`,
      transformResponse: (response: { success: boolean; data?: any }) => {
        if (!response?.data) throw new Error('Resource booking not found');
        return transformBooking(response.data);
      },
      providesTags: (_res, _err, id) => [{ type: 'ResourceBooking', id }],
    }),

    // CHECK AVAILABILITY
    checkResourceAvailability: builder.query<
      ResourceAvailability,
      { resource_id: number; start_datetime: string; end_datetime: string }
    >({
      query: (params) => ({
        url: '/schedule/availability',
        params,
      }),
      transformResponse: (response: { success: boolean; data?: ResourceAvailability }) => {
        return (
          response?.data ?? {
            available: false,
            message: 'Unable to check availability',
          }
        );
      },
      providesTags: ['ResourceBooking'],
    }),

    // CREATE BOOKING
    createResourceBooking: builder.mutation<
      { success: boolean; message: string; data?: ResourceBooking },
      CreateResourceBookingRequest
    >({
      query: (body) => ({
        url: '/schedule',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ResourceBooking'],
    }),

    // CANCEL BOOKING
    cancelResourceBooking: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/schedule/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ResourceBooking'],
    }),

    // DELETE BOOKING
    deleteResourceBooking: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/schedule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ResourceBooking'],
    }),

    // BOOKING STATS
    getResourceBookingStats: builder.query<ResourceBookingStats, void>({
      query: () => '/schedule/stats',
      transformResponse: (response: { success: boolean; data?: any }) => {
        const data = response?.data ?? {};
        const byStatus = data.byStatus ?? {};
        return {
          total: data.total ?? 0,
          pending: data.pending ?? byStatus.pending ?? 0,
          confirmed: data.confirmed ?? byStatus.confirmed ?? 0,
          rejected: data.rejected ?? byStatus.rejected ?? 0,
          cancelled: data.cancelled ?? byStatus.cancelled ?? 0,
          completed: data.completed ?? byStatus.completed ?? 0,
        };
      },
      providesTags: ['ResourceBooking'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useGetAllResourceBookingsQuery,
  useGetMyResourceBookingsQuery,
  useGetResourceBookingByIdQuery,
  useCheckResourceAvailabilityQuery,
  useCreateResourceBookingMutation,
  useCancelResourceBookingMutation,
  useDeleteResourceBookingMutation,
  useGetResourceBookingStatsQuery,
} = resourceBookingSlice;