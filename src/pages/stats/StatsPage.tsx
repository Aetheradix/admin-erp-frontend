import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { CalloutBanner } from '@/components/ui/composed/CalloutBanner';
import { EmptySlate } from '@/components/ui/composed/EmptySlate';
import { OrgChart } from './components/OrgChart';
import { ProjectCard } from './components/ProjectCard';
import { mockHierarchy } from './hooks/mockStats';
import { useGetProjectsQuery, useGetProjectStatsQuery } from '@/store/api/projectApiSlice';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { PieChart, TrendingUp, Layers, Archive as ArchiveIcon, Sparkles } from 'lucide-react';
import { Tabs } from '@/components/ui/primitives/Tabs';

export function StatsPage() {
  const { data: projects = [], isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetProjectStatsQuery();

  const [activeTab, setActiveTab] = useState('Hierarchy');
  const TABS = ['Hierarchy', 'Ongoing Projects', 'Archive'];

  const ongoingProjects = projects.filter((p: any) => p.status !== 'Archived');
  const archivedProjects = projects.filter((p: any) => p.status === 'Archived');

  if (projectsLoading || statsLoading) {
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Active Projects',
            value: statsData?.projects?.active ?? 0,
            icon: Layers,
            color: 'text-primary',
          },
          {
            label: 'Total Employees',
            value: statsData?.employees?.total ?? mockHierarchy.length,
            icon: PieChart,
            color: 'text-info',
          },
          { label: 'Completion Rate', value: '92%', icon: TrendingUp, color: 'text-success' },
          {
            label: 'Historical Data',
            value: archivedProjects.length,
            icon: ArchiveIcon,
            color: 'text-warning',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group"
          >
            <div
              className={`w-14 h-14 rounded-lg bg-surface-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}
            >
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground">{stat.value}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

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
          <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {activeTab === 'Hierarchy' && <OrgChart nodes={mockHierarchy} />}

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
