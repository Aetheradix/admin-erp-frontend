import { FileUpload } from '@/components/ui/composed/FileUpload';
import { FormField } from '@/components/ui/composed/FormField';
import { RichEditor } from '@/components/ui/composed/RichEditor';
import { Button } from '@/components/ui/primitives/Button';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/primitives/Input';

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
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
      {/* Main Content Area */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-4xl border border-border-subtle shadow-soft">
          <h3 className="text-lg font-bold mb-6">Write your story</h3>
          <div className="flex flex-col gap-6">
            <FormField label="Blog Title" required>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a catchy title..."
              />
            </FormField>

            <FormField label="Excerpt" description="A short summary of your post for social sharing.">
              <Textarea 
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="What is this post about?"
                rows={3}
              />
            </FormField>

            <FormField label="Content" required>
              <RichEditor 
                value={formData.content}
                onTextChange={(e) => setFormData({ ...formData, content: e.htmlValue || '' })}
                style={{ height: '400px' }}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Sidebar / Settings Area */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
        {/* Actions Card */}
        <div className="bg-white p-8 rounded-4xl border border-border-subtle shadow-soft">
          <div className="flex flex-col gap-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-14 rounded-2xl! shadow-lg shadow-primary/20 font-black tracking-wide text-base active:scale-95 transition-all" 
              loading={isLoading}
              disabled={isLoading}
            >
              {initialData ? 'Update Post' : 'Publish Story'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-12 rounded-2xl! font-bold text-muted!" 
              onClick={() => navigate('/blogs')}
            >
              Cancel
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-foreground uppercase tracking-wider">Visibility</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${formData.status === 'Published' ? 'bg-success/10 text-success' : 'bg-surface-subtle text-muted'}`}>
                {formData.status}
              </span>
            </div>
            <div className="bg-surface-subtle p-1.5 rounded-2xl flex items-center">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Draft' })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.status === 'Draft' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-foreground'}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Published' })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${formData.status === 'Published' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-foreground'}`}
              >
                Public
              </button>
            </div>
          </div>
        </div>

        {/* Media Card */}
        <div className="bg-white p-8 rounded-4xl border border-border-subtle shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Featured Image</h3>
            <i className="pi pi-image text-muted"></i>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-border-subtle bg-surface-subtle flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden relative">
              {formData.featuredImage ? (
                <>
                  <img src={formData.featuredImage} alt="Preview" width={400} height={225} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="primary" className="rounded-full! p-3!" aria-label="Edit featured image">
                      <i className="pi pi-pencil" aria-hidden="true"></i>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-soft text-primary group-hover:scale-110 transition-transform">
                    <i className="pi pi-cloud-upload text-xl"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Click or Drag to Upload</p>
                    <p className="text-[10px] text-muted font-medium mt-1 uppercase tracking-tight">PNG, JPG up to 10MB</p>
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
              onUpload={() => {}} // Handle upload logic
            />
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white p-8 rounded-4xl border border-border-subtle shadow-soft">
          <div className="flex flex-col gap-6">
            <FormField label="Category">
              <Select 
                options={categories}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
                placeholder="Select category"
              />
            </FormField>

            <FormField label="Tags" description="Separate with commas">
              <input 
                type="text" 
                value={formData.tags?.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                placeholder="e.g. SEO, AI, Design"
                className="w-full px-5 py-3.5 rounded-2xl border border-border-subtle focus:border-primary outline-none transition-all text-sm font-medium"
              />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
};
