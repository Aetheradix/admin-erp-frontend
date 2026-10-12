import { apiSlice } from './apiSlice';
import type {
  InventoryItem,
  InventoryStats,
  InventoryFilterOptions,
  InventoryAuditLog,
  InventoryBookingRecord,
  AssignableEmployee,
  InventoryQueryParams,
} from '@/types/inventory';

export const inventorySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query<
      {
        total: number;
        page: number;
        totalPages: number;
        items: InventoryItem[];
      },
      InventoryQueryParams | void
    >({
      query: (params) => ({
        url: '/inventory',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Inventory' as const, id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),

    getInventoryStats: builder.query<InventoryStats, void>({
      query: () => '/inventory/stats',
      transformResponse: (res: { data: InventoryStats }) => res.data,
      providesTags: [{ type: 'Inventory', id: 'STATS' }],
    }),

    getInventoryFilterOptions: builder.query<InventoryFilterOptions, void>({
      query: () => '/inventory/filter-options',
      transformResponse: (res: { data: InventoryFilterOptions }) => res.data,
      providesTags: [{ type: 'Inventory', id: 'OPTIONS' }],
    }),

    getInventoryItemById: builder.query<
      InventoryItem & { auditLogs: InventoryAuditLog[]; bookings: InventoryBookingRecord[] },
      number
    >({
      query: (id) => `/inventory/${id}`,
      transformResponse: (res: { data: InventoryItem & { auditLogs: InventoryAuditLog[]; bookings: InventoryBookingRecord[] } }) =>
        res.data,
      providesTags: (_res, _err, id) => [{ type: 'Inventory', id }],
    }),

    getAssignableEmployees: builder.query<AssignableEmployee[], void>({
      query: () => '/inventory/employees',
      transformResponse: (res: { data: AssignableEmployee[] }) => res.data,
    }),

    createInventoryItem: builder.mutation<InventoryItem, Partial<InventoryItem>>({
      query: (data) => ({
        url: '/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        { type: 'Inventory', id: 'OPTIONS' },
        'Resource',
      ],
    }),

    updateInventoryItem: builder.mutation<
      InventoryItem,
      { id: number; data: Partial<InventoryItem> }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'Resource',
      ],
    }),

    toggleBookableResource: builder.mutation<
      InventoryItem,
      { id: number; is_bookable: boolean | number }
    >({
      query: ({ id, is_bookable }) => ({
        url: `/inventory/${id}/toggle-bookable`,
        method: 'PATCH',
        body: { is_bookable },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'Resource',
        'ResourceBooking',
      ],
    }),

    assignInventoryItem: builder.mutation<
      InventoryItem,
      { id: number; assigned_to: number; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/assign`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
      ],
    }),

    unassignInventoryItem: builder.mutation<
      InventoryItem,
      { id: number; condition_status?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/unassign`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
      ],
    }),

    markForMaintenance: builder.mutation<InventoryItem, { id: number; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/maintenance`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'Resource',
      ],
    }),

    completeMaintenance: builder.mutation<
      InventoryItem,
      { id: number; condition_status?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/maintenance/complete`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'Resource',
      ],
    }),

    deleteOrRetireInventoryItem: builder.mutation<
      { success: boolean; message: string; retired?: boolean; deleted?: boolean },
      { id: number; retireOnly?: boolean }
    >({
      query: ({ id, retireOnly = true }) => ({
        url: `/inventory/${id}?retireOnly=${retireOnly}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'Resource',
      ],
    }),

    bookInventoryResource: builder.mutation<
      any,
      { id: number; start_datetime: string; end_datetime: string; purpose?: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/book`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'STATS' },
        'ResourceBooking',
      ],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetInventoryFilterOptionsQuery,
  useGetInventoryItemByIdQuery,
  useGetAssignableEmployeesQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useToggleBookableResourceMutation,
  useAssignInventoryItemMutation,
  useUnassignInventoryItemMutation,
  useMarkForMaintenanceMutation,
  useCompleteMaintenanceMutation,
  useDeleteOrRetireInventoryItemMutation,
  useBookInventoryResourceMutation,
} = inventorySlice;
