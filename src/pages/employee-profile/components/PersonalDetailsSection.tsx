import { useState, useEffect, useRef } from 'react';
import { User, Save, Cloud } from 'lucide-react';
import { Input, Select, DatePicker, Checkbox } from 'antd';
import dayjs from 'dayjs';
import type { PersonalDetails } from '@/services/employeeProfileService';
import { isDataModified } from '@/utils/formDraftManager';

interface Props {
  data?: PersonalDetails;
  onSave: (data: PersonalDetails) => void;
  onSaveDraft?: (data: PersonalDetails) => void;
  onDraftChange?: (data: PersonalDetails, isDirty: boolean) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

export function PersonalDetailsSection({
  data,
  onSave,
  onSaveDraft,
  onDraftChange,
  isSaving,
  readOnly,
}: Props) {
  const [form, setForm] = useState<PersonalDetails>({
    fullName: '',
    contactNumber: '',
    email: '',
    currentAddress: '',
    permanentAddress: '',
    ...data,
  });
  const [sameAddress, setSameAddress] = useState(data?.sameAsCurrentAddress || false);
  const isLocalChange = useRef(false);

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    if (data) {
      setForm({ ...data });
      setSameAddress(Boolean(data.sameAsCurrentAddress));
    }
  }, [data]);

  const set = (key: keyof PersonalDetails, val: any) => {
    isLocalChange.current = true;
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (onDraftChange) {
        onDraftChange(next, isDataModified(data, next));
      }
      return next;
    });
  };

  const handleSameAddress = (checked: boolean) => {
    setSameAddress(checked);
    const perm = checked ? form.currentAddress || '' : form.permanentAddress;
    const next = {
      ...form,
      permanentAddress: perm,
      sameAsCurrentAddress: checked,
    };
    setForm(next);
    if (onDraftChange) {
      onDraftChange(next, isDataModified(data, next));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, sameAsCurrentAddress: sameAddress });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Personal & Contact Details</h3>
          <p className="text-xs text-muted">Your personal information and emergency contacts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>Full Name *</label>
          <Input
            size="large"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="e.g. John Smith"
            className="rounded-xl!"
            required
            disabled={readOnly}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>Email Address *</label>
          <Input size="large" value={form.email} disabled className="rounded-xl!" />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <DatePicker
            size="large"
            className="w-full rounded-xl!"
            value={form.dateOfBirth ? dayjs(form.dateOfBirth) : null}
            onChange={(_, dateStr) => set('dateOfBirth', typeof dateStr === 'string' ? dateStr : '')}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <Select
            size="large"
            className="w-full"
            value={form.gender || undefined}
            onChange={(val) => set('gender', val)}
            placeholder="Select gender"
            disabled={readOnly}
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Non-binary', value: 'Non-binary' },
              { label: 'Prefer not to say', value: 'Prefer not to say' },
            ]}
          />
        </div>
        <div>
          <label className={labelClass}>Nationality</label>
          <Input
            size="large"
            value={form.nationality || ''}
            onChange={(e) => set('nationality', e.target.value)}
            placeholder="e.g. Indian"
            className="rounded-xl!"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Marital Status</label>
          <Select
            size="large"
            className="w-full"
            value={form.maritalStatus || undefined}
            onChange={(val) => set('maritalStatus', val)}
            placeholder="Select status"
            disabled={readOnly}
            options={[
              { label: 'Single', value: 'Single' },
              { label: 'Married', value: 'Married' },
              { label: 'Divorced', value: 'Divorced' },
              { label: 'Widowed', value: 'Widowed' },
            ]}
          />
        </div>
        <div>
          <label className={labelClass}>Contact Number *</label>
          <Input
            size="large"
            value={form.contactNumber}
            onChange={(e) => set('contactNumber', e.target.value)}
            placeholder="+91 9876543210"
            className="rounded-xl!"
            required
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Alternate Contact</label>
          <Input
            size="large"
            value={form.alternateContact || ''}
            onChange={(e) => set('alternateContact', e.target.value)}
            placeholder="+91 9876543210"
            className="rounded-xl!"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Addresses */}
      <div className="pt-2">
        <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted">
            Address Details
          </h4>
          <div>
            <label className={labelClass}>Current Address *</label>
            <Input.TextArea
              rows={3}
              value={form.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
              placeholder="Street, City, State, PIN"
              className="rounded-xl!"
              required
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <Checkbox
              checked={sameAddress}
              onChange={(e) => handleSameAddress(e.target.checked)}>
              <span className="text-xs text-muted font-semibold">Same as current address</span>
            </Checkbox>
          )}

          {!sameAddress && (
            <div>
              <label className={labelClass}>Permanent Address</label>
              <Input.TextArea
                rows={3}
                value={form.permanentAddress}
                onChange={(e) => set('permanentAddress', e.target.value)}
                placeholder="Street, City, State, PIN"
                className="rounded-xl!"
                disabled={readOnly}
              />
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="pt-2">
        <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted">
            Emergency Contact
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <Input
                size="large"
                value={form.emergencyContactName || ''}
                onChange={(e) => set('emergencyContactName', e.target.value)}
                placeholder="Contact person name"
                className="rounded-xl!"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className={labelClass}>Relation</label>
              <Select
                size="large"
                className="w-full"
                value={form.emergencyContactRelation || undefined}
                onChange={(val) => set('emergencyContactRelation', val)}
                placeholder="Select relation"
                disabled={readOnly}
                options={[
                  { label: 'Spouse', value: 'Spouse' },
                  { label: 'Parent', value: 'Parent' },
                  { label: 'Sibling', value: 'Sibling' },
                  { label: 'Child', value: 'Child' },
                  { label: 'Friend', value: 'Friend' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Phone Number</label>
              <Input
                size="large"
                value={form.emergencyContactPhone || ''}
                onChange={(e) => set('emergencyContactPhone', e.target.value)}
                placeholder="+91 9876543210"
                className="rounded-xl!"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle/50">
          {onSaveDraft && (
            <button
              type="button"
              onClick={() => onSaveDraft({ ...form, sameAsCurrentAddress: sameAddress })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-foreground text-sm font-semibold transition-all">
              <Cloud size={16} className="text-muted" />
              Save as Draft
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50">
            {isSaving ? <i className="pi pi-spin pi-spinner" /> : <Save size={16} />}
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
}
