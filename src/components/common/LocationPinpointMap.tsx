import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface LocationPinpointMapProps {
  latitude: number | null;
  longitude: number | null;
  radius?: number; // Geofence radius in meters
  accuracy?: number | null; // GPS accuracy in meters
  locationName?: string | null;
  height?: string;
  className?: string;
  showCoordinatesBadge?: boolean;
}

export const LocationPinpointMap: React.FC<LocationPinpointMapProps> = ({
  latitude,
  longitude,
  radius,
  accuracy,
  locationName,
  height = '200px',
  className = '',
  showCoordinatesBadge = true,
}) => {
  if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-2xl bg-surface-subtle border border-dashed border-border-subtle flex flex-col items-center justify-center p-4 text-center text-muted ${className}`}>
        <MapPin size={24} className="opacity-40 mb-1.5" />
        <span className="text-xs font-semibold">Location not selected or coordinates pending</span>
        <span className="text-[10px] text-muted/70">Search an address or pin from GPS to preview map</span>
      </div>
    );
  }

  // Calculate bounding box for OpenStreetMap embed around coordinates
  const delta = 0.004; // ~400-500 meters window
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-2xl overflow-hidden border border-border-subtle shadow-xs bg-surface-subtle group ${className}`}>
      {/* Interactive Map Embed - bottom 36px clipped to remove external attribution/donation bar */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          title="Location Pinpoint Map"
          src={embedUrl}
          style={{ height: 'calc(100% + 38px)', width: '100%', border: 0 }}
          loading="lazy"
          className="w-full filter contrast-105"
        />
      </div>

      {/* Floating Info Overlay at the bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
        {showCoordinatesBadge && (
          <div className="pointer-events-auto bg-surface-elevated/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border-subtle shadow-md text-[11px] font-mono font-bold text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            </span>
            {accuracy && <span className="text-muted font-normal text-[10px]">±{Math.round(accuracy)}m</span>}
            {radius && <span className="text-primary font-black text-[10px]">| {radius}m zone</span>}
          </div>
        )}

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          title="Open in Google Maps"
          className="pointer-events-auto bg-surface-elevated/95 backdrop-blur-md hover:bg-surface px-2.5 py-1 rounded-xl border border-border-subtle shadow-md text-[10px] font-bold text-primary flex items-center gap-1 hover:underline transition-colors shrink-0">
          <span>Open Maps</span>
          <ExternalLink size={10} />
        </a>
      </div>

      {locationName && (
        <div className="absolute top-2 left-2 max-w-[85%] pointer-events-none">
          <div className="bg-surface-elevated/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border-subtle shadow-md text-[10px] font-bold text-foreground truncate flex items-center gap-1">
            <Navigation size={10} className="text-primary shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
