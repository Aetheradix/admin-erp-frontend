/* eslint-disable react-refresh/only-export-components -- column factory module, not a rendered component */
import { Download, FileText, Lock, Trash2, Unlock } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { CATEGORY_BADGE_COLORS } from '../constants';
import type { CompanyDocument } from '../types';

interface DocumentColumnOptions {
  canManageOrg: boolean;
  onToggleVisibility: (id: number | string) => void;
  onDeleteRequest: (id: number | string) => void;
}

function VisibilityBadge({ visibility }: { visibility: CompanyDocument['visibility'] }) {
  const isPublic = visibility === 'Public';
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border select-none ${
        isPublic
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      }`}>
      {isPublic ? (
        <>
          <Unlock size={12} />
          <span>Public (All Staff)</span>
        </>
      ) : (
        <>
          <Lock size={12} />
          <span>Private (Admin Only)</span>
        </>
      )}
    </span>
  );
}

export function getDocumentColumns({
  canManageOrg,
  onToggleVisibility,
  onDeleteRequest,
}: DocumentColumnOptions): ColumnsType<CompanyDocument> {
  return [
    {
      title: 'Document Name',
      key: 'title',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.title}</span>
            <span className="text-xs text-muted max-w-sm truncate">{record.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <span
          className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            CATEGORY_BADGE_COLORS[category] || 'bg-surface-subtle text-muted'
          }`}>
          {category}
        </span>
      ),
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: string) => <span className="text-xs font-mono text-muted">{size}</span>,
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => <span className="text-xs text-muted">{date}</span>,
    },
    {
      title: 'Visibility Control',
      key: 'visibility',
      render: (_, record) => {
        if (!canManageOrg) {
          return <VisibilityBadge visibility={record.visibility} />;
        }
        return (
          <button
            onClick={() => onToggleVisibility(record.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all border cursor-pointer ${
              record.visibility === 'Public'
                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
            }`}>
            {record.visibility === 'Public' ? (
              <>
                <Unlock size={12} />
                <span>Public (All Staff)</span>
              </>
            ) : (
              <>
                <Lock size={12} />
                <span>Private (Admin Only)</span>
              </>
            )}
          </button>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <a
            href={record.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors cursor-pointer"
            title="Download Document">
            <Download size={16} />
          </a>
          {canManageOrg && (
            <button
              onClick={() => onDeleteRequest(record.id)}
              className="p-2 rounded-lg hover:bg-error/10 text-muted hover:text-error transition-colors cursor-pointer"
              title="Delete Document">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];
}
