import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { OrgChart } from './components/OrgChart';
import { ProjectCard } from './components/ProjectCard';
import type { Node } from './hooks/mockStats';
import { useGetProjectsQuery, useGetProjectStatsQuery } from '@/store/api/projectApiSlice';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { Archive as ArchiveIcon, Sparkles } from 'lucide-react';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { StatsSummaryCards } from './components/StatsSummaryCards';
import { ARCHIVED_STATUS, COMPLETED_STATUS, STATS_TABS } from './constants';

export function StatsPage() {
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetProjectStatsQuery();
  const { data: hierarchyData, isLoading: hierarchyLoading } = useGetOrganizationHierarchyQuery();

  const [activeTab, setActiveTab] = useState('Hierarchy');

  const ongoingProjects = projects.filter((p) => p.status !== ARCHIVED_STATUS);
  const archivedProjects = projects.filter((p) => p.status === ARCHIVED_STATUS);

  const flatUsers = hierarchyData?.data?.flatUsers;
  const hierarchyNodes: Node[] = useMemo(() => {
    const flat = flatUsers || [];
    return flat.map((u) => ({
      id: String(u.id),
      name: u.username || u.email,
      role: u.role || u.designation || 'Staff',
      parentId: u.reporting_manager_id ? String(u.reporting_manager_id) : undefined,
      image:
        u.image_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username || u.email)}`,
    }));
  }, [flatUsers]);

  const completedProjects = projects.filter((p) => p.status === COMPLETED_STATUS).length;
  const completionRate =
    projects.length === 0 ? '0%' : `${Math.round((completedProjects / projects.length) * 100)}%`;

  if (projectsLoading || statsLoading || hierarchyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Company Intelligence"
        description="Comprehensive visualization of organizational structure, project lifecycles, and historical archives."
      />

      {/* High Level Stats */}
      <StatsSummaryCards
        activeProjects={statsData?.projects?.active ?? ongoingProjects.length}
        totalEmployees={
          statsData?.employees?.total ??
          hierarchyData?.data?.stats?.totalEmployees ??
          hierarchyNodes.length
        }
        completionRate={completionRate}
        historicalCount={archivedProjects.length}
      />

      {/* Navigation Tabs */}
      <div className="flex flex-col gap-8">
        <div className="bg-white p-4 rounded-3xl border border-border-subtle shadow-soft flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <span className="text-sm font-black text-foreground uppercase tracking-widest">
              Strategy Portal
            </span>
          </div>
          <Tabs items={STATS_TABS} activeItem={activeTab} onItemChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {activeTab === 'Hierarchy' && <OrgChart nodes={hierarchyNodes} />}

          {activeTab === 'Ongoing Projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ongoingProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {activeTab === 'Archive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archivedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {archivedProjects.length === 0 && (
                <EmptySlate
                  variant="ghost"
                  icon={ArchiveIcon}
                  title="Archive is clean"
                  message=""
                />
              )}
            </div>
          )}
        </div>
      </div>

      <CalloutBanner
        padding="lg"
        title={
          <>
            Charting the <span className="text-primary">Unknown</span>
          </>
        }
        description="Our organizational growth is driven by transparency and iterative excellence. By visualizing our structure and project lifecycles, we empower every team member to understand their impact and align with our global vision."
      />
    </div>
  );
}
