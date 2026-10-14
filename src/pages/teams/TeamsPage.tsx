import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Users, Crown, Folder, Network, LayoutGrid, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

interface Team {
  id: number;
  name: string;
  lead: string;
  members: number;
  department: string;
  color: string;
  projects: number;
}

const COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
];
const DEPARTMENTS = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Creative', value: 'Creative' },
  { label: 'Growth', value: 'Growth' },
  { label: 'Revenue', value: 'Revenue' },
  { label: 'People', value: 'People' },
  { label: 'Infrastructure', value: 'Infrastructure' },
];

const initialTeams: Team[] = [
  {
    id: 1,
    name: 'Engineering',
    lead: 'Sarah Chen',
    members: 24,
    department: 'Technology',
    color: '#3B82F6',
    projects: 8,
  },
  {
    id: 2,
    name: 'Design',
    lead: 'Maya Johnson',
    members: 12,
    department: 'Creative',
    color: '#8B5CF6',
    projects: 5,
  },
  {
    id: 3,
    name: 'Marketing',
    lead: 'Alex Rivera',
    members: 8,
    department: 'Growth',
    color: '#10B981',
    projects: 4,
  },
  {
    id: 4,
    name: 'Sales',
    lead: 'David Kim',
    members: 15,
    department: 'Revenue',
    color: '#F59E0B',
    projects: 6,
  },
  {
    id: 5,
    name: 'HR & Operations',
    lead: 'Lisa Park',
    members: 6,
    department: 'People',
    color: '#EC4899',
    projects: 3,
  },
  {
    id: 6,
    name: 'DevOps',
    lead: 'James Wu',
    members: 5,
    department: 'Infrastructure',
    color: '#06B6D4',
    projects: 7,
  },
];

const emptyForm = { name: '', lead: '', department: '', members: 1 };

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewMode, setViewMode] = useState<'cards' | 'orgchart'>('cards');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.lead || !form.department) return;
    const newTeam: Team = {
      id: Date.now(),
      name: form.name,
      lead: form.lead,
      members: form.members,
      department: form.department,
      color: COLORS[teams.length % COLORS.length],
      projects: 0,
    };
    setTeams([newTeam, ...teams]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Teams"
        description="Manage teams across your organization."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Teams' }]}
        primaryAction={{
          label: 'Create Team',
          onClick: () => setShowForm(true),
          icon: 'pi pi-plus',
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Teams', value: teams.length },
          { label: 'Total Members', value: teams.reduce((a, t) => a + t.members, 0) },
          { label: 'Active Projects', value: teams.reduce((a, t) => a + t.projects, 0) },
          { label: 'Departments', value: new Set(teams.map((t) => t.department)).size },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-border-subtle shadow-soft flex flex-col gap-1">
            <span className="text-2xl font-black text-foreground">{stat.value}</span>
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Directory Layout Switcher */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-foreground uppercase tracking-wider">
            Directory View
          </span>
          <div className="flex items-center p-1 bg-surface-subtle rounded-xl border border-border-subtle">
            <button
              type="button"
              id="team-cards-view-btn"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}>
              <LayoutGrid size={14} />
              <span>Team Cards</span>
            </button>
            <button
              type="button"
              id="team-orgchart-view-btn"
              onClick={() => setViewMode('orgchart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === 'orgchart'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}>
              <Network size={14} />
              <span>Org Hierarchy Tree</span>
            </button>
          </div>
        </div>
        <span className="text-xs text-muted font-bold">
          {viewMode === 'orgchart'
            ? 'Interactive Multi-Tier Organizational Chart'
            : `${teams.length} Active Teams`}
        </span>
      </div>

      {viewMode === 'orgchart' ? (
        <div className="flex flex-col items-center gap-6 p-6 md:p-10 rounded-3xl bg-surface-subtle/30 border border-border-subtle overflow-x-auto min-w-full">
          {/* Level 1: CEO / Executive Office */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center">
            <div className="bg-white rounded-3xl border-2 border-primary/30 shadow-lg p-6 flex items-center gap-4 min-w-[320px] relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                AV
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">Alexander Vance</h3>
                  <Crown size={14} className="text-amber-500" />
                </div>
                <span className="text-xs font-bold text-primary">Chief Executive Officer</span>
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                  Executive Leadership • Global ERP OS
                </span>
              </div>
            </div>
            {/* Trunk Line */}
            <div className="w-0.5 h-10 bg-primary/40 my-1" />
          </motion.div>

          {/* Level 2: Functional Department Directors */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-6xl">
            {[
              {
                id: 'tech',
                dept: 'Technology & Eng',
                lead: 'Sarah Chen',
                role: 'VP of Engineering',
                color: '#3B82F6',
                teams: teams.filter((t) => t.department === 'Technology' || t.department === 'Infrastructure'),
              },
              {
                id: 'creative',
                dept: 'Design & Creative',
                lead: 'Maya Johnson',
                role: 'Head of Product Design',
                color: '#8B5CF6',
                teams: teams.filter((t) => t.department === 'Creative'),
              },
              {
                id: 'growth',
                dept: 'Growth & Revenue',
                lead: 'David Kim',
                role: 'Head of Sales & Growth',
                color: '#10B981',
                teams: teams.filter((t) => t.department === 'Revenue' || t.department === 'Growth'),
              },
              {
                id: 'people',
                dept: 'People & Operations',
                lead: 'Lisa Park',
                role: 'VP of People & Culture',
                color: '#EC4899',
                teams: teams.filter((t) => t.department === 'People'),
              },
            ].map((pillar) => {
              const isCollapsed = collapsedNodes[pillar.id];
              return (
                <div key={pillar.id} className="flex flex-col items-center gap-4">
                  {/* Pillar Lead Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-white rounded-2xl border border-border-subtle shadow-soft p-5 flex flex-col gap-3 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}>
                        {pillar.dept}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleNode(pillar.id)}
                        className="p-1 rounded-lg hover:bg-surface-subtle text-muted cursor-pointer"
                        title={isCollapsed ? 'Expand Teams' : 'Collapse Teams'}>
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: pillar.color }}>
                        {pillar.lead.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">{pillar.lead}</span>
                        <span className="text-xs text-muted font-medium">{pillar.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 text-xs text-muted">
                      <span>{pillar.teams.length} Reporting Pods</span>
                      <span className="font-bold">
                        {pillar.teams.reduce((s, t) => s + t.members, 0)} Members
                      </span>
                    </div>
                  </motion.div>

                  {/* Connector Down */}
                  {!isCollapsed && pillar.teams.length > 0 && (
                    <div className="w-0.5 h-4 bg-border-strong" />
                  )}

                  {/* Level 3: Reporting Pods / Teams */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3 w-full">
                        {pillar.teams.map((t) => (
                          <div
                            key={t.id}
                            className="bg-white/80 backdrop-blur-xs rounded-xl border border-border-subtle p-3.5 flex flex-col gap-2 hover:border-primary/40 hover:bg-white transition-all shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-foreground">{t.name}</span>
                              <span className="text-[10px] font-bold text-muted bg-surface-subtle px-1.5 py-0.5 rounded">
                                {t.projects} Projects
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted">
                              <div className="flex items-center gap-1">
                                <Briefcase size={11} className="text-primary" />
                                <span>Lead: {t.lead}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold">
                                <Users size={11} />
                                <span>{t.members}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-border-subtle shadow-soft p-8 flex flex-col gap-6 group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: team.color }}
              />
              <div className="flex items-start justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${team.color}15` }}>
                    <Users size={24} style={{ color: team.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">{team.name}</h3>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                      {team.department}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Crown size={14} />
                <span className="text-xs font-bold">{team.lead}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-muted" />
                    <span className="text-xs font-bold text-muted">{team.members} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Folder size={13} className="text-muted" />
                    <span className="text-xs font-bold text-muted">{team.projects} projects</span>
                  </div>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">View →</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Create New Team"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Team Name
            </label>
            <Input
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Team Lead
            </label>
            <Input
              placeholder="e.g. John Doe"
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Department
            </label>
            <Select
              options={DEPARTMENTS}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.value })}
              placeholder="Select department"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Initial Members
            </label>
            <Input
              type="number"
              placeholder="1"
              value={String(form.members)}
              onChange={(e) => setForm({ ...form, members: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-md!"
            />
            <Button
              label="Create Team"
              onClick={handleSubmit}
              icon="pi pi-check"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
