import { Plus, Radar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import type { Office } from '../types';
import { OfficeCard } from './OfficeCard';

interface OfficesGridProps {
  offices: Office[];
  isLoading: boolean;
  canManage: boolean;
  onCreate: () => void;
  onEdit: (office: Office) => void;
  onDelete: (id: number) => void;
}

export function OfficesGrid({
  offices,
  isLoading,
  canManage,
  onCreate,
  onEdit,
  onDelete,
}: OfficesGridProps) {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <p className="text-xs font-bold text-muted">Loading registered offices...</p>
        </div>
      ) : offices.length === 0 ? (
        <div className="bg-surface-elevated rounded-3xl border border-dashed border-border-subtle p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Radar size={28} />
          </div>
          <h3 className="text-lg font-black text-foreground">No Office Locations Configured</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Add your company's physical headquarters or regional branches with latitude, longitude,
            and geofence radius to enforce on-premise attendance.
          </p>
          {canManage && (
            <Button onClick={onCreate} className="rounded-2xl! px-6! mx-auto">
              <Plus size={14} className="mr-1.5" />
              Add First Office
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office, i) => (
            <OfficeCard
              key={office.id}
              office={office}
              index={i}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
