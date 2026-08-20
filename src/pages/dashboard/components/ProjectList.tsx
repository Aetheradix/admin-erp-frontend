import { motion } from 'framer-motion';
import { Plus, Filter, Search } from 'lucide-react';
import ProjectCard from './ProjectCard';

import type { Project } from '@/types/models';

interface ProjectListProps {
  projects: Project[];
}

export const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Active Projects</h2>
            <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              <span className="text-[10px] font-black text-primary tracking-widest uppercase">
                88 TOTAL
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-muted tracking-wide">
            Manage and track your ongoing infrastructure works
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-surface-subtle border border-border-subtle rounded-2xl px-4 py-2 hover:bg-surface-elevated transition-colors">
            <Search size={14} className="text-muted mr-2" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-transparent border-none outline-none text-[11px] font-bold text-foreground placeholder:text-muted/50 w-32"
            />
          </div>
          <button className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center border border-border-subtle hover:bg-surface-elevated transition-all">
            <Filter size={14} className="text-muted" />
          </button>
          <button className="h-10 px-6 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
            <Plus size={14} />
            <span>New Work</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <motion.div
          whileHover={{ scale: 0.98, y: -4 }}
          role="button"
          tabIndex={0}
          aria-label="Create new project"
          className="relative min-h-[200px] rounded-[2rem] border-2 border-dashed border-border-strong/50 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-500"
        >
          <div className="w-14 h-14 rounded-3xl bg-surface-subtle flex items-center justify-center mb-4 group-hover:bg-primary group-hover:rotate-90 transition-all duration-500 border border-border-subtle shadow-sm group-hover:shadow-primary/30">
            <Plus size={24} className="text-muted group-hover:text-white transition-colors" />
          </div>
          <p className="text-[10px] font-black text-muted group-hover:text-primary uppercase tracking-[0.2em] transition-colors">
            Initialize Project
          </p>
          <p className="text-[9px] font-medium text-muted/50 mt-1 uppercase tracking-widest">
            Add a new workspace
          </p>
        </motion.div>

        {projects.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
