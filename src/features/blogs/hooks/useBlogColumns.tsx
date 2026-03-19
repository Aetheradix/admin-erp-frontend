import { Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Edit2, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';

interface BlogType {
  key: string;
  id?: string;
  title: string;
  category: string;
  status: string;
  author: string;
  date: string;
}

export const useBlogColumns = (handleEdit: (record: any) => void, handleDelete: (id: string) => void) => {
  const columns: ColumnsType<BlogType> = [
    {
      title: 'Protocol Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-bold text-white tracking-tighter uppercase text-sm">{text}</span>,
    },
    {
      title: 'Classification',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Badge variant="muted" className="border-white/5!">{category}</Badge>,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Badge variant={status === 'Published' ? 'success' : 'muted'} className={status === 'Published' ? 'bg-emerald-500/10! text-emerald-400!' : ''}>
          {status}
        </Badge>
      ),
    },
    {
      title: 'Originator',
      dataIndex: 'author',
      key: 'author',
      render: (author) => <span className="text-white/20 text-xs font-black uppercase tracking-widest">{author}</span>,
    },
    {
      title: 'Operations',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <IconButton icon={Edit2} onClick={() => handleEdit(record)} size={14} className="bg-white/5! border-none!" />
          <IconButton 
            icon={Trash2} 
            onClick={() => handleDelete(record.id || record.key)} 
            size={14} 
            className="text-rose-400! bg-rose-500/10! border-none!" 
          />
        </Space>
      ),
    },
  ];

  return columns;
};
