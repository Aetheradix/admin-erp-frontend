import { useState, useEffect, useRef } from 'react';
import { Briefcase, Plus, Trash2, Save, Upload, Check, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Checkbox } from 'antd';
import type { EmploymentHistoryEntry, ProfileDocument } from '@/services/employeeProfileService';
import { addDocument } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { isDataModified } from '@/utils/formDraftManager';

interface Props {
  data: EmploymentHistoryEntry[];
  documents: ProfileDocument[];
  userId: number;
  onSave: (data: EmploymentHistoryEntry[]) => void;
  onSaveDraft?: (data: EmploymentHistoryEntry[]) => void;
  onDraftChange?: (data: EmploymentHistoryEntry[], isDirty: boolean) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

function newEntry(): EmploymentHistoryEntry {
  return {
    id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    employer: '',
    designation: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    salary: '',
    responsibilities: '',
    documentIds: [],
  };
}

export function PreviousEmploymentSection({
  data,
  documents: _documents,
  userId,
  onSave,
  onSaveDraft,
  onDraftChange,
  isSaving,
  readOnly,
}: Props) {
  const [entries, setEntries] = useState<EmploymentHistoryEntry[]>(data && data.length > 0 ? data : []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const isLocalChange = useRef(false);

  useEffect(() => {
    if (isLocalChange.current) {
      isLocalChange.current = false;
      return;
    }
    if (data) {
      setEntries(data);
    }
  }, [data]);

  const notifyChange = (updated: EmploymentHistoryEntry[]) => {
    isLocalChange.current = true;
    if (onDraftChange) {
      onDraftChange(updated, isDataModified(data, updated));
    }
  };

  const addEntry = () => {
    const next = [...entries, newEntry()];
    setEntries(next);
    notifyChange(next);
  };

  const removeEntry = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    notifyChange(next);
  };

  const updateEntry = (id: string, key: keyof EmploymentHistoryEntry, val: any) => {
    const next = entries.map((e) => (e.id === id ? { ...e, [key]: val } : e));
    setEntries(next);
    notifyChange(next);
  };

  const handleFileUpload = async (entryId: string, file: File) => {
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED.includes(file.type)) {
      showToast({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Only PDF, JPG, PNG files.',
        life: 3000,
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ severity: 'error', summary: 'Too Large', detail: 'Max 5MB.', life: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const doc = addDocument(userId, {
        type: 'salary_slip',
        label: file.name.includes('reliev') ? 'Relieving Letter' : 'Employment Document',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'uploaded',
        localData: e.target?.result as string,
      });
      const next = entries.map((en) =>
        en.id === entryId
          ? { ...en, documentIds: [...(en.documentIds || []), doc.id] }
          : en
      );
      setEntries(next);
      notifyChange(next);
      showToast({
        severity: 'success',
        summary: 'Uploaded',
        detail: `${file.name} added.`,
        life: 2500,
      });
    };
    reader.readAsDataURL(file);
    setActiveUploadId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(entries);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Previous Employment</h3>
            <p className="text-xs text-muted">Add your work history (most recent first)</p>
          </div>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
            <Plus size={16} /> Add Employment
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-subtle flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-muted" />
          </div>
          <h4 className="text-sm font-bold text-muted mb-2">No Employment History Added</h4>
          <p className="text-xs text-muted max-w-xs mb-4">
            Add your previous employment records. If this is your first job, you can skip this
            section.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25">
              <Plus size={16} /> Add First Employment
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-muted">
                Employment #{idx + 1}
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company / Employer *</label>
                <Input
                  size="large"
                  value={entry.employer}
                  onChange={(e) => updateEntry(entry.id, 'employer', e.target.value)}
                  placeholder="Company name"
                  className="rounded-xl!"
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Designation / Role *</label>
                <Input
                  size="large"
                  value={entry.designation}
                  onChange={(e) => updateEntry(entry.id, 'designation', e.target.value)}
                  placeholder="Your role/title"
                  className="rounded-xl!"
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <Input
                  size="large"
                  type="date"
                  value={entry.startDate || ''}
                  onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <Input
                  size="large"
                  type="date"
                  value={entry.endDate || ''}
                  onChange={(e) => updateEntry(entry.id, 'endDate', e.target.value)}
                  className="rounded-xl!"
                  disabled={readOnly || entry.isCurrent}
                  placeholder={entry.isCurrent ? 'Present' : ''}
                />
                {!readOnly && (
                  <div className="mt-2">
                    <Checkbox
                      checked={entry.isCurrent || false}
                      onChange={(e) => updateEntry(entry.id, 'isCurrent', e.target.checked)}>
                      <span className="text-[11px] text-muted font-semibold">
                        Currently working here
                      </span>
                    </Checkbox>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Last Drawn Salary (₹)</label>
                <Input
                  size="large"
                  value={entry.salary || ''}
                  onChange={(e) => updateEntry(entry.id, 'salary', e.target.value)}
                  placeholder="Monthly CTC"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Key Responsibilities</label>
                <Input.TextArea
                  rows={3}
                  value={entry.responsibilities || ''}
                  onChange={(e) => updateEntry(entry.id, 'responsibilities', e.target.value)}
                  placeholder="Briefly describe your role and responsibilities"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Document upload for this entry */}
            {!readOnly && (
              <div>
                <label className={labelClass}>Supporting Documents</label>
                <p className="text-[10px] text-muted mb-2">
                  Upload salary slips, relieving letter, experience letter
                </p>
                <input
                  ref={activeUploadId === entry.id ? fileRef : undefined}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(entry.id, e.target.files[0])
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadId(entry.id);
                    fileRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all">
                  <Upload size={14} /> Upload Document
                </button>
                {(entry.documentIds?.length || 0) > 0 && (
                  <div className="mt-2 text-[10px] text-success font-semibold flex items-center gap-1">
                    <Check size={12} /> {entry.documentIds?.length} document(s) uploaded
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {!readOnly && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
          <div>
            {entries.length === 0 && (
              <span className="text-xs text-muted">
                Fresher or no previous experience? Click continue to proceed.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <button
                type="button"
                onClick={() => onSaveDraft(entries)}
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
        </div>
      )}
    </form>
  );
}
