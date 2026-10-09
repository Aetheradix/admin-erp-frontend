import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Edit3, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/primitives/Badge';
import { resolveImageUrl } from '@/utils/imageUrl';
import type { Blog } from '../hooks/mockBlogs';

interface BlogFeaturedProps {
  blogs: Blog[];
}

// Small sub-component so each secondary card has its own error state
function SecondaryCard({ blog, navigate }: { blog: Blog; navigate: (path: string) => void }) {
  const [coverError, setCoverError] = useState(false);
  const cover = resolveImageUrl(blog.featuredImage || blog.image_url);

  return (
    <motion.div
      key={String(blog.id)}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate(`/social/blogs/${blog.id}/edit`)}
      className="group flex-1 relative rounded-[2rem] overflow-hidden border border-border-subtle/80 shadow-soft bg-white/80 backdrop-blur-xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex gap-4 items-start">
        <div className="w-22 h-22 rounded-2xl overflow-hidden shrink-0 bg-surface-subtle border border-border-subtle">
          {cover && !coverError ? (
            <img
              src={cover}
              alt={blog.title}
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-surface-subtle">
              <Sparkles size={20} />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
            {blog.category || 'Insights'}
          </span>
          <h3 className="text-sm font-black text-foreground leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <p className="text-[11px] text-muted line-clamp-1 mt-1 font-medium">
            {blog.excerpt || 'Read details and insights...'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
          <span>Edit Post</span>
          <ArrowRight
            size={13}
            className="text-primary group-hover:translate-x-1 transition-transform"
          />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-muted">
          {blog.status}
        </span>
      </div>
    </motion.div>
  );
}

export const BlogFeatured = ({ blogs }: BlogFeaturedProps) => {
  const navigate = useNavigate();
  const [primaryError, setPrimaryError] = useState(false);
  const featured = blogs.slice(0, 3);

  if (featured.length === 0) return null;

  const getAuthorName = (author: Blog['author']) =>

    typeof author === 'string' ? author : author?.name || 'Aether Editorial';

  const getAuthorImage = (author: Blog['author']) =>
    typeof author === 'string'
      ? `https://api.dicebear.com/7.x/notionists/svg?seed=${author}`
      : author?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=Editorial`;

  const primary = featured[0];
  const primaryCover = resolveImageUrl(primary.featuredImage || primary.image_url);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Primary Hero Spotlight Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate(`/social/blogs/${primary.id}/edit`)}
        className={`${
          featured.length > 1 ? 'lg:col-span-8' : 'lg:col-span-12'
        } group relative aspect-[16/10] lg:aspect-auto lg:h-[460px] rounded-[2.5rem] overflow-hidden border border-border-subtle shadow-xl cursor-pointer bg-slate-900`}>
        {primaryCover && !primaryError ? (
          <img
            src={primaryCover}
            alt={primary.title}
            onError={() => setPrimaryError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-95"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-slate-900 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
            <Edit3 size={13} />
            Edit Story
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-8 lg:p-10 w-full lg:w-4/5 flex flex-col items-start z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary text-white border-none px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
              Featured Story
            </Badge>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              {primary.category || 'General'}
            </span>
          </div>

          <h2 className="text-2xl lg:text-4xl font-black text-white leading-[1.2] mb-3 tracking-tight group-hover:text-primary-light transition-colors line-clamp-2">
            {primary.title}
          </h2>

          {primary.excerpt && (
            <p className="text-white/75 text-xs lg:text-sm font-medium line-clamp-2 mb-6 max-w-2xl leading-relaxed">
              {primary.excerpt}
            </p>
          )}

          <div className="flex items-center gap-6 mt-auto pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-primary/40 overflow-hidden bg-white/10 shrink-0">
                <img
                  src={getAuthorImage(primary.author)}
                  alt={getAuthorName(primary.author)}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-white/90">
                {getAuthorName(primary.author)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-black uppercase tracking-wider">
              <Clock size={12} />
              <span>{primary.readTime || '4 min read'}</span>
            </div>

            <span className="text-xs font-bold text-white/90 ml-auto flex items-center gap-1 group-hover:translate-x-1 transition-transform text-primary">
              Refine Story <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Secondary Featured Cards */}
      {featured.length > 1 && (
        <div className="lg:col-span-4 flex flex-col gap-6">
          {featured.slice(1).map((blog, idx) => (
            <motion.div
              key={String(blog.id)}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + idx * 0.15 }}>
              <SecondaryCard blog={blog} navigate={navigate} />
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};
