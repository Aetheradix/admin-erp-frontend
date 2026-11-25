import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, RefreshCw, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import type { GeocodingResult } from '@/services/geocodingService';

interface PlaceSearchSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResults: GeocodingResult[];
  isSearching: boolean;
  showSuggestions: boolean;
  onShowSuggestions: (show: boolean) => void;
  onClearSearch: () => void;
  onSelectLocation: (place: GeocodingResult) => void;
}

export function PlaceSearchSection({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  showSuggestions,
  onShowSuggestions,
  onClearSearch,
  onSelectLocation,
}: PlaceSearchSectionProps) {
  return (
    <div className="relative p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Search size={13} />
          <span>Search Place</span>
        </label>
      </div>

      <div className="relative">
        <Input
          placeholder="Search office building, tech park, street, or city (e.g. Indiranagar, Cyber City)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => searchResults.length > 0 && onShowSuggestions(true)}
          className="pr-8!"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching ? (
            <RefreshCw size={14} className="animate-spin text-primary" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="text-muted hover:text-foreground">
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 left-4 right-4 top-full mt-1 bg-surface-elevated rounded-2xl border border-border-subtle shadow-xl max-h-56 overflow-y-auto divide-y divide-border-subtle/60">
            {searchResults.map((place) => (
              <button
                key={place.placeId}
                type="button"
                onClick={() => onSelectLocation(place)}
                className="w-full text-left p-3 hover:bg-surface-subtle transition-colors flex items-start gap-2.5 cursor-pointer">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-foreground truncate">{place.name}</div>
                  <div className="text-[11px] text-muted truncate mt-0.5">{place.address}</div>
                  <div className="text-[10px] text-primary/80 font-mono mt-0.5">
                    {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
