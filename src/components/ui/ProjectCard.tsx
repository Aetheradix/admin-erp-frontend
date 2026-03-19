import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  category: string;
  amount: string;
  tasksCount: number;
  colorClass: string;
  members?: string[];
  extraMembers?: number;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  title, 
  category, 
  amount, 
  tasksCount, 
  colorClass, 
  members = [], 
  extraMembers,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`${colorClass} rounded-[2.5rem] p-6 flex flex-col justify-between min-h-45 shadow-lg group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer`}
    >
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={16} />
      </div>
      <div>
        <span className="text-[10px] bg-black/20 font-bold px-2 py-1 rounded w-fit mb-3 block uppercase tracking-wider">#{category}</span>
        <h3 className="font-bold text-xl mb-1">{title}</h3>
        <p className="text-xs text-white/80">Completed tasks: {tasksCount}</p>
      </div>
      <div className="flex items-end justify-between mt-4">
        <div className="font-bold text-2xl">{amount}</div>
        <div className="flex -space-x-2">
          {members.map((seed, i) => (
            <img 
              key={i} 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`} 
              className="w-8 h-8 rounded-full border-2 border-inherit bg-[#1b212f]" 
              alt="Member"
            />
          ))}
          {extraMembers !== undefined && (
            <div className="w-8 h-8 rounded-full border-2 border-inherit bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
              +{extraMembers}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
