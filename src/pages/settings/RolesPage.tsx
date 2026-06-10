import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Shield, Check, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from 'primereact/dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { InputSwitch } from 'primereact/inputswitch';

interface Role {
    name: string;
    description: string;
    users: number;
    permissions: Record<string, boolean>;
}

const PERMISSION_KEYS = ['users', 'projects', 'finance', 'inventory', 'settings', 'reports'];

const initialRoles: Role[] = [
    { name: 'Super Admin', description: 'Full access to all features', users: 2, permissions: { users: true, projects: true, finance: true, inventory: true, settings: true, reports: true } },
    { name: 'Admin', description: 'Administrative access with some restrictions', users: 4, permissions: { users: true, projects: true, finance: true, inventory: true, settings: true, reports: true } },
    { name: 'Manager', description: 'Team and project management', users: 12, permissions: { users: true, projects: true, finance: false, inventory: false, settings: false, reports: true } },
    { name: 'Developer', description: 'Project and task access', users: 45, permissions: { users: false, projects: true, finance: false, inventory: false, settings: false, reports: false } },
    { name: 'Viewer', description: 'Read-only access to assigned resources', users: 28, permissions: { users: false, projects: false, finance: false, inventory: false, settings: false, reports: false } },
];

const emptyForm = { name: '', description: '', permissions: Object.fromEntries(PERMISSION_KEYS.map(k => [k, false])) };

export function RolesPage() {
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const handleSubmit = () => {
        if (!form.name) return;
        const newRole: Role = {
            name: form.name,
            description: form.description,
            users: 0,
            permissions: { ...form.permissions },
        };
        setRoles([...roles, newRole]);
        setForm(emptyForm);
        setShowForm(false);
    };

    const togglePermission = (key: string) => {
        setForm({ ...form, permissions: { ...form.permissions, [key]: !form.permissions[key] } });
    };

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Roles & Permissions" description="Manage access control for your organization."
                breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Settings', url: '/settings' }, { label: 'Roles & Permissions' }]}
                primaryAction={{ label: 'Create Role', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-subtle bg-surface-subtle/30">
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Role</th>
                            <th className="text-left px-10 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Users</th>
                            {PERMISSION_KEYS.map(k => (
                                <th key={k} className="text-center px-4 py-6 text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">{k}</th>
                            ))}
                            <th className="w-16 px-10 py-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.name} className="border-b border-border-subtle/50 hover:bg-surface-subtle/50 transition-colors">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-error/5 flex items-center justify-center text-error border border-error/10"><Shield size={18} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-foreground tracking-tight">{role.name}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground leading-tight italic">{role.description}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="px-3 py-1 bg-surface-subtle rounded-lg text-[10px] font-black inline-block uppercase text-muted tracking-widest">{role.users} users</div>
                                </td>
                                {PERMISSION_KEYS.map((key) => (
                                    <td key={key} className="px-4 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${role.permissions[key] ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-subtle/40 border-border-subtle text-muted/30'}`}>
                                                {role.permissions[key] ? <Check size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted/20" />}
                                            </div>
                                        </div>
                                    </td>
                                ))}
                                <td className="px-10 py-8">
                                    <button className="p-2 rounded-xl border border-border-subtle text-muted hover:text-primary hover:bg-primary/5 transition-all"><Edit2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Create Role Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Create New Role" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
            >
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Role Name</label>
                        <Input placeholder="e.g. Content Editor" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Description</label>
                        <Input placeholder="Brief description of this role" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">Permissions</label>
                        <div className="grid grid-cols-2 gap-3">
                            {PERMISSION_KEYS.map((key) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle">
                                    <span className="text-xs font-bold text-foreground capitalize">{key}</span>
                                    <InputSwitch checked={form.permissions[key]} onChange={() => togglePermission(key)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-xl!" />
                        <Button label="Create Role" onClick={handleSubmit} icon="pi pi-check" className="rounded-xl! px-8!" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
