import React, { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { FormField } from '@/components/ui/composed/FormField';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Sparkles, Clock } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';

interface BookResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onBook: (
    itemId: number,
    bookingData: { start_datetime: string; end_datetime: string; purpose?: string; notes?: string }
  ) => Promise<void>;
  isLoading?: boolean;
}

export const BookResourceModal: React.FC<BookResourceModalProps> = ({
  isOpen,
  onClose,
  item,
  onBook,
  isLoading,
}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(12, 0, 0, 0);

  const [startDateTime, setStartDateTime] = useState<string>(tomorrow.toISOString().slice(0, 16));
  const [endDateTime, setEndDateTime] = useState<string>(tomorrowEnd.toISOString().slice(0, 16));
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!item) return null;

  const handleConfirm = async () => {
    if (!startDateTime || !endDateTime) {
      showToast({
        severity: 'warn',
        summary: 'Dates Required',
        detail: 'Please specify both start and end date/time for the reservation.',
      });
      return;
    }

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      showToast({
        severity: 'warn',
        summary: 'Invalid Timeframe',
        detail: 'End date/time must be strictly after the start date/time.',
      });
      return;
    }

    await onBook(item.id, {
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      purpose: purpose || `Reservation for ${item.name}`,
      notes,
    });
    onClose();
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">Schedule Resource Reservation</h2>
            <p className="text-xs text-muted font-bold">
              Reserve "{item.name}" ({item.category} &bull; {item.location})
            </p>
          </div>
        </div>
      }
      className="w-full max-w-lg">
      <div className="flex flex-col gap-4 pt-2">
        <div className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center gap-3 text-xs text-muted font-medium">
          <Clock size={16} className="text-primary shrink-0" />
          <span>
            Backend verification will ensure no overlapping bookings exist for this resource slot.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Start Date & Time" required id="book-start">
            <Input
              id="book-start"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="h-11"
            />
          </FormField>

          <FormField label="End Date & Time" required id="book-end">
            <Input
              id="book-end"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="h-11"
            />
          </FormField>
        </div>

        <FormField label="Booking Purpose / Meeting Title" required id="book-purpose">
          <Input
            id="book-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Q3 Strategic Planning / Client Product Demo"
            className="h-11"
          />
        </FormField>

        <FormField label="Special Requirements or Notes" id="book-notes">
          <Textarea
            id="book-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catering, projector setup, additional microphones, specific driver notes..."
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" onClick={onClose} className="px-5 rounded-2xl font-bold">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 rounded-2xl font-black shadow-md shadow-primary/20">
            {isLoading ? 'Verifying & Booking...' : 'Confirm Reservation'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
