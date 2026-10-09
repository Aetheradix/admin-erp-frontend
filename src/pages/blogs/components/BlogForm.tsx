import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Globe,
  Settings,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Tag,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle2,
  Trash2,
  FileText,
  RefreshCw,
  AlertCircle,
  Download,
} from 'lucide-react';

import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { FormField } from '@/components/ui/composed/FormField';
import { RichEditor } from '@/components/ui/composed/RichEditor';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Input } from '@/components/ui/primitives/Input';
import { Badge } from '@/components/ui/primitives/Badge';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { resolveImageUrl, cleanUploadPath, downloadImageFile } from '@/utils/imageUrl';
import type { Blog } from '@/types/models';

interface BlogFormProps {
  initialData?: Blog;
  onSubmit: (data: Partial<Blog>) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Management', value: 'Management' },
  { label: 'Business', value: 'Business' },
  { label: 'Lifestyle', value: 'Lifestyle' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Culture & HR', value: 'Culture & HR' },
];

export const BlogForm = ({ initialData, onSubmit, isLoading }: BlogFormProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    content: '',
    category: 'Technology',
    excerpt: '',
    status: 'Draft',
    featuredImage: '',
    image_url: '',
    tags: ['Insights', 'Enterprise'],
    ...initialData,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Synchronize when initialData arrives or updates
  useEffect(() => {
    if (initialData) {
      const existingImg = initialData.featuredImage || initialData.image_url || '';
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'Technology',
        excerpt: initialData.excerpt || '',
        status: initialData.status || 'Draft',
        featuredImage: existingImg,
        image_url: existingImg,
        tags:
          Array.isArray(initialData.tags) && initialData.tags.length > 0
            ? initialData.tags
            : ['Enterprise'],
        author: initialData.author,
      });
      if (existingImg) {
        setImageUrlInput(existingImg);
        setImgError(false);
        setImgLoaded(false);
      }
    }
  }, [initialData]);

  const onValueChange = <K extends keyof Blog>(key: K, value: Blog[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Live Read Time Calculation
  const stats = useMemo(() => {
    const rawText = (formData.content || '').replace(/<[^>]*>/g, '').trim();
    const words = rawText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
    return {
      wordCount,
      charCount: rawText.length,
      readTime: `${readMinutes} min read`,
    };
  }, [formData.content]);

  // Upload to server only the returned server URL goes to DB (never base64)
  const handleImageUpload = async (file: File) => {
    showToast({
      severity: 'info',
      summary: 'Uploading...',
      detail: 'Image is being uploaded to Hostinger storage.',
      life: 2000,
    });

    try {
      const res = await uploadImage({ file, category: 'blogs' }).unwrap();
      const rawUrl = res.data?.url;
      if (rawUrl) {
        const serverUrl = cleanUploadPath(rawUrl);
        setFormData((prev) => ({
          ...prev,
          featuredImage: serverUrl,
          image_url: serverUrl,
        }));
        setImageUrlInput(serverUrl);
        showToast({
          severity: 'success',
          summary: 'Uploaded Successfully',
          detail: 'Image saved to Hostinger storage.',
          life: 2500,
        });
      }
    } catch {
      showToast({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Could not upload image to server. Please try again.',
        life: 4000,
      });
      setPreviewUrl('');
    }
  };

  const downloadImage = () => {
    const src = previewUrl || formData.featuredImage || formData.image_url || '';
    if (!src) return;
    downloadImageFile(src, `blog-cover-${Date.now()}.jpg`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setImgError(false);
      setImgLoaded(false);
      handleImageUpload(file);
    }
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    const clean = cleanUploadPath(imageUrlInput.trim());
    setPreviewUrl(clean);
    setImgError(false);
    setFormData((prev) => ({
      ...prev,
      featuredImage: clean,
      image_url: clean,
    }));
    setImageUrlInput(clean);
    setShowUrlInput(false);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    setImgError(false);
    setImgLoaded(false);
    setFormData((prev) => ({
      ...prev,
      featuredImage: '',
      image_url: '',
    }));
    setImageUrlInput('');
  };

  // Tag management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,|,$/g, '');
      if (trimmed && !formData.tags?.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), trimmed],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tagToRemove) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Title Required',
        detail: 'Please provide a strategic title for your story.',
      });
      return;
    }
    const payload: Partial<Blog> = {
      ...formData,
      readTime: stats.readTime,
    };
    onSubmit(payload);
  };

  // Determine active cover to render
  // previewUrl (blob:) is highest priority â€” it is always local and never 404s
  // Only fall back to stored URLs if no local preview exists
  const rawCover = previewUrl
    ? previewUrl
    : (formData.featuredImage || formData.image_url || '');
  const currentCover = resolveImageUrl(rawCover);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8 items-start">
      {/* Hidden Native File Input: 100% reliable click trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* â”€â”€ Main Content Area (Left 8 Cols) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        {/* Story Composition Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-8 lg:p-10 rounded-[2.5rem] border border-border-subtle/80 shadow-soft">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-border-subtle/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  Editorial Draft
                </h3>
                <p className="text-xs text-muted font-medium">
                  Craft compelling prose, structured insights, and clear takeaways.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-muted bg-surface-subtle/60 px-4 py-2 rounded-xl border border-border-subtle/50">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                {stats.readTime}
              </span>
              <span className="opacity-30">â€¢</span>
              <span>{stats.wordCount} words</span>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            {/* Title */}
            <FormField
              label="Strategic Headline"
              required
              className="text-[10px]! font-black! uppercase! tracking-[0.15em]! text-muted!">
              <Input
                value={formData.title || ''}
                onChange={(e) => onValueChange('title', e.target.value)}
                placeholder="E.g. Revolutionizing Workforce Mobility with Autonomous Workflows"
                className="h-14! text-base! font-bold! rounded-2xl! border-border-subtle! bg-surface-subtle/30! focus:bg-white! shadow-xs!"
              />
            </FormField>

            {/* The Hook / Excerpt */}
            <FormField
              label="The Executive Hook"
              description="A punchy 1-2 sentence preview for cards and social search snippets."
              className="text-[10px]! font-black! uppercase! tracking-[0.15em]! text-muted!">
              <Textarea
                value={formData.excerpt || ''}
                onChange={(e) => onValueChange('excerpt', e.target.value)}
                placeholder="Give readers an irresistible preview of the value inside this story..."
                rows={3}
                className="rounded-2xl! border-border-subtle! bg-surface-subtle/30! focus:bg-white! shadow-xs! text-sm! font-medium! p-4!"
              />
            </FormField>

            {/* Rich Text Editor */}
            <FormField
              label="Core Manuscript"
              required
              description="Rich formatted body with headers, quotes, lists, and inline links."
              className="text-[10px]! font-black! uppercase! tracking-[0.15em]! text-muted!">
              <div className="rounded-2xl overflow-hidden border border-border-subtle shadow-xs bg-white">
                <RichEditor
                  value={formData.content || ''}
                  onTextChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content: e.htmlValue || '',
                    }));
                  }}
                  style={{ minHeight: '440px', border: 'none' }}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Live SEO / Social Feed Preview */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-border-subtle/70 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-wider text-muted">
            <Sparkles size={14} className="text-primary" />
            Social & Search Discovery Preview
          </div>
          <div className="p-5 rounded-2xl bg-surface-subtle/60 border border-border-subtle/80 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
              <span>aether-erp.io</span>
              <span className="text-muted/60">
                /blogs/
                {(formData.title || 'story')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .slice(0, 30)}
              </span>
            </span>
            <h4 className="text-base font-black text-foreground line-clamp-1">
              {formData.title || 'Draft Article Headline'}
            </h4>
            <p className="text-xs text-muted font-medium line-clamp-2">
              {formData.excerpt ||
                'Article summary snippet will display here in social timeline feeds and search previews...'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ Sidebar / Meta Settings (Right 4 Cols) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-6">
        {/* Action Controls Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-border-subtle/80 shadow-soft">
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl! bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 font-black tracking-wider text-xs uppercase flex items-center justify-center gap-2.5 active:scale-98 transition-all text-white"
              loading={isLoading}
              disabled={isLoading}>
              <Save size={18} />
              {initialData ? 'Update & Sync Story' : 'Publish Narrative'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 rounded-2xl! font-bold text-xs uppercase tracking-wider text-muted hover:text-red-600 hover:bg-red-500/10 flex items-center justify-center gap-2 transition-colors"
              onClick={() => navigate('/social/blogs')}>
              <X size={15} />
              Discard & Return
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-muted" />
                <span className="text-[11px] font-black text-foreground uppercase tracking-wider">
                  Publication Status
                </span>
              </div>
              <Badge
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border-none ${
                  formData.status === 'Published'
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-amber-500/15 text-amber-600'
                }`}>
                {formData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-surface-subtle/70 p-1.5 rounded-2xl border border-border-subtle/60">
              <button
                type="button"
                onClick={() => onValueChange('status', 'Draft')}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  formData.status === 'Draft'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-muted hover:text-foreground'
                }`}>
                Draft
              </button>
              <button
                type="button"
                onClick={() => onValueChange('status', 'Published')}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  formData.status === 'Published'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-muted hover:text-foreground'
                }`}>
                Published
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Asset Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-border-subtle/80 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" />
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                Featured Cover Image
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              <LinkIcon size={12} />
              {showUrlInput ? 'Upload' : 'Paste URL'}
            </button>
          </div>

          {showUrlInput ? (
            <div className="flex flex-col gap-3 mb-4">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste HTTPS image link..."
                className="h-11! text-xs! rounded-xl!"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="small"
                  className="rounded-xl! text-xs! font-bold! flex-1"
                  onClick={handleApplyUrl}>
                  Apply Cover
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  className="rounded-xl! text-xs!"
                  onClick={() => setShowUrlInput(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                if (!currentCover && !isUploadingImage) {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const objectUrl = URL.createObjectURL(file);
                  setPreviewUrl(objectUrl);
                  setImgError(false);
                  setImgLoaded(false);
                  handleImageUpload(file);
                }
              }}
              className="relative group overflow-hidden rounded-[1.75rem] border-2 border-dashed border-border-subtle bg-surface-subtle/40 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
              {currentCover && !imgError ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                  {/* Loading skeleton â€” shown until image loads or errors */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-subtle animate-pulse">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary/40">
                        <ImageIcon size={20} />
                      </div>
                    </div>
                  )}
                  <img
                    src={currentCover}
                    alt="Story Cover"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => {
                      // Immediately mark error so broken icon is never shown
                      setImgError(true);
                      setImgLoaded(false);
                      // Strip the bad URL from formData so it won't be submitted
                      if (!previewUrl || currentCover === previewUrl) {
                        setPreviewUrl('');
                        setFormData((prev) => ({ ...prev, featuredImage: '', image_url: '' }));
                      }
                    }}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {imgLoaded && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-2 rounded-xl bg-white text-foreground text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        title="Replace Cover">
                        <RefreshCw size={13} />
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        title="Download Image">
                        <Download size={13} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2.5 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                        title="Remove Cover">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : imgError ? (
                <div className="aspect-[16/10] w-full flex flex-col items-center justify-center p-6 text-center select-none bg-amber-500/5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                    <AlertCircle size={22} />
                  </div>
                  <p className="text-xs font-black text-foreground uppercase tracking-wider">
                    Image Not Available
                  </p>
                  <p className="text-[10px] text-muted font-medium mt-1 mb-3">
                    Click to select a new cover photo
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold">
                    Select File
                  </button>
                </div>
              ) : (
                <div className="aspect-[16/10] w-full flex flex-col items-center justify-center p-6 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center text-primary mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs font-black text-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    Upload Cover Image
                  </p>
                  <p className="text-[10px] text-muted font-bold mt-1">
                    PNG, JPG, WebP up to 10MB
                  </p>
                  <span className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                    Click or Drag File Here
                  </span>
                </div>
              )}

              {isUploadingImage && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                  <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest animate-pulse">
                    Uploading to Storage...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categorization & Tags Card */}
        <div className="bg-white/80 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-border-subtle/80 shadow-soft flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
              Categorization & Indexing
            </h3>
          </div>

          <FormField
            label="Category Pillar"
            className="text-[10px]! font-black! uppercase! tracking-[0.15em]! text-muted!">
            <Select
              options={CATEGORIES}
              value={formData.category || 'Technology'}
              onChange={(e) => onValueChange('category', e.value)}
              placeholder="Select Category"
              className="h-12! rounded-2xl! border-border-subtle! bg-surface-subtle/40!"
            />
          </FormField>

          <FormField
            label="Story Tags"
            description="Type tag name and press Enter or comma"
            className="text-[10px]! font-black! uppercase! tracking-[0.15em]! text-muted!">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="E.g. AI, ERP, Leadership..."
                  className="w-full pl-9 pr-4 py-3 rounded-2xl border border-border-subtle bg-surface-subtle/40 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold text-foreground placeholder:text-muted/60"
                />
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 ml-0.5"
                        title="Remove tag">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          <div className="p-4 rounded-2xl bg-surface-subtle/50 border border-border-subtle/50 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span className="text-[11px] font-medium text-muted">
              Auto-saved locally â€¢ Backups preserved on draft edit
            </span>
          </div>
        </div>
      </motion.div>
    </form>
  );
};
