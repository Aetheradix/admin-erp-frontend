import { FileUpload } from '@/components/ui/composed/FileUpload';
import { FormField } from '@/components/ui/composed/FormField';
import { RichEditor } from '@/components/ui/composed/RichEditor';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/primitives/Input';
import { Badge } from '@/components/ui/primitives/Badge';
import { motion } from 'framer-motion';
import { Save, X, Globe, Settings, Image as ImageIcon } from 'lucide-react';

interface BlogFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const BlogForm = ({ initialData, onSubmit, isLoading }: BlogFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(
    initialData || {
      title: '',
      content: '',
      category: 'Technology',
      excerpt: '',
      status: 'Draft',
      tags: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    { label: 'Technology', value: 'Technology' },
    { label: 'Management', value: 'Management' },
    { label: 'Business', value: 'Business' },
    { label: 'Lifestyle', value: 'Lifestyle' },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10">
      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-8 flex flex-col gap-8"
      >
        <div className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-soft">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ImageIcon size={20} className="text-primary" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Main Narrative</h3>
          </div>

          <div className="flex flex-col gap-8">
            <FormField label="Strategic Title" required className="!text-[10px] !font-black !uppercase !tracking-[0.15em] !text-muted">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a high-impact headline..."
                className="h-14! text-base! font-bold! rounded-2xl! border-none! bg-white! shadow-sm!"
              />
            </FormField>

            <FormField label="The Hook" description="A compelling summary for maximum engagement." className="!text-[10px] !font-black !uppercase !tracking-[0.15em] !text-muted">
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="What makes this story worth reading?"
                rows={3}
                className="rounded-[1.5rem]! border-none! bg-white! shadow-sm! text-sm! font-medium! p-5!"
              />
            </FormField>

            <FormField label="Full Context" required className="!text-[10px] !font-black !uppercase !tracking-[0.15em] !text-muted">
              <div className="rounded-[1.5rem] overflow-hidden border border-border-subtle shadow-sm bg-white">
                <RichEditor
                  value={formData.content}
                  onTextChange={(e) => setFormData({ ...formData, content: e.htmlValue || '' })}
                  style={{ height: '450px', border: 'none' }}
                />
              </div>
            </FormField>
          </div>
        </div>
      </motion.div>

      {/* Sidebar / Settings Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-4 flex flex-col gap-10"
      >
        {/* Actions Card */}
        <div className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-soft">
          <div className="flex flex-col gap-5">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl! bg-primary shadow-xl shadow-primary/30 font-black tracking-[0.1em] text-xs uppercase flex items-center justify-center gap-3 active:scale-95 transition-all text-white"
              loading={isLoading}
              disabled={isLoading}
            >
              <Save size={18} />
              {initialData ? 'Sync Changes' : 'Launch Narrative'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 rounded-2xl! font-black text-[10px] uppercase tracking-widest text-muted! hover:bg-red-500/5! hover:text-red-500! flex items-center justify-center gap-2"
              onClick={() => navigate('/blogs')}
            >
              <X size={14} />
              Discard Draft
            </Button>
          </div>

          <div className="mt-10 pt-10 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-muted" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.15em]">Distribution</span>
              </div>
              <Badge className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border-none shadow-sm ${formData.status === 'Published' ? 'bg-success/10 text-success' : 'bg-surface-subtle text-muted'}`}>
                {formData.status}
              </Badge>
            </div>
            <div className="bg-surface-subtle/50 p-1.5 rounded-2xl flex items-center border border-border-subtle/50">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Draft' })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Draft' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-foreground'}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Published' })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Published' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-foreground'}`}
              >
                Public
              </button>
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Featured Asset</h3>
            <Settings size={14} className="text-muted" />
          </div>

          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] w-full rounded-[1.5rem] border-2 border-dashed border-border-subtle bg-white/50 flex flex-col items-center justify-center gap-4 group-hover:border-primary group-hover:bg-primary/5 transition-all overflow-hidden relative">
              {formData.featuredImage ? (
                <>
                  <img src={formData.featuredImage} alt="Preview" width={400} height={300} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="primary" className="rounded-full! w-12 h-12 flex items-center justify-center p-0!" aria-label="Edit featured image">
                      <i className="pi pi-pencil text-sm" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <i className="pi pi-cloud-upload text-xl"></i>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-black text-foreground uppercase tracking-widest">Connect Asset</p>
                    <p className="text-[10px] text-muted font-bold mt-2 uppercase tracking-tight opacity-60">RAW, JPEG, PNG • MAX 10MB</p>
                  </div>
                </>
              )}
            </div>
            <FileUpload
              mode="basic"
              name="featuredImage"
              accept="image/*"
              maxFileSize={1000000}
              className="absolute inset-0 opacity-0 cursor-pointer"
              auto
              onUpload={() => { }} // Handle upload logic
            />
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white shadow-soft">
          <div className="flex flex-col gap-10">
            <FormField label="Classification" className="!text-[10px] !font-black !uppercase !tracking-[0.15em] !text-muted">
              <Select
                options={categories}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
                placeholder="Select category"
                className="h-12! rounded-2xl! border-none! bg-white! shadow-sm!"
              />
            </FormField>

            <FormField label="Strategic Tags" description="Separate entities with commas" className="!text-[10px] !font-black !uppercase !tracking-[0.15em] !text-muted">
              <input
                type="text"
                value={formData.tags?.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                placeholder="e.g. CORE, QUANTUM, SYNERGY"
                className="w-full px-6 py-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-[13px] font-bold"
              />
            </FormField>
          </div>
        </div>
      </motion.div>
    </form>
  );
};
