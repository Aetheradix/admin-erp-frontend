import React, { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { FormField } from '@/components/ui/composed/FormField';
import { Wrench, CheckCircle2 } from 'lucide-react';
import type { InventoryItem, InventoryCondition } from '@/types/inventory';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  mode: 'start' | 'complete';
  onSubmit: (
    itemId: number,
    payload: { condition_status?: InventoryCondition; notes?: string }
  ) => Promise<void>;
  isLoading?: boolean;
}

const CONDITION_OPTIONS = [
  { label: 'New (Pristine Condition)', value: 'New' },
  { label: 'Good (Repaired & Fully Functional)', value: 'Good' },
  { label: 'Fair (Functional with Noticeable Wear)', value: 'Fair' },
  { label: 'Poor (Degraded)', value: 'Poor' },
];

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  item,
  mode,
  onSubmit,
  isLoading,
}) => {
  const [condition, setCondition] = useState<InventoryCondition>('Good');
  const [notes, setNotes] = useState<string>('');

  if (!item) return null;

  const handleConfirm = async () => {
    await onSubmit(item.id, {
      condition_status: mode === 'complete' ? condition : undefined,
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
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              mode === 'start'
                ? 'bg-rose-500/10 text-rose-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
            {mode === 'start' ? <Wrench size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">
              {mode === 'start' ? 'Send Asset for Maintenance' : 'Complete Maintenance Work'}
            </h2>
            <p className="text-xs text-muted font-bold">
              "{item.name}" ({item.asset_id})
            </p>
          </div>
        </div>
      }
      className="w-full max-w-lg">
      <div className="flex flex-col gap-4 pt-2">
        {mode === 'complete' && (
          <FormField label="Updated Condition After Service" required id="maint-condition">
            <Select
              id="maint-condition"
              options={CONDITION_OPTIONS}
              value={condition}
              onChange={(e) => setCondition(e.value as InventoryCondition)}
            />
          </FormField>
        )}

        <FormField
          label={
            mode === 'start'
              ? 'Reported Fault / Maintenance Reason'
              : 'Service Summary & Parts Replaced'
          }
          id="maint-notes">
          <Textarea
            id="maint-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              mode === 'start'
                ? 'Describe malfunctioning hardware, battery degradation, screen flickering, scheduled oil change...'
                : 'Replaced battery, calibrated display, certified operational...'
            }
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
            className={`px-6 rounded-2xl font-black ${
              mode === 'start'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
            }`}>
            {isLoading
              ? 'Processing...'
              : mode === 'start'
                ? 'Mark for Maintenance'
                : 'Complete & Restore'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
