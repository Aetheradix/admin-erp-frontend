import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: any[];
}

export const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-foreground">Projects</h2>
          <div className="bg-surface-subtle px-3 py-1 rounded-full border border-border-subtle">
            <span className="text-[10px] font-black text-muted tracking-widest uppercase">88 TOTAL</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div 
            role="button"
            tabIndex={0}
            aria-label="Project actions"
            className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-elevated transition-colors"
          >
            <i className="pi pi-ellipsis-h text-muted" aria-hidden="true"></i>
          </div>
          <div 
            role="button"
            tabIndex={0}
            aria-label="Create new project"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary-hover transition-colors"
          >
            <i className="pi pi-plus text-white text-xs" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 0.98 }}
          role="button"
          tabIndex={0}
          aria-label="Create new project"
          className="border-2 border-dashed border-border-subtle rounded-3xl flex flex-col items-center justify-center min-h-40 cursor-pointer group hover:border-primary/50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <i className="pi pi-plus text-muted group-hover:text-primary transition-colors" aria-hidden="true"></i>
          </div>
          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">New Project</span>
        </motion.div>

        {projects.map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
