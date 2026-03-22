import { useState } from 'react';
import { User, Mail, Phone, Briefcase, Contact, ShieldCheck, Settings, LogOut, Camera, Sparkles, Edit3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Button } from '@/components/ui/primitives/Button';
import { ProfileForm } from './components/ProfileForm';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'Jonathan Reeves',
    designation: 'CEO & Founder',
    employeeId: 'AX-001-HQ',
    email: 'j.reeves@aetheradix.io',
    contactNo: '+1 (555) 012-3456',
    department: 'Executive',
    joinDate: 'Jan 2024',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO'
  });

  const handleEditSave = (updatedData: any) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="My Profile"
        description="Manage your professional identity and account security within the Aetheradix ecosystem."
        primaryAction={!isEditing ? {
          label: 'Edit Profile',
          onClick: () => setIsEditing(true),
          icon: 'pi pi-user-edit',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        } : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Sidebar */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[48px] border border-border-subtle shadow-soft flex flex-col items-center text-center gap-6 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
            
            <div className="relative mt-8">
              <div className="w-40 h-40 rounded-[40px] border-4 border-white shadow-xl overflow-hidden relative z-10 group/avatar">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                  <Camera size={32} />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-4 border-white z-20">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="flex flex-col gap-1 relative z-10">
              <h2 className="text-2xl font-black text-foreground">{user.name}</h2>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">{user.designation}</span>
            </div>

            <div className="w-full flex flex-col gap-3 pt-6 border-t border-border-subtle relative z-10">
              <Button variant="secondary" className="w-full h-12 rounded-2xl! gap-2 border-border-subtle!">
                <Settings size={16} />
                <span className="font-bold text-xs uppercase tracking-widest">Account Settings</span>
              </Button>
              <Button variant="ghost" className="w-full h-12 rounded-2xl! gap-2 text-error hover:bg-error/5 border-none!">
                <LogOut size={16} />
                <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="bg-foreground p-8 rounded-[40px] text-white flex flex-col gap-6 group overflow-hidden relative">
             <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Security Clearance</span>
             </div>
             <div className="flex flex-col gap-2 relative z-10">
                <h4 className="text-lg font-black leading-tight">V3 Access Authorized</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Your account has elevated privileges for financial approvals and staff management.
                </p>
             </div>
          </div>
        </div>

        {/* Profile Details Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[48px] border border-border-subtle shadow-soft flex flex-col gap-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                 <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Personal Information</h3>
                 <p className="text-sm font-medium text-muted-foreground italic">Essential details for identity verification and communication</p>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-primary animate-pulse">
                   <Edit3 size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Editing Mode</span>
                </div>
              )}
            </div>

            {!isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {[
                    { label: 'Full Display Name', value: user.name, icon: User },
                    { label: 'Work Email Address', value: user.email, icon: Mail },
                    { label: 'Primary Contact', value: user.contactNo, icon: Phone },
                    { label: 'Unique Employee ID', value: user.employeeId, icon: Contact },
                    { label: 'Assigned Department', value: user.department, icon: Briefcase },
                    { label: 'Company Join Date', value: user.joinDate, icon: Briefcase },
                  ].map((field) => (
                    <div key={field.label} className="flex items-start gap-4 group/field">
                      <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-muted group-hover/field:bg-primary/5 group-hover/field:text-primary transition-all duration-300">
                        <field.icon size={20} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">{field.label}</span>
                        <span className="text-sm font-bold text-foreground">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-10 border-t border-border-subtle flex items-center justify-between">
                   <p className="text-xs font-medium text-muted-foreground max-w-md">
                     * Some information is managed by the HR department. Contact the system administrator for changes to your core identity records.
                   </p>
                   <Button 
                    variant="primary" 
                    onClick={() => setIsEditing(true)}
                    className="h-12 px-8 rounded-2xl! font-black tracking-widest shadow-lg shadow-primary/20"
                   >
                     Apply for Changes
                   </Button>
                </div>
              </>
            ) : (
              <ProfileForm 
                initialData={{
                  name: user.name,
                  email: user.email,
                  contactNo: user.contactNo,
                  department: user.department,
                  designation: user.designation
                }}
                onSave={handleEditSave}
                onCancel={() => setIsEditing(false)}
              />
            )}
          </div>

          <div className="bg-surface-subtle/50 p-10 rounded-[48px] border border-dashed border-border-strong flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Active Sessions</h4>
              <p className="text-[10px] font-black text-muted uppercase tracking-wider">Security monitoring & session management</p>
            </div>
            
            <div className="flex flex-col gap-4">
               {[
                 { device: 'MacBook Pro 16" - Chrome', location: 'London, UK', status: 'Current Session' },
                 { device: 'iPhone 15 Pro - Safari', location: 'London, UK', status: 'Active 2h ago' }
               ].map((session, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-border-subtle flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-muted">
                          <Contact size={18} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground">{session.device}</span>
                          <span className="text-[10px] font-bold text-muted">{session.location}</span>
                       </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-success' : 'text-muted'}`}>
                       {session.status}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
