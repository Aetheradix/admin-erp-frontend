import { useState } from 'react';
import { X } from 'lucide-react';

import type { CreateResourceRequest } from '@/store/api/resourceBookingSlice';

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateResourceRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const AddResourceModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddResourceModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Equipment');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');

  if (!open) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const data: CreateResourceRequest = {
      name: name.trim(),
      type: type || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      capacity: capacity === '' ? null : Number(capacity),
      is_active: true,
    };

    console.log('Resource data:', data);

    // THIS IS THE IMPORTANT PART
    await onSubmit(data);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setName('');
    setType('Equipment');
    setLocation('');
    setDescription('');
    setCapacity('');

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl border bg-background shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Add Resource</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a company resource that can be booked.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* NAME */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Resource Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PS5"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* TYPE */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Room">Room</option>

              <option value="Equipment">Equipment</option>

              <option value="Vehicle">Vehicle</option>

              <option value="Other">Other</option>
            </select>
          </div>

          {/* LOCATION */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 2nd Floor"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* CAPACITY */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity</label>

            <input
              type="number"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 2"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this resource..."
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* FOOTER */}

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
