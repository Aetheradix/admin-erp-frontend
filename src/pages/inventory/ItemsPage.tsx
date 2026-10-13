import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Switch } from '@/components/ui/primitives/Switch';
import { Button } from '@/components/ui/primitives/Button';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { resolveImageUrl } from '@/utils/imageUrl';
import { API_URL } from '@/config/env';
import { useBulkImportInventoryMutation } from '@/store/api/inventorySlice';
import {
  useGetInventoryItemsQuery,
  useGetInventoryStatsQuery,
  useGetInventoryFilterOptionsQuery,
  useGetInventoryItemByIdQuery,
  useGetAssignableEmployeesQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useToggleBookableResourceMutation,
  useAssignInventoryItemMutation,
  useUnassignInventoryItemMutation,
  useMarkForMaintenanceMutation,
  useCompleteMaintenanceMutation,
  useDeleteOrRetireInventoryItemMutation,
  useBookInventoryResourceMutation,
} from '@/store/api/inventorySlice';

import { InventoryStats } from './components/InventoryStats';
import { InventoryFormModal } from './components/InventoryFormModal';
import { InventoryDetailModal } from './components/InventoryDetailModal';
import { AssignItemModal } from './components/AssignItemModal';
import { BookResourceModal } from './components/BookResourceModal';
import { MaintenanceModal } from './components/MaintenanceModal';

import {
  Package,
  Plus,
  Download,
  Search,
  Filter,
  RotateCcw,
  MapPin,
  Eye,
  Edit3,
  UserCheck,
  CalendarCheck,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react';

import type { InventoryItem, InventoryCondition } from '@/types/inventory';

export const ItemsPage: React.FC = () => {
  const navigate = useNavigate();

  // Query & Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [bookableFilter, setBookableFilter] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [sortBy] = useState('created_at');
  const [sortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // RTK Query Hooks
  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      is_bookable:
        bookableFilter === 'bookable' ? 1 : bookableFilter === 'inventory' ? 0 : undefined,
      condition_status: conditionFilter || undefined,
      sortBy,
      sortOrder,
      page,
      limit,
    }),
    [
      search,
      selectedCategory,
      selectedStatus,
      bookableFilter,
      conditionFilter,
      sortBy,
      sortOrder,
      page,
      limit,
    ]
  );

  const { data: inventoryData, isLoading, isFetching } = useGetInventoryItemsQuery(queryParams);
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetInventoryStatsQuery();
  const { data: filterOptions } = useGetInventoryFilterOptionsQuery();
  const { data: employees = [] } = useGetAssignableEmployeesQuery();

  // Mutations
  const [createItem, { isLoading: isCreating }] = useCreateInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation();
  const [toggleBookable, { isLoading: isToggling }] = useToggleBookableResourceMutation();
  const [assignItem, { isLoading: isAssigning }] = useAssignInventoryItemMutation();
  const [unassignItem] = useUnassignInventoryItemMutation();
  const [markMaintenance, { isLoading: isMaintStarting }] = useMarkForMaintenanceMutation();
  const [completeMaintenance, { isLoading: isMaintCompleting }] = useCompleteMaintenanceMutation();
  const [deleteOrRetire] = useDeleteOrRetireInventoryItemMutation();
  const [bookResource, { isLoading: isBooking }] = useBookInventoryResourceMutation();

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const { data: detailedItem } = useGetInventoryItemByIdQuery(detailItemId as number, {
    skip: !detailItemId,
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetItem, setAssignTargetItem] = useState<InventoryItem | null>(null);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookTargetItem, setBookTargetItem] = useState<InventoryItem | null>(null);

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceTargetItem, setMaintenanceTargetItem] = useState<InventoryItem | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState<'start' | 'complete'>('start');

  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [bulkImport, { isLoading: isImporting }] = useBulkImportInventoryMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await bulkImport(formData).unwrap();
      showToast({
        severity: 'success',
        summary: 'Bulk Import Successful',
        detail: `Successfully imported ${res.importedCount} items.${res.errors?.length ? ` (${res.errors.length} rows skipped)` : ''}`,
      });
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Import Failed',
        detail: err?.data?.message || err?.message || 'Could not parse or import file.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle bookable resource
  const handleToggleBookable = async (item: InventoryItem, nextChecked: boolean) => {
    try {
      await toggleBookable({
        id: item.id,
        is_bookable: nextChecked ? 1 : 0,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Resource Booking Updated',
        detail: nextChecked
          ? `"${item.name}" is now enabled as a bookable company resource.`
          : `"${item.name}" is now disabled from resource booking (existing reservations preserved).`,
      });
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Update Failed',
        detail: err?.data?.message || err?.message || 'Could not update booking eligibility.',
      });
    }
  };

  // Submit create or edit form
  const handleFormSubmit = async (data: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, data }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Asset Updated',
          detail: `"${data.name}" details have been updated successfully.`,
        });
      } else {
        await createItem(data).unwrap();
        showToast({
          severity: 'success',
          summary: 'Asset Registered',
          detail: `"${data.name}" has been registered into company inventory.`,
        });
      }
      setFormModalOpen(false);
      setEditingItem(null);
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Save Failed',
        detail: err?.data?.message || err?.message || 'Failed to save inventory item.',
      });
    }
  };

  // Assign staff
  const handleAssignSubmit = async (itemId: number, assignedTo: number, notes?: string) => {
    try {
      await assignItem({ id: itemId, assigned_to: assignedTo, notes }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Asset Assigned',
        detail: 'Asset has been successfully allocated to the employee.',
      });
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Assignment Failed',
        detail: err?.data?.message || err?.message || 'Failed to assign asset.',
      });
    }
  };

  // Return / unassign item
  const handleUnassign = async (item: InventoryItem) => {
    try {
      await unassignItem({ id: item.id }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Asset Returned',
        detail: `"${item.name}" returned to available inventory.`,
      });
      refetchStats();
      if (detailItemId === item.id) {
        setDetailItemId(null);
      }
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Return Failed',
        detail: err?.data?.message || err?.message || 'Failed to return asset.',
      });
    }
  };

  // Maintenance submit
  const handleMaintenanceSubmit = async (
    itemId: number,
    payload: { condition_status?: InventoryCondition; notes?: string }
  ) => {
    try {
      if (maintenanceMode === 'start') {
        await markMaintenance({ id: itemId, notes: payload.notes }).unwrap();
        showToast({
          severity: 'info',
          summary: 'Marked for Maintenance',
          detail: 'Asset status set to Under Maintenance. Resource booking paused.',
        });
      } else {
        await completeMaintenance({
          id: itemId,
          condition_status: payload.condition_status,
          notes: payload.notes,
        }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Maintenance Complete',
          detail: 'Asset is now restored and available for use.',
        });
      }
      refetchStats();
      if (detailItemId === itemId) {
        setDetailItemId(null);
      }
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Maintenance Update Failed',
        detail: err?.data?.message || err?.message || 'Action failed.',
      });
    }
  };

  // Book resource submit
  const handleBookSubmit = async (
    itemId: number,
    bookingData: { start_datetime: string; end_datetime: string; purpose?: string; notes?: string }
  ) => {
    try {
      await bookResource({ id: itemId, ...bookingData }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Resource Reserved',
        detail: 'Reservation confirmed! No overlapping bookings exist for this slot.',
      });
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Booking Conflict or Error',
        detail: err?.data?.message || err?.message || 'Could not complete reservation.',
      });
    }
  };

  // Delete or Retire item
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await deleteOrRetire({ id: itemToDelete.id, retireOnly: true }).unwrap();
      showToast({
        severity: 'info',
        summary: res.retired ? 'Asset Retired' : 'Asset Removed',
        detail: res.message || 'Asset status updated safely.',
      });
      setItemToDelete(null);
      setConfirmDialogVisible(false);
      refetchStats();
    } catch (err: any) {
      showToast({
        severity: 'error',
        summary: 'Action Failed',
        detail: err?.data?.message || err?.message || 'Could not retire asset.',
      });
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    // token is passed via cookie/session; no explicit header needed here
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedStatus) params.append('status', selectedStatus);
    if (bookableFilter) params.append('is_bookable', bookableFilter === 'bookable' ? '1' : '0');

    window.open(`${API_URL}/inventory/export/csv?${params.toString()}`, '_blank');
    showToast({
      severity: 'info',
      summary: 'Export Started',
      detail: 'Generating inventory audit and asset spreadsheet report.',
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setBookableFilter('');
    setConditionFilter('');
    setPage(1);
  };

  const items = inventoryData?.items || [];
  const totalItems = inventoryData?.total || 0;
  const totalPages = inventoryData?.totalPages || 1;

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...(filterOptions?.categories?.map((c) => ({ label: c, value: c })) || []),
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Available', value: 'Available' },
    { label: 'Booked', value: 'Booked' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Under Maintenance', value: 'Under Maintenance' },
    { label: 'Retired', value: 'Retired' },
  ];

  const bookableOptions = [
    { label: 'All Resource Types', value: '' },
    { label: 'Bookable Resources Only (ON)', value: 'bookable' },
    { label: 'Standard Inventory Only (OFF)', value: 'inventory' },
  ];

  const conditionOptions = [
    { label: 'All Conditions', value: '' },
    { label: 'New', value: 'New' },
    { label: 'Good', value: 'Good' },
    { label: 'Fair', value: 'Fair' },
    { label: 'Poor', value: 'Poor' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. Page Header */}
      <PageHeader
        title="Inventory & Resource Management"
        description="Centralized tracking for company assets, hardware, equipment, and bookable shared resources"
        actions={
          <div className="flex items-center gap-3">
            {/* Hidden file input for Excel/CSV */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            {/* New Import Button */}
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="text-xs font-bold rounded-2xl h-11 px-4 shadow-xs">
              <Upload size={14} className="mr-1.5" />{' '}
              {isImporting ? 'Importing...' : 'Import Stock (Excel)'}
            </Button>

            <Button
              variant="secondary"
              onClick={handleExportCsv}
              className="text-xs font-bold rounded-2xl h-11 px-4 shadow-xs">
              <Download size={14} className="mr-1.5" /> Export Report (CSV)
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setEditingItem(null);
                setFormModalOpen(true);
              }}
              className="text-xs font-black rounded-2xl h-11 px-6 shadow-md shadow-primary/20">
              <Plus size={16} className="mr-1.5" /> Register Asset
            </Button>
          </div>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 -mt-2">
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black bg-primary text-white shadow-xs cursor-pointer flex items-center gap-2">
          <Package size={15} /> Assets & Resources Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/stock-levels')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2">
          <Layers size={15} /> Stock Health & Categories
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/movements')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2">
          <Clock size={15} /> Asset Movements & Audits
        </button>
      </div>

      {/* 2. Interactive KPI Stats Strip */}
      <InventoryStats
        stats={stats}
        isLoading={isStatsLoading}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
      />

      {/* 3. Search & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white backdrop-blur-xl border border-border-subtle shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
            <Filter size={14} className="text-primary" /> Filter & Search Inventory
          </div>
          {(search || selectedCategory || selectedStatus || bookableFilter || conditionFilter) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              <RotateCcw size={12} /> Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Asset ID, Name, Serial..."
              className="pl-10 h-11 text-xs"
            />
          </div>

          {/* Category */}
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.value as string);
              setPage(1);
            }}
          />

          {/* Status */}
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.value as string);
              setPage(1);
            }}
          />

          {/* Bookable Toggle Filter */}
          <Select
            options={bookableOptions}
            value={bookableFilter}
            onChange={(e) => {
              setBookableFilter(e.value as string);
              setPage(1);
            }}
          />

          {/* Condition */}
          <Select
            options={conditionOptions}
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.value as string);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* 4. Inventory Data Table */}
      <div className="rounded-4xl bg-white backdrop-blur-xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border-subtle/80 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-foreground">Asset Catalog & Resource Pool</h3>
            <p className="text-xs text-muted font-bold mt-0.5">
              Showing {items.length} of {totalItems} company inventory assets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-bold">Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 px-3 rounded-xl border border-border-subtle bg-surface text-xs font-bold text-foreground">
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle/40 text-[11px] font-black uppercase tracking-wider text-muted">
                <th className="py-4 px-6">Item / Asset</th>
                <th className="py-4 px-4">Asset ID</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-3 text-center">Qty</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Current Status</th>
                <th className="py-4 px-4 text-center">Bookable Resource</th>
                <th className="py-4 px-4">Assigned To</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60 text-xs">
              {isLoading || isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-6 px-6">
                      <div className="h-6 bg-surface-subtle rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Package size={36} className="mx-auto text-muted mb-3" />
                    <h4 className="text-sm font-black text-foreground">No inventory items found</h4>
                    <p className="text-xs text-muted font-bold mt-1">
                      Try adjusting your search criteria or register a new asset.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setEditingItem(null);
                        setFormModalOpen(true);
                      }}
                      className="mt-4 text-xs font-bold rounded-2xl">
                      <Plus size={14} className="mr-1" /> Add First Asset
                    </Button>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isBookable = Boolean(item.is_bookable);

                  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
                    Available: {
                      bg: 'bg-emerald-50 ',
                      text: 'text-emerald-700 ',
                      dot: 'bg-emerald-500',
                    },
                    Booked: {
                      bg: 'bg-sky-50 ',
                      text: 'text-sky-700 ',
                      dot: 'bg-sky-500',
                    },
                    Assigned: {
                      bg: 'bg-purple-50 ',
                      text: 'text-purple-700 ',
                      dot: 'bg-purple-500',
                    },
                    'Under Maintenance': {
                      bg: 'bg-amber-50 ',
                      text: 'text-amber-700 ',
                      dot: 'bg-amber-500',
                    },
                    Retired: {
                      bg: 'bg-slate-100',
                      text: 'text-slate-700 ',
                      dot: 'bg-slate-500',
                    },
                  };

                  const cfg = statusConfig[item.status] || {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    dot: 'bg-slate-400',
                  };

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-primary/5 transition-colors group cursor-pointer"
                      onClick={() => setDetailItemId(item.id)}>
                      {/* 1. Item / Asset */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={resolveImageUrl(item.image_url)}
                              alt={item.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-border-subtle shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-primary shrink-0">
                              <Package size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-black text-foreground hover:text-primary transition-colors block truncate max-w-xs">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-bold text-muted truncate block">
                              {item.brand_model || item.condition_status + ' condition'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Asset ID */}
                      <td className="py-4 px-4 font-mono font-bold text-[11px] text-foreground">
                        <span className="px-2 py-0.5 rounded-lg bg-surface-subtle border border-border-subtle">
                          {item.asset_id}
                        </span>
                      </td>

                      {/* 3. Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xl bg-surface text-foreground font-bold text-[11px] border border-border-subtle">
                          {item.category}
                        </span>
                      </td>

                      {/* 4. Quantity */}
                      <td className="py-4 px-3 text-center font-bold text-foreground">
                        {item.quantity}
                      </td>

                      {/* 5. Location */}
                      <td className="py-4 px-4 text-muted font-bold truncate max-w-[160px]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} className="text-primary shrink-0" />
                          <span className="truncate">{item.location || '—'}</span>
                        </span>
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* 7. Bookable Resource Secondary Toggle */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={isBookable}
                            onChange={(e) => handleToggleBookable(item, e.value)}
                            disabled={isToggling}
                          />
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider ${
                              isBookable ? 'text-amber-600 ' : 'text-muted'
                            }`}>
                            {isBookable ? 'Bookable' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      {/* 8. Assigned To */}
                      <td className="py-4 px-4">
                        {item.assigned_to ? (
                          <div className="flex items-center gap-2 max-w-[150px]">
                            {item.assigned_user_avatar ? (
                              <img
                                src={resolveImageUrl(item.assigned_user_avatar)}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {item.assigned_user_name?.slice(0, 1).toUpperCase() || 'S'}
                              </div>
                            )}
                            <span className="truncate font-bold text-foreground text-[11px]">
                              {item.assigned_user_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-surface-subtle text-muted">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* 9. Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            type="button"
                            title="View Asset Details"
                            onClick={() => setDetailItemId(item.id)}
                            className="w-8 h-8 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer">
                            <Eye size={14} />
                          </button>

                          {/* Quick Edit */}
                          <button
                            type="button"
                            title="Edit Asset Details"
                            onClick={() => {
                              setEditingItem(item);
                              setFormModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer">
                            <Edit3 size={14} />
                          </button>

                          {/* Direct Book button if bookable and available */}
                          {isBookable && item.status === 'Available' && (
                            <button
                              type="button"
                              title="Book Resource Now"
                              onClick={() => {
                                setBookTargetItem(item);
                                setBookModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 flex items-center justify-center transition-all cursor-pointer">
                              <CalendarCheck size={14} />
                            </button>
                          )}

                          {/* Assign or Return */}
                          {item.status === 'Assigned' ? (
                            <button
                              type="button"
                              title="Return Asset to Inventory"
                              onClick={() => handleUnassign(item)}
                              className="w-8 h-8 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/30 flex items-center justify-center transition-all cursor-pointer">
                              <RotateCcw size={14} />
                            </button>
                          ) : item.status === 'Available' ? (
                            <button
                              type="button"
                              title="Assign to Staff Member"
                              onClick={() => {
                                setAssignTargetItem(item);
                                setAssignModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/30 flex items-center justify-center transition-all cursor-pointer">
                              <UserCheck size={14} />
                            </button>
                          ) : null}

                          {/* Maintenance */}
                          {item.status === 'Under Maintenance' ? (
                            <button
                              type="button"
                              title="Complete Maintenance"
                              onClick={() => {
                                setMaintenanceTargetItem(item);
                                setMaintenanceMode('complete');
                                setMaintenanceModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer">
                              <CheckCircle2 size={14} />
                            </button>
                          ) : item.status !== 'Retired' ? (
                            <button
                              type="button"
                              title="Send for Maintenance"
                              onClick={() => {
                                setMaintenanceTargetItem(item);
                                setMaintenanceMode('start');
                                setMaintenanceModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-surface hover:bg-surface-subtle border border-border-subtle flex items-center justify-center text-muted hover:text-amber-600 transition-all cursor-pointer">
                              <Wrench size={14} />
                            </button>
                          ) : null}

                          {/* Retire / Delete */}
                          <button
                            type="button"
                            title="Retire or Delete Asset"
                            onClick={() => {
                              setItemToDelete(item);
                              setConfirmDialogVisible(true);
                            }}
                            className="w-8 h-8 rounded-xl bg-surface hover:bg-rose-50 border border-border-subtle flex items-center justify-center text-muted hover:text-rose-600 transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between gap-4">
            <span className="text-xs text-muted font-bold">
              Page {page} of {totalPages} ({totalItems} total items)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs font-bold rounded-xl px-3 h-8">
                <ChevronLeft size={14} className="mr-1" /> Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs font-bold rounded-xl px-3 h-8">
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InventoryFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isLoading={isCreating || isUpdating}
      />

      <InventoryDetailModal
        isOpen={Boolean(detailItemId)}
        onClose={() => setDetailItemId(null)}
        item={detailedItem || null}
        onEdit={(item) => {
          setEditingItem(item);
          setDetailItemId(null);
          setFormModalOpen(true);
        }}
        onAssign={(item) => {
          setAssignTargetItem(item);
          setAssignModalOpen(true);
        }}
        onUnassign={handleUnassign}
        onBook={(item) => {
          setBookTargetItem(item);
          setBookModalOpen(true);
        }}
        onMaintenance={(item) => {
          setMaintenanceTargetItem(item);
          setMaintenanceMode('start');
          setMaintenanceModalOpen(true);
        }}
        onCompleteMaintenance={(item) => {
          setMaintenanceTargetItem(item);
          setMaintenanceMode('complete');
          setMaintenanceModalOpen(true);
        }}
      />

      <AssignItemModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignTargetItem(null);
        }}
        item={assignTargetItem}
        employees={employees}
        onAssign={handleAssignSubmit}
        isLoading={isAssigning}
      />

      <BookResourceModal
        isOpen={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setBookTargetItem(null);
        }}
        item={bookTargetItem}
        onBook={handleBookSubmit}
        isLoading={isBooking}
      />

      <MaintenanceModal
        isOpen={maintenanceModalOpen}
        onClose={() => {
          setMaintenanceModalOpen(false);
          setMaintenanceTargetItem(null);
        }}
        item={maintenanceTargetItem}
        mode={maintenanceMode}
        onSubmit={handleMaintenanceSubmit}
        isLoading={isMaintStarting || isMaintCompleting}
      />

      <ConfirmDialog
        visible={confirmDialogVisible}
        onHide={() => {
          setConfirmDialogVisible(false);
          setItemToDelete(null);
        }}
        message={
          itemToDelete ? (
            <div>
              <p className="font-bold text-foreground">
                Are you sure you want to retire asset "{itemToDelete.name}" ({itemToDelete.asset_id}
                )?
              </p>
              <p className="text-xs text-muted mt-2">
                This will safely mark the item as Retired and disable future resource bookings,
                while permanently preserving all historical booking and audit records.
              </p>
            </div>
          ) : (
            ''
          )
        }
        header="Retire Inventory Asset"
        icon="pi pi-exclamation-triangle"
        accept={handleConfirmDelete}
        reject={() => {
          setConfirmDialogVisible(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default ItemsPage;
