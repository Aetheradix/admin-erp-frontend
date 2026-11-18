import { Activity, Building, Plus, Radar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import type { BranchesSubTab } from '../types';

interface BranchesHeaderProps {
  officeCount: number;
  activeSubTab: BranchesSubTab;
  onSubTabChange: (tab: BranchesSubTab) => void;
  canManage: boolean;
  isLoadingOffices: boolean;
  onRefreshOffices: () => void;
  onAddOffice: () => void;
}

const tabClass = (active: boolean) =>
  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
    active
      ? 'bg-surface-elevated text-foreground shadow-xs border border-border-subtle'
      : 'text-muted hover:text-foreground'
  }`;

export function BranchesHeader({
  officeCount,
  activeSubTab,
  onSubTabChange,
  canManage,
  isLoadingOffices,
  onRefreshOffices,
  onAddOffice,
}: BranchesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-elevated rounded-3xl p-6 border border-border-subtle shadow-sm">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Radar size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Office Geofencing & Hubs</h2>
            <p className="text-xs font-semibold text-muted mt-0.5">
              Register authorized workplace perimeters for accurate physical attendance check-ins
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex p-1 bg-surface-subtle rounded-2xl border border-border-subtle">
          <button type="button" onClick={() => onSubTabChange('offices')} className={tabClass(activeSubTab === 'offices')}>
            <Building size={13} />
            <span>Registered Hubs ({officeCount})</span>
          </button>
          {canManage && (
            <button type="button" onClick={() => onSubTabChange('logs')} className={tabClass(activeSubTab === 'logs')}>
              <Activity size={13} />
              <span>Audit Logs</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRefreshOffices}
          title="Refresh Offices"
          className="p-2 rounded-2xl bg-surface-subtle border border-border-subtle text-muted hover:text-foreground transition-colors cursor-pointer">
          <RefreshCw size={14} className={isLoadingOffices ? 'animate-spin' : ''} />
        </button>

        {canManage && activeSubTab === 'offices' && (
          <Button
            onClick={onAddOffice}
            className="rounded-2xl! h-10! px-4! bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 cursor-pointer flex items-center gap-2">
            <Plus size={15} />
            <span>Add Office</span>
          </Button>
        )}
      </div>
    </div>
  );
}
