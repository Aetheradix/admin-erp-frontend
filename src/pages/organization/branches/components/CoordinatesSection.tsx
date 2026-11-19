import type { Dispatch, SetStateAction } from 'react';
import { Compass, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { LocationPinpointMap } from '@/components/common/LocationPinpointMap';
import type { OfficeFormData } from '../types';

interface CoordinatesSectionProps {
  formData: OfficeFormData;
  setFormData: Dispatch<SetStateAction<OfficeFormData>>;
  isDetectingLocation: boolean;
  onDetectLocation: () => void;
}

export function CoordinatesSection({
  formData,
  setFormData,
  isDetectingLocation,
  onDetectLocation,
}: CoordinatesSectionProps) {
  return (
    <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border-subtle space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Compass size={13} className="text-primary" />
          <span>Geofence Coordinates (Manual / Editable)</span>
        </label>
        <button
          type="button"
          onClick={onDetectLocation}
          disabled={isDetectingLocation}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer">
          <Navigation size={12} className={isDetectingLocation ? 'animate-spin' : ''} />
          <span>{isDetectingLocation ? 'Pinning GPS...' : 'Pin Current GPS'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-muted uppercase">Latitude *</label>
          <Input
            type="number"
            step="any"
            placeholder="e.g. 12.9716"
            value={formData.latitude === '' ? '' : String(formData.latitude)}
            onChange={(e) =>
              setFormData({ ...formData, latitude: e.target.value === '' ? '' : Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-muted uppercase">Longitude *</label>
          <Input
            type="number"
            step="any"
            placeholder="e.g. 77.5946"
            value={formData.longitude === '' ? '' : String(formData.longitude)}
            onChange={(e) =>
              setFormData({ ...formData, longitude: e.target.value === '' ? '' : Number(e.target.value) })
            }
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-muted uppercase">Radius (meters) *</label>
          <Input
            type="number"
            min={20}
            max={5000}
            placeholder="100"
            value={String(formData.radius)}
            onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) || 100 })}
            required
          />
        </div>
      </div>

      {/* REAL-TIME INTERACTIVE PINPOINT MAP PREVIEW */}
      <div className="space-y-1 pt-1">
        <LocationPinpointMap
          latitude={formData.latitude === '' ? null : Number(formData.latitude)}
          longitude={formData.longitude === '' ? null : Number(formData.longitude)}
          radius={Number(formData.radius)}
          locationName={formData.name || formData.address}
          height="170px"
        />
      </div>
    </div>
  );
}
