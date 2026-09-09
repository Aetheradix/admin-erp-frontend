import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';

import type { ResourceBooking } from '@/store/api/resourceBookingSlice';

import type { Resource, CreateResourceBookingRequest } from '../types/index.types';

interface ResourceBookingModalProps {
  open: boolean;
  resource: Resource | null;
  resources: Resource[];
  bookings: ResourceBooking[];
  onClose: () => void;
  onSubmit: (data: CreateResourceBookingRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const ResourceBookingModal = ({
  open,
  resource,
  resources,
  bookings,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ResourceBookingModalProps) => {
  const [selectedResourceId, setSelectedResourceId] = useState('');

  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [purpose, setPurpose] = useState('');

  /*
   * Reset form whenever modal opens.
   */
  useEffect(() => {
    if (!open) return;

    setSelectedResourceId(resource?.id ? String(resource.id) : '');

    setStartDatetime('');
    setEndDatetime('');
    setPurpose('');
  }, [open, resource]);

  /*
   * Validate date range.
   */
  const invalidTime = useMemo(() => {
    if (!startDatetime || !endDatetime) {
      return false;
    }

    return new Date(endDatetime).getTime() <= new Date(startDatetime).getTime();
  }, [startDatetime, endDatetime]);

  /*
   * Find conflicting booking.
   */
  const conflictingBooking = useMemo(() => {
    if (!selectedResourceId || !startDatetime || !endDatetime || invalidTime) {
      return null;
    }

    const selectedResource = Number(selectedResourceId);

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    return (
      bookings.find((booking) => {
        /*
         * Different resource = no conflict.
         */
        if (Number(booking.resource_id) !== selectedResource) {
          return false;
        }

        /*
         * These statuses should not block availability.
         */
        if (
          booking.status === 'cancelled' ||
          booking.status === 'rejected' ||
          booking.status === 'completed'
        ) {
          return false;
        }

        const bookingStart = new Date(booking.start_datetime);

        const bookingEnd = new Date(booking.end_datetime);

        /*
         * Overlap:
         *
         * requested start < existing end
         * AND
         * requested end > existing start
         */
        return start < bookingEnd && end > bookingStart;
      }) ?? null
    );
  }, [bookings, selectedResourceId, startDatetime, endDatetime, invalidTime]);

  const canCheckAvailability =
    Boolean(selectedResourceId) && Boolean(startDatetime) && Boolean(endDatetime) && !invalidTime;

  const isAvailable = canCheckAvailability && !conflictingBooking;

  /*
   * Submit booking.
   */
  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!selectedResourceId || !startDatetime || !endDatetime) {
      return;
    }

    if (invalidTime) {
      return;
    }

    if (conflictingBooking) {
      return;
    }

    const bookingData: CreateResourceBookingRequest = {
      resource_id: Number(selectedResourceId),
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      purpose: purpose.trim(),
    };

    /*
     * This calls:
     *
     * useResourceBookingPage()
     *        ↓
     * handleBookingSubmit()
     *        ↓
     * createResourceBooking()
     *        ↓
     * NETWORK REQUEST
     */
    await onSubmit(bookingData);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Book Resource</h2>

            <p className="text-sm text-muted-foreground">
              Create a reservation for a company resource.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* Resource */}
          <div className="space-y-2">
            <label htmlFor="resource" className="text-sm font-medium">
              Resource
            </label>

            <select
              id="resource"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="" disabled>
                Select resource
              </option>

              {resources.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start */}
          <div className="space-y-2">
            <label htmlFor="start-datetime" className="text-sm font-medium">
              Start Date & Time
            </label>

            <input
              id="start-datetime"
              type="datetime-local"
              value={startDatetime}
              onChange={(e) => setStartDatetime(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          {/* End */}
          <div className="space-y-2">
            <label htmlFor="end-datetime" className="text-sm font-medium">
              End Date & Time
            </label>

            <input
              id="end-datetime"
              type="datetime-local"
              value={endDatetime}
              onChange={(e) => setEndDatetime(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />

            {invalidTime && (
              <p className="text-xs text-red-600">
                End date and time must be after the start date and time.
              </p>
            )}
          </div>

          {/* Availability */}
          {canCheckAvailability && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                conflictingBooking
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {conflictingBooking ? (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <div className="text-sm">
                {conflictingBooking ? (
                  <>
                    <p className="font-medium">Resource is not available</p>

                    <p className="mt-1">
                      Already booked from{' '}
                      {new Date(conflictingBooking.start_datetime).toLocaleString()} to{' '}
                      {new Date(conflictingBooking.end_datetime).toLocaleString()}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Resource is available</p>

                    <p className="mt-1">This resource is available for the selected time.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div className="space-y-2">
            <label htmlFor="purpose" className="text-sm font-medium">
              Purpose
            </label>

            <textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={isSubmitting}
              placeholder="Why do you need this resource?"
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isAvailable || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

            {isSubmitting ? 'Booking...' : 'Book Resource'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceBookingModal;
