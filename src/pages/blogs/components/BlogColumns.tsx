import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Calendar, User, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/primitives/Badge';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { Button } from '@/components/ui/primitives/Button';
import type { Blog } from '../hooks/mockBlogs';

// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<Blog['status'], any> = {
  Published: 'success',
  Draft: 'secondary',
  Scheduled: 'warning',
};

export function StatusCell({ status }: { status: Blog['status'] }) {
  return (
    <div className="flex justify-center">
      <Badge
        variant={STATUS_VARIANT[status]}
        className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border-none shadow-sm flex items-center gap-2"
      >
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current`} />
        {status}
      </Badge>
    </div>
  );
}

// ─── Author ───────────────────────────────────────────────────────────────────

export function AuthorCell({ author }: { author: Blog['author'] }) {
  const authorName = typeof author === 'string' ? author : author?.name || 'Unknown';
  const authorImg = typeof author === 'string'
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${author}`
    : author?.image;

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Avatar
          image={authorImg}
          className="w-10 h-10 rounded-2xl border border-border-subtle shadow-soft transition-transform group-hover:scale-110"
          width={40}
          height={40}
          aria-label={`Author: ${authorName}`}
        />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
          <User size={8} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-black text-foreground tracking-tight">{authorName}</span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] text-muted font-bold uppercase tracking-widest leading-none">Senior Editor</span>
        </div>
      </div>
    </div>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

export function TitleCell({ title, excerpt, content }: { title: string; excerpt?: string; content?: string }) {
  const displayExcerpt = excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '');

  return (
    <div className="flex flex-col max-w-lg py-4 group cursor-pointer">
      <h4 className="font-black text-foreground text-[15px] group-hover:text-primary transition-colors leading-snug tracking-tight">
        {title}
      </h4>
      <div className="flex items-center gap-3 mt-2.5">
        <p className="text-[10px] text-muted/60 font-medium line-clamp-1 italic">
          "{displayExcerpt}"
        </p>
      </div>
    </div>
  );
}

// ─── Category ─────────────────────────────────────────────────────────────────

export function CategoryCell({ category }: { category: string | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
          {category || 'Uncategorized'}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-muted/50 font-bold uppercase tracking-widest">
        <Calendar size={10} />
        <span>Jun 11, 2026</span>
      </div>
    </div>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

export function ImageCell({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-border-subtle shadow-soft transition-all duration-500 hover:rotate-1 hover:scale-105">
      <img src={src} alt={alt} width={90} height={60} className="w-24 h-16 object-cover" />
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Eye size={16} className="text-primary" />
      </div>
    </div>
  );
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface ActionsCellProps {
  id: string;
  onDelete: (id: string) => void;
}

export function ActionsCell({ id, onDelete }: ActionsCellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 justify-end pr-6">
      <Button
        variant="ghost"
        className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border-subtle hover:bg-surface-elevated hover:text-primary transition-all active:scale-90"
        onClick={() => navigate(`/blogs/${id}/edit`)}
        aria-label="Edit post"
      >
        <Edit2 size={16} />
      </Button>
      <Button
        variant="ghost"
        className="w-10 h-10 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white transition-all active:scale-90"
        onClick={() => onDelete(id)}
        aria-label="Delete post"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
