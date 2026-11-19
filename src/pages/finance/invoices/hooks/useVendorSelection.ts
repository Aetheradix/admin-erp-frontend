import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import {
  useCreateVendorMutation,
  useGetVendorsQuery,
  type Vendor,
} from '@/store/api/financeApiSlice';
import type { InvoiceForm } from '../types';
import type { InvoiceFormErrors } from '../formValidation';

interface UseVendorSelectionOptions {
  billToName: string;
  billToPhone?: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToPincode: string;
  billToGSTIN: string;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  setErrors: React.Dispatch<React.SetStateAction<InvoiceFormErrors>>;
}

export function useVendorSelection({
  billToName,
  billToPhone,
  billToAddress,
  billToCity,
  billToState,
  billToPincode,
  billToGSTIN,
  updateField,
  setErrors,
}: UseVendorSelectionOptions) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSavingVendor, setIsSavingVendor] = useState(false);
  const [showExtraVendorDetails, setShowExtraVendorDetails] = useState(false);
  const [newVendorCategory, setNewVendorCategory] = useState('Others');
  const [newVendorType, setNewVendorType] = useState('Company');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [matchedVendor, setMatchedVendor] = useState<Vendor | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: vendorsList = [], refetch: refetchVendors } = useGetVendorsQuery();
  const [createVendorApi] = useCreateVendorMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVendors = useMemo(() => {
    if (!billToName || !billToName.trim()) return vendorsList;
    const term = billToName.toLowerCase().trim();
    return vendorsList.filter((vendor: Vendor) => {
      const name = (vendor.vendor_name || vendor.name || '').toLowerCase();
      const phone = (
        vendor.vendor_phoneNo ||
        vendor.vendor_phone_no ||
        vendor.phone ||
        ''
      ).toLowerCase();
      const gstin = (vendor.vendor_gstin || vendor.gstin || '').toLowerCase();
      return name.includes(term) || phone.includes(term) || gstin.includes(term);
    });
  }, [vendorsList, billToName]);

  const exactVendorMatch = useMemo(() => {
    if (!billToName || !billToName.trim()) return null;
    const term = billToName.toLowerCase().trim();
    return (
      vendorsList.find(
        (vendor: Vendor) => (vendor.vendor_name || vendor.name || '').toLowerCase().trim() === term
      ) ?? null
    );
  }, [vendorsList, billToName]);

  const handleSelectVendor = useCallback(
    (vendor: Vendor) => {
      updateField('billToName', vendor.vendor_name || vendor.name || '');
      updateField(
        'billToPhone',
        vendor.vendor_phoneNo || vendor.vendor_phone_no || vendor.phone || ''
      );
      if (vendor.vendor_address || vendor.address) {
        updateField('billToAddress', vendor.vendor_address || vendor.address || '');
      }
      if (vendor.vendor_city || vendor.city) {
        updateField('billToCity', vendor.vendor_city || vendor.city || '');
      }
      if (vendor.vendor_state || vendor.state) {
        updateField('billToState', vendor.vendor_state || vendor.state || '');
      }
      if (vendor.vendor_pincode || vendor.pincode) {
        updateField('billToPincode', vendor.vendor_pincode || vendor.pincode || '');
      }
      if (vendor.vendor_gstin || vendor.gstin) {
        updateField('billToGSTIN', vendor.vendor_gstin || vendor.gstin || '');
      }
      setMatchedVendor(vendor);
      setIsDropdownOpen(false);
      setShowExtraVendorDetails(false);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.billToName;
        delete next.billToPhone;
        return next;
      });
      message.success({
        content: `Autofilled details from database for "${vendor.vendor_name || vendor.name}"`,
        key: 'vendor-autofill',
      });
    },
    [updateField, setErrors]
  );

  const handleCreateNewVendor = useCallback(
    async (event?: React.MouseEvent) => {
      event?.preventDefault();
      const vendorName = (billToName || '').trim();
      const vendorPhone = (billToPhone || '').trim();

      if (!vendorName) {
        setErrors((prev) => ({ ...prev, billToName: 'Vendor name is required.' }));
        message.error('Please enter a vendor name to save.');
        return;
      }
      if (!vendorPhone) {
        setErrors((prev) => ({ ...prev, billToPhone: 'Vendor phone number is required.' }));
        message.error('Please enter a phone number for the vendor before saving.');
        return;
      }

      try {
        setIsSavingVendor(true);
        const response = await createVendorApi({
          vendor_name: vendorName,
          vendor_phoneNo: vendorPhone,
          vendor_address: billToAddress || null,
          vendor_city: billToCity || null,
          vendor_state: billToState || null,
          vendor_pincode: billToPincode || null,
          vendor_gstin: billToGSTIN || null,
          vendor_email: newVendorEmail.trim() || null,
          vendor_category: newVendorCategory || 'Others',
          vendor_type: newVendorType || 'Company',
        }).unwrap();

        const createdVendor = response?.data || response;
        setMatchedVendor(createdVendor);
        setIsDropdownOpen(false);
        setShowExtraVendorDetails(false);
        await refetchVendors();
        message.success({
          content: `New vendor "${vendorName}" created and saved to database successfully!`,
          key: 'vendor-create-success',
        });
      } catch (error: unknown) {
        const apiError = error as { data?: { message?: string }; message?: string };
        message.error({
          content: apiError?.data?.message || apiError?.message || 'Failed to create vendor in database.',
          key: 'vendor-create-error',
        });
      } finally {
        setIsSavingVendor(false);
      }
    },
    [
      billToName,
      billToPhone,
      billToAddress,
      billToCity,
      billToState,
      billToPincode,
      billToGSTIN,
      newVendorEmail,
      newVendorCategory,
      newVendorType,
      createVendorApi,
      refetchVendors,
      setErrors,
    ]
  );

  return {
    dropdownRef,
    vendorsList,
    filteredVendors,
    exactVendorMatch,
    matchedVendor,
    isDropdownOpen,
    setIsDropdownOpen,
    isSavingVendor,
    showExtraVendorDetails,
    setShowExtraVendorDetails,
    newVendorCategory,
    setNewVendorCategory,
    newVendorType,
    setNewVendorType,
    newVendorEmail,
    setNewVendorEmail,
    setMatchedVendor,
    handleSelectVendor,
    handleCreateNewVendor,
  };
}
