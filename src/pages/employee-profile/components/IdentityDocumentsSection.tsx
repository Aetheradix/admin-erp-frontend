import { useState, useEffect, useRef } from 'react';
import { Shield, Upload, Save, FileText, X, Check, AlertTriangle } from 'lucide-react';
import type { IdentityDocuments, ProfileDocument } from '@/services/employeeProfileService';
import { addDocument, PASSPORT_MAX_LENGTH, validatePassportNumber } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';

interface Props {
  data?: IdentityDocuments;
  documents: ProfileDocument[];
  userId: number;
  onSave: (data: IdentityDocuments) => void;
  onDocumentAdded: (doc: ProfileDocument) => void;
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

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_MB = 5;

interface DocUploadProps {
  docType: ProfileDocument['type'];
  label: string;
  existingDoc?: ProfileDocument;
  userId: number;
  onUploaded: (doc: ProfileDocument) => void;
  readOnly?: boolean;
}

function DocumentUploader({
  docType,
  label,
  existingDoc,
  userId,
  onUploaded,
  readOnly,
}: DocUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingDoc?.localData || null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Only PDF, JPG, JPEG, PNG files allowed.',
        life: 3000,
      });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast({
        severity: 'error',
        summary: 'File Too Large',
        detail: `Max file size is ${MAX_SIZE_MB}MB.`,
        life: 3000,
      });
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);

        const doc = addDocument(userId, {
          type: docType,
          label,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          status: 'uploaded',
          localData: base64,
        });
        onUploaded(doc);
        showToast({
          severity: 'success',
          summary: 'Uploaded',
          detail: `${label} uploaded successfully.`,
          life: 2500,
        });
      };
      reader.readAsDataURL(file);
    } catch {
      showToast({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Could not process the file. Please try again.',
        life: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${
          preview
            ? 'border-success/40 bg-success/5'
            : readOnly
              ? 'border-border-subtle bg-surface-subtle'
              : 'border-border-subtle hover:border-primary/40 cursor-pointer bg-surface-subtle/50 hover:bg-primary/5'
        }`}
        onClick={() => !readOnly && !preview && fileRef.current?.click()}>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            preview ? 'bg-success/10' : 'bg-primary/10'
          }`}>
          {uploading ? (
            <i className="pi pi-spin pi-spinner text-primary" />
          ) : preview ? (
            <Check size={18} className="text-success" />
          ) : (
            <Upload size={18} className="text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-foreground">{label}</div>
          {existingDoc ? (
            <div className="text-[10px] text-success font-semibold mt-0.5">
              {existingDoc.fileName}
            </div>
          ) : (
            <div className="text-[10px] text-muted mt-0.5">PDF, JPG, PNG up to {MAX_SIZE_MB}MB</div>
          )}
        </div>

        {!readOnly && preview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
            }}
            className="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center text-error hover:bg-error/20 transition-all shrink-0">
            <X size={14} />
          </button>
        )}

        {!readOnly && !preview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0 hover:bg-primary/20 transition-all">
            <Upload size={12} /> Upload
          </button>
        )}
      </div>
    </div>
  );
}

export function IdentityDocumentsSection({
  data,
  documents,
  userId,
  onSave,
  onDocumentAdded,
  isSaving,
  readOnly,
}: Props) {
  const [form, setForm] = useState<IdentityDocuments>({
    panNumber: '',
    aadhaarNumber: '',
    ...data,
  });
  const [passportError, setPassportError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setForm({ ...data });
      if (data.passportNumber) {
        const res = validatePassportNumber(data.passportNumber);
        setPassportError(res.isValid ? null : res.error || null);
      }
    }
  }, [data]);

  const handlePassportChange = (val: string) => {
    const raw = val.trimStart().toUpperCase();
    if (raw.length > PASSPORT_MAX_LENGTH) {
      setPassportError(`Passport number cannot exceed ${PASSPORT_MAX_LENGTH} characters.`);
      set('passportNumber', raw.slice(0, PASSPORT_MAX_LENGTH));
      return;
    }
    set('passportNumber', raw);
    const res = validatePassportNumber(raw);
    setPassportError(res.isValid ? null : res.error || null);
  };

  const handlePassportPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const clean = pasted.trim().toUpperCase();
    if (clean.length > PASSPORT_MAX_LENGTH) {
      setPassportError(`Passport number cannot exceed ${PASSPORT_MAX_LENGTH} characters.`);
      set('passportNumber', clean.slice(0, PASSPORT_MAX_LENGTH));
    } else {
      set('passportNumber', clean);
      const res = validatePassportNumber(clean);
      setPassportError(res.isValid ? null : res.error || null);
    }
  };

  const set = (key: keyof IdentityDocuments, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const getDoc = (type: ProfileDocument['type']) => documents.find((d) => d.type === type);

  const maskAadhaar = (val: string) => {
    if (!val) return '';
    return val.replace(/\d(?=\d{4})/g, '*');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.passportNumber && form.passportNumber.trim()) {
      const res = validatePassportNumber(form.passportNumber);
      if (!res.isValid) {
        setPassportError(res.error || 'Invalid passport number');
        showToast({
          severity: 'error',
          summary: 'Invalid Passport Number',
          detail: res.error || 'Please enter a valid passport number before saving.',
          life: 4000,
        });
        return;
      }
    }
    onSave({
      ...form,
      passportNumber: form.passportNumber ? form.passportNumber.trim().toUpperCase() : '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Identity Documents</h3>
          <p className="text-xs text-muted">Government-issued identity verification documents</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            <strong>Upload Now or Later:</strong> You can attach your document proofs now or submit
            them later before final HR verification. Clicking <strong>Save & Continue</strong> will
            preserve your entries and take you to the next step.
          </p>
        </div>
      </div>

      {/* PAN Card */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <FileText size={14} className="text-primary" /> PAN Card *
        </h4>
        <div>
          <label className={labelClass}>PAN Number</label>
          <input
            className={inputClass(readOnly)}
            value={form.panNumber || ''}
            onChange={(e) => set('panNumber', e.target.value.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            disabled={readOnly}
            required
          />
        </div>
        <DocumentUploader
          docType="pan_card"
          label="PAN Card Document"
          existingDoc={getDoc('pan_card')}
          userId={userId}
          onUploaded={onDocumentAdded}
          readOnly={readOnly}
        />
      </div>

      {/* Aadhaar Card */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <FileText size={14} className="text-primary" /> Aadhaar Card *
        </h4>
        <div>
          <label className={labelClass}>Aadhaar Number</label>
          <input
            className={inputClass(readOnly)}
            value={readOnly ? maskAadhaar(form.aadhaarNumber || '') : form.aadhaarNumber || ''}
            onChange={(e) => set('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="12-digit Aadhaar number"
            maxLength={12}
            disabled={readOnly}
            required
          />
        </div>
        <DocumentUploader
          docType="aadhaar"
          label="Aadhaar Document"
          existingDoc={getDoc('aadhaar')}
          userId={userId}
          onUploaded={onDocumentAdded}
          readOnly={readOnly}
        />
      </div>

      {/* Passport (Optional) */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <FileText size={14} className="text-muted" /> Passport{' '}
          <span className="text-[10px] text-muted font-normal">(Optional)</span>
        </h4>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Passport Number</label>
            <span className="text-[10px] text-muted font-semibold">
              {(form.passportNumber || '').length} / {PASSPORT_MAX_LENGTH} max
            </span>
          </div>
          <input
            className={`${inputClass(readOnly)} ${
              passportError ? 'border-error focus:ring-error/20' : ''
            }`}
            value={form.passportNumber || ''}
            onChange={(e) => handlePassportChange(e.target.value)}
            onPaste={handlePassportPaste}
            placeholder="e.g. A1234567"
            maxLength={PASSPORT_MAX_LENGTH}
            disabled={readOnly}
          />
          {passportError && (
            <p className="text-xs text-error mt-1.5 font-semibold flex items-center gap-1">
              <AlertTriangle size={12} /> {passportError}
            </p>
          )}
        </div>
        <DocumentUploader
          docType="passport"
          label="Passport Document"
          existingDoc={getDoc('passport')}
          userId={userId}
          onUploaded={onDocumentAdded}
          readOnly={readOnly}
        />
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
