import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { StaffCard } from './components/StaffCard';
import { StaffTableToolbar } from './components/StaffTableToolbar';
import { StaffForm } from './components/StaffForm';
import { useStaffFilters } from './hooks/useStaffFilters';
import { Users, Sparkles } from 'lucide-react';

import { useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } from '@/store/api/staffApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { StaffMember } from './hooks/mockStaff';

export function StaffList() {
  const { data: staff = [], isLoading, isError } = useGetStaffQuery();
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    activeDepartment, 
    setActiveDepartment,
  } = useStaffFilters();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading staff directory. Please ensure the backend is running.
      </div>
    );
  }

  const filteredStaff = staff.filter((member: StaffMember) => {
    const matchesDepartment = activeDepartment === 'All' || member.department === activeDepartment;
    
    const name = member.username || member.name || '';
    const role = member.designation || member.role || '';
    const skills = member.skills || [];

    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepartment && matchesSearch;
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const member = staff.find((m: any) => String(m.id) === String(id));
    if (member) {
      setEditingMember({
        ...member,
        name: member.username || member.name,
        role: member.designation || member.role,
        phone: member.contact_no || member.phone,
        image: member.image_url || member.image,
        joinDate: member.join_date || member.joinDate
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await deleteStaff(id).unwrap();
        console.log('Member removed');
      } catch (err) {
        console.error('Failed to remove member', err);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        username: data.name,
        email: data.email,
        designation: data.role,
        department: data.department,
        contact_no: data.phone,
        status: data.status,
        join_date: data.joinDate,
        skills: data.skills,
        image_url: data.image
      };

      if (editingMember) {
        await updateStaff({ id: editingMember.id, ...payload }).unwrap();
      } else {
        await createStaff(payload).unwrap();
      }
      setShowForm(false);
    } catch (err) {
      console.error('Operation failed', err);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <PageHeader
        title="Team Directory"
        description="Empower your workforce by managing profiles, roles, and expertise in a premium unified workspace."
        primaryAction={{
          label: 'Onboard Member',
          onClick: handleAddMember,
          icon: 'pi pi-user-plus',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-col gap-8">
        {/* Filtering & Search Toolbar */}
        <StaffTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
          onAddNewStaff={handleAddMember}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                {filteredStaff.length} Members Registered
              </h2>
              <p className="text-xs text-muted font-bold">Showing {activeDepartment} directory</p>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredStaff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <div className="col-span-full py-32 rounded-[48px] border-2 border-dashed border-border-strong bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-surface-subtle flex items-center justify-center text-muted/30">
                <Users size={48} />
              </div>
              <div className="max-w-md px-6">
                <h3 className="text-2xl font-black text-foreground mb-2">No Members Found</h3>
                <p className="text-muted font-medium leading-relaxed">
                  We couldn't find any team members matching your search criteria. Try adjusting your filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Stats/Values (Premium touch) */}
      <div className="mt-8 p-12 rounded-[48px] bg-foreground text-white relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl flex flex-col gap-4">
            <h2 className="text-4xl font-black leading-tight tracking-tight">
              A Symphony of <br />
              <span className="text-primary">Diverse Expertise.</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Our team represents a collective of the brightest minds across multiple disciplines, 
              working together to redefine enterprise technology.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full lg:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-primary">24+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expert Skills</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-black text-primary">98%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Retention Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Form Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingMember ? "Revise Member Profile" : "Onboard New Specialist"}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[48px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' }
        }}
      >
        <StaffForm
          initialData={editingMember}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
