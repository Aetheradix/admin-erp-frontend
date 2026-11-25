import { useCallback, useState } from 'react';
import {
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  type Office,
} from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { reverseGeocode, type GeocodingResult } from '@/services/geocodingService';
import { getUltraAccuratePosition } from '@/utils/highAccuracyGeolocation';
import { getApiErrorMessage } from '@/shared/utils/apiError';
import { EMPTY_OFFICE_FORM } from '../constants';
import type { OfficeFormData } from '../types';
import { buildOfficePayload, officeToFormData, validateOfficeForm } from '../utils';
import { usePlaceSearch } from './usePlaceSearch';

export function useOfficeModal() {
  const [createOffice, { isLoading: isCreating }] = useCreateOfficeMutation();
  const [updateOffice, { isLoading: isUpdating }] = useUpdateOfficeMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [formData, setFormData] = useState<OfficeFormData>(EMPTY_OFFICE_FORM);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const placeSearch = usePlaceSearch();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSuggestions,
    setShowSuggestions,
    resetSearch,
    clearSearch,
  } = placeSearch;

  const openCreate = useCallback(
    (overrides?: Partial<OfficeFormData>) => {
      setEditingOffice(null);
      setFormData({ ...EMPTY_OFFICE_FORM, ...overrides });
      resetSearch();
      setShowModal(true);
    },
    [resetSearch]
  );

  const openEdit = useCallback(
    (office: Office, overrides?: Partial<OfficeFormData>) => {
      setEditingOffice(office);
      setFormData({ ...officeToFormData(office), ...overrides });
      resetSearch(office.address || office.name);
      setShowModal(true);
    },
    [resetSearch]
  );

  const closeModal = () => setShowModal(false);

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

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      showToast({
        severity: 'error',
        summary: 'GPS Error',
        detail: 'Geolocation is not supported by your browser.',
      });
      return;
    }
    setIsDetectingLocation(true);
    try {
      const pos = await getUltraAccuratePosition({ timeoutMs: 6000, desiredAccuracyMeters: 10 });
      const lat = Math.round(pos.latitude * 1e6) / 1e6;
      const lon = Math.round(pos.longitude * 1e6) / 1e6;

      let resolvedAddress = '';
      try {
        const addr = await reverseGeocode(lat, lon);
        if (addr) resolvedAddress = addr;
      } catch (e) {
        console.warn('Reverse geocode error:', e);
      }

      setIsDetectingLocation(false);
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        address: prev.address ? prev.address : resolvedAddress,
        name: prev.name ? prev.name : resolvedAddress ? resolvedAddress.split(',')[0] : prev.name,
      }));
      if (resolvedAddress) {
        setSearchQuery(resolvedAddress);
      }
      showToast({
        severity: 'success',
        summary: 'Location Detected (Ultra-Accurate)',
        detail: `Locked GPS (${lat.toFixed(4)}°, ${lon.toFixed(4)}) ±${Math.round(pos.accuracy)}m${resolvedAddress ? ` • ${resolvedAddress.slice(0, 35)}...` : ''}`,
      });
    } catch (err) {
      setIsDetectingLocation(false);
      showToast({
        severity: 'error',
        summary: 'GPS Acquisition Failed',
        detail: err instanceof Error ? err.message : 'Unable to retrieve high precision location.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = validateOfficeForm(formData);
    if (issue) {
      showToast({ severity: issue.severity, summary: 'Validation', detail: issue.detail });
      return;
    }

    const lat = Number(formData.latitude);
    const lon = Number(formData.longitude);
    const payload = buildOfficePayload(formData, lat, lon);

    try {
      if (editingOffice) {
        await updateOffice({ id: editingOffice.id, ...payload }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Updated',
          detail: `Office "${formData.name}" geofence updated.`,
        });
      } else {
        await createOffice(payload).unwrap();
        showToast({
          severity: 'success',
          summary: 'Created',
          detail: `New office "${formData.name}" registered.`,
        });
      }
      setShowModal(false);
      setFormData(EMPTY_OFFICE_FORM);
    } catch (err) {
      showToast({
        severity: 'error',
        summary: 'Save Failed',
        detail: getApiErrorMessage(err, 'Could not save office location.'),
      });
    }
  };

  return {
    showModal,
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
    clearSearch,
    openCreate,
    openEdit,
    closeModal,
    handleSelectLocation,
    handleDetectLocation,
    handleSubmit,
  };
}
