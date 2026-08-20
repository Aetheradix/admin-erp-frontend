import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from '@/components/ui/composed/Dialog';
import { StaffCard } from './components/StaffCard';
import { StaffTableToolbar } from './components/StaffTableToolbar';
import { StaffForm } from './components/StaffForm';
import { StaffEmptyState } from './components/StaffEmptyState';
import { StaffStatsSection } from './components/StaffStatsSection';
import { useStaff } from './hooks/useStaff';
import { Sparkles } from 'lucide-react';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { useAuth } from '@/hooks/useAuth';

export function StaffList() {
  const {
    handleSubmit,
    onAddMember,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    staff,
    handleEdit,
    handleDelete,
    handlePromote,
    showForm,
    setShowForm,
    editingMember,
  } = useStaff();

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

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

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Team Directory"
        description="Empower your workforce by managing profiles, roles, and expertise in a premium unified workspace."
        primaryAction={
          isAdmin
            ? {
                label: 'Onboard Member',
                onClick: onAddMember,
                icon: 'pi pi-user-plus',
                className:
                  'px-8! py-4! rounded-lg! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
              }
            : undefined
        }
      />

      <div className="flex flex-col gap-8">
        <StaffTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
        />

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                {staff.length} Members Registered
              </h2>
              <p className="text-xs text-muted font-bold">Showing {activeDepartment} directory</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              onPromote={isAdmin ? handlePromote : undefined}
            />
          ))}

          {staff.length === 0 && <StaffEmptyState />}
        </div>
      </div>

      <StaffStatsSection />

      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingMember ? 'Revise Member Profile' : 'Onboard New Specialist'}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-10"
        headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
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
