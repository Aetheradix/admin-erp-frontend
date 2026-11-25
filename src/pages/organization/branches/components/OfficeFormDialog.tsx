import type { Dispatch, SetStateAction } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import type { GeocodingResult } from '@/services/geocodingService';
import type { Office, OfficeFormData } from '../types';
import { PlaceSearchSection } from './PlaceSearchSection';
import { CoordinatesSection } from './CoordinatesSection';

interface OfficeFormDialogProps {
  visible: boolean;
  editingOffice: Office | null;
  formData: OfficeFormData;
  setFormData: Dispatch<SetStateAction<OfficeFormData>>;
  isDetectingLocation: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: GeocodingResult[];
  isSearching: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onClearSearch: () => void;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSelectLocation: (place: GeocodingResult) => void;
  onDetectLocation: () => void;
}

export function OfficeFormDialog({
  visible,
  editingOffice,
  formData,
  setFormData,
  isDetectingLocation,
  isCreating,
  isUpdating,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  showSuggestions,
  setShowSuggestions,
  onClearSearch,
  onHide,
  onSubmit,
  onSelectLocation,
  onDetectLocation,
}: OfficeFormDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={editingOffice ? 'Edit Office Geofence' : 'Register New Office Geofence'}
      modal
      className="w-full max-w-2xl mx-4"
      contentClassName="p-6 max-h-[85vh] overflow-y-auto"
      headerClassName="px-6 pt-6 pb-2 text-lg font-black tracking-tight border-none"
      pt={{
        root: {
          className: 'rounded-[28px] overflow-hidden border-none shadow-2xl bg-surface-elevated',
        },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <PlaceSearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          showSuggestions={showSuggestions}
          onShowSuggestions={setShowSuggestions}
          onClearSearch={onClearSearch}
          onSelectLocation={onSelectLocation}
        />

        {/* BASIC OFFICE DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-muted uppercase tracking-wider">
              Office Name *
            </label>
            <Input
              placeholder="e.g. Bangalore Headquarters"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-muted uppercase tracking-wider">
              Timezone
            </label>
            <Input
              placeholder="Asia/Kolkata"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black text-muted uppercase tracking-wider">
            Complete Address / Landmark
          </label>
          <Input
            placeholder="e.g. 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <CoordinatesSection
          formData={formData}
          setFormData={setFormData}
          isDetectingLocation={isDetectingLocation}
          onDetectLocation={onDetectLocation}
        />

        {/* Global HQ Designation Toggle */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <input
            type="checkbox"
            id="office_hq_checkbox"
            checked={formData.is_hq}
            onChange={(e) => setFormData({ ...formData, is_hq: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="office_hq_checkbox"
            className="text-xs font-black text-amber-900 dark:text-amber-200 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-1">
            <span>Designate as Organization Global Headquarters (Global HQ)</span>
          </label>
        </div>

        {/* Active Status Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="office_active_checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded accent-primary w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="office_active_checkbox"
            className="text-xs font-bold text-foreground cursor-pointer">
            Office is active for attendance geofence verification
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="ghost"
            label="Cancel"
            onClick={onHide}
            className="rounded-xl!"
          />
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            label={
              isCreating || isUpdating
                ? 'Saving...'
                : editingOffice
                  ? 'Save Changes'
                  : 'Create Office'
            }
            icon="pi pi-check"
            className="rounded-xl! px-6! bg-primary hover:bg-primary-hover text-white font-black"
          />
        </div>
      </form>
    </Dialog>
  );
}
