import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { InventoryAuditLog, InventoryBookingRecord, InventoryItem } from '@/types/inventory';
import { formatPriceWithCurrency } from '@/utils/currency';
import { resolveImageUrl } from '@/utils/imageUrl';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Coins,
  Cpu,
  Edit3,
  FileText,
  History,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item:
    | (InventoryItem & { auditLogs?: InventoryAuditLog[]; bookings?: InventoryBookingRecord[] })
    | null;
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

  const statusBadgeColor =
    {
      Available: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      Booked: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
      Assigned: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
      'Under Maintenance': 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      Retired: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
    }[item.status] || 'bg-slate-500/15 text-slate-700 border-slate-500/30';

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      width="min(860px, 94vw)"
      header={
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <Package size={22} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-foreground truncate tracking-tight">
                {item.name}
              </h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-surface-subtle text-muted border border-border-subtle shrink-0">
                {item.asset_id}
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-0.5 truncate">
              {item.category} &bull; {item.brand_model || 'No model specified'}
            </p>
          </div>
        </div>
      }
      headerClassName="px-7 pt-6 pb-4 border-b border-border-subtle/80 bg-surface"
      className="rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex flex-col">
        {/* Scrollable Container */}
        <div className="max-h-[min(72vh,680px)] overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* Top Hero Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-surface-subtle via-surface-elevated to-surface-subtle border border-border-subtle shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4.5">
              {item.image_url ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border-subtle shadow-sm shrink-0 bg-surface">
                  <img
                    src={resolveImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-inner">
                  <Package size={32} />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl border ${statusBadgeColor}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-border-subtle text-foreground shadow-2xs">
                    Condition: {item.condition_status}
                  </span>
                  {isBookable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30">
                      <Sparkles size={12} /> Bookable Resource
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-surface-subtle text-muted border border-border-subtle">
                      Inventory Only
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-bold mt-0.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary shrink-0" />{' '}
                    <span>{item.location || 'Location Not Specified'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <Coins size={13} className="shrink-0" />{' '}
                    <span>{formatPriceWithCurrency(item.purchase_cost, item.currency)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={13} className="shrink-0" /> Qty: {item.quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Context Action Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center shrink-0">
              {item.status === 'Assigned' && onUnassign && (
                <Button
                  variant="secondary"
                  onClick={() => onUnassign(item)}
                  className="text-xs font-bold rounded-xl h-10 px-4 flex-1 md:flex-initial">
                  Return Asset
                </Button>
              )}
              {item.status === 'Available' && onAssign && (
                <Button
                  variant="secondary"
                  onClick={() => onAssign(item)}
                  className="text-xs font-bold rounded-xl h-10 px-4 flex-1 md:flex-initial shadow-xs border-border-subtle hover:border-primary/40">
                  <UserCheck size={15} className="mr-1.5" /> Assign Staff
                </Button>
              )}
              {isBookable && item.status === 'Available' && onBook && (
                <Button
                  variant="primary"
                  onClick={() => onBook(item)}
                  className="text-xs font-black rounded-xl h-10 px-5 flex-1 md:flex-initial shadow-md shadow-primary/20">
                  <CalendarCheck size={15} className="mr-1.5" /> Book Now
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}>
              Overview & Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}>
              <CalendarCheck size={14} />
              <span>Reservations ({item.bookings?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audits')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audits'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-foreground hover:bg-surface-subtle'
              }`}>
              <History size={14} />
              <span>Audit History ({item.auditLogs?.length || 0})</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Hardware Specifications */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-subtle/50 border border-border-subtle shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
                  <Cpu size={14} className="text-primary" />
                  <span>Hardware & Technical Specifications</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-surface border border-border-subtle/60 flex flex-col gap-1">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Brand / Model
                    </span>
                    <span className="font-bold text-foreground truncate">
                      {item.brand_model || '—'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border-subtle/60 flex flex-col gap-1">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Serial Number
                    </span>
                    <span className="font-mono font-bold text-foreground truncate">
                      {item.serial_number || '—'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border-subtle/60 flex flex-col gap-1">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Purchase Date
                    </span>
                    <span className="font-bold text-foreground">{item.purchase_date || '—'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border-subtle/60 flex flex-col gap-1">
                    <span className="text-muted block text-[10px] font-bold uppercase tracking-wider">
                      Original Valuation
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {formatPriceWithCurrency(item.purchase_cost, item.currency)}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <div className="pt-3 border-t border-border-subtle/60">
                    <span className="text-muted block text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText size={12} className="text-primary" /> Technical Description
                    </span>
                    <p className="text-xs font-medium text-foreground leading-relaxed p-3 rounded-xl bg-surface border border-border-subtle/60">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Card 2: Assignment & Resource State */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-subtle/50 border border-border-subtle shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>Assignment & Resource State</span>
                </div>

                {item.assigned_to ? (
                  <div className="p-4 rounded-xl bg-surface border border-border-subtle flex items-center gap-3.5">
                    {item.assigned_user_avatar ? (
                      <img
                        src={resolveImageUrl(item.assigned_user_avatar)}
                        alt="Staff"
                        className="w-12 h-12 rounded-full object-cover border border-border-subtle"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-black text-sm border border-purple-500/20">
                        {item.assigned_user_name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-black text-foreground block truncate">
                        {item.assigned_user_name}
                      </span>
                      <span className="text-[11px] text-muted font-bold block truncate">
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
                  <div className="p-4 rounded-xl bg-surface border border-border-subtle text-xs font-bold text-muted flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <span className="text-foreground font-bold block">Unassigned Asset</span>
                      <span className="text-[11px] text-muted block">
                        Available in inventory pool for assignment
                      </span>
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="pt-3 border-t border-border-subtle/60">
                    <span className="text-muted block text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText size={12} className="text-primary" /> Handling & Care Notes
                    </span>
                    <p className="text-xs font-medium text-foreground leading-relaxed p-3 rounded-xl bg-surface border border-border-subtle/60">
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
                  This item currently has the bookable resource toggle turned OFF. Past reservations
                  are preserved below for historical records.
                </div>
              )}

              {item.bookings && item.bookings.length > 0 ? (
                <div className="divide-y divide-border-subtle/50 border border-border-subtle rounded-2xl overflow-hidden bg-surface">
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
                            {new Date(b.start_datetime).toLocaleString()} &rarr;{' '}
                            {new Date(b.end_datetime).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted font-medium mt-0.5">
                            Booked by {b.booked_by_name || `User #${b.booked_by}`} (
                            {b.booked_by_email || ''})
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
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
                <div className="p-8 text-center rounded-2xl bg-surface-subtle/50 border border-dashed border-border-subtle">
                  <CalendarCheck size={28} className="mx-auto text-muted mb-2" />
                  <p className="text-xs font-bold text-muted">
                    No reservations recorded for this asset yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Audit Logs */}
          {activeTab === 'audits' && (
            <div className="flex flex-col gap-3">
              {item.auditLogs && item.auditLogs.length > 0 ? (
                <div className="divide-y divide-border-subtle/50 border border-border-subtle rounded-2xl overflow-hidden bg-surface">
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
                <div className="p-8 text-center rounded-2xl bg-surface-subtle/50 border border-dashed border-border-subtle">
                  <History size={28} className="mx-auto text-muted mb-2" />
                  <p className="text-xs font-bold text-muted">
                    No audit history found for this item.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 sm:px-8 py-4 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle flex items-center justify-between gap-4 sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            {item.status === 'Under Maintenance' && onCompleteMaintenance && (
              <Button
                variant="secondary"
                onClick={() => onCompleteMaintenance(item)}
                className="text-xs font-bold rounded-xl h-10 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                <CheckCircle2 size={14} className="mr-1.5" /> Complete Maintenance
              </Button>
            )}
            {item.status !== 'Under Maintenance' && item.status !== 'Retired' && onMaintenance && (
              <Button
                variant="secondary"
                onClick={() => onMaintenance(item)}
                className="text-xs font-bold rounded-xl h-10 px-4 border-border-subtle">
                <Wrench size={14} className="mr-1.5" /> Maintenance
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onEdit && (
              <Button
                variant="secondary"
                onClick={() => onEdit(item)}
                className="text-xs font-black rounded-xl h-10 px-5 border-border-subtle hover:border-primary/40 flex items-center gap-1.5">
                <Edit3 size={14} />
                <span>Edit Specs</span>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold rounded-xl h-10 px-5 text-muted hover:text-foreground">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
