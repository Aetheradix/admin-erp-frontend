import React from 'react';
import { Crown } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { PersonListItem } from './PersonListItem';

interface OrganizationTabProps {
  manager: HierarchyNodeUser | null;
  directReports: HierarchyNodeUser[];
  peers: HierarchyNodeUser[];
  onInspectUser: (user: HierarchyNodeUser) => void;
}

export const OrganizationTab: React.FC<OrganizationTabProps> = React.memo(({
  manager,
  directReports,
  peers,
  onInspectUser,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-150">
      <div className="space-y-4">
        {/* Reporting Line Manager */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            Reporting Line Manager
          </span>
          {manager ? (
            <PersonListItem user={manager} onClick={onInspectUser} />
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
              <Crown size={15} className="text-amber-600 shrink-0" />
              <span>Direct executive line to Board of Directors</span>
            </div>
          )}
        </div>

        {/* Peers in Team */}
        {peers.length > 0 && (
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Peers in Team ({peers.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {peers.map((peer) => (
                <button
                  key={peer.id}
                  type="button"
                  onClick={() => onInspectUser(peer)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#0078d4]/10 hover:text-[#0078d4] text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  {peer.username}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direct Reports */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Direct Reports ({directReports.length})
          </span>
        </div>

        {directReports.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {directReports.map((sub) => (
              <PersonListItem key={sub.id} user={sub} onClick={onInspectUser} />
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Individual Contributor (0 direct reports)
          </div>
        )}
      </div>
    </div>
  );
});

OrganizationTab.displayName = 'OrganizationTab';
