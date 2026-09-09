import { useState } from 'react';

import {
  useGetAllResourceBookingsQuery,
  useGetMyResourceBookingsQuery,
  useCreateResourceBookingMutation,
  useCancelResourceBookingMutation,
  useDeleteResourceBookingMutation,
  useGetResourceBookingStatsQuery,
  useGetResourcesQuery,
  useCreateResourceMutation,
  type ResourceBooking,
  type CreateResourceBookingRequest,
  type CreateResourceRequest,
} from '@/store/api/resourceBookingSlice';

import { showToast } from '@/components/ui/composed/Toast.utils';

import type { Resource, ResourceBookingStatus } from '../types/index.types';

export const useResourceBookingPage = () => {
  /* ============================================================
     UI STATE
  ============================================================ */

  const [showForm, setShowForm] = useState(false);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<ResourceBooking | null>(null);

  const [search, setSearch] = useState('');

  const [activeResourceType, setActiveResourceType] = useState('All');

  const [activeStatus, setActiveStatus] = useState('All');

  /* ============================================================
     FILTERS
  ============================================================ */

  const RESOURCE_TYPES = ['All', 'Room', 'Equipment', 'Vehicle', 'Other'];

  const STATUSES: Array<'All' | ResourceBookingStatus> = [
    'All',
    'Pending',
    'Confirmed',
    'Rejected',
    'Cancelled',
    'Completed',
  ];

  /* ============================================================
     RESOURCES
  ============================================================ */

  const { data: resources = [], isLoading: resourcesLoading } = useGetResourcesQuery();

  const [createResource, { isLoading: isCreatingResource }] = useCreateResourceMutation();

  /* ============================================================
     BOOKINGS
  ============================================================ */

  const {
    data: allBookings = [],
    isLoading: allBookingsLoading,
    refetch: refetchAllBookings,
  } = useGetAllResourceBookingsQuery();

  const {
    data: myBookings = [],
    isLoading: myBookingsLoading,
    refetch: refetchMyBookings,
  } = useGetMyResourceBookingsQuery();

  const { data: stats, isLoading: statsLoading } = useGetResourceBookingStatsQuery();

  /* ============================================================
     BOOKING MUTATIONS
  ============================================================ */

  const [createResourceBooking, { isLoading: isCreating }] = useCreateResourceBookingMutation();

  const [cancelResourceBooking, { isLoading: isCancelling }] = useCancelResourceBookingMutation();

  const [deleteResourceBooking, { isLoading: isDeleting }] = useDeleteResourceBookingMutation();

  /* ============================================================
     FILTER MY BOOKINGS
  ============================================================ */

  const filteredMyBookings = myBookings.filter((booking) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      booking.resource_name?.toLowerCase().includes(searchValue) ||
      booking.purpose?.toLowerCase().includes(searchValue);

    const matchesStatus =
      activeStatus === 'All' || booking.status.toLowerCase() === activeStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* ============================================================
     FILTER ALL BOOKINGS
  ============================================================ */

  const filteredAllBookings = allBookings.filter((booking) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      booking.resource_name?.toLowerCase().includes(searchValue) ||
      booking.username?.toLowerCase().includes(searchValue) ||
      booking.purpose?.toLowerCase().includes(searchValue);

    const matchesStatus =
      activeStatus === 'All' || booking.status.toLowerCase() === activeStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* ============================================================
     OPEN BOOKING FORM
  ============================================================ */

  const openBookingForm = (resource: Resource | null = null) => {
    setSelectedResource(resource);
    setShowForm(true);
  };

  /* ============================================================
     CLOSE BOOKING FORM
  ============================================================ */

  const closeBookingForm = () => {
    setShowForm(false);
    setSelectedResource(null);
  };

  /* ============================================================
     CREATE RESOURCE
  ============================================================ */

  const handleCreateResource = async (data: CreateResourceRequest) => {
    console.log('1. Resource data:', data);

    console.log('2. About to call API mutation');

    try {
      const result = await createResource(data).unwrap();

      console.log('3. API SUCCESS:', result);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Resource created successfully.',
        life: 3000,
      });

      return result;
    } catch (error) {
      console.error('3. API ERROR:', error);

      throw error;
    }
  };

  /* ============================================================
     CREATE BOOKING
  ============================================================ */

  const handleBookingSubmit = async (data: CreateResourceBookingRequest) => {
    try {
      await createResourceBooking(data).unwrap();

      closeBookingForm();

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Resource booking created successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to create resource booking:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to create resource booking.',
        life: 3000,
      });

      throw err;
    }
  };

  /* ============================================================
     CANCEL BOOKING
  ============================================================ */

  const handleCancel = async (id: number) => {
    try {
      await cancelResourceBooking(id).unwrap();

      showToast({
        severity: 'success',
        summary: 'Cancelled',
        detail: 'Resource booking cancelled successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to cancel resource booking:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to cancel resource booking.',
        life: 3000,
      });
    }
  };

  /* ============================================================
     DELETE BOOKING
  ============================================================ */

  const handleDelete = async (id: number) => {
    try {
      await deleteResourceBooking(id).unwrap();

      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }

      showToast({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Resource booking deleted successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as {
        data?: {
          message?: string;
        };
      };

      console.error('Failed to delete resource booking:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to delete resource booking.',
        life: 3000,
      });
    }
  };

  /* ============================================================
     BOOKING DETAILS
  ============================================================ */

  const openBookingDetails = (booking: ResourceBooking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  /* ============================================================
     LOADING
  ============================================================ */

  const isLoading = resourcesLoading || allBookingsLoading || myBookingsLoading || statsLoading;

  const isMutating = isCreating || isCreatingResource || isCancelling || isDeleting;

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    /* Resources */
    resources,
    resourcesLoading,
    handleCreateResource,
    isCreatingResource,

    /* Bookings */
    allBookings,
    myBookings,
    filteredAllBookings,
    filteredMyBookings,

    /* Stats */
    stats,

    /* Loading */
    isLoading,
    isCreating,
    isCancelling,
    isDeleting,
    isMutating,

    /* Search */
    search,
    setSearch,

    /* Filters */
    activeResourceType,
    setActiveResourceType,
    RESOURCE_TYPES,

    activeStatus,
    setActiveStatus,
    STATUSES,

    /* Booking Form */
    showForm,
    setShowForm,

    selectedResource,
    setSelectedResource,

    openBookingForm,
    closeBookingForm,

    /* Booking Details */
    selectedBooking,
    openBookingDetails,
    closeBookingDetails,

    /* Actions */
    handleBookingSubmit,
    handleCancel,
    handleDelete,

    /* Refetch */
    refetchAllBookings,
    refetchMyBookings,
  };
};
