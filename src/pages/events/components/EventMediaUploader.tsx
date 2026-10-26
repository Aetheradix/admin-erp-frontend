import { useState, useRef } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Download,
  Eye,
  Plus,
  FileCheck,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import type { EventAttachment } from '@/types/models';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  saveEventAttachmentLocally,
  getEventAttachments,
  removeEventAttachmentLocally,
} from '../utils/eventUtils';
import { API_URL } from '@/config/env';

interface EventMediaUploaderProps {
  eventId: string | number;
  eventTitle: string;
  initialAttachments?: EventAttachment[];
  isReadOnly?: boolean;
  onAttachmentAdded?: (attachment: EventAttachment) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: 'uploading' | 'done' | 'error';
  error?: string;
}

export const EventMediaUploader = ({
  eventId,
  eventTitle,
  initialAttachments = [],
  isReadOnly = false,
  onAttachmentAdded,
}: EventMediaUploaderProps) => {
  const [attachments, setAttachments] = useState<EventAttachment[]>(() =>
    getEventAttachments(eventId, initialAttachments)
  );
  const [selectedPreview, setSelectedPreview] = useState<EventAttachment | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = attachments.filter((a) => a.type === 'image');
  const documents = attachments.filter((a) => a.type !== 'image');

  const uploadToServer = async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload/file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `Upload failed (${res.status})`);
    }

    const json = await res.json();
    if (!json.url && !json.data?.url) throw new Error('No URL returned from server');
    return { url: json.url || json.data?.url };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const uploaders: UploadingFile[] = fileArray.map((f) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      progress: 'uploading' as const,
    }));
    setUploadingFiles((prev) => [...prev, ...uploaders]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await Promise.all(
      fileArray.map(async (file, idx) => {
        const uploader = uploaders[idx];
        try {
          const { url } = await uploadToServer(file);
          const isImage = file.type.startsWith('image/');
          const newAttachment: EventAttachment = {
            id: uploader.id,
            name: file.name,
            url,
            type: isImage ? 'image' : 'file',
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            uploaded_by: 'You',
            uploaded_at: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
          const updated = saveEventAttachmentLocally(eventId, newAttachment);
          setAttachments(updated);
          onAttachmentAdded?.(newAttachment);
          setUploadingFiles((prev) =>
            prev.map((u) => (u.id === uploader.id ? { ...u, progress: 'done' as const } : u))
          );
          showToast({
            severity: 'success',
            summary: 'Uploaded!',
            detail: `"${file.name}" saved to server.`,
            life: 3000,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setUploadingFiles((prev) =>
            prev.map((u) =>
              u.id === uploader.id ? { ...u, progress: 'error' as const, error: msg } : u
            )
          );
          showToast({
            severity: 'error',
            summary: 'Upload Failed',
            detail: `"${file.name}": ${msg}`,
            life: 4000,
          });
        } finally {
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((u) => u.id !== uploader.id));
          }, 1800);
        }
      })
    );
  };

  const isUploading = uploadingFiles.some((u) => u.progress === 'uploading');

  const handleRemove = (attachment: EventAttachment) => {
    const updated = removeEventAttachmentLocally(eventId, attachment.id);
    setAttachments(updated);
    if (selectedPreview?.id === attachment.id) setSelectedPreview(null);
    showToast({
      severity: 'info',
      summary: 'Removed',
      detail: `"${attachment.name}" has been removed.`,
      life: 2500,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-foreground">Media & Files</span>
          {attachments.length > 0 && (
            <span className="text-xs font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
              {attachments.length} file{attachments.length !== 1 ? 's' : ''}
            </span>
          )}
          {isUploading && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Loader2 size={11} className="animate-spin" />
              Uploading...
            </span>
          )}
        </div>
        {!isReadOnly && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip,.xls,.xlsx,.csv,.mp4,.mp3,.wav"
              multiple
              className="hidden"
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-11 rounded-2xl! px-5! gap-2 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap">
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{isUploading ? 'Uploading...' : 'Upload Photos / Files'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Active Uploads Progress */}
      {uploadingFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadingFiles.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                u.progress === 'uploading'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : u.progress === 'done'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-600'
              }`}>
              {u.progress === 'uploading' && (
                <Loader2 size={13} className="animate-spin flex-shrink-0" />
              )}
              {u.progress === 'done' && <FileCheck size={13} className="flex-shrink-0" />}
              {u.progress === 'error' && <X size={13} className="flex-shrink-0" />}
              <span className="truncate flex-1">{u.name}</span>
              <span className="flex-shrink-0">
                {u.progress === 'uploading' ? 'Uploading to server...' : u.error || u.progress}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid */}
      {attachments.length === 0 && uploadingFiles.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl border-2 border-dashed border-border-strong bg-surface-subtle/50 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-muted border border-border-subtle shadow-xs">
            <ImageIcon size={26} className="text-primary/70" />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground">No media or files uploaded yet</h4>
            <p className="text-xs text-muted font-medium mt-0.5">
              Be the first to upload memories or presentation slides from {eventTitle}!
            </p>
          </div>
          {!isReadOnly && (
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 h-10 rounded-xl font-bold text-xs gap-1.5">
              <Plus size={14} />
              <span>Choose Files to Upload</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {images.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" />
                <span>Photos & Moments ({images.length})</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-900 border border-border-subtle shadow-xs hover:shadow-lg transition-all cursor-pointer">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <div
                        onClick={() => setSelectedPreview(img)}
                        className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-foreground transition-all cursor-pointer"
                        title="Preview">
                        <Eye size={15} />
                      </div>
                      {!isReadOnly && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(img);
                          }}
                          className="w-8 h-8 rounded-xl bg-red-500/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer"
                          title="Remove Image">
                          <Trash2 size={14} />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[10px] font-bold text-white truncate block">
                        {img.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                <span>Documents & Presentations ({documents.length})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-black">
                        <FileCheck size={18} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-foreground truncate">{doc.name}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-muted font-medium mt-0.5">
                          <span>{doc.size || 'Document'}</span>
                          <span>•</span>
                          <span>{doc.uploaded_at}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="w-9 h-9 rounded-xl bg-surface-subtle text-foreground hover:bg-primary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Download File">
                        <Download size={14} />
                      </a>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemove(doc)}
                          className="w-9 h-9 rounded-xl bg-surface-subtle text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove File">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-zinc-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-black">
              <img
                src={selectedPreview.url}
                alt={selectedPreview.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-white truncate">{selectedPreview.name}</h5>
                <span className="text-[10px] text-zinc-400">
                  Uploaded on {selectedPreview.uploaded_at}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreview.url}
                  download={selectedPreview.name}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white hover:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all">
                  <Download size={14} />
                  <span>Download</span>
                </a>
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemove(selectedPreview)}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPreview(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
