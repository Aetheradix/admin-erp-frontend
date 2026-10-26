import { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Save,
} from 'lucide-react';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useUploadProfilePictureMutation } from '@/store/api/employeeProfileApiSlice';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

interface Props {
  profile?: ProfileCompletionData | null;
  onSave: (url: string) => void;
  onContinue?: () => void;
  readOnly?: boolean;
}

export function ProfilePictureSection({ profile, onSave, onContinue, readOnly }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>(profile?.profilePictureUrl || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProfilePictureApi, { isLoading: isUploadingApi }] =
    useUploadProfilePictureMutation();
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  const isLoading = isUploadingApi || isProcessingLocal;

  const validateAndProcessFile = async (file: File) => {
    setUploadError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      const err = 'Please upload a valid image file (JPG, PNG, or WebP).';
      setUploadError(err);
      showToast.error(err);
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const err = 'Image size must be less than 5 MB.';
      setUploadError(err);
      showToast.error(err);
      return;
    }

    setIsProcessingLocal(true);

    try {
      // 1. Convert to local Data URL for immediate responsive feedback
      const reader = new FileReader();
      reader.onload = async (e) => {
        const localDataUrl = e.target?.result as string;
        setPreviewUrl(localDataUrl);

        // 2. Try server upload
        try {
          const res = await uploadProfilePictureApi(file).unwrap();
          const serverUrl = res.data?.url || localDataUrl;
          setPreviewUrl(serverUrl);
          onSave(serverUrl);
          showToast.success('Profile picture updated successfully!');
        } catch {
          // If backend upload fails, fallback to storing local data URL
          onSave(localDataUrl);
          showToast.success('Profile picture saved locally.');
        } finally {
          setIsProcessingLocal(false);
        }
      };

      reader.onerror = () => {
        setIsProcessingLocal(false);
        showToast.error('Failed to read image file.');
      };

      reader.readAsDataURL(file);
    } catch {
      setIsProcessingLocal(false);
      showToast.error('Unexpected error while processing image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly || isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!readOnly && !isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (readOnly || isLoading) return;
    setPreviewUrl('');
    onSave('');
    showToast.info('Profile picture removed.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Camera size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Profile Picture</h3>
          <p className="text-xs text-muted">
            Upload a professional headshot for your organization identity
          </p>
        </div>
      </div>

      {/* Main Avatar Card */}
      <div className="p-8 rounded-3xl bg-surface-subtle border border-border-subtle flex flex-col sm:flex-row items-center gap-8">
        {/* Avatar Display */}
        <div
          className="relative group shrink-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-surface-subtle flex items-center justify-center relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex flex-col items-center justify-center text-primary">
                <User size={48} className="stroke-[1.5]" />
              </div>
            )}

            {/* Hover overlay for changing picture */}
            {!readOnly && (
              <div
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200 ${
                  isHovered || isLoading ? 'opacity-100' : 'opacity-0'
                }`}>
                {isLoading ? (
                  <RefreshCw size={24} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={24} className="mb-1" />
                    <span className="text-[11px] font-bold">Change</span>
                  </>
                )}
              </div>
            )}
          </div>

          {previewUrl && !readOnly && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 p-1.5 rounded-full bg-error text-white shadow-md hover:bg-error/90 transition-colors"
              title="Remove photo">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Action / Guidelines Area */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {previewUrl ? 'Photo Uploaded' : 'No photo uploaded yet'}
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              A clear, professional photo helps team members recognize you across directory, chat,
              and project assignments.
            </p>
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
                {isLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {previewUrl ? 'Upload New Photo' : 'Choose Photo'}
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-error hover:bg-error/5 text-xs font-bold transition-all flex items-center gap-1.5">
                  <Trash2 size={13} />
                  Remove
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Zone */}
      {!readOnly && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border-subtle hover:border-primary/40 bg-surface-subtle/50'
          }`}>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-muted">
              <Upload size={18} />
            </div>
            <p className="text-xs font-bold text-foreground">
              Drop your photo here, or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-[11px] text-muted">Supports JPG, PNG or WebP up to 5MB</p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2">
        <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          Photo Guidelines
        </h5>
        <ul className="text-xs text-muted space-y-1 list-disc list-inside">
          <li>Use a recent, well-lit portrait photo facing forward</li>
          <li>Ensure plain or neutral background without distractions</li>
          <li>Avoid wearing sunglasses, hats, or heavy filters</li>
          <li>Minimum recommended dimensions: 400 × 400 pixels</li>
        </ul>
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => onContinue && onContinue()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
            <Save size={16} />
            Save & Continue
          </button>
        </div>
      )}
    </div>
  );
}
