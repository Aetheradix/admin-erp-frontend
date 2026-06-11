import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/primitives/Badge';
import type { Blog } from '../hooks/mockBlogs';

interface BlogFeaturedProps {
    blogs: Blog[];
}

export const BlogFeatured = ({ blogs }: BlogFeaturedProps) => {
    const featured = blogs.slice(0, 3); // Just take the first 3 for now

    if (featured.length === 0) return null;

    const getAuthorName = (author: Blog['author']) => typeof author === 'string' ? author : author?.name || 'Unknown';
    const getAuthorImage = (author: Blog['author']) => typeof author === 'string'
        ? `https://api.dicebear.com/7.x/notionists/svg?seed=${author}`
        : author?.image;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Primary Featured Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-8 group relative aspect-[16/9] lg:aspect-auto lg:h-[480px] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl cursor-pointer"
            >
                <img
                    src={featured[0].image_url || ''}
                    alt={featured[0].title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 p-10 w-full lg:w-3/4">
                    <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        Featured Story
                    </Badge>
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
                        {featured[0].title}
                    </h2>
                    <p className="text-white/60 text-sm font-medium line-clamp-2 mb-8 max-w-xl">
                        {featured[0].excerpt}
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden">
                                <img src={getAuthorImage(featured[0].author)} alt={getAuthorName(featured[0].author)} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-bold text-white/80">{getAuthorName(featured[0].author)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} />
                            <span>5 min read</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Secondary Featured Cards */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                {featured.slice(1).map((blog, idx) => (
                    <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.2 }}
                        className="group flex-1 relative rounded-[2rem] overflow-hidden border border-border-subtle shadow-soft bg-white p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                    >
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                                <img src={blog.image_url || ''} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">{blog.category}</span>
                                <h3 className="text-lg font-black text-foreground leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                                    {blog.title}
                                </h3>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Read More</span>
                                <ArrowRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="text-[9px] font-medium text-muted uppercase tracking-wider">{blog.status}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
