import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { OrgChart } from './components/OrgChart';
import { ProjectCard } from './components/ProjectCard';
import { mockProjects, mockHierarchy } from './hooks/mockStats';
import { PieChart, TrendingUp, Layers, Archive as ArchiveIcon, Sparkles } from 'lucide-react';
import { Tabs } from '@/components/ui/primitives/Tabs';

export function StatsPage() {
  const [activeTab, setActiveTab] = useState('Hierarchy');
  const TABS = ['Hierarchy', 'Ongoing Projects', 'Archive'];

  const ongoingProjects = mockProjects.filter(p => p.status !== 'Archived');
  const archivedProjects = mockProjects.filter(p => p.status === 'Archived');

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
          { label: 'Active Projects', value: ongoingProjects.length, icon: Layers, color: 'text-primary' },
          { label: 'Total Employees', value: mockHierarchy.length, icon: PieChart, color: 'text-info' },
          { label: 'Completion Rate', value: '92%', icon: TrendingUp, color: 'text-success' },
          { label: 'Historical Data', value: archivedProjects.length, icon: ArchiveIcon, color: 'text-warning' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft transition-all duration-300 hover:shadow-lg flex items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl bg-surface-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground">{stat.value}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col gap-8">
        <div className="bg-white p-4 rounded-[40px] border border-border-subtle shadow-soft flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <span className="text-sm font-black text-foreground uppercase tracking-widest">Strategy Portal</span>
          </div>
          <Tabs 
            items={TABS}
            activeItem={activeTab}
            onItemChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {activeTab === 'Hierarchy' && (
            <OrgChart nodes={mockHierarchy} />
          )}

          {activeTab === 'Ongoing Projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ongoingProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {activeTab === 'Archive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archivedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {archivedProjects.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40">
                  <ArchiveIcon size={48} />
                  <p className="text-sm font-black uppercase tracking-widest mt-4">Archive is clean</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vision Statement */}
      <div className="p-12 rounded-[48px] bg-foreground text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight">
            Charting the <span className="text-primary">Unknown</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-3xl">
            Our organizational growth is driven by transparency and iterative excellence. 
            By visualizing our structure and project lifecycles, we empower every team member 
            to understand their impact and align with our global vision.
          </p>
        </div>
      </div>
    </div>
  );
}
