import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';

import { useGetInventoryStatsQuery, useGetInventoryItemsQuery } from '@/store/api/inventorySlice';
import {
  Layers,
  Package,
  Clock,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const StockLevelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useGetInventoryStatsQuery();
  const { data: itemsData } = useGetInventoryItemsQuery({ limit: 100 });

  const items = itemsData?.items || [];

  // Items needing attention (under maintenance, poor or fair condition)
  const maintenanceItems = items.filter((i) => i.status === 'Under Maintenance');
  const degradedItems = items.filter(
    (i) => i.condition_status === 'Poor' || i.condition_status === 'Fair'
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      <PageHeader
        title="Stock Levels & Health Overview"
        description="Category allocation, asset condition distributions, and critical inventory maintenance warnings"
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 -mt-2">
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2">
          <Package size={15} /> Assets & Resources Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/stock-levels')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black bg-primary text-white shadow-xs cursor-pointer flex items-center gap-2">
          <Layers size={15} /> Stock Health & Categories
        </button>
        <button
          type="button"
          onClick={() => navigate('/inventory/movements')}
          className="px-5 py-2.5 rounded-2xl text-xs font-black text-muted hover:text-foreground hover:bg-surface-subtle transition-all cursor-pointer flex items-center gap-2">
          <Clock size={15} /> Asset Movements & Audits
        </button>
      </div>

      {/* Valuation & Topline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-4xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 block mb-1">
              Total Capital Valuation
            </span>
            <span className="text-3xl font-black text-foreground">
              $${Number(stats?.totalValuation || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-muted block mt-1">
              Across {stats?.totalItems || 0} registered assets
            </span>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="p-6 rounded-4xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-1">
              Operational Pool
            </span>
            <span className="text-3xl font-black text-foreground">
              {stats?.availableItems || 0} Available
            </span>
            <span className="text-xs font-bold text-muted block mt-1">
              {stats?.bookableItems || 0} bookable resources online
            </span>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
        </div>

        <div className="p-6 rounded-4xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 block mb-1">
              Items Requiring Attention
            </span>
            <span className="text-3xl font-black text-foreground">
              {(stats?.maintenanceItems || 0) + degradedItems.length}
            </span>
            <span className="text-xs font-bold text-muted block mt-1">
              {stats?.maintenanceItems || 0} in repair &bull; {degradedItems.length} worn condition
            </span>
          </div>
          <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
        </div>
      </div>

      {/* Category Distribution Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-black text-foreground">Category Stock Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.categoryBreakdown?.map((cat) => {
            const count = Number(cat.count);
            const total = stats?.totalItems || 1;
            const pct = Math.round((count / total) * 100);

            return (
              <div
                key={cat.category}
                className="p-6 rounded-3xl bg-white backdrop-blur-xl border border-border-subtle shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-foreground">{cat.category}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-subtle text-muted">
                      {count} items ({pct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden mb-4">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-muted">
                    <span>Capital Invested</span>
                    <span className="text-foreground">
                      $${Number(cat.value || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border-subtle/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    View in table <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Condition Health & Maintenance Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Condition Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-xs">
          <h3 className="text-sm font-black text-foreground mb-4">Physical Condition Health</h3>
          <div className="grid grid-cols-2 gap-4">
            {stats?.conditionBreakdown?.map((c) => (
              <div
                key={c.condition_status}
                className="p-4 rounded-2xl bg-surface-subtle/50 border border-border-subtle">
                <span className="text-xs font-black uppercase text-muted block">
                  {c.condition_status} Condition
                </span>
                <span className="text-2xl font-black text-foreground block mt-1">
                  {c.count} Assets
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assets currently under maintenance */}
        <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-xs">
          <h3 className="text-sm font-black text-foreground mb-4">
            Under Maintenance Alert List ({maintenanceItems.length})
          </h3>
          {maintenanceItems.length > 0 ? (
            <div className="divide-y divide-border-subtle/60">
              {maintenanceItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-foreground block">{item.name}</span>
                    <span className="text-[11px] text-muted font-bold font-mono">
                      {item.asset_id} &bull; {item.location}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    In Service
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-bold text-muted">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
              All assets are currently in working operational order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockLevelsPage;
