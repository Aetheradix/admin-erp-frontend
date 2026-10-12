import React, { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';

import { resolveImageUrl } from '@/utils/imageUrl';
import {
  Package,
  CalendarCheck,
  UserCheck,
  Wrench,
  Sparkles,
  MapPin,
  Tag,
  DollarSign,
  History,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { InventoryItem, InventoryAuditLog, InventoryBookingRecord } from '@/types/inventory';

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: (InventoryItem & { auditLogs?: InventoryAuditLog[]; bookings?: InventoryBookingRecord[] }) | null;
  onEdit?: (item: InventoryItem) => void;
  onAssign?: (item: InventoryItem) => void;
  onUnassign?: (item: InventoryItem) => void;
  onBook?: (item: InventoryItem) => void;
  onMaintenance?: (item: InventoryItem) => void;
  onCompleteMaintenance?: (item: InventoryItem) => void;
}

export const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onAssign,
  onUnassign,
  onBook,
  onMaintenance,
  onCompleteMaintenance,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'audits'>('overview');

  if (!item) return null;

  const isBookable = Boolean(item.is_bookable);

  const statusBadgeColor = {
    'Available': 'bg-emerald-500/15 text-emerald-700  border-emerald-500/30',
    'Booked': 'bg-sky-500/15 text-sky-700  border-sky-500/30',
    'Assigned': 'bg-purple-500/15 text-purple-700  border-purple-500/30',
    'Under Maintenance': 'bg-amber-500/15 text-amber-700  border-amber-500/30',
    'Retired': 'bg-slate-500/15 text-slate-700  border-slate-500/30',
  }[item.status] || 'bg-slate-500/15 text-slate-700 border-slate-500/30';

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground truncate">{item.name}</h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-surface-subtle text-muted">
                {item.asset_id}
              </span>
            </div>
            <p className="text-xs text-muted font-bold truncate">
              {item.category} &bull; {item.brand_model || 'No model specified'}
            </p>
          </div>
        </div>
      }
      className="w-full max-w-4xl"
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* Top Summary Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-surface-subtle via-surface to-surface-subtle border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {item.image_url ? (
              <img
                src={resolveImageUrl(item.image_url)}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-border-subtle shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Package size={28} />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${statusBadgeColor}`}>
                  {item.status}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-border-subtle text-foreground">
                  Condition: {item.condition_status}
                </span>
                {isBookable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30">
                    <Sparkles size={12} /> Bookable Resource (ON)
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-subtle text-muted">
                    Inventory Only (OFF)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted font-bold">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} className="text-primary" /> {item.location || 'Location Not Specified'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign size={13} className="text-emerald-500" /> $${Number(item.purchase_cost || 0).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Tag size={13} /> Qty: {item.quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Action */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {item.status === 'Assigned' && onUnassign && (
              <Button
                variant="secondary"
                onClick={() => onUnassign(item)}
                className="text-xs font-bold rounded-2xl flex-1 md:flex-initial"
              >
                Return Asset
              </Button>
            )}
            {item.status === 'Available' && onAssign && (
              <Button
                variant="secondary"
                onClick={() => onAssign(item)}
                className="text-xs font-bold rounded-2xl flex-1 md:flex-initial"
              >
                <UserCheck size={14} className="mr-1.5" /> Assign Staff
              </Button>
            )}
            {isBookable && item.status === 'Available' && onBook && (
              <Button
                variant="primary"
                onClick={() => onBook(item)}
                className="text-xs font-black rounded-2xl flex-1 md:flex-initial shadow-md shadow-primary/20"
              >
                <CalendarCheck size={14} className="mr-1.5" /> Book Now
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-subtle'
            }`}
          >
            Overview & Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-subtle'
            }`}
          >
            <CalendarCheck size={14} />
            <span>Reservations ({item.bookings?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audits'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-foreground hover:bg-surface-subtle'
            }`}
          >
            <History size={14} />
            <span>Audit History ({item.auditLogs?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-surface-subtle/40 border border-border-subtle">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Hardware Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted block text-[11px] font-bold">Brand / Model</span>
                  <span className="font-bold text-foreground">{item.brand_model || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-bold">Serial Number</span>
                  <span className="font-mono font-bold text-foreground">{item.serial_number || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-bold">Purchase Date</span>
                  <span className="font-bold text-foreground">{item.purchase_date || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px] font-bold">Original Cost</span>
                  <span className="font-bold text-foreground">$${Number(item.purchase_cost || 0).toLocaleString()}</span>
                </div>
              </div>

              {item.description && (
                <div className="pt-2 border-t border-border-subtle/50">
                  <span className="text-muted block text-[11px] font-bold mb-1">Description</span>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-surface-subtle/40 border border-border-subtle">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                Assignment & Resource State
              </h3>
              
              {item.assigned_to ? (
                <div className="p-3 rounded-2xl bg-surface border border-border-subtle flex items-center gap-3">
                  {item.assigned_user_avatar ? (
                    <img
                      src={resolveImageUrl(item.assigned_user_avatar)}
                      alt="Staff"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
                      {item.assigned_user_name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-black text-foreground block">
                      {item.assigned_user_name}
                    </span>
                    <span className="text-[11px] text-muted font-bold block">
                      {item.assigned_user_email} &bull; {item.assigned_user_department || 'Staff'}
                    </span>
                    {item.assigned_date && (
                      <span className="text-[10px] text-muted font-medium mt-0.5 block">
                        Assigned on {new Date(item.assigned_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-surface border border-border-subtle text-xs font-bold text-muted flex items-center gap-2">
                  <UserCheck size={16} className="text-muted" /> Unassigned (Available in inventory pool)
                </div>
              )}

              {item.notes && (
                <div className="pt-2 border-t border-border-subtle/50">
                  <span className="text-muted block text-[11px] font-bold mb-1">Handling & Care Notes</span>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Bookings */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-3">
            {!isBookable && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                This item currently has the bookable resource toggle turned OFF. Past reservations are preserved below for historical records.
              </div>
            )}

            {item.bookings && item.bookings.length > 0 ? (
              <div className="divide-y divide-border-subtle/50 border border-border-subtle rounded-3xl overflow-hidden bg-surface">
                {item.bookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CalendarCheck size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-foreground">
                          {b.purpose || 'Resource Reservation'}
                        </div>
                        <div className="text-[11px] text-muted font-bold mt-0.5">
                          {new Date(b.start_datetime).toLocaleString()} &rarr; {new Date(b.end_datetime).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted font-medium mt-0.5">
                          Booked by {b.booked_by_name || `User #${b.booked_by}`} ({b.booked_by_email || ''})
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : b.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-surface-subtle/50 border border-dashed border-border-subtle">
                <CalendarCheck size={28} className="mx-auto text-muted mb-2" />
                <p className="text-xs font-bold text-muted">No reservations recorded for this asset yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === 'audits' && (
          <div className="flex flex-col gap-3">
            {item.auditLogs && item.auditLogs.length > 0 ? (
              <div className="divide-y divide-border-subtle/50 border border-border-subtle rounded-3xl overflow-hidden bg-surface">
                {item.auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-surface-subtle text-muted flex items-center justify-center shrink-0 mt-0.5">
                        <History size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {log.action}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {log.user_name || 'System Operator'}
                          </span>
                        </div>
                        <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                          {log.details || 'Inventory status or property adjustment recorded.'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-surface-subtle/50 border border-dashed border-border-subtle">
                <History size={28} className="mx-auto text-muted mb-2" />
                <p className="text-xs font-bold text-muted">No audit events recorded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            {item.status === 'Under Maintenance' && onCompleteMaintenance && (
              <Button
                variant="secondary"
                onClick={() => onCompleteMaintenance(item)}
                className="text-xs font-bold rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              >
                <CheckCircle2 size={14} className="mr-1.5" /> Complete Maintenance
              </Button>
            )}
            {item.status !== 'Under Maintenance' && item.status !== 'Retired' && onMaintenance && (
              <Button
                variant="secondary"
                onClick={() => onMaintenance(item)}
                className="text-xs font-bold rounded-2xl"
              >
                <Wrench size={14} className="mr-1.5" /> Maintenance
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                onClick={() => onEdit(item)}
                className="text-xs font-bold rounded-2xl px-5"
              >
                Edit Specs
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold rounded-2xl px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
