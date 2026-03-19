import React from 'react';
import { MoreHorizontal, ArrowUpRight, Plus } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import ProjectCard from '@/components/ui/ProjectCard';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

const DashboardProjectGrid: React.FC = () => {
  const { projects } = useDashboardData();

  return (
    <div className="bg-[#1b212f] rounded-[2.5rem] p-6 lg:p-8 border border-white/5 flex-1 shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <span className="text-white/40 font-medium">({projects.length + 83})</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={MoreHorizontal} />
          <IconButton icon={ArrowUpRight} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Project Button */}
        <button className="border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all min-h-45">
          <Plus size={32} />
        </button>
        
        {/* Project Cards */}
        {projects.map((project, i) => (
          <ProjectCard 
            key={i}
            {...project}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardProjectGrid;
