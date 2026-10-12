import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { useGetInventoryStatsQuery } from '@/store/api/inventorySlice';
import {
  Clock,
  Package,
  Layers,
  History,
  Search,
  FileText,
} from 'lucide-react';

export const MovementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetInventoryStatsQuery();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const audits = stats?.recentAudits || [];

  const filteredAudits = audits.filter((log) => {
    const matchesSearch =
      !search ||
      log.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.asset_id?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = !actionFilter || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionFilterOptions = [
    { label: 'All Actions', value: '' },
    { label: 'Created / Registered', value: 'CREATED' },
    { label: 'Staff Assignment', value: 'ASSIGNED' },
    { label: 'Returned to Stock', value: 'UNASSIGNED' },
    { label: 'Bookable Toggle Changed', value: 'TOGGLE_BOOKABLE' },
    { label: 'Maintenance Logged', value: 'MAINTENANCE' },
    { label: 'Resource Booked', value: 'RESOURCE_BOOKED' },
    { label: 'Asset Retired', value: 'RETIRED' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      <PageHeader
        title="Asset Movements & Audit Trail"
        description="Chronological log of asset allocations, handovers, resource reservations, and maintenance adjustments"
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 -mt-2">
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2"
        >
          <Package size={15} /> Assets & Resources Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/stock-levels')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2"
        >
          <Layers size={15} /> Stock Health & Categories
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/movements')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black bg-primary text-white shadow-xs cursor-pointer flex items-center gap-2"
        >
          <Clock size={15} /> Asset Movements & Audits
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white backdrop-blur-xl border border-border-subtle shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by asset name, ID, or activity remarks..."
            className="pl-10 h-11 text-xs"
          />
        </div>

        <div className="w-full md:w-64">
          <Select
            options={actionFilterOptions}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.value as string)}
          />
        </div>
      </div>

      {/* Audit Trail Timeline / Table */}
      <div className="rounded-4xl bg-white backdrop-blur-xl border border-border-subtle shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border-subtle">
          <h3 className="text-base font-black text-foreground">Recent Audit Log Events</h3>
          <p className="text-xs text-muted font-bold mt-0.5">
            System records tracking all operational state transitions
          </p>
        </div>

        <div className="divide-y divide-border-subtle/60">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-bold text-muted animate-pulse">
              Loading audit records...
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="p-16 text-center">
              <History size={36} className="mx-auto text-muted mb-2" />
              <p className="text-xs font-bold text-muted">No movement records found.</p>
            </div>
          ) : (
            filteredAudits.map((log) => {
              const actionColors: Record<string, string> = {
                'CREATED': 'bg-emerald-50 text-emerald-700  ',
                'ASSIGNED': 'bg-purple-50 text-purple-700  ',
                'UNASSIGNED': 'bg-blue-50 text-blue-700  ',
                'TOGGLE_BOOKABLE': 'bg-amber-50 text-amber-700  ',
                'MAINTENANCE': 'bg-rose-50 text-rose-700  ',
                'RESOURCE_BOOKED': 'bg-sky-50 text-sky-700  ',
                'RETIRED': 'bg-slate-100 text-slate-700  ',
              };

              const actionColor = actionColors[log.action] || 'bg-slate-100 text-slate-700';

              return (
                <div key={log.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-subtle/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${actionColor}`}>
                          {log.action}
                        </span>
                        <span className="font-black text-foreground text-xs">
                          {log.item_name || 'Asset Item'}
                        </span>
                        {log.asset_id && (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-subtle text-muted">
                            {log.asset_id}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted font-medium mt-1 leading-relaxed max-w-2xl">
                        {log.details || 'Operational record updated.'}
                      </p>

                      <div className="text-[11px] font-bold text-muted mt-1">
                        Recorded by: <span className="text-foreground">{log.user_name || 'System'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-muted block">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementsPage;
