import React from 'react';
import { Mail, MoreHorizontal, Phone, Shield, Trash2 } from 'lucide-react';
import { App, Dropdown } from 'antd';

interface User {
  id: string;
  key?: string;
  username: string;
  role: 'admin' | 'user';
  status?: string;
  img?: string;
}

interface UserCardProps {
  user: User;
  onDelete: (id: string) => void;
  onUpdateRole: (id: string, newRole: 'admin' | 'user') => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete, onUpdateRole }) => {
  const { modal } = App.useApp();
  const displayName = user.username || 'Unknown User';
  
  const handleDelete = () => {
    modal.confirm({
      title: 'Confirm Deletion',
      content: `Are you sure you want to remove ${displayName}? This action cannot be undone.`,
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'No, Keep',
      onOk: () => onDelete(user.id || user.key!),
      centered: true,
      className: 'dark-modal'
    });
  };

  return (
    <div className="bg-[#1b212f] border border-white/5 rounded-[2.5rem] p-8 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-6">
        <Dropdown
          menu={{
            items: [
              {
                key: 'role',
                label: user.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin',
                icon: <Shield size={14} />,
                onClick: () => onUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin'),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Remove',
                danger: true,
                icon: <Trash2 size={14} />,
                onClick: handleDelete,
              },
            ],
            className: 'dark-dropdown',
          }}
          trigger={['click']}
        >
          <button className="text-white/20 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </Dropdown>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/5 p-1 mb-6 group-hover:border-primary/40 transition-all duration-500 overflow-hidden">
          <img 
            src={user.img || `https://api.dicebear.com/7.x/notionists/svg?seed=${displayName}`} 
            alt={displayName} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
        <p className="text-sm text-primary font-medium mb-6 uppercase tracking-widest text-[10px]">{user.role} Node</p>
        
        <div className="flex items-center gap-2 mb-8">
          <span className={`w-2 h-2 rounded-full ${user.status !== 'Inactive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500'} animate-pulse`}></span>
          <span className="text-xs text-white/30 font-bold uppercase tracking-widest">{user.status || 'Active'}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {[Mail, Phone, Shield].map((Icon, idx) => (
            <button key={idx} className="h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all border border-white/5 hover:border-white">
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
