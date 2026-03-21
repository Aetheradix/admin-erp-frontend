import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/primitives/Badge';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { Button } from '@/components/ui/primitives/Button';
import type { Blog } from '../hooks/mockBlogs';


// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<Blog['status'], any> = {
  Published: 'success',
  Draft:     'secondary',
  Scheduled: 'warning',
};

export function StatusCell({ status }: { status: Blog['status'] }) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
    >
      {status}
    </Badge>
  );
}

// ─── Author ───────────────────────────────────────────────────────────────────

export function AuthorCell({ author }: { author: Blog['author'] }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar
          image={author.image}
          className="w-9 h-9 rounded-full border-2 border-white shadow-soft"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground leading-none">{author.name}</span>
        <span className="text-[10px] text-muted font-medium mt-1 uppercase tracking-tight">Editor</span>
      </div>
    </div>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

export function TitleCell({ title, excerpt }: { title: string; excerpt: string }) {
  return (
    <div className="flex flex-col max-w-lg py-2">
      <span className="font-black text-foreground text-base hover:text-primary cursor-pointer transition-colors leading-tight">
        {title}
      </span>
      <span className="text-[11px] text-muted/80 font-medium mt-2 line-clamp-1">
        {excerpt}
      </span>
    </div>
  );
}

// ─── Category ─────────────────────────────────────────────────────────────────

export function CategoryCell({ category }: { category: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      <span className="text-[11px] font-black text-muted uppercase tracking-[0.1em]">
        {category}
      </span>
    </div>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

export function ImageCell({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-border-subtle shadow-sm transition-transform hover:scale-105">
      <img src={src} alt={alt} className="w-20 h-14 object-cover" />
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <div className="flex items-center gap-2 justify-end pr-4">
      <Button
        variant="ghost"
        className="w-13! h-13! rounded-full! hover:bg-surface-elevated! hover:text-primary! transition-all active:scale-95"
        onClick={() => navigate(`/blogs/${id}/edit`)}
      >
        <Edit2 size={30} />
      </Button>
      {/* <Button
        variant="ghost"
        className="w-13! h-13! rounded-full! hover:bg-surface-elevated! hover:text-info! transition-all active:scale-95"
        onClick={() => navigate(`/blogs/${id}`)}
      >
        <Eye size={30} />
      </Button> */}
      <Button
        variant="ghost"
        className="w-13! h-13! rounded-full! hover:bg-red-500/13! hover:text-red-500! transition-all active:scale-95"
        onClick={() => onDelete(id)}
      >
        <Trash2 size={30} />
      </Button>
    </div>
  );
}