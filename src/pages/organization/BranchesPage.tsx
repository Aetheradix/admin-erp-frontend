import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building,
  Plus,
  Edit2,
  Trash2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Radar,
  Activity,
  Search,
  X,
  Compass,
} from 'lucide-react';
import {
  useGetAllOfficesQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
  useGetGeofenceLogsQuery,
  type Office,
  type GeofenceAuditLog,
} from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useAuth } from '@/hooks/useAuth';
import { searchLocations, type GeocodingResult } from '@/services/geocodingService';
import { LocationPinpointMap } from '@/components/common/LocationPinpointMap';
import { getUltraAccuratePosition } from '@/utils/highAccuracyGeolocation';

interface OfficeFormData {
  id?: number;
  name: string;
  address: string;
  latitude: number | '';
  longitude: number | '';
  radius: number;
  timezone: string;
  is_active: boolean;
}

const emptyForm: OfficeFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  radius: 100,
  timezone: 'Asia/Kolkata',
  is_active: true,
};

export function BranchesPage() {
  const { isSuperadmin, roles } = useAuth();
  const canManage = isSuperadmin || roles?.some((r) => ['Admin', 'Superadmin', 'HR Admin'].includes(r));

  const [activeSubTab, setActiveSubTab] = useState<'offices' | 'logs'>('offices');
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [formData, setFormData] = useState<OfficeFormData>(emptyForm);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Search & Select Autocomplete State (like Google Maps / Ola)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Queries & Mutations
  const { data: offices = [], isLoading: isLoadingOffices, refetch: refetchOffices } = useGetAllOfficesQuery();
  const { data: geofenceLogs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useGetGeofenceLogsQuery(
    undefined,
    { skip: activeSubTab !== 'logs' }
  );

  const [createOffice, { isLoading: isCreating }] = useCreateOfficeMutation();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();
  const [deleteOffice, { isLoading: isDeleting }] = useDeleteOfficeMutation();

  // Debounced search for place autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowSuggestions(true);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (place: GeocodingResult) => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
    setSearchQuery(place.name);
    setShowSuggestions(false);
    showToast({
      severity: 'success',
      summary: 'Location Selected',
      detail: `Coordinates populated for ${place.name}`,
    });
  };

  const handleOpenCreate = () => {
    setEditingOffice(null);
    setFormData(emptyForm);
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setShowModal(true);
  };

  const handleOpenEdit = (office: Office) => {
    setEditingOffice(office);
    const active = office.is_active ?? office.isActive ?? true;
    setFormData({
      id: office.id,
      name: office.name,
      address: office.address || '',
      latitude: office.latitude,
      longitude: office.longitude,
      radius: office.radius,
      timezone: office.timezone || 'Asia/Kolkata',
      is_active: active,
    });
    setSearchQuery(office.address || office.name);
    setSearchResults([]);
    setShowSuggestions(false);
    setShowModal(true);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      showToast({ severity: 'error', summary: 'GPS Error', detail: 'Geolocation is not supported by your browser.' });
      return;
    }
    setIsDetectingLocation(true);
    try {
      const pos = await getUltraAccuratePosition({ timeoutMs: 6000, desiredAccuracyMeters: 10 });
      setIsDetectingLocation(false);
      const lat = Math.round(pos.latitude * 1e6) / 1e6;
      const lon = Math.round(pos.longitude * 1e6) / 1e6;
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
      }));
      showToast({
        severity: 'success',
        summary: 'Location Detected (Ultra-Accurate)',
        detail: `Locked high-precision GPS (${lat.toFixed(4)}°, ${lon.toFixed(4)}°) with accuracy ±${Math.round(pos.accuracy)}m`,
      });
    } catch (err: any) {
      setIsDetectingLocation(false);
      showToast({
        severity: 'error',
        summary: 'GPS Acquisition Failed',
        detail: err.message || 'Unable to retrieve high precision location.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({ severity: 'warn', summary: 'Validation', detail: 'Office name is required.' });
      return;
    }
    if (formData.latitude === '' || formData.longitude === '') {
      showToast({ severity: 'warn', summary: 'Validation', detail: 'Latitude and longitude coordinates are required.' });
      return;
    }

    const lat = Number(formData.latitude);
    const lon = Number(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      showToast({ severity: 'error', summary: 'Validation', detail: 'Latitude must be between -90 and 90.' });
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      showToast({ severity: 'error', summary: 'Validation', detail: 'Longitude must be between -180 and 180.' });
      return;
    }
    if (formData.radius < 20 || formData.radius > 5000) {
      showToast({ severity: 'error', summary: 'Validation', detail: 'Radius must be between 20 and 5000 meters.' });
      return;
    }

    try {
      if (editingOffice) {
        await updateOffice({
          id: editingOffice.id,
          name: formData.name.trim(),
          address: formData.address.trim(),
          latitude: lat,
          longitude: lon,
          radius: Number(formData.radius),
          timezone: formData.timezone,
          is_active: formData.is_active,
          isActive: formData.is_active,
        }).unwrap();
        showToast({ severity: 'success', summary: 'Updated', detail: `Office "${formData.name}" geofence updated.` });
      } else {
        await createOffice({
          name: formData.name.trim(),
          address: formData.address.trim(),
          latitude: lat,
          longitude: lon,
          radius: Number(formData.radius),
          timezone: formData.timezone,
          is_active: formData.is_active,
          isActive: formData.is_active,
        }).unwrap();
        showToast({ severity: 'success', summary: 'Created', detail: `New office "${formData.name}" registered.` });
      }
      setShowModal(false);
      setFormData(emptyForm);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      showToast({
        severity: 'error',
        summary: 'Save Failed',
        detail: apiErr?.data?.message || 'Could not save office location.',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOffice(id).unwrap();
      showToast({ severity: 'success', summary: 'Deleted', detail: 'Office location removed.' });
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      showToast({
        severity: 'error',
        summary: 'Delete Failed',
        detail: apiErr?.data?.message || 'Could not delete office.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      {/* Header & Sub-tab navigation */}
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
            <button
              type="button"
              onClick={() => setActiveSubTab('offices')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeSubTab === 'offices'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-subtle'
                : 'text-muted hover:text-foreground'
                }`}>
              <Building size={13} />
              <span>Registered Hubs ({offices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('logs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeSubTab === 'logs'
                ? 'bg-surface-elevated text-foreground shadow-xs border border-border-subtle'
                : 'text-muted hover:text-foreground'
                }`}>
              <Activity size={13} />
              <span>Audit Logs</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetchOffices()}
            title="Refresh Offices"
            className="p-2 rounded-2xl bg-surface-subtle border border-border-subtle text-muted hover:text-foreground transition-colors cursor-pointer">
            <RefreshCw size={14} className={isLoadingOffices ? 'animate-spin' : ''} />
          </button>

          {canManage && activeSubTab === 'offices' && (
            <Button
              onClick={handleOpenCreate}
              className="rounded-2xl! h-10! px-4! bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 cursor-pointer flex items-center gap-2">
              <Plus size={15} />
              <span>Add Office</span>
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: Registered Offices Grid */}
      {activeSubTab === 'offices' && (
        <div className="space-y-6">
          {isLoadingOffices ? (
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
                Add your company's physical headquarters or regional branches with latitude, longitude, and geofence radius to enforce on-premise attendance.
              </p>
              {canManage && (
                <Button onClick={handleOpenCreate} className="rounded-2xl! px-6! mx-auto">
                  <Plus size={14} className="mr-1.5" />
                  Add First Office
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices.map((office, i) => {
                const isActive = office.is_active ?? office.isActive ?? true;
                return (
                  <motion.div
                    key={office.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
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
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-surface-subtle text-muted border border-border-subtle'
                          }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
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
                            onClick={() => handleOpenEdit(office)}
                            title="Edit Office"
                            className="p-1.5 rounded-xl hover:bg-surface-subtle text-muted hover:text-foreground transition-colors cursor-pointer">
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(office.id)}
                            title="Delete Office"
                            className="p-1.5 rounded-xl hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Geofence Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-surface-elevated rounded-3xl border border-border-subtle shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Geofence Check-in Verification History</h3>
              <p className="text-xs text-muted font-medium">
                Live audit trail of all employee geofence boundary validations
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchLogs()}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
              <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {isLoadingLogs ? (
            <div className="py-12 text-center">
              <RefreshCw size={22} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs font-bold text-muted">Loading audit entries...</p>
            </div>
          ) : geofenceLogs.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs font-semibold">
              No geofence check-in attempts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-muted text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Target Office</th>
                    <th className="py-3 px-3">Distance / Radius</th>
                    <th className="py-3 px-3">GPS Accuracy</th>
                    <th className="py-3 px-3">Verification Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {geofenceLogs.map((log: GeofenceAuditLog) => {
                    const isSuccess = log.status === 'SUCCESS' || log.status === 'REMOTE_WFH';
                    return (
                      <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-muted">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">
                          {log.username || log.email || (log.employee_code ? `Emp #${log.employee_code}` : `User #${log.user_id}`)}
                        </td>
                        <td className="py-3 px-3 text-foreground font-semibold">
                          {log.office_name || (log.office_id ? `Office #${log.office_id}` : 'Remote / WFH')}
                        </td>
                        <td className="py-3 px-3 font-mono text-foreground">
                          {log.distance_meters !== null && log.distance_meters !== undefined ? (
                            <span>
                              <strong>{Math.round(log.distance_meters)}m</strong>
                              {log.allowed_radius_meters ? ` / ${log.allowed_radius_meters}m` : ''}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-muted">
                          {log.location_accuracy ? `±${Math.round(log.location_accuracy)}m` : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isSuccess
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-500/15 text-red-600 dark:text-red-400'
                              }`}>
                            {isSuccess ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                            {log.status}
                          </span>
                          {log.failure_reason && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">{log.failure_reason}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT OFFICE DIALOG WITH AUTOCOMPLETE & MANUAL ENTRY */}
      <Dialog
        visible={showModal}
        onHide={() => setShowModal(false)}
        header={editingOffice ? 'Edit Office Geofence' : 'Register New Office Geofence'}
        modal
        className="w-full max-w-2xl mx-4"
        contentClassName="p-6 max-h-[85vh] overflow-y-auto"
        headerClassName="px-6 pt-6 pb-2 text-lg font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[28px] overflow-hidden border-none shadow-2xl bg-surface-elevated' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* SEARCH & SELECT SECTION (Like Google Maps / Ola) */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                className="pr-8!"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching ? (
                  <RefreshCw size={14} className="animate-spin text-primary" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSuggestions(false);
                    }}
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
                      onClick={() => handleSelectLocation(place)}
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

          {/* MANUAL COORDINATES ENTRY + GPS PIN SHORTCUT */}
          <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={13} className="text-primary" />
                <span>Geofence Coordinates (Manual / Editable)</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
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
              {/* <span className="text-[10px] font-black uppercase text-muted tracking-wider block">
                Visual Pinpoint Map & Boundary Preview
              </span> */}
              <LocationPinpointMap
                latitude={formData.latitude === '' ? null : Number(formData.latitude)}
                longitude={formData.longitude === '' ? null : Number(formData.longitude)}
                radius={Number(formData.radius)}
                locationName={formData.name || formData.address}
                height="170px"
              />
            </div>
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
            <label htmlFor="office_active_checkbox" className="text-xs font-bold text-foreground cursor-pointer">
              Office is active for attendance geofence verification
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="ghost"
              label="Cancel"
              onClick={() => setShowModal(false)}
              className="rounded-xl!"
            />
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              label={isCreating || isUpdating ? 'Saving...' : editingOffice ? 'Save Changes' : 'Create Office'}
              icon="pi pi-check"
              className="rounded-xl! px-6! bg-primary hover:bg-primary-hover text-white font-black"
            />
          </div>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        visible={deleteConfirmId !== null}
        onHide={() => setDeleteConfirmId(null)}
        header="Confirm Delete"
        modal
        className="w-full max-w-sm mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-2 text-lg font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[28px] overflow-hidden border-none shadow-2xl bg-surface-elevated' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="space-y-4">
          <p className="text-xs text-muted font-medium">
            Are you sure you want to remove this office location? Employees will no longer be able to check in against this geofence.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              label="Cancel"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-xl!"
            />
            <Button
              type="button"
              disabled={isDeleting}
              label={isDeleting ? 'Deleting...' : 'Delete Office'}
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="rounded-xl! px-5! bg-red-600 hover:bg-red-700 text-white font-black"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default BranchesPage;
