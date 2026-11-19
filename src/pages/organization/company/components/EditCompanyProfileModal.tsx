import { Divider, Input as AntInput, Select as AntSelect } from 'antd';
import { MapPin, Plus } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import type { Office } from '@/store/api/attendanceSlice';
import { InternationalPhoneInput } from '../../components/InternationalPhoneInput';
import type { CompanyInfoState } from '../types';

interface EditCompanyProfileModalProps {
  visible: boolean;
  onHide: () => void;
  editForm: CompanyInfoState;
  setEditForm: (form: CompanyInfoState) => void;
  offices: Office[];
  phoneError: string;
  setPhoneError: (error: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onAddLocation: () => void;
}

export function EditCompanyProfileModal({
  visible,
  onHide,
  editForm,
  setEditForm,
  offices,
  phoneError,
  setPhoneError,
  isSaving,
  onSave,
  onAddLocation,
}: EditCompanyProfileModalProps) {
  const labelClass =
    'text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]';

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Edit Company Information"
      modal
      className="w-full max-w-4xl mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Company Legal Name</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Industry Sector</label>
            <Input
              value={editForm.industry}
              onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Tagline / Headline</label>
          <Input
            value={editForm.tagline}
            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Company Overview & Description</label>
          <AntInput.TextArea
            rows={3}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Enter comprehensive company description..."
            className="w-full !rounded-md !bg-white !text-foreground !text-sm !font-medium !border-border-subtle hover:!border-primary/50 focus:!border-primary !shadow-xs resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Official Website</label>
            <Input
              value={editForm.website}
              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Contact Email</label>
            <Input
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Phone Number</label>
            <InternationalPhoneInput
              countryCode={editForm.phone_country_code || '+1'}
              phoneNumber={editForm.phone_number || ''}
              error={phoneError}
              onChange={(code, num) => {
                setEditForm({
                  ...editForm,
                  phone_country_code: code,
                  phone_number: num,
                  phone: `${code} ${num}`.trim(),
                });
                if (phoneError) setPhoneError('');
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Global Headquarters Address</label>
            <button
              type="button"
              onClick={onAddLocation}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              <Plus size={12} />
              Add New Location
            </button>
          </div>

          <AntSelect
            value={editForm.hq_office_id || undefined}
            placeholder="Select headquarters location..."
            size="large"
            showSearch
            optionFilterProp="label"
            className="w-full text-sm [&_.ant-select-selector]:!min-h-[46px] [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-border-subtle [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-muted/60"
            onChange={(val) => {
              const selectedId = Number(val);
              const selectedOffice = offices.find((office) => office.id === selectedId);
              setEditForm({
                ...editForm,
                hq_office_id: selectedId || null,
                address: selectedOffice?.address || editForm.address,
              });
            }}
            options={offices.map((office) => ({
              value: office.id,
              label: `${office.name} — ${office.address || 'No address'}`,
              name: office.name,
              address: office.address,
              isHq: Boolean(office.is_hq || office.isHq),
            }))}
            optionRender={(option) => {
              const data = option.data as { name: string; address?: string; isHq?: boolean };
              return (
                <div className="flex items-start gap-2.5 py-1">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <MapPin size={13} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-xs">{data.name}</span>
                      {data.isHq && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                          Current HQ
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted truncate max-w-[500px]">
                      {data.address || 'No address specified'}
                    </span>
                  </div>
                </div>
              );
            }}
            notFoundContent={
              <div className="py-4 px-3 text-center">
                <div className="text-xs text-muted mb-2 font-medium">
                  No office locations added yet
                </div>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onAddLocation}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                  <Plus size={13} />
                  Add New Location
                </button>
              </div>
            }
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div
                  className="px-3 py-2 flex items-center justify-between hover:bg-primary/5 cursor-pointer rounded-b transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onAddLocation}>
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Plus size={14} />
                    Add New Location
                  </span>
                  <span className="text-[10px] text-muted font-medium">
                    Go to Offices & Branches
                  </span>
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" label="Cancel" onClick={onHide} className="rounded-md!" />
          <Button
            label={isSaving ? 'Saving...' : 'Save Changes'}
            disabled={isSaving}
            onClick={onSave}
            icon="pi pi-check"
            className="rounded-md! px-8!"
          />
        </div>
      </div>
    </Dialog>
  );
}
