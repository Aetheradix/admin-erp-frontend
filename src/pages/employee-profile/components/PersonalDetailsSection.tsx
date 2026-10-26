import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import type { PersonalDetails } from '@/services/employeeProfileService';

interface Props {
  data?: PersonalDetails;
  onSave: (data: PersonalDetails) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const inputClass = (readOnly?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    readOnly
      ? 'bg-surface-subtle border-border-subtle text-muted cursor-not-allowed'
      : 'bg-white border-border-subtle hover:border-primary/30 focus:border-primary'
  }`;

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

export function PersonalDetailsSection({ data, onSave, isSaving, readOnly }: Props) {
  const [form, setForm] = useState<PersonalDetails>({
    fullName: '',
    contactNumber: '',
    email: '',
    currentAddress: '',
    permanentAddress: '',
    ...data,
  });
  const [sameAddress, setSameAddress] = useState(data?.sameAsCurrentAddress || false);

  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  const set = (key: keyof PersonalDetails, val: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSameAddress = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) set('permanentAddress', form.currentAddress || '');
    set('sameAsCurrentAddress', checked);
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
          <input
            className={inputClass(readOnly)}
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="e.g. John Smith"
            required
            disabled={readOnly}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>Email Address *</label>
          <input className={inputClass(true)} value={form.email} disabled readOnly type="email" />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input
            type="date"
            className={inputClass(readOnly)}
            value={form.dateOfBirth || ''}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Gender</label>
          <select
            className={inputClass(readOnly)}
            value={form.gender || ''}
            onChange={(e) => set('gender', e.target.value)}
            disabled={readOnly}>
            <option value="">Select gender</option>
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nationality</label>
          <input
            className={inputClass(readOnly)}
            value={form.nationality || ''}
            onChange={(e) => set('nationality', e.target.value)}
            placeholder="e.g. Indian"
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Marital Status</label>
          <select
            className={inputClass(readOnly)}
            value={form.maritalStatus || ''}
            onChange={(e) => set('maritalStatus', e.target.value)}
            disabled={readOnly}>
            <option value="">Select status</option>
            {['Single', 'Married', 'Divorced', 'Widowed'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Contact Number *</label>
          <input
            type="tel"
            className={inputClass(readOnly)}
            value={form.contactNumber}
            onChange={(e) => set('contactNumber', e.target.value)}
            placeholder="+91 9876543210"
            required
            disabled={readOnly}
          />
        </div>
        <div>
          <label className={labelClass}>Alternate Contact</label>
          <input
            type="tel"
            className={inputClass(readOnly)}
            value={form.alternateContact || ''}
            onChange={(e) => set('alternateContact', e.target.value)}
            placeholder="+91 9876543210"
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
            <textarea
              className={`${inputClass(readOnly)} h-20 resize-none`}
              value={form.currentAddress}
              onChange={(e) => set('currentAddress', e.target.value)}
              placeholder="Street, City, State, PIN"
              required
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => handleSameAddress(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-muted font-semibold">Same as current address</span>
            </label>
          )}

          {!sameAddress && (
            <div>
              <label className={labelClass}>Permanent Address</label>
              <textarea
                className={`${inputClass(readOnly)} h-20 resize-none`}
                value={form.permanentAddress}
                onChange={(e) => set('permanentAddress', e.target.value)}
                placeholder="Street, City, State, PIN"
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
              <input
                className={inputClass(readOnly)}
                value={form.emergencyContactName || ''}
                onChange={(e) => set('emergencyContactName', e.target.value)}
                placeholder="Contact person name"
                disabled={readOnly}
              />
            </div>
            <div>
              <label className={labelClass}>Relation</label>
              <select
                className={inputClass(readOnly)}
                value={form.emergencyContactRelation || ''}
                onChange={(e) => set('emergencyContactRelation', e.target.value)}
                disabled={readOnly}>
                <option value="">Select relation</option>
                {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                className={inputClass(readOnly)}
                value={form.emergencyContactPhone || ''}
                onChange={(e) => set('emergencyContactPhone', e.target.value)}
                placeholder="+91 9876543210"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50">
            {isSaving ? <i className="pi pi-spin pi-spinner" /> : <Save size={16} />}
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
}
