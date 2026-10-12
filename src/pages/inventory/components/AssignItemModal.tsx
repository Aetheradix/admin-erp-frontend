import React, { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { FormField } from '@/components/ui/composed/FormField';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { UserCheck } from 'lucide-react';
import type { InventoryItem, AssignableEmployee } from '@/types/inventory';

interface AssignItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  employees: AssignableEmployee[];
  onAssign: (itemId: number, assignedTo: number, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AssignItemModal: React.FC<AssignItemModalProps> = ({
  isOpen,
  onClose,
  item,
  employees,
  onAssign,
  isLoading,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');

  if (!item) return null;

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.username} (${emp.department || 'Staff'} - ${emp.email})`,
    value: emp.id,
  }));

  const handleConfirm = async () => {
    if (!selectedUserId) {
      showToast({
        severity: 'warn',
        summary: 'Employee Required',
        detail: 'Please select an employee to allocate this item to.',
      });
      return;
    }

    await onAssign(item.id, selectedUserId, notes);
    onClose();
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">Assign Asset to Staff</h2>
            <p className="text-xs text-muted font-bold">
              Check out "{item.name}" ({item.asset_id}) to an active team member
            </p>
          </div>
        </div>
      }
      className="w-full max-w-lg"
    >
      <div className="flex flex-col gap-4 pt-2">
        <FormField label="Select Team Member" required id="assign-emp">
          <Select
            id="assign-emp"
            options={employeeOptions}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.value as number)}
            placeholder="Search or choose staff member..."
          />
        </FormField>

        <FormField label="Handover Remarks & Checkout Notes" id="assign-notes">
          <Textarea
            id="assign-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Asset accessories included (e.g. charger, adapter), expected return date, condition at handover..."
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" onClick={onClose} className="px-5 rounded-2xl font-bold">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !selectedUserId}
            className="px-6 rounded-2xl font-black bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20"
          >
            {isLoading ? 'Assigning...' : 'Confirm Handover'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
