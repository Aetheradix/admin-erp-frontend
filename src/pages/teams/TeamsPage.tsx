import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Users, Crown, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
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

const COLORS = ['#E8583A', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'];
const DEPARTMENTS = [
    { label: 'Technology', value: 'Technology' },
    { label: 'Creative', value: 'Creative' },
    { label: 'Growth', value: 'Growth' },
    { label: 'Revenue', value: 'Revenue' },
    { label: 'People', value: 'People' },
    { label: 'Infrastructure', value: 'Infrastructure' },
];

const initialTeams: Team[] = [
    { id: 1, name: 'Engineering', lead: 'Sarah Chen', members: 24, department: 'Technology', color: '#E8583A', projects: 8 },
    { id: 2, name: 'Design', lead: 'Maya Johnson', members: 12, department: 'Creative', color: '#8B5CF6', projects: 5 },
    { id: 3, name: 'Marketing', lead: 'Alex Rivera', members: 8, department: 'Growth', color: '#10B981', projects: 4 },
    { id: 4, name: 'Sales', lead: 'David Kim', members: 15, department: 'Revenue', color: '#F59E0B', projects: 6 },
    { id: 5, name: 'HR & Operations', lead: 'Lisa Park', members: 6, department: 'People', color: '#EC4899', projects: 3 },
    { id: 6, name: 'DevOps', lead: 'James Wu', members: 5, department: 'Infrastructure', color: '#06B6D4', projects: 7 },
];

const emptyForm = { name: '', lead: '', department: '', members: 1 };

export function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>(initialTeams);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

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
                primaryAction={{ label: 'Create Team', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Teams', value: teams.length },
                    { label: 'Total Members', value: teams.reduce((a, t) => a + t.members, 0) },
                    { label: 'Active Projects', value: teams.reduce((a, t) => a + t.projects, 0) },
                    { label: 'Departments', value: new Set(teams.map(t => t.department)).size },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-border-subtle shadow-soft flex flex-col gap-1">
                        <span className="text-2xl font-black text-foreground">{stat.value}</span>
                        <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teams.map((team, i) => (
                    <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="bg-white rounded-2xl border border-border-subtle shadow-soft p-8 flex flex-col gap-6 group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: team.color }} />
                        <div className="flex items-start justify-between pt-2">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${team.color}15` }}>
                                    <Users size={24} style={{ color: team.color }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight">{team.name}</h3>
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{team.department}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted"><Crown size={14} /><span className="text-xs font-bold">{team.lead}</span></div>
                        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5"><Users size={13} className="text-muted" /><span className="text-xs font-bold text-muted">{team.members} members</span></div>
                                <div className="flex items-center gap-1.5"><Folder size={13} className="text-muted" /><span className="text-xs font-bold text-muted">{team.projects} projects</span></div>
                            </div>
                            <button className="text-xs font-bold text-primary hover:underline">View →</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Team Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Create New Team" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
            >
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Team Name</label>
                        <Input placeholder="e.g. Engineering" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Team Lead</label>
                        <Input placeholder="e.g. John Doe" value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Department</label>
                        <Select options={DEPARTMENTS} value={form.department} onChange={(e) => setForm({ ...form, department: e.value })} placeholder="Select department" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Initial Members</label>
                        <Input type="number" placeholder="1" value={String(form.members)} onChange={(e) => setForm({ ...form, members: Number(e.target.value) || 1 })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-md!" />
                        <Button label="Create Team" onClick={handleSubmit} icon="pi pi-check" className="rounded-md! px-8!" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
