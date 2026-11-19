import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Building2,
  User,
  IndianRupee,
  Plus,
  Trash2,
  X,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  Search,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  Package,
} from 'lucide-react';
import { message } from 'antd';
import { Input } from '@/components/ui/composed/Input';
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useLazyGetNextInvoiceNumberQuery,
  type Vendor,
} from '@/store/api/financeApiSlice';
import { useGetInventoryItemsQuery } from '@/store/api/inventorySlice';
import type { InvoiceForm, InvoiceItem } from '../types/invoice.types';

interface InvoiceFormModalProps {
  visible: boolean;
  onHide: () => void;
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  updateItem: (
    index: number,
    fieldOrUpdates: keyof InvoiceItem | Partial<InvoiceItem>,
    value?: string | number | undefined
  ) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onSubmit: () => Promise<void> | void;
  emptyForm: InvoiceForm;
  setForm: React.Dispatch<React.SetStateAction<InvoiceForm>>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  rightElement?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, description, rightElement }) => (
  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
    <div className="flex items-center gap-2.5">
      <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    {rightElement}
  </div>
);

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  visible,
  onHide,
  form,
  updateField,
  updateItem,
  addItem,
  removeItem,
  onSubmit,
  emptyForm,
  setForm,
  isSubmitting = false,
  isEditing = false,
}) => {
  const [showIssuerDetails, setShowIssuerDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Vendor autofill & creation states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSavingVendor, setIsSavingVendor] = useState(false);
  const [showExtraVendorDetails, setShowExtraVendorDetails] = useState(false);
  const [newVendorCategory, setNewVendorCategory] = useState('Others');
  const [newVendorType, setNewVendorType] = useState('Company');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [matchedVendor, setMatchedVendor] = useState<Vendor | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // RTK Query hooks for vendors
  const { data: vendorsList = [], refetch: refetchVendors } = useGetVendorsQuery();
  const [createVendorApi] = useCreateVendorMutation();
  const [fetchNextInvoiceNumber, { isFetching: isFetchingNumber }] =
    useLazyGetNextInvoiceNumberQuery();

  // RTK Query hook for inventory stock items
  const { data: inventoryData } = useGetInventoryItemsQuery({ limit: 100 });
  const inventoryItems = inventoryData?.items || [];

  const addInventoryItem = () => {
    const firstAvailable =
      inventoryItems.find((it) => Number(it.quantity) > 0) || inventoryItems[0];
    if (firstAvailable) {
      setForm((prev: InvoiceForm) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            description: firstAvailable.name,
            quantity: 1,
            rate: Number(firstAvailable.purchase_cost) || 0,
            inventory_item_id: firstAvailable.id,
            asset_id: firstAvailable.asset_id,
            available_stock: Number(firstAvailable.quantity),
          },
        ],
      }));
    } else {
      addItem();
    }
  };

  const syncInvoiceNumberFromDB = async (targetDate?: string) => {
    if (isEditing) return;
    const dateToQuery = targetDate || form.invoiceDate || new Date().toISOString().slice(0, 10);
    try {
      const res = await fetchNextInvoiceNumber({ date: dateToQuery }).unwrap();
      if (res && res.nextInvoiceNumber) {
        updateField('invoiceNumber', res.nextInvoiceNumber);
      }
    } catch (_) {
      const d = new Date(dateToQuery);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      updateField('invoiceNumber', `INV${yy}${mm}-001`);
    }
  };

  // Auto-sync next invoice number from DB when modal opens for creation
  useEffect(() => {
    if (visible && !isEditing) {
      if (!form.invoiceNumber || /^INV-\d{4}/i.test(form.invoiceNumber)) {
        syncInvoiceNumberFromDB(form.invoiceDate);
      }
    }
  }, [visible, isEditing]);

  // Close dropdown on outside click
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
    if (!form.billToName || !form.billToName.trim()) return vendorsList;
    const term = form.billToName.toLowerCase().trim();
    return vendorsList.filter((v: Vendor) => {
      const name = (v.vendor_name || v.name || '').toLowerCase();
      const phone = (v.vendor_phoneNo || v.vendor_phone_no || v.phone || '').toLowerCase();
      const gstin = (v.vendor_gstin || v.gstin || '').toLowerCase();
      return name.includes(term) || phone.includes(term) || gstin.includes(term);
    });
  }, [vendorsList, form.billToName]);

  const exactVendorMatch = useMemo(() => {
    if (!form.billToName || !form.billToName.trim()) return null;
    const term = form.billToName.toLowerCase().trim();
    return vendorsList.find(
      (v: Vendor) => (v.vendor_name || v.name || '').toLowerCase().trim() === term
    );
  }, [vendorsList, form.billToName]);

  const handleSelectVendor = (vendor: Vendor) => {
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
      const copy = { ...prev };
      delete copy.billToName;
      delete copy.billToPhone;
      return copy;
    });
    message.success({
      content: `Autofilled details from database for "${vendor.vendor_name || vendor.name}"`,
      key: 'vendor-autofill',
    });
  };

  const handleCreateNewVendor = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const vendorName = (form.billToName || '').trim();
    const vendorPhone = (form.billToPhone || '').trim();

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
      const res = await createVendorApi({
        vendor_name: vendorName,
        vendor_phoneNo: vendorPhone,
        vendor_address: form.billToAddress || null,
        vendor_city: form.billToCity || null,
        vendor_state: form.billToState || null,
        vendor_pincode: form.billToPincode || null,
        vendor_gstin: form.billToGSTIN || null,
        vendor_email: newVendorEmail.trim() || null,
        vendor_category: newVendorCategory || 'Others',
        vendor_type: newVendorType || 'Company',
      }).unwrap();

      const createdVendor = res?.data || res;
      setMatchedVendor(createdVendor);
      setIsDropdownOpen(false);
      setShowExtraVendorDetails(false);
      await refetchVendors();
      message.success({
        content: `New vendor "${vendorName}" created and saved to database successfully!`,
        key: 'vendor-create-success',
      });
    } catch (err: any) {
      message.error({
        content: err?.data?.message || err?.message || 'Failed to create vendor in database.',
        key: 'vendor-create-error',
      });
    } finally {
      setIsSavingVendor(false);
    }
  };

  const safeItems = Array.isArray(form?.items) ? form.items : [];

  const subTotal = safeItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = (subTotal * Number(form?.gstRate || 0)) / 100;
  const total = subTotal + gstAmount;

  // Real-time stock sufficiency validation
  const hasStockError =
    !isEditing &&
    safeItems.some(
      (item) =>
        (item.inventory_item_id || item.asset_id) &&
        item.available_stock !== undefined &&
        item.available_stock !== null &&
        Number(item.quantity || 0) > Number(item.available_stock)
    );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.invoiceNumber?.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required.';
    }
    if (!form.billToName?.trim()) {
      newErrors.billToName = 'Vendor or customer name is required.';
    }
    if (!form.billToPhone?.trim()) {
      newErrors.billToPhone = 'Vendor phone number is required.';
    }

    if (safeItems.length === 0) {
      newErrors.items = 'Please add at least one line item.';
    } else {
      const hasInvalidItem = safeItems.some(
        (item) => !item.description?.trim() || Number(item.quantity || 0) <= 0
      );
      if (hasInvalidItem) {
        newErrors.items =
          'Please ensure all items have a description and quantity greater than zero.';
      } else if (!isEditing) {
        // Enforce inventory stock check
        for (const item of safeItems) {
          if (
            (item.inventory_item_id || item.asset_id) &&
            item.available_stock !== undefined &&
            item.available_stock !== null
          ) {
            const requestedQty = Number(item.quantity || 0);
            const stockQty = Number(item.available_stock);
            if (requestedQty > stockQty) {
              newErrors.items = `Insufficient stock for "${item.description}". Only ${stockQty} available in inventory, but ${requestedQty} requested. Please adjust quantity before creating invoice.`;
              message.error({
                content: `Insufficient stock for "${item.description}". Only ${stockQty} available in inventory (requested: ${requestedQty})!`,
                key: 'stock-error',
                duration: 5,
              });
              break;
            }
          }
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    setIsDropdownOpen(false);
    setShowExtraVendorDetails(false);
    setMatchedVendor(null);
    onHide();
    setForm(emptyForm);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}>
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Tax Invoice' : 'Create Tax Invoice'}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                  {form.invoiceNumber || 'NEW'}
                </span>
                {isEditing && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Editing Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? 'Update billing information, items, notes, or payment status.'
                  : 'Enter billing information, items, and tax breakdown.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="overflow-y-auto flex-1 p-6 space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <span>Please fill all required fields and check line items.</span>
            </div>
          )}

          {/* Section 1: Invoice Specifications */}
          <section className="space-y-4">
            <SectionTitle
              icon={<FileText size={18} />}
              title="Invoice Specifications"
              description="Basic numbers, timeline, and jurisdiction."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => syncInvoiceNumberFromDB()}
                      disabled={isFetchingNumber}
                      title="Fetch next unique invoice number from database"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition disabled:opacity-50">
                      <RefreshCw size={11} className={isFetchingNumber ? 'animate-spin' : ''} />
                      {isFetchingNumber ? 'Syncing...' : 'Sync with DB'}
                    </button>
                  )}
                </div>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  error={errors.invoiceNumber}
                  disabled={isEditing}
                  placeholder="e.g. INV2610-004"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {isEditing
                    ? 'Invoice ID is locked during editing'
                    : 'Format: INV<YY><MM>-<unique_number> (e.g. INV2610-004)'}
                </p>
              </div>

              <Input
                label="Invoice Date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  updateField('invoiceDate', newDate);
                  if (!isEditing && newDate) {
                    syncInvoiceNumberFromDB(newDate);
                  }
                }}
                required
              />

              <Input
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />

              <Input
                label="Place of Supply"
                value={form.placeOfSupply}
                onChange={(e) => updateField('placeOfSupply', e.target.value)}
                placeholder="e.g. Madhya Pradesh"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                <select
                  value={String(form.gstRate)}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="0">0% (Nil / Exempt)</option>
                  <option value="5">5% (Concessional)</option>
                  <option value="12">12% (Standard Lower)</option>
                  <option value="18">18% (Standard Services Default)</option>
                  <option value="28">28% (Luxury / Higher)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={form.status || 'Pending'}
                  onChange={(e) => updateField('status', e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Bill To (Vendor / Customer Details) */}
          <section className="space-y-4">
            <SectionTitle
              icon={<User size={18} />}
              title="Vendor / Customer Details (Bill To)"
              description="Recipient company or vendor receiving the invoice."
              rightElement={
                exactVendorMatch || matchedVendor ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Database Vendor Linked
                  </span>
                ) : form.billToName?.trim() ? (
                  <button
                    type="button"
                    onClick={() => setShowExtraVendorDetails((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition">
                    <UserPlus size={13} />
                    New Vendor
                  </button>
                ) : null
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vendor Search & Name input with floating autocomplete */}
              <div ref={dropdownRef} className="relative md:col-span-2">
                <Input
                  label="Vendor / Customer Name"
                  value={form.billToName}
                  onChange={(e) => {
                    updateField('billToName', e.target.value);
                    setIsDropdownOpen(true);
                    setMatchedVendor(null);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  error={errors.billToName}
                  required
                  placeholder="e.g. Acme Corporation Pvt Ltd (type to search database)"
                />

                {/* Floating Autocomplete / Search Suggestions */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] max-h-72 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 space-y-1">
                    {filteredVendors.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Search size={12} /> Database Vendors ({filteredVendors.length})
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">Click to autofill</span>
                        </div>
                        {filteredVendors.map((v: Vendor) => (
                          <button
                            key={v.vendor_id || v.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectVendor(v)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-gray-50 flex items-start justify-between gap-3 transition group">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-black flex items-center gap-2">
                                <span>{v.vendor_name || v.name}</span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                  {v.vendor_type || 'Company'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                {(v.vendor_phoneNo || v.vendor_phone_no || v.phone) && (
                                  <span className="flex items-center gap-1 text-gray-700">
                                    <Phone size={11} className="text-gray-400" />
                                    {v.vendor_phoneNo || v.vendor_phone_no || v.phone}
                                  </span>
                                )}
                                {(v.vendor_city || v.city) && (
                                  <span>📍 {v.vendor_city || v.city}</span>
                                )}
                                {(v.vendor_gstin || v.gstin) && (
                                  <span className="font-mono text-[11px]">
                                    GST: {v.vendor_gstin || v.gstin}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                              Autofill ↵
                            </span>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-500 text-center">
                        No registered vendor matching &quot;{form.billToName}&quot;
                      </div>
                    )}

                    {/* Option to create new vendor directly */}
                    {!exactVendorMatch && form.billToName?.trim() && (
                      <div className="pt-1 mt-1 border-t border-gray-100">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setShowExtraVendorDetails(true);
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-900 flex items-center justify-between transition font-medium text-xs">
                          <span className="flex items-center gap-2">
                            <UserPlus size={15} className="text-blue-600 shrink-0" />
                            <span>
                              Create new vendor <strong>&quot;{form.billToName}&quot;</strong> in database
                            </span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] shrink-0">
                            + Add New
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vendor Phone Number */}
              <div>
                <Input
                  label="Vendor Phone Number"
                  value={form.billToPhone || ''}
                  onChange={(e) => updateField('billToPhone', e.target.value)}
                  error={errors.billToPhone}
                  required
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              {/* Client / Vendor GSTIN */}
              <Input
                label="Vendor / Client GSTIN (Optional)"
                value={form.billToGSTIN}
                onChange={(e) => updateField('billToGSTIN', e.target.value.toUpperCase())}
                placeholder="e.g. 23AAAAA0000A1Z5"
              />

              <div className="md:col-span-2">
                <Input
                  label="Billing Address"
                  value={form.billToAddress}
                  onChange={(e) => updateField('billToAddress', e.target.value)}
                  placeholder="Office suite, building, street"
                />
              </div>

              <Input
                label="City"
                value={form.billToCity}
                onChange={(e) => updateField('billToCity', e.target.value)}
                placeholder="e.g. Bhopal"
              />

              <Input
                label="State"
                value={form.billToState}
                onChange={(e) => updateField('billToState', e.target.value)}
                placeholder="e.g. Madhya Pradesh"
              />

              <Input
                label="Pincode"
                value={form.billToPincode}
                onChange={(e) => updateField('billToPincode', e.target.value)}
                placeholder="e.g. 462001"
              />

              <Input
                label="Country"
                value={form.billToCountry}
                onChange={(e) => updateField('billToCountry', e.target.value)}
                placeholder="India"
              />

              {/* Inline Option to Save Vendor to Database */}
              {form.billToName?.trim() && !exactVendorMatch && (
                <div className="col-span-full bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <UserPlus size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900">
                          Save &quot;{form.billToName}&quot; to Vendor Database?
                        </h3>
                        <p className="text-[11px] text-gray-600">
                          Store this vendor in the database so their phone number, GSTIN, and address autofill automatically next time.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExtraVendorDetails((prev) => !prev)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-xl transition">
                        {showExtraVendorDetails ? 'Fewer Fields' : 'More Fields'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateNewVendor}
                        disabled={isSavingVendor}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm disabled:opacity-50">
                        {isSavingVendor ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                        Save Vendor to Database
                      </button>
                    </div>
                  </div>

                  {showExtraVendorDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-blue-200/60">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Vendor Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={newVendorEmail}
                          onChange={(e) => setNewVendorEmail(e.target.value)}
                          placeholder="contact@vendor.com"
                          className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Vendor Category
                        </label>
                        <select
                          value={newVendorCategory}
                          onChange={(e) => setNewVendorCategory(e.target.value)}
                          className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="Stationary">Stationary</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Foods&Beverages">Foods & Beverages</option>
                          <option value="Networking">Networking</option>
                          <option value="Others">Others / General</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">
                          Vendor Type
                        </label>
                        <select
                          value={newVendorType}
                          onChange={(e) => setNewVendorType(e.target.value)}
                          className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="Company">Company</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Issuer Business Details */}
          <section className="space-y-4">
            <SectionTitle
              icon={<Building2 size={18} />}
              title="Issuer Business Details"
              description="Organization issuing this tax invoice."
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowIssuerDetails(!showIssuerDetails)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black hover:underline cursor-pointer">
                  {showIssuerDetails ? 'Collapse Details' : 'Edit Issuer Details'}
                  {showIssuerDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              }
            />

            {!showIssuerDetails ? (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium">
                <span>
                  <strong>Company:</strong> {form.companyName || 'Aetheradix Private Limited'}
                </span>
                <span>•</span>
                <span>
                  <strong>GSTIN:</strong> {form.companyGSTIN || '23ABDCA8625L1ZJ'}
                </span>
                <span>•</span>
                <span>
                  <strong>Address:</strong> {form.companyCity || 'Bhopal'},{' '}
                  {form.companyState || 'Madhya Pradesh'}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in duration-200">
                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
                <Input
                  label="Contact Person"
                  value={form.companyContact}
                  onChange={(e) => updateField('companyContact', e.target.value)}
                />
                <Input
                  label="Company GSTIN"
                  value={form.companyGSTIN}
                  onChange={(e) => updateField('companyGSTIN', e.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Company Address"
                    value={form.companyAddress}
                    onChange={(e) => updateField('companyAddress', e.target.value)}
                  />
                </div>
                <Input
                  label="City"
                  value={form.companyCity}
                  onChange={(e) => updateField('companyCity', e.target.value)}
                />
                <Input
                  label="State"
                  value={form.companyState}
                  onChange={(e) => updateField('companyState', e.target.value)}
                />
                <Input
                  label="Pincode"
                  value={form.companyPincode}
                  onChange={(e) => updateField('companyPincode', e.target.value)}
                />
                <Input
                  label="Country"
                  value={form.companyCountry}
                  onChange={(e) => updateField('companyCountry', e.target.value)}
                />
              </div>
            )}
          </section>

          {/* Section 4: Invoice Line Items */}
          <section className="space-y-4">
            <SectionTitle
              icon={<IndianRupee size={18} />}
              title="Invoice Line Items"
              description="Add deliverables, professional services, or products."
            />

            {errors.items && <p className="text-xs text-red-500 font-medium">{errors.items}</p>}

            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 mb-3 gap-2">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <IndianRupee size={16} className="text-emerald-600" /> Billed Items
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addInventoryItem}
                    className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                    <Package size={14} /> Add from Inventory
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition">
                    <Plus size={14} /> Add Custom Item
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {safeItems.map((item, idx) => {
                  const lineTotal = Number(item.quantity || 0) * Number(item.rate || 0);
                  const isLinkedToInventory = Boolean(item.inventory_item_id || item.asset_id);
                  const isInsufficient =
                    isLinkedToInventory &&
                    item.available_stock !== undefined &&
                    Number(item.quantity || 0) > Number(item.available_stock);

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-2.5 bg-white p-3 rounded-2xl border transition ${
                        isInsufficient
                          ? 'border-red-300 bg-red-50/20 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      {/* Inventory Item Selector Ribbon */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100 text-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 shrink-0">
                            <Package size={13} className="text-indigo-600" /> Source:
                          </span>
                          <select
                            value={item.inventory_item_id || ''}
                            onChange={(e) => {
                              const selectedId = Number(e.target.value);
                              if (!selectedId) {
                                updateItem(idx, {
                                  inventory_item_id: undefined,
                                  asset_id: undefined,
                                  available_stock: undefined,
                                });
                                return;
                              }
                              const inv = inventoryItems.find((it) => it.id === selectedId);
                              if (inv) {
                                updateItem(idx, {
                                  description: inv.name,
                                  rate: Number(inv.purchase_cost) || 0,
                                  inventory_item_id: inv.id,
                                  asset_id: inv.asset_id,
                                  available_stock: Number(inv.quantity),
                                  quantity:
                                    item.quantity && Number(item.quantity) > 0
                                      ? Number(item.quantity)
                                      : 1,
                                });
                              }
                            }}
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-800 font-medium focus:border-black outline-none cursor-pointer flex-1 max-w-md">
                            <option value="">Custom Deliverable / Service (No Inventory Link)</option>
                            {inventoryItems.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.asset_id}) — Stock: {inv.quantity} — ₹{Number(inv.purchase_cost || 0).toLocaleString('en-IN')}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Live Stock Badge */}
                        {isLinkedToInventory && (
                          <div className="flex items-center gap-2 shrink-0">
                            {isInsufficient ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/90 border border-red-300 px-2.5 py-0.5 rounded-full animate-pulse">
                                <AlertCircle size={12} className="text-red-600" /> Insufficient Stock! Only {item.available_stock} available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 size={12} className="text-emerald-600" /> In Stock ({item.available_stock} available)
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                updateItem(idx, {
                                  inventory_item_id: undefined,
                                  asset_id: undefined,
                                  available_stock: undefined,
                                })
                              }
                              className="text-[11px] text-gray-400 hover:text-gray-700 underline cursor-pointer">
                              Unlink
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Line Item Inputs */}
                      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                        <input
                          type="text"
                          placeholder="Item Description / Deliverable / Service"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-black outline-none bg-white font-medium"
                        />

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500 font-medium sm:hidden">
                              Qty:
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                placeholder="Qty"
                                value={item.quantity || ''}
                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                className={`w-20 border rounded-lg px-2.5 py-2 text-xs text-center font-mono outline-none ${
                                  isInsufficient
                                    ? 'border-red-500 bg-red-50 text-red-900 font-bold ring-2 ring-red-200'
                                    : 'border-gray-200 focus:border-black bg-white'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500 font-medium sm:hidden">
                              Rate:
                            </span>
                            <input
                              type="number"
                              min="0"
                              placeholder="Rate (₹)"
                              value={item.rate || ''}
                              onChange={(e) => updateItem(idx, 'rate', Number(e.target.value))}
                              className="w-28 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-right font-mono focus:border-black outline-none bg-white"
                            />
                          </div>

                          <div className="w-28 text-right font-mono font-bold text-xs text-gray-900 px-2 shrink-0">
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>

                          {safeItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-gray-400 hover:text-red-500 transition p-1.5 cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stock Warning Notice if Insufficient */}
                      {isInsufficient && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200">
                          <AlertTriangle size={14} className="shrink-0 text-red-600" />
                          <span>
                            Inventory stock is insufficient! Available in stock: <strong>{item.available_stock}</strong> unit(s), but <strong>{item.quantity}</strong> requested. Reduce quantity to create invoice.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Items Subtotal Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-xs text-gray-900">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-mono">
                  ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* Section 5: Calculation Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Notes & Payment Terms"
                description="Optional terms displayed on the invoice."
              />
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="e.g. Thank you for your business. Payment is due within 15 days."
                className="mt-3 w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sub Total (Taxable Value)</span>
                  <span className="font-mono font-semibold text-gray-900">
                    ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>GST ({form.gstRate}%)</span>
                  <span className="font-mono font-semibold text-gray-900">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Total Amount Due
                  </span>
                  <span className="text-[11px] text-gray-400">Includes all applicable taxes</span>
                </div>
                <span className="text-2xl font-black font-mono text-gray-900">
                  ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Net Amount Banner - Matching Payroll Pattern */}
          <div className="p-4 rounded-2xl bg-black text-white flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Invoice Amount</p>
              <p className="text-xl font-bold font-mono mt-0.5">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || hasStockError}
            onClick={handleFormSubmit}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer ${
              hasStockError
                ? 'bg-red-600 text-white hover:bg-red-700 cursor-not-allowed opacity-90'
                : 'bg-black text-white hover:bg-gray-800 disabled:opacity-50'
            }`}>
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {hasStockError
              ? 'Insufficient Stock (Cannot Create)'
              : isSubmitting
                ? isEditing
                  ? 'Updating Invoice...'
                  : 'Creating Invoice...'
                : isEditing
                  ? 'Update Invoice'
                  : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
