import { Clock, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { InvoiceAuditLog } from '../types';

const invoiceAuditColumns: ColumnsType<InvoiceAuditLog> = [
  {
    title: 'Timestamp',
    key: 'createdAt',
    width: 190,
    render: (_, record) => (
      <span className="text-xs font-mono text-slate-600">
        {new Date(record.createdAt || '').toLocaleString()}
      </span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    width: 160,
    render: (_, record) => (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
        {record.action || ''}
      </span>
    ),
  },
  {
    title: 'Description',
    key: 'description',
    render: (_, record) => (
      <span className="text-xs text-slate-800 font-medium">
        {record.description || 'Invoice transaction recorded.'}
      </span>
    ),
  },
  {
    title: 'Admin / User',
    key: 'username',
    width: 170,
    render: (_, record) => (
      <span className="text-xs text-slate-600 font-semibold">{record.username || 'System'}</span>
    ),
  },
];

interface InvoiceAuditLogSectionProps {
  logs: InvoiceAuditLog[];
  isLoading: boolean;
  retentionCutoffLabel: string;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onClearMonth: () => void;
}

export function InvoiceAuditLogSection({
  logs,
  isLoading,
  retentionCutoffLabel,
  onExportExcel,
  onExportCsv,
  onClearMonth,
}: InvoiceAuditLogSectionProps) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900">Invoice Audit Logs</h3>
          <p className="text-xs text-slate-500">
            History of invoice updates, creations, and deletions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock size={12} /> Stored for 3 Months (Since {retentionCutoffLabel})
          </span>
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95">
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Download Excel</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95">
            <Download size={14} className="text-indigo-600" />
            <span>Download CSV</span>
          </button>
          <button
            type="button"
            onClick={onClearMonth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            title="Clear 1 month of audit logs at a time so the other 2 months remain in the system">
            <Trash2 size={14} className="text-rose-600" />
            <span>Clear Month</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <Table
          scroll={{ x: 'max-content' }}
          columns={invoiceAuditColumns}
          dataSource={logs}
          loading={isLoading}
          rowKey={(record) => String(record.id || Math.random())}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: 'No invoice audit logs found within the last 3 months.' }}
        />
      </div>
    </div>
  );
}
