import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Calendar, User, Eye, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/primitives/Badge';
import { Avatar } from '@/components/ui/primitives/Avatar';
import { Button } from '@/components/ui/primitives/Button';
import { resolveImageUrl } from '@/utils/imageUrl';
import type { Blog } from '../hooks/mockBlogs';

// ─── Status ───────────────────────────────────────────────────────────────────

export function StatusCell({ status }: { status: Blog['status'] }) {
  const isPublished = status === 'Published';
  return (
    <div className="flex justify-center">
      <Badge
        className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border-none shadow-xs flex items-center gap-1.5 ${
          isPublished
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-amber-500/10 text-amber-600'
        }`}>
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        {status || 'Draft'}
      </Badge>
    </div>
  );
}

// ─── Author ───────────────────────────────────────────────────────────────────

export function AuthorCell({ author }: { author: Blog['author'] }) {
  const authorName = typeof author === 'string' ? author : author?.name || 'Editorial Staff';
  const authorImg =
    typeof author === 'string'
      ? `https://api.dicebear.com/7.x/notionists/svg?seed=${author}`
      : author?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${authorName}`;

  return (
    <div className="flex items-center gap-3">
      <div className="relative group shrink-0">
        <Avatar
          image={resolveImageUrl(authorImg)}
          className="w-9 h-9 rounded-xl border border-border-subtle shadow-xs transition-transform group-hover:scale-105"
          width={36}
          height={36}
          aria-label={`Author: ${authorName}`}
        />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
          <User size={7} />
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-foreground truncate tracking-tight">
          {authorName}
        </span>
        <span className="text-[9px] text-muted font-bold uppercase tracking-widest leading-none mt-0.5">
          Contributor
        </span>
      </div>
    </div>
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

export function TitleCell({
  id,
  title,
  excerpt,
  content,
}: {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
}) {
  const navigate = useNavigate();
  const displayExcerpt =
    excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 90) + '...' : '');

  return (
    <div
      onClick={() => navigate(`/social/blogs/${id}/edit`)}
      className="flex flex-col max-w-lg py-3 group cursor-pointer"
      title="Click to edit story">
      <h4 className="font-black text-foreground text-sm group-hover:text-primary transition-colors leading-snug tracking-tight line-clamp-2">
        {title}
      </h4>
      {displayExcerpt && (
        <p className="text-[11px] text-muted/70 font-medium line-clamp-1 mt-1.5">
          {displayExcerpt}
        </p>
      )}
    </div>
  );
}

// ─── Category ─────────────────────────────────────────────────────────────────

export function CategoryCell({
  category,
  date,
}: {
  category: string | null;
  date?: string;
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
        {category || 'General'}
      </span>
      <div className="flex items-center gap-1.5 text-[9px] text-muted font-bold uppercase tracking-wider">
        <Calendar size={10} />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

export function ImageCell({
  id,
  src,
  alt,
}: {
  id: string;
  src?: string;
  alt: string;
}) {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);
  const resolved = resolveImageUrl(src);

  return (
    <div
      onClick={() => navigate(`/social/blogs/${id}/edit`)}
      className="relative group overflow-hidden rounded-xl border border-border-subtle shadow-xs cursor-pointer w-20 h-14 shrink-0 bg-surface-subtle">
      {resolved && !hasError ? (
        <img
          src={resolved}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-surface-subtle flex items-center justify-center text-primary/40">
          <Sparkles size={16} />
        </div>
      )}
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Eye size={14} className="text-white drop-shadow-sm" />
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
    <div className="flex items-center gap-2 justify-end pr-4">
      <Button
        variant="ghost"
        className="w-9 h-9 rounded-xl bg-surface-subtle border border-border-subtle hover:bg-surface-elevated hover:text-primary transition-all active:scale-95 text-muted"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/social/blogs/${id}/edit`);
        }}
        aria-label="Edit story">
        <Edit2 size={14} />
      </Button>
      <Button
        variant="ghost"
        className="w-9 h-9 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        aria-label="Delete story">
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
