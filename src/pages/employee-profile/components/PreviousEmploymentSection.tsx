import { useState, useRef } from 'react';
import { Briefcase, Plus, Trash2, Save, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EmploymentHistoryEntry, ProfileDocument } from '@/services/employeeProfileService';
import { addDocument } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface Props {
  data: EmploymentHistoryEntry[];
  documents: ProfileDocument[];
  userId: number;
  onSave: (data: EmploymentHistoryEntry[]) => void;
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

export function PreviousEmploymentSection({ data, documents: _documents, userId, onSave, isSaving, readOnly }: Props) {
  const [entries, setEntries] = useState<EmploymentHistoryEntry[]>(
    data.length > 0 ? data : []
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const addEntry = () => {
    setEntries((prev) => [...prev, newEntry()]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, key: keyof EmploymentHistoryEntry, val: any) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [key]: val } : e));
  };

  const handleFileUpload = async (entryId: string, file: File) => {
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!ALLOWED.includes(file.type)) {
      showToast({ severity: 'error', summary: 'Invalid File', detail: 'Only PDF, JPG, PNG files.', life: 3000 });
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
      updateEntry(entryId, 'documentIds', [
        ...(entries.find((en) => en.id === entryId)?.documentIds || []),
        doc.id,
      ]);
      showToast({ severity: 'success', summary: 'Uploaded', detail: `${file.name} added.`, life: 2500 });
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
          >
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
            Add your previous employment records. If this is your first job, you can skip this section.
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25"
            >
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
            className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-muted">
                Employment #{idx + 1}
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company / Employer *</label>
                <input
                  className={inputClass(readOnly)}
                  value={entry.employer}
                  onChange={(e) => updateEntry(entry.id, 'employer', e.target.value)}
                  placeholder="Company name"
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Designation / Role *</label>
                <input
                  className={inputClass(readOnly)}
                  value={entry.designation}
                  onChange={(e) => updateEntry(entry.id, 'designation', e.target.value)}
                  placeholder="Your role/title"
                  required
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  type="date"
                  className={inputClass(readOnly)}
                  value={entry.startDate || ''}
                  onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input
                  type="date"
                  className={inputClass(readOnly || entry.isCurrent)}
                  value={entry.endDate || ''}
                  onChange={(e) => updateEntry(entry.id, 'endDate', e.target.value)}
                  disabled={readOnly || entry.isCurrent}
                  placeholder={entry.isCurrent ? 'Present' : ''}
                />
                {!readOnly && (
                  <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.isCurrent || false}
                      onChange={(e) => updateEntry(entry.id, 'isCurrent', e.target.checked)}
                    />
                    <span className="text-[10px] text-muted font-semibold">Currently working here</span>
                  </label>
                )}
              </div>
              <div>
                <label className={labelClass}>Last Drawn Salary (₹)</label>
                <input
                  className={inputClass(readOnly)}
                  value={entry.salary || ''}
                  onChange={(e) => updateEntry(entry.id, 'salary', e.target.value)}
                  placeholder="Monthly CTC"
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Key Responsibilities</label>
                <textarea
                  className={`${inputClass(readOnly)} h-20 resize-none`}
                  value={entry.responsibilities || ''}
                  onChange={(e) => updateEntry(entry.id, 'responsibilities', e.target.value)}
                  placeholder="Briefly describe your role and responsibilities"
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Document upload for this entry */}
            {!readOnly && (
              <div>
                <label className={labelClass}>Supporting Documents</label>
                <p className="text-[10px] text-muted mb-2">Upload salary slips, relieving letter, experience letter</p>
                <input
                  ref={activeUploadId === entry.id ? fileRef : undefined}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(entry.id, e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadId(entry.id);
                    fileRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all"
                >
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
        <div className="flex justify-between items-center pt-2">
          {entries.length === 0 && (
            <span className="text-xs text-muted">
              Fresher or no previous experience? Click continue to proceed.
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {isSaving ? <i className="pi pi-spin pi-spinner" /> : <Save size={16} />}
              Save & Continue
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
