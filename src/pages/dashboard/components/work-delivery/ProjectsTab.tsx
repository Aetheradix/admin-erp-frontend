import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search } from 'lucide-react';
import type { Project } from '@/types/models';
import { PROJECT_SEARCH_THRESHOLD } from '../../constants';
import { filterProjects } from '../../utils/workDelivery';
import { ProjectRow } from './ProjectRow';
import { WorkDeliveryEmpty, WorkDeliveryList } from './WorkDeliveryPrimitives';

interface ProjectsTabProps {
  projects: Project[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ProjectsTab({ projects, searchQuery, onSearchChange }: ProjectsTabProps) {
  const navigate = useNavigate();
  const filteredProjects = filterProjects(projects, searchQuery);

  return (
    <div className="flex-1 flex flex-col pt-1">
      {projects.length > PROJECT_SEARCH_THRESHOLD && (
        <div className="mb-2 relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-muted" />
          <input
            type="text"
            placeholder="Search projects by name, category, or status..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search projects"
            className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <WorkDeliveryEmpty
          icon={FolderKanban}
          iconSize={28}
          iconClassName="text-muted/50 mb-2"
          title={searchQuery ? 'No matching projects found' : 'No active projects found'}
          message={
            searchQuery
              ? 'Try adjusting your search keywords'
              : 'Projects created or assigned to your team will appear here in real-time.'
          }
          messageClassName="text-[11px] text-muted mt-0.5 max-w-xs"
          action={
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs cursor-pointer">
              <Plus size={12} />
              <span>New Project</span>
            </button>
          }
        />
      ) : (
        <WorkDeliveryList>
          {filteredProjects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </WorkDeliveryList>
      )}
    </div>
  );
}