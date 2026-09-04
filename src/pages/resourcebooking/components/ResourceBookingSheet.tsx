import { useEffect, useState } from 'react';
import { Drawer, Button, Select, Input, Alert } from 'antd';
import { CalendarDays, Clock } from 'lucide-react';

import {
  useCreateResourceBookingMutation,
  useCheckResourceAvailabilityQuery,
} from '@/store/api/resourceBookingSlice';

const { TextArea } = Input;

interface ResourceBookingSheetProps {
  open: boolean;
  resource: any;
  resources: any[];
  onClose: () => void;
}

const ResourceBookingSheet = ({
  open,
  resource,
  resources,
  onClose,
}: ResourceBookingSheetProps) => {
  const [resourceId, setResourceId] = useState<number | ''>(
    resource?.id ?? ''
  );
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const [createBooking, { isLoading: creating }] =
    useCreateResourceBookingMutation();

  useEffect(() => {
    if (open) {
      setResourceId(resource?.id ?? '');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setNotes('');
      setAvailabilityChecked(false);
    }
  }, [open, resource]);

  const canCheckAvailability =
    !!resourceId &&
    !!date &&
    !!startTime &&
    !!endTime &&
    startTime < endTime;

  const startDatetime =
    date && startTime ? `${date} ${startTime}:00` : '';
  const endDatetime =
    date && endTime ? `${date} ${endTime}:00` : '';

  const {
    data: availability,
    isFetching: checkingAvailability,
  } = useCheckResourceAvailabilityQuery(
    {
      resource_id: Number(resourceId),
      start_datetime: startDatetime,
      end_datetime: endDatetime,
    },
    {
      skip: !availabilityChecked || !canCheckAvailability,
    }
  );

  const handleCheckAvailability = () => {
    if (!canCheckAvailability) return;
    setAvailabilityChecked(true);
  };

  const handleSubmit = async () => {
    if (!canCheckAvailability || !availability?.available) return;

    try {
      await createBooking({
        resource_id: Number(resourceId),
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        purpose,
        notes,
      }).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <Drawer
      title="Book Resource"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>

          {!availabilityChecked ? (
            <Button
              type="primary"
              disabled={!canCheckAvailability || checkingAvailability}
              loading={checkingAvailability}
              onClick={handleCheckAvailability}
            >
              Check Availability
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={
                !availability?.available ||
                creating ||
                checkingAvailability
              }
              loading={creating}
              onClick={handleSubmit}
            >
              Book Resource
            </Button>
          )}
        </div>
      }
    >
      <p className="mb-6 text-sm text-gray-500">
        Reserve a company resource for a specific date and time.
      </p>

      <div className="space-y-5">
        {/* Resource Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Resource</label>
          <Select
            className="w-full"
            placeholder="Select a resource"
            value={resourceId || undefined}
            onChange={(value) => {
              setResourceId(value);
              setAvailabilityChecked(false);
            }}
            options={resources.map((item) => ({
              value: item.id,
              label: `${item.name} - ${item.type}`,
            }))}
          />
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input
            type="date"
            prefix={<CalendarDays className="mr-1 h-4 w-4 text-gray-400" />}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setAvailabilityChecked(false);
            }}
          />
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="time"
              prefix={<Clock className="mr-1 h-4 w-4 text-gray-400" />}
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setAvailabilityChecked(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input
              type="time"
              prefix={<Clock className="mr-1 h-4 w-4 text-gray-400" />}
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setAvailabilityChecked(false);
              }}
            />
          </div>
        </div>

        {/* Validation Error */}
        {startTime && endTime && startTime >= endTime && (
          <p className="text-sm text-red-500">
            End time must be after start time.
          </p>
        )}

        {/* Purpose */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Purpose</label>
          <Input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Team meeting"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional information..."
            rows={4}
          />
        </div>

        {/* Availability Feedback */}
        {availabilityChecked && (
          <div className="pt-2">
            {checkingAvailability ? (
              <Alert
                type="info"
                message="Checking availability..."
                showIcon
              />
            ) : availability?.available ? (
              <Alert
                type="success"
                message="Resource is available for the selected time."
                showIcon
              />
            ) : (
              <Alert
                type="error"
                message="Resource is not available for the selected time."
                showIcon
              />
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ResourceBookingSheet;