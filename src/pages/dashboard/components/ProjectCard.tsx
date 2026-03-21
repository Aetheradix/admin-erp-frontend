import { Avatar } from '@/components/ui/primitives/Avatar';
import { motion } from 'framer-motion';

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
      whileHover={{ y: -5 }}
      style={{ backgroundColor: color }}
      className="p-6 rounded-3xl shadow-lg shadow-black/5 flex flex-col justify-between min-h-40 cursor-pointer group transition-all"
    >
      <div>
        <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md mb-4 inline-block">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">#{category}</span>
        </div>
        <h3 className="text-xl font-black text-white leading-tight mb-1">{title}</h3>
        <p className="text-[11px] font-medium text-white/80">Completed tasks: {tasks}</p>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-xl font-black text-white">{value}</h4>
        
        <div className="flex -space-x-2">
          {[1, 2].map((i) => (
            <Avatar 
              key={i}
              image={`https://api.dicebear.com/7.x/avataaars/svg?seed=${title}-${i}`}
              className="w-7 h-7 rounded-full! border-2 border-white/20 shadow-none!"
            />
          ))}
          {participants > 2 && (
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">+{participants - 2}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
