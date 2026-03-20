import { UserPlus } from 'lucide-react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { Spin } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import UserCard from './components/UserCard';
import { useUserActions } from './hooks/useUserActions';

export default function UsersList() {
  const { data: staff = [], isLoading, isError } = useGetUsersQuery();
  const { handleDelete, handleUpdateRole } = useUserActions();

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Spin size="large" /></div>;
  if (isError) return <div className="p-8 text-center text-white/50">Error loading staff list</div>;

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader 
        title="Admin Panel"
        subtitle="Manage organization members and system access permissions."
        actions={
          <button className="w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
            <UserPlus size={28} />
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staff.map((p: any) => (
          <UserCard 
            key={p.id || p.key} 
            user={p} 
            onDelete={handleDelete} 
            onUpdateRole={handleUpdateRole}
          />
        ))}
      </div>
    </div>
  );
}
