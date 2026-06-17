import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

interface Task {
    id: number;
    title: string;
    assignee: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'To Do' | 'In Progress' | 'Done';
    project: string;
}

const initialTasks: Task[] = [
    { id: 1, title: 'Design new dashboard layout', assignee: 'Maya Johnson', priority: 'High', dueDate: '2026-06-15', status: 'In Progress', project: 'Decom App' },
    { id: 2, title: 'Implement authentication flow', assignee: 'David Kim', priority: 'High', dueDate: '2026-06-12', status: 'In Progress', project: 'SkyLux' },
    { id: 3, title: 'Write API documentation', assignee: 'Alex Rivera', priority: 'Medium', dueDate: '2026-06-20', status: 'To Do', project: 'Decom App' },
    { id: 4, title: 'Database schema optimization', assignee: 'James Wu', priority: 'High', dueDate: '2026-06-11', status: 'Done', project: 'Biofarm' },
    { id: 5, title: 'User onboarding emails', assignee: 'Emily Davis', priority: 'Low', dueDate: '2026-06-25', status: 'To Do', project: 'DushMash' },
    { id: 6, title: 'Payment gateway integration', assignee: 'Sarah Chen', priority: 'High', dueDate: '2026-06-14', status: 'In Progress', project: 'PAD move' },
    { id: 7, title: 'Mobile responsive fixes', assignee: 'Maya Johnson', priority: 'Medium', dueDate: '2026-06-18', status: 'To Do', project: 'SkyLux' },
    { id: 8, title: 'Performance audit report', assignee: 'Rahul Patel', priority: 'Low', dueDate: '2026-06-22', status: 'Done', project: 'Decom App' },
    { id: 9, title: 'CI/CD pipeline setup', assignee: 'James Wu', priority: 'Medium', dueDate: '2026-06-16', status: 'In Progress', project: 'Biofarm' },
    { id: 10, title: 'Client feedback integration', assignee: 'Lisa Park', priority: 'Medium', dueDate: '2026-06-19', status: 'To Do', project: 'PAD move' },
];

const PRIORITIES = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
];

const STATUSES = [
    { label: 'To Do', value: 'To Do' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Done', value: 'Done' },
];

const PROJECTS = [
    { label: 'Decom App', value: 'Decom App' },
    { label: 'SkyLux', value: 'SkyLux' },
    { label: 'DushMash', value: 'DushMash' },
    { label: 'Biofarm', value: 'Biofarm' },
    { label: 'PAD move', value: 'PAD move' },
];

const priorityColors: Record<string, string> = {
    High: 'bg-error/10 text-error',
    Medium: 'bg-warning/10 text-warning',
    Low: 'bg-info/10 text-info',
};

const statusColors: Record<string, string> = {
    'To Do': 'bg-surface-subtle border-border-subtle',
    'In Progress': 'bg-primary/5 border-primary/20',
    Done: 'bg-success/5 border-success/20',
};

const emptyForm = { title: '', assignee: '', priority: '' as string, dueDate: '', status: 'To Do' as string, project: '' };

export function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTab, setActiveTab] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const TABS = ['All', 'To Do', 'In Progress', 'Done'];

    const filtered = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);

    const counts = {
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        Done: tasks.filter(t => t.status === 'Done').length,
    };

    const handleSubmit = () => {
        if (!form.title || !form.assignee || !form.priority || !form.project) return;
        const newTask: Task = {
            id: Date.now(),
            title: form.title,
            assignee: form.assignee,
            priority: form.priority as Task['priority'],
            dueDate: form.dueDate || new Date().toISOString().slice(0, 10),
            status: form.status as Task['status'],
            project: form.project,
        };
        setTasks([newTask, ...tasks]);
        setForm(emptyForm);
        setShowForm(false);
    };

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Tasks" description="Manage and track tasks across all projects."
                breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Tasks' }]}
                primaryAction={{ label: 'New Task', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            <div className="grid grid-cols-3 gap-6">
                {Object.entries(counts).map(([status, count]) => (
                    <div key={status} className={`rounded-xl border p-6 shadow-soft flex items-center justify-between ${statusColors[status]}`}>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-black text-foreground">{count}</span>
                            <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">{status}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-4 px-8 flex items-center justify-between">
                <span className="text-sm font-black text-foreground uppercase tracking-wider">Task Board</span>
                <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
                        className="bg-white rounded-xl border border-border-subtle shadow-soft p-7 flex flex-col gap-5 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <h3 className="text-sm font-bold text-foreground leading-snug flex-1 pr-3">{task.title}</h3>
                            <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                        <span className="text-xs font-medium text-primary/80 bg-primary/5 self-start px-3 py-1 rounded">{task.project}</span>
                        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
                            <div className="flex items-center gap-2 text-muted"><User size={13} /><span className="text-xs font-medium">{task.assignee}</span></div>
                            <div className="flex items-center gap-1.5 text-muted"><Calendar size={13} /><span className="text-xs font-medium">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* New Task Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Create New Task" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
            >
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Task Title</label>
                        <Input placeholder="e.g. Design new feature" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Assignee</label>
                            <Input placeholder="e.g. John Doe" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Due Date</label>
                            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Priority</label>
                            <Select options={PRIORITIES} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.value })} placeholder="Priority" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Status</label>
                            <Select options={STATUSES} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} placeholder="Status" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Project</label>
                            <Select options={PROJECTS} value={form.project} onChange={(e) => setForm({ ...form, project: e.value })} placeholder="Project" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-md!" />
                        <Button label="Create Task" onClick={handleSubmit} icon="pi pi-check" className="rounded-md! px-8!" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
