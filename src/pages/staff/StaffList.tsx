import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { StaffCard } from './components/StaffCard';
import { StaffTableToolbar } from './components/StaffTableToolbar';
import { StaffForm } from './components/StaffForm';
import { StaffEmptyState } from './components/StaffEmptyState';
import { StaffStatsSection } from './components/StaffStatsSection';
import { useStaff } from './hooks/useStaff';
import { Sparkles } from 'lucide-react';
import { ProgressSpinner } from 'primereact/progressspinner';

export function StaffList() {
  const {
    staff,
    isLoading,
    isError,
    showForm,
    editingMember,
    setShowForm,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    handlePromote,
    handleEdit,
    handleDelete,
    handleSubmit,
    toast,
    onAddMember
  } = useStaff();

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
      <Toast 
        ref={toast} 
        pt={{
          root: { className: 'w-full max-w-sm p-4' },
          message: (options: any) => ({
            className: `mb-4 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl ${
              options.props?.message?.severity === 'success' ? 'bg-green-50/90 border-green-200' :
              options.props?.message?.severity === 'error' ? 'bg-red-50/90 border-red-200' :
              'bg-white/90 border-gray-200'
            }`
          }),
          content: { className: 'flex items-start p-5 gap-4' },
          icon: (options: any) => ({
            className: `text-2xl mt-0.5 ${
              options.props?.message?.severity === 'success' ? 'text-green-600' :
              options.props?.message?.severity === 'error' ? 'text-red-600' :
              'text-primary'
            }`
          }),
          text: { className: 'flex-1 flex flex-col gap-1.5' },
          summary: { className: 'font-black text-gray-900 text-base tracking-tight' },
          detail: { className: 'text-sm font-medium text-gray-600' },
          closeButton: { className: 'w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center hover:bg-black/5 transition-colors text-gray-500 ml-auto' }
        }}
      />
      <PageHeader
        title="Team Directory"
        description="Empower your workforce by managing profiles, roles, and expertise in a premium unified workspace."
        primaryAction={{
          label: 'Onboard Member',
          onClick: onAddMember,
          icon: 'pi pi-user-plus',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-widest! shadow-xl! shadow-primary/20!',
        }}
      />

      <div className="flex flex-col gap-8">
        <StaffTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
          onAddNewStaff={onAddMember}
        />

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPromote={handlePromote}
            />
          ))}

          {staff.length === 0 && <StaffEmptyState />}
        </div>
      </div>

      <StaffStatsSection />

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
