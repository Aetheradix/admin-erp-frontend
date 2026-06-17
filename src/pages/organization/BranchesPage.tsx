import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { MapPin, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

interface Branch {
    id: number;
    name: string;
    location: string;
    head: string;
    employees: number;
    status: string;
    type: string;
}

const BRANCH_TYPES = [
    { label: 'Headquarters', value: 'Headquarters' },
    { label: 'Regional', value: 'Regional' },
    { label: 'International', value: 'International' },
    { label: 'Development', value: 'Development' },
];

const typeColors: Record<string, string> = {
    Headquarters: 'bg-primary/10 text-primary',
    Regional: 'bg-info/10 text-info',
    International: 'bg-success/10 text-success',
    Development: 'bg-warning/10 text-warning',
};

const initialBranches: Branch[] = [
    { id: 1, name: 'San Francisco HQ', location: 'San Francisco, CA', head: 'Sarah Chen', employees: 68, status: 'Active', type: 'Headquarters' },
    { id: 2, name: 'New York Office', location: 'New York, NY', head: 'James Wilson', employees: 34, status: 'Active', type: 'Regional' },
    { id: 3, name: 'London Hub', location: 'London, UK', head: 'Emily Davis', employees: 22, status: 'Active', type: 'International' },
    { id: 4, name: 'Bangalore Center', location: 'Bangalore, India', head: 'Rahul Patel', employees: 45, status: 'Active', type: 'Development' },
    { id: 5, name: 'Toronto Branch', location: 'Toronto, Canada', head: 'Mike Roberts', employees: 12, status: 'Active', type: 'Regional' },
    { id: 6, name: 'Singapore Office', location: 'Singapore', head: 'Lisa Tan', employees: 8, status: 'Setting Up', type: 'International' },
];

const emptyForm = { name: '', location: '', head: '', employees: 1, type: '' };

export function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>(initialBranches);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const handleSubmit = () => {
        if (!form.name || !form.location || !form.head || !form.type) return;
        const newBranch: Branch = {
            id: Date.now(),
            name: form.name,
            location: form.location,
            head: form.head,
            employees: form.employees,
            status: 'Setting Up',
            type: form.type,
        };
        setBranches([newBranch, ...branches]);
        setForm(emptyForm);
        setShowForm(false);
    };

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Branches" description="Manage your organization's physical locations and regional offices."
                breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Organization', url: '/org' }, { label: 'Branches' }]}
                primaryAction={{ label: 'Add Branch', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {branches.map((branch, i) => (
                    <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 flex flex-col gap-6 group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-black text-foreground tracking-tight">{branch.name}</h3>
                                <div className="flex items-center gap-1.5 text-muted"><MapPin size={14} /><span className="text-xs font-medium">{branch.location}</span></div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColors[branch.type] || 'bg-surface-subtle text-muted'}`}>{branch.type}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-muted"><User size={14} /><span className="text-xs font-bold">{branch.head}</span></div>
                            <div className="flex items-center gap-2 text-muted"><Users size={14} /><span className="text-xs font-bold">{branch.employees} people</span></div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${branch.status === 'Active' ? 'text-success' : 'text-warning'}`}>● {branch.status}</span>
                            <button className="text-xs font-bold text-primary hover:underline">Manage →</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Branch Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Add New Branch" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
            >
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Branch Name</label>
                        <Input placeholder="e.g. Berlin Office" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Location</label>
                        <Input placeholder="e.g. Berlin, Germany" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Branch Head</label>
                            <Input placeholder="e.g. John Doe" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Branch Type</label>
                            <Select options={BRANCH_TYPES} value={form.type} onChange={(e) => setForm({ ...form, type: e.value })} placeholder="Type" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Initial Employees</label>
                        <Input type="number" placeholder="1" value={String(form.employees)} onChange={(e) => setForm({ ...form, employees: Number(e.target.value) || 1 })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-xl!" />
                        <Button label="Add Branch" onClick={handleSubmit} icon="pi pi-check" className="rounded-xl! px-8!" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
