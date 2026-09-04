// src/hooks/useResourceBookingPage.ts

import { useState } from 'react';

import {
  useGetAllResourceBookingsQuery,
  useGetMyResourceBookingsQuery,
  useCreateResourceBookingMutation,
  useCancelResourceBookingMutation,
  useDeleteResourceBookingMutation,
  useGetResourceBookingStatsQuery,
  type ResourceBooking,
} from '@/store/api/resourceBookingSlice';

import { showToast } from '@/components/ui/composed/Toast.utils';

import type {
  Resource,
  ResourceBookingStatus,
  CreateResourceBookingRequest,
} from '../types/index.types';

export const useResourceBookingPage = () => {
  // ============================================================
  // UI State
  // ============================================================

  const [showForm, setShowForm] = useState(false);

  const [selectedResource, setSelectedResource] =
    useState<Resource | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<ResourceBooking | null>(null);

  const [search, setSearch] = useState('');

  const [activeResourceType, setActiveResourceType] =
    useState('All');

  const [activeStatus, setActiveStatus] =
    useState('All');


  // ============================================================
  // Filters
  // ============================================================

  const RESOURCE_TYPES = [
    'All',
    'Room',
    'Equipment',
    'Vehicle',
    'Other',
  ];

  const STATUSES: Array<'All' | ResourceBookingStatus> = [
    'All',
    'Pending',
    'Confirmed',
    'Rejected',
    'Cancelled',
    'Completed',
  ];


  // ============================================================
  // Queries
  // ============================================================

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

  const {
    data: stats,
    isLoading: statsLoading,
  } = useGetResourceBookingStatsQuery();


  // ============================================================
  // Mutations
  // ============================================================

  const [createResourceBooking, {
    isLoading: isCreating,
  }] = useCreateResourceBookingMutation();

  const [cancelResourceBooking, {
    isLoading: isCancelling,
  }] = useCancelResourceBookingMutation();

  const [deleteResourceBooking, {
    isLoading: isDeleting,
  }] = useDeleteResourceBookingMutation();


  // ============================================================
  // Filter My Bookings
  // ============================================================

  const filteredMyBookings = myBookings.filter((booking) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      !search ||
      booking.resource_name
        ?.toLowerCase()
        .includes(searchValue) ||
      booking.purpose
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      activeStatus === 'All' ||
      booking.status === activeStatus;

    return matchesSearch && matchesStatus;
  });


  // ============================================================
  // Filter All Bookings
  // ============================================================

  const filteredAllBookings = allBookings.filter((booking) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      !search ||
      booking.resource_name
        ?.toLowerCase()
        .includes(searchValue) ||
      booking.username
        ?.toLowerCase()
        .includes(searchValue) ||
      booking.purpose
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      activeStatus === 'All' ||
      booking.status === activeStatus;

    return matchesSearch && matchesStatus;
  });


  // ============================================================
  // Open Booking Form
  // ============================================================

  const openBookingForm = (
    resource: Resource | null = null
  ) => {
    setSelectedResource(resource);
    setShowForm(true);
  };


  // ============================================================
  // Close Booking Form
  // ============================================================

  const closeBookingForm = () => {
    setShowForm(false);
    setSelectedResource(null);
  };


  // ============================================================
  // Create Booking
  // ============================================================

  const handleBookingSubmit = async (
    data: CreateResourceBookingRequest
  ) => {
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

      console.error(
        'Failed to create resource booking:',
        err
      );

      showToast({
        severity: 'error',
        summary: 'Error',
        detail:
          apiError.data?.message ||
          'Failed to create resource booking.',
        life: 3000,
      });
    }
  };


  // ============================================================
  // Cancel Booking
  // ============================================================

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

      console.error(
        'Failed to cancel resource booking:',
        err
      );

      showToast({
        severity: 'error',
        summary: 'Error',
        detail:
          apiError.data?.message ||
          'Failed to cancel resource booking.',
        life: 3000,
      });
    }
  };


  // ============================================================
  // Delete Booking
  // ============================================================

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

      console.error(
        'Failed to delete resource booking:',
        err
      );

      showToast({
        severity: 'error',
        summary: 'Error',
        detail:
          apiError.data?.message ||
          'Failed to delete resource booking.',
        life: 3000,
      });
    }
  };


  // ============================================================
  // Select Booking
  // ============================================================

  const openBookingDetails = (
    booking: ResourceBooking
  ) => {
    setSelectedBooking(booking);
  };


  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };


  // ============================================================
  // Loading State
  // ============================================================

  const isLoading =
    allBookingsLoading ||
    myBookingsLoading ||
    statsLoading;

  const isMutating =
    isCreating ||
    isCancelling ||
    isDeleting;


  // ============================================================
  // Return
  // ============================================================

  return {
    // ----------------------------------------------------------
    // Bookings
    // ----------------------------------------------------------

    allBookings,
    myBookings,

    filteredAllBookings,
    filteredMyBookings,

    // ----------------------------------------------------------
    // Stats
    // ----------------------------------------------------------

    stats,

    // ----------------------------------------------------------
    // Loading
    // ----------------------------------------------------------

    isLoading,
    isCreating,
    isCancelling,
    isDeleting,
    isMutating,

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    search,
    setSearch,

    // ----------------------------------------------------------
    // Filters
    // ----------------------------------------------------------

    activeResourceType,
    setActiveResourceType,

    RESOURCE_TYPES,

    activeStatus,
    setActiveStatus,

    STATUSES,

    // ----------------------------------------------------------
    // Booking Form
    // ----------------------------------------------------------

    showForm,
    setShowForm,

    selectedResource,
    setSelectedResource,

    openBookingForm,
    closeBookingForm,

    // ----------------------------------------------------------
    // Booking Details
    // ----------------------------------------------------------

    selectedBooking,
    openBookingDetails,
    closeBookingDetails,

    // ----------------------------------------------------------
    // Actions
    // ----------------------------------------------------------

    handleBookingSubmit,
    handleCancel,
    handleDelete,

    // ----------------------------------------------------------
    // Manual Refetch
    // ----------------------------------------------------------

    refetchAllBookings,
    refetchMyBookings,
  };
};