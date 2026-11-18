import { Upload } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { DOCUMENT_CATEGORY_OPTIONS, DOCUMENT_VISIBILITY_OPTIONS } from '../constants';
import type { CompanyDocument, UploadDocumentForm } from '../types';

interface UploadDocumentModalProps {
  visible: boolean;
  onHide: () => void;
  form: UploadDocumentForm;
  setForm: (form: UploadDocumentForm) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  onSubmit: () => void;
}

export function UploadDocumentModal({
  visible,
  onHide,
  form,
  setForm,
  selectedFile,
  setSelectedFile,
  isUploading,
  onSubmit,
}: UploadDocumentModalProps) {
  const labelClass = 'text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]';

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Upload Document to Vault"
      modal
      className="w-full max-w-xl mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Document Title</label>
          <Input
            placeholder="e.g. ISO 27001 Re-certification 2026"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Category</label>
            <Select
              options={DOCUMENT_CATEGORY_OPTIONS}
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.value as CompanyDocument['category'] })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Visibility Level</label>
            <Select
              options={DOCUMENT_VISIBILITY_OPTIONS}
              value={form.visibility}
              onChange={(e) =>
                setForm({ ...form, visibility: e.value as CompanyDocument['visibility'] })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Description / Notes</label>
          <Input
            placeholder="Brief summary of document purpose..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Select File (PDF, DOCX, PNG)</label>
          <label className="border-2 border-dashed border-border-subtle hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-surface-subtle/50">
            <Upload size={28} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {selectedFile ? selectedFile.name : 'Click or drag file to attach'}
            </span>
            <span className="text-[11px] text-muted">Max file size 25MB</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" label="Cancel" onClick={onHide} className="rounded-md!" />
          <Button
            label={isUploading ? 'Uploading...' : 'Upload & Index'}
            disabled={isUploading}
            onClick={onSubmit}
            icon="pi pi-upload"
            className="rounded-md! px-8!"
          />
        </div>
      </div>
    </Dialog>
  );
}
