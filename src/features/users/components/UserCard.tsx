import React from 'react';
import { Mail, MoreHorizontal, Phone, Shield, Trash2 } from 'lucide-react';
import { Dropdown } from 'antd';

interface User {
  id: string;
  key?: string;
  name: string;
  role: string;
  status: string;
  img?: string;
}

interface UserCardProps {
  user: User;
  onDelete: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
  return (
    <div className="bg-[#1b212f] border border-white/5 rounded-[2.5rem] p-8 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-6">
        <Dropdown
          menu={{
            items: [
              {
                key: 'delete',
                label: 'Remove',
                danger: true,
                icon: <Trash2 size={14} />,
                onClick: () => onDelete(user.id || user.key!),
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
            src={user.img || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-full h-full object-cover rounded-full" 
          />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
        <p className="text-sm text-primary font-medium mb-6 uppercase tracking-widest text-[10px]">{user.role} Project Node</p>
        
        <div className="flex items-center gap-2 mb-8">
          <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500'} animate-pulse`}></span>
          <span className="text-xs text-white/30 font-bold uppercase tracking-widest">{user.status}</span>
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
