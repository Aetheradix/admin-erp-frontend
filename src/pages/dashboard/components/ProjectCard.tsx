import { Avatar } from '@/components/ui/primitives/Avatar';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  tasks: number;
  value: string;
  color: string;
  category: string;
  participants: number;
}

export default function ProjectCard({ title, tasks, value, color, category, participants }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      style={{
        backgroundColor: color,
        boxShadow: `0 20px 40px -15px ${color}33`
      }}
      className="group relative p-8 rounded-[2rem] flex flex-col justify-between min-h-[200px] cursor-pointer transition-all duration-500 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/5 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white/15 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">#{category}</span>
          </div>
          <motion.div
            whileHover={{ rotate: 90 }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors border border-white/10"
          >
            <MoreHorizontal size={16} className="text-white" />
          </motion.div>
        </div>

        <h3 className="text-2xl font-black text-white leading-[1.1] mb-2 tracking-tight">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white animate-pulse" />
          <p className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{tasks} tasks in progress</p>
        </div>
      </div>

      <div className="relative flex items-end justify-between mt-10">
        <div>
          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block mb-1">Contract Value</span>
          <h4 className="text-2xl font-black text-white tracking-tighter">{value}</h4>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex -space-x-3">
            {[1, 2].map((i) => (
              <Avatar
                key={i}
                image={`https://api.dicebear.com/7.x/avataaars/svg?seed=${title}-${i}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full! border-2 border-white/20 ring-2 ring-black/5"
                aria-label={`Participant ${i}`}
              />
            ))}
            {participants > 2 && (
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center z-10 ring-2 ring-black/5">
                <span className="text-[10px] font-black text-white">+{participants - 2}</span>
              </div>
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center z-20 shadow-lg cursor-pointer"
            >
              <Plus size={14} className="text-foreground" style={{ color: color }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hover Arrow Indicator */}
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
        <ArrowUpRight size={20} className="text-white" />
      </div>
    </motion.div>
  );
}
