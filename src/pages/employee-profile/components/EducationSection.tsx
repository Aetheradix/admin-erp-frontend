import { useState, useEffect, useRef } from 'react';
import { GraduationCap, Plus, Trash2, Save, Upload, Check, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Select } from 'antd';
import type { EducationEntry, ProfileDocument } from '@/services/employeeProfileService';
import { addDocument } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { isDataModified } from '@/utils/formDraftManager';

interface Props {
  data: EducationEntry[];
  documents: ProfileDocument[];
  userId: number;
  onSave: (data: EducationEntry[]) => void;
  onSaveDraft?: (data: EducationEntry[]) => void;
  onDraftChange?: (data: EducationEntry[], isDirty: boolean) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

function newEntry(): EducationEntry {
  return {
    id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    degree: '',
    institution: '',
    field: '',
    startYear: '',
    endYear: '',
    grade: '',
    documentIds: [],
  };
}

const DEGREE_OPTIONS = [
  'High School (10th)',
  'Higher Secondary (12th)',
  'Diploma',
  "Bachelor's Degree (B.A.)",
  "Bachelor's Degree (B.Sc.)",
  "Bachelor's Degree (B.Tech/B.E.)",
  "Bachelor's Degree (BBA)",
  "Bachelor's Degree (BCA)",
  "Bachelor's Degree (B.Com)",
  "Master's Degree (M.A.)",
  "Master's Degree (M.Sc.)",
  "Master's Degree (M.Tech/M.E.)",
  "Master's Degree (MBA)",
  "Master's Degree (MCA)",
  'M.Com',
  'PhD / Doctorate',
  'Post Graduate Diploma',
  'Other',
];

export function EducationSection({
  data,
  documents: _documents,
  userId,
  onSave,
  onSaveDraft,
  onDraftChange,
  isSaving,
  readOnly,
}: Props) {
  const [entries, setEntries] = useState<EducationEntry[]>(data && data.length > 0 ? data : []);
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

  const notifyChange = (updated: EducationEntry[]) => {
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

  const updateEntry = (id: string, key: keyof EducationEntry, val: any) => {
    const next = entries.map((e) => (e.id === id ? { ...e, [key]: val } : e));
    setEntries(next);
    notifyChange(next);
  };

  const handleFileUpload = (entryId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast({ severity: 'error', summary: 'Too Large', detail: 'Max 5MB.', life: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const doc = addDocument(userId, {
        type: 'degree_certificate',
        label: file.name,
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
            <GraduationCap size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Educational Qualifications</h3>
            <p className="text-xs text-muted">Add your academic background (highest first)</p>
          </div>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
            <Plus size={16} /> Add Qualification
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-subtle flex items-center justify-center mb-4">
            <GraduationCap size={28} className="text-muted" />
          </div>
          <h4 className="text-sm font-bold text-muted mb-2">No Qualifications Added</h4>
          <p className="text-xs text-muted max-w-xs mb-4">
            Add your educational qualifications from highest to lowest degree.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25">
              <Plus size={16} /> Add Qualification
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
                Qualification #{idx + 1}
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
                <label className={labelClass}>Degree / Qualification *</label>
                <Select
                  size="large"
                  className="w-full"
                  value={entry.degree || undefined}
                  onChange={(val) => updateEntry(entry.id, 'degree', val)}
                  placeholder="Select degree"
                  disabled={readOnly}
                  options={DEGREE_OPTIONS.map((d) => ({ label: d, value: d }))}
                />
              </div>
              <div>
                <label className={labelClass}>Field of Study</label>
                <Input
                  size="large"
                  value={entry.field || ''}
                  onChange={(e) => updateEntry(entry.id, 'field', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Institution / University *</label>
                <Input
                  size="large"
                  value={entry.institution}
                  onChange={(e) => updateEntry(entry.id, 'institution', e.target.value)}
                  placeholder="Name of institution"
                  className="rounded-xl!"
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Start Year</label>
                <Input
                  size="large"
                  type="number"
                  value={entry.startYear || ''}
                  onChange={(e) => updateEntry(entry.id, 'startYear', e.target.value)}
                  placeholder="e.g. 2018"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>End / Passing Year</label>
                <Input
                  size="large"
                  type="number"
                  value={entry.endYear || ''}
                  onChange={(e) => updateEntry(entry.id, 'endYear', e.target.value)}
                  placeholder="e.g. 2022"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Grade / Percentage / CGPA</label>
                <Input
                  size="large"
                  value={entry.grade || ''}
                  onChange={(e) => updateEntry(entry.id, 'grade', e.target.value)}
                  placeholder="e.g. 8.5 CGPA or 85%"
                  className="rounded-xl!"
                  disabled={readOnly}
                />
              </div>
            </div>

            {!readOnly && (
              <div>
                <label className={labelClass}>Certificates & Marksheets</label>
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
                  <Upload size={14} /> Upload Certificate / Marksheet
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle/50">
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
      )}
    </form>
  );
}
