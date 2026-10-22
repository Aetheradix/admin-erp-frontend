import { useState, useRef } from 'react';
import { Award, Plus, Trash2, Save, Upload, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CertificationEntry, ProfileDocument } from '@/services/employeeProfileService';
import { addDocument } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface Props {
  data: CertificationEntry[];
  documents: ProfileDocument[];
  userId: number;
  onSave: (data: CertificationEntry[]) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

const inputClass = (readOnly?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    readOnly
      ? 'bg-surface-subtle border-border-subtle text-muted cursor-not-allowed'
      : 'bg-white border-border-subtle hover:border-primary/30 focpius:border-primary'
  }`;

const labelClass = 'block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider';

function newEntry(): CertificationEntry {
  return {
    id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    description: '',
  };
}

export function CertificationsSection({ data, documents: _documents, userId, onSave, isSaving, readOnly }: Props) {
  const [entries, setEntries] = useState<CertificationEntry[]>(data.length > 0 ? data : []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);
  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const updateEntry = (id: string, key: keyof CertificationEntry, val: string) =>
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, [key]: val } : e));

  const handleFileUpload = (entryId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast({ severity: 'error', summary: 'Too Large', detail: 'Max 10MB.', life: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const doc = addDocument(userId, {
        type: 'certification',
        label: `Certificate: ${entries.find((en) => en.id === entryId)?.title || file.name}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'uploaded',
        localData: e.target?.result as string,
      });
      updateEntry(entryId, 'documentId', doc.id);
      showToast({ severity: 'success', summary: 'Uploaded', detail: 'Certificate uploaded.', life: 2500 });
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
            <Award size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Certifications & Achievements</h3>
            <p className="text-xs text-muted">Professional certifications, awards, and accomplishments</p>
          </div>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
          >
            <Plus size={16} /> Add Certification
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
            <Star size={28} className="text-primary" />
          </div>
          <h4 className="text-sm font-bold text-muted mb-2">Showcase Your Achievements</h4>
          <p className="text-xs text-muted max-w-sm mb-4">
            Add your professional certifications, awards, training records, or any notable accomplishments.
            You can add as many as needed — no code changes required!
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25"
            >
              <Plus size={16} /> Add First Certification
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {entries.map((entry, idx) => {
          const hasCertDoc = !!entry.documentId;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4 relative"
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b from-primary to-primary/30" />

              <div className="flex items-center justify-between pl-3">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-primary" />
                  <div className="text-xs font-black uppercase tracking-wider text-muted">Entry #{idx + 1}</div>
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

              <div className="grid grid-cols-2 gap-4 pl-3">
                <div className="col-span-2">
                  <label className={labelClass}>Certification / Achievement Title *</label>
                  <input
                    className={inputClass(readOnly)}
                    value={entry.title}
                    onChange={(e) => updateEntry(entry.id, 'title', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    required
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className={labelClass}>Issuing Organization *</label>
                  <input
                    className={inputClass(readOnly)}
                    value={entry.issuingOrganization}
                    onChange={(e) => updateEntry(entry.id, 'issuingOrganization', e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    required
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className={labelClass}>Credential / Certificate ID</label>
                  <input
                    className={inputClass(readOnly)}
                    value={entry.credentialId || ''}
                    onChange={(e) => updateEntry(entry.id, 'credentialId', e.target.value)}
                    placeholder="Unique certificate ID (if any)"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className={labelClass}>Issue Date</label>
                  <input
                    type="date"
                    className={inputClass(readOnly)}
                    value={entry.issueDate || ''}
                    onChange={(e) => updateEntry(entry.id, 'issueDate', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <label className={labelClass}>Expiry Date <span className="text-muted font-normal">(if applicable)</span></label>
                  <input
                    type="date"
                    className={inputClass(readOnly)}
                    value={entry.expiryDate || ''}
                    onChange={(e) => updateEntry(entry.id, 'expiryDate', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass(readOnly)} h-20 resize-none`}
                    value={entry.description || ''}
                    onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                    placeholder="Brief description of the certification or achievement"
                    disabled={readOnly}
                  />
                </div>

                {/* Certificate upload */}
                {!readOnly && (
                  <div className="col-span-2">
                    <label className={labelClass}>Certificate Document</label>
                    <input
                      ref={activeUploadId === entry.id ? fileRef : undefined}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(entry.id, e.target.files[0])}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setActiveUploadId(entry.id); fileRef.current?.click(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all"
                      >
                        <Upload size={14} /> Upload Certificate
                      </button>
                      {hasCertDoc && (
                        <span className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
                          <Check size={13} /> Certificate uploaded
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add more button */}
      {entries.length > 0 && !readOnly && (
        <button
          type="button"
          onClick={addEntry}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-primary/20 text-primary text-sm font-bold hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Plus size={16} /> Add Another Certification or Achievement
        </button>
      )}

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isSaving ? <i className="pi pi-spin pi-spinner" /> : <Save size={16} />}
            Save & Continue
          </button>
        </div>
      )}
    </form>
  );
}
