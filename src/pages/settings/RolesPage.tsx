import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Shield, Check, Edit2, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { InputSwitch } from '@/components/ui/primitives/Switch';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { initialUsers } from '@/pages/users/UsersPage';

interface Role {
    name: string;
    description: string;
    users: number;
    permissions: Record<string, boolean>;
}

const PERMISSION_KEYS = ['users', 'projects', 'finance', 'inventory', 'settings', 'reports'];

const initialRoles: Role[] = [
    { name: 'Super Admin', description: 'Full access to all features', users: initialUsers.filter(u => u.role === 'Super Admin').length, permissions: { users: true, projects: true, finance: true, inventory: true, settings: true, reports: true } },
    { name: 'Admin', description: 'Administrative access with some restrictions', users: initialUsers.filter(u => u.role === 'Admin').length, permissions: { users: true, projects: true, finance: true, inventory: true, settings: true, reports: true } },
    { name: 'Manager', description: 'Team and project management', users: initialUsers.filter(u => u.role === 'Manager').length, permissions: { users: true, projects: true, finance: false, inventory: false, settings: false, reports: true } },
    { name: 'Developer', description: 'Project and task access', users: initialUsers.filter(u => u.role === 'Developer').length, permissions: { users: false, projects: true, finance: false, inventory: false, settings: false, reports: false } },
    { name: 'Viewer', description: 'Read-only access to assigned resources', users: initialUsers.filter(u => u.role === 'Viewer').length, permissions: { users: false, projects: false, finance: false, inventory: false, settings: false, reports: false } },
];




const emptyForm = { name: '', description: '', permissions: Object.fromEntries(PERMISSION_KEYS.map(k => [k, false])) };

export function RolesPage() {
  //  const [autoApprove,setAutoApprove] = useState(false);
    const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('erp_roles');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return initialRoles;
            }
        }
        return initialRoles;
    });

 

    const [sectionConfig, setSectionConfig] = useState(() => {
        const saved = localStorage.getItem('erp_sections_config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // fall through
            }
        }
        return {
            maxSections: 12,
            visibleSections: Object.fromEntries(
                ['Dashboard', 'Check-In', 'Organization', 'Teams', 'Team', 'Tasks', 'Finance', 'Inventory', 'Blogs', 'Gallery', 'Analytics', 'Settings'].map(s => [s, true])
            )
        };
    });

    useEffect(() => {
        localStorage.setItem('erp_roles', JSON.stringify(roles));
        window.dispatchEvent(new Event('erp_config_changed'));
    }, [roles]);

    useEffect(() => {
        localStorage.setItem('erp_sections_config', JSON.stringify(sectionConfig));
        window.dispatchEvent(new Event('erp_config_changed'));
    }, [sectionConfig]);

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

    const toggleRolePermission = (roleName: string, permissionKey: string) => {
        setRoles(roles.map(role =>
            role.name === roleName
                ? { ...role, permissions: { ...role.permissions, [permissionKey]: !role.permissions[permissionKey] } }
                : role
        ));
    };

    const columns: ColumnsType<Role> = [
        {
            title: 'Role',
            key: 'role',
            render: (_: unknown, record: Role) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-error/5 flex items-center justify-center text-error border border-error/10"><Shield size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-base font-black text-foreground tracking-tight">{record.name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground leading-tight italic">{record.description}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Users',
            dataIndex: 'users',
            key: 'users',
            render: (users) => (
                <div className="px-3 py-1 bg-surface-subtle rounded-lg text-[10px] font-black inline-block uppercase text-muted tracking-widest">{users} users</div>
            ),
        },
        ...PERMISSION_KEYS.map(key => ({
            title: key,
            dataIndex: ['permissions', key],
            key,
            align: 'center' as const,
            render: (allowed: boolean, record: Role) => (
                <div className="flex justify-center">
                    <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors cursor-pointer hover:opacity-80 ${allowed ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-subtle/40 border-border-subtle text-muted/30 hover:border-primary/30 hover:bg-surface-subtle'}`}
                        onClick={() => toggleRolePermission(record.name, key)}
                    >
                        {allowed ? <Check size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted/20" />}
                    </div>
                </div>
            ),
        })),
        {
            title: '',
            key: 'action',
            width: 80,
            render: () => (
                <button className="p-2 rounded-md border border-border-subtle text-muted hover:text-primary hover:bg-primary/5 transition-all">
                    <Edit2 size={16} />
                </button>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader title="Roles & Permissions" description="Manage access control for your organization."
                breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Settings', url: '/settings' }, { label: 'Roles & Permissions' }]}
                primaryAction={{ label: 'Create Role', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
            />

            {/* Admin Section Configuration Controls */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl border border-border-subtle shadow-soft p-8 flex flex-col gap-6"
            >
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                        <Sliders size={20} className="text-primary" />
                        Admin Section Control Center
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Configure global visibility settings for sidebar sections and limit the maximum number of sections displayed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border-subtle/50">
                    {/* Max Sections Slider */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-muted uppercase tracking-[0.1em]">Max display count</span>
                            <span className="px-3 py-1 bg-primary/10 text-primary font-black rounded-lg text-xs">{sectionConfig.maxSections} Sections</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            value={sectionConfig.maxSections}
                            onChange={(e) => setSectionConfig({ ...sectionConfig, maxSections: parseInt(e.target.value) })}
                            className="w-full accent-primary h-2 bg-surface-subtle rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] text-muted italic">Limits the count of displayed navigation items in the sidebar.</span>
                    </div>

                    {/* Section Visibility Toggles */}
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-extrabold text-muted uppercase tracking-[0.1em]">Global Visibility Toggles</span>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(sectionConfig.visibleSections).map((key) => {
                                const active = sectionConfig.visibleSections[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSectionConfig({
                                                ...sectionConfig,
                                                visibleSections: {
                                                    ...sectionConfig.visibleSections,
                                                    [key]: !active
                                                }
                                            });
                                        }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${active
                                            ? 'bg-primary/5 border-primary/20 text-primary'
                                            : 'bg-surface-subtle/40 border-border-subtle text-muted hover:border-muted/30'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary' : 'bg-muted/40'}`} />
                                        {key}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="name"
                    pagination={false}
                    className="premium-table"
                />
            </motion.div>

            {/* Create Role Dialog */}
            <Dialog visible={showForm} onHide={() => setShowForm(false)} header="Create New Role" modal
                className="w-full max-w-xl mx-4" contentClassName="p-8" headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
                pt={{ root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' }, mask: { className: 'backdrop-blur-md bg-black/40' } }}
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
                                <div key={key} className="flex items-center justify-between p-3 rounded-md bg-surface-subtle">
                                    <span className="text-xs font-bold text-foreground capitalize">{key}</span>
                                    <InputSwitch checked={form.permissions[key]} onChange={() => togglePermission(key)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
                        <Button variant="ghost" label="Cancel" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-md!" />
                        <Button label="Create Role" onClick={handleSubmit} icon="pi pi-check" className="rounded-md! px-8!" />
                    </div>
                </div>
            </Dialog>
      
        </div>
    );
}
