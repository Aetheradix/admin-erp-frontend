import { useState, useRef } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Download,
  Eye,
  Plus,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import type { EventAttachment } from '@/types/models';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { saveEventAttachmentLocally, getEventAttachments } from '../utils/eventUtils';

interface EventMediaUploaderProps {
  eventId: string | number;
  eventTitle: string;
  initialAttachments?: EventAttachment[];
  isReadOnly?: boolean;
  onAttachmentAdded?: (attachment: EventAttachment) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        const newAttachment: EventAttachment = {
          id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: base64Data,
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

        showToast({
          severity: 'success',
          summary: 'Uploaded Successfully',
          detail: `Added "${file.name}" to event memories.`,
          life: 3000,
        });
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const images = attachments.filter((a) => a.type === 'image');
  const documents = attachments.filter((a) => a.type === 'file');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Upload Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-primary/10 via-amber-500/5 to-primary/5 border border-primary/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles size={14} />
              Event Recap & Memories
            </span>
            <Badge variant="primary" className="text-[10px] font-black rounded-lg">
              {attachments.length} Assets
            </Badge>
          </div>
          <p className="text-xs text-muted font-medium mt-1">
            Browse and share photographs, slide presentations, certificates, and recordings from this event.
          </p>
        </div>

        {!isReadOnly && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"
              multiple
              className="hidden"
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-2xl! px-5! gap-2 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Upload size={14} />
              <span>Upload Photos / Files</span>
            </Button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {attachments.length === 0 ? (
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
              className="mt-2 h-10 rounded-xl font-bold text-xs gap-1.5"
            >
              <Plus size={14} />
              <span>Choose Files to Upload</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Photo Gallery Section */}
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
                    onClick={() => setSelectedPreview(img)}
                    className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-900 border border-border-subtle shadow-xs hover:shadow-lg transition-all cursor-pointer"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-foreground transition-all">
                        <Eye size={15} />
                      </div>
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

          {/* Document & Files Section */}
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
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle shadow-xs hover:shadow-md transition-all group"
                  >
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

                    <a
                      href={doc.url}
                      download={doc.name}
                      className="w-9 h-9 rounded-xl bg-surface-subtle text-foreground hover:bg-primary hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                      title="Download File"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* High-res Image Preview Lightbox Modal */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-zinc-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
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
                  className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white hover:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPreview(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-bold"
                >
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
