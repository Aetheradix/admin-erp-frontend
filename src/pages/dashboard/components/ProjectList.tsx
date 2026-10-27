import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, CheckCircle2, ListTodo, Layers, ArrowUpRight } from 'lucide-react';
import ProjectCard from './ProjectCard';

import type { Project } from '@/types/models';

interface ProjectListProps {
  projects: Project[];
  totalTasks?: number;
  completedTasks?: number;
  taskCompletionRate?: number;
}

export const ProjectList = ({
  projects,
  totalTasks = 0,
  completedTasks = 0,
  taskCompletionRate = 0,
}: ProjectListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface-elevated rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header with Search and New Work button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
                Workspaces & Delivery
              </span>
              <div className="bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <span className="text-[9px] font-black text-primary tracking-wider uppercase">
                  {projects.length} Active
                </span>
              </div>
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Active Projects & Tasks</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-surface-subtle border border-border-subtle rounded-2xl px-3 py-1.5 hover:bg-surface-elevated transition-colors">
              <Search size={13} className="text-muted mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-[11px] font-bold text-foreground placeholder:text-muted/50 w-28"
              />
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="px-3.5 py-1.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-primary-hover transition-all flex items-center gap-1.5 cursor-pointer">
              <Plus size={13} />
              <span>New Work</span>
            </button>
          </div>
        </div>

        {/* Task Velocity Summary Strip */}
        <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border-subtle mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ListTodo size={14} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block leading-none">
                  Total Tasks
                </span>
                <span className="text-sm font-black text-foreground leading-tight mt-0.5 block">
                  {totalTasks}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-border-subtle" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-muted block leading-none">
                  Completed
                </span>
                <span className="text-sm font-black text-foreground leading-tight mt-0.5 block">
                  {completedTasks}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 sm:max-w-xs flex-1 justify-end">
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between text-[9px] font-black text-muted uppercase tracking-wider mb-1">
                <span>Velocity</span>
                <span className="text-primary font-bold">{taskCompletionRate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, taskCompletionRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Initialize Project Action Card */}
          <motion.div
            whileHover={{ scale: 0.99, y: -2 }}
            role="button"
            tabIndex={0}
            aria-label="Create new project"
            onClick={() => navigate('/tasks')}
            className="min-h-[135px] rounded-2xl border-2 border-dashed border-border-strong/50 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-200 p-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center mb-2 group-hover:bg-primary group-hover:rotate-90 transition-all duration-300 border border-border-subtle shadow-xs group-hover:shadow-primary/20">
              <Plus size={18} className="text-muted group-hover:text-white transition-colors" />
            </div>
            <p className="text-[10px] font-black text-muted group-hover:text-primary uppercase tracking-[0.18em] transition-colors">
              Initialize Project
            </p>
            <p className="text-[9px] font-medium text-muted/60 mt-0.5">
              Launch a new workspace delivery
            </p>
          </motion.div>

          {/* When no projects yet, show Task Board Quick Link to balance the 2-col grid */}
          {filteredProjects.length === 0 && (
            <motion.div
              whileHover={{ scale: 0.99, y: -2 }}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/tasks')}
              className="min-h-[135px] rounded-2xl bg-surface-subtle border border-border-subtle hover:border-primary/30 flex flex-col justify-between p-4 cursor-pointer group transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <ArrowUpRight size={14} className="text-muted group-hover:text-primary transition-colors" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Workflow Kanban
                </span>
                <h4 className="text-xs font-black text-foreground mt-0.5">
                  Browse Active Task Board
                </h4>
                <p className="text-[10px] text-muted/70 mt-0.5">
                  {totalTasks > 0 ? `${totalTasks} tasks pending in pipeline` : 'Create tasks & workflows'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Render Actual Projects if present */}
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id || project.title}
              onClick={() => navigate('/tasks')}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}>
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
