import React, { useMemo } from 'react';
import { Briefcase, CheckCircle2, FolderGit2 } from 'lucide-react';
import { useGetProjectsQuery } from '@/store/api/projectSlice';

interface ProjectsCardProps {
  department?: string;
  userId?: number;
}

export const ProjectsCard: React.FC<ProjectsCardProps> = React.memo(({ department }) => {
  const { data: allProjects = [], isLoading } = useGetProjectsQuery();

  const matchedProjects = useMemo(() => {
    if (!allProjects.length) return [];
    const deptLower = (department || '').toLowerCase();
    const deptMatches = allProjects.filter(
      (p) => p.category?.toLowerCase() === deptLower || p.client?.toLowerCase().includes(deptLower)
    );
    return deptMatches.length > 0 ? deptMatches.slice(0, 3) : allProjects.slice(0, 2);
  }, [allProjects, department]);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Briefcase size={13} className="text-[#0078d4]" />
          Current Projects & Workstreams
        </span>
        <span className="text-[10px] font-bold text-slate-500">
          {isLoading ? 'Loading...' : `${matchedProjects.length} Active`}
        </span>
      </div>

      {matchedProjects.length > 0 ? (
        <div className="space-y-2">
          {matchedProjects.map((proj) => (
            <div key={proj.id} className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate">{proj.title || proj.name}</span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  {proj.category || department || 'General'} · {proj.client || 'Internal Initiative'}
                </span>
              </div>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 bg-blue-50 text-[#0078d4] border-blue-200">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-white/70 border border-slate-200/60 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
          <FolderGit2 size={16} className="text-slate-400" />
          <span>No active projects assigned in ERP system</span>
        </div>
      )}
    </div>
  );
});

ProjectsCard.displayName = 'ProjectsCard';
