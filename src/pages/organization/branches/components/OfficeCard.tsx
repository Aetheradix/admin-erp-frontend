import { motion } from 'framer-motion';
import {
  Building,
  Clock,
  Edit2,
  ExternalLink,
  MapPin,
  Navigation,
  Radar,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { LocationPinpointMap } from '@/components/common/LocationPinpointMap';
import type { Office } from '../types';

interface OfficeCardProps {
  office: Office;
  index: number;
  canManage: boolean;
  onEdit: (office: Office) => void;
  onDelete: (id: number) => void;
}

export function OfficeCard({ office, index, canManage, onEdit, onDelete }: OfficeCardProps) {
  const isActive = office.is_active ?? office.isActive ?? true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-surface-elevated rounded-3xl border ${isActive ? 'border-border-subtle' : 'border-border-subtle/50 opacity-70'
        } shadow-xs p-6 flex flex-col justify-between gap-5 group hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
      {/* Active Indicator Top Stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${isActive ? 'bg-emerald-500' : 'bg-muted/30'
          }`}
      />

      {/* Header: Name and Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-primary" />
            <h3 className="text-base font-black text-foreground tracking-tight">{office.name}</h3>
          </div>
          {office.address && (
            <p className="text-xs text-muted font-medium flex items-center gap-1.5 pl-6">
              <MapPin size={12} className="shrink-0 text-muted/70" />
              <span className="line-clamp-2">{office.address}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${isActive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-surface-subtle text-muted border border-border-subtle'
              }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {Boolean(office.is_hq || office.isHq) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Building size={11} className="text-amber-600 dark:text-amber-400" />
              Global HQ
            </span>
          )}
        </div>
      </div>

      {/* Geofence Parameters Card */}
      <div className="bg-surface-subtle/80 rounded-2xl p-3.5 border border-border-subtle space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted flex items-center gap-1.5">
            <Radar size={13} className="text-primary" />
            Geofence Radius
          </span>
          <span className="text-foreground font-mono font-black">{office.radius} meters</span>
        </div>

        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted flex items-center gap-1.5">
            <Navigation size={13} className="text-primary" />
            Coordinates
          </span>
          <a
            href={`https://maps.google.com/?q=${office.latitude},${office.longitude}`}
            target="_blank"
            rel="noreferrer"
            title="Open in Google Maps"
            className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1">
            {Number(office.latitude).toFixed(4)}°, {Number(office.longitude).toFixed(4)}°
            <ExternalLink size={11} />
          </a>
        </div>

        {office.timezone && (
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              Timezone
            </span>
            <span className="text-muted text-[11px]">{office.timezone}</span>
          </div>
        )}
      </div>

      {/* Mini Pinpoint Map Preview */}
      <LocationPinpointMap
        latitude={Number(office.latitude)}
        longitude={Number(office.longitude)}
        radius={office.radius}
        locationName={office.name}
        height="120px"
        showCoordinatesBadge={false}
      />

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          Server Haversine Verified
        </span>

        {canManage && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(office)}
              title="Edit Office"
              className="p-1.5 rounded-xl hover:bg-surface-subtle text-muted hover:text-foreground transition-colors cursor-pointer">
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(office.id)}
              title="Delete Office"
              className="p-1.5 rounded-xl hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
