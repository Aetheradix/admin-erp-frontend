import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { StaffCard } from './components/StaffCard';
import { StaffTableToolbar } from './components/StaffTableToolbar';
import { StaffForm } from './components/StaffForm';
import { mockStaff as initialMockData, type StaffMember } from './hooks/mockStaff';
import { useStaffFilters } from './hooks/useStaffFilters';
import { Users, Sparkles } from 'lucide-react';

export function StaffList() {
  const [staff, setStaff] = useState<StaffMember[]>(initialMockData);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    activeDepartment, 
    setActiveDepartment,
  } = useStaffFilters();

  const filteredStaff = staff.filter((member) => {
    const matchesDepartment = activeDepartment === 'All' || member.department === activeDepartment;
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepartment && matchesSearch;
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const member = staff.find(m => m.id === id);
    if (member) {
      setEditingMember(member);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSubmit = (data: Partial<StaffMember>) => {
    if (editingMember) {
      setStaff(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...data } as StaffMember : m));
    } else {
      const newMember: StaffMember = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      } as StaffMember;
      setStaff(prev => [newMember, ...prev]);
    }
    setShowForm(false);
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
