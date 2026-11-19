import type { DataNode } from 'antd/es/tree';
import { Crown, Edit2, UserCheck } from 'lucide-react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import { getDepartmentColor } from '../../utils/orgLayoutEngine';

interface BuildHierarchyTreeOptions {
  canManageHierarchy: boolean;
  onSelectEmployee: (user: HierarchyNodeUser) => void;
  onEditManager: (user: HierarchyNodeUser) => void;
}

function buildUnassignedNode(node: HierarchyNodeUser, mapNode: MapNode): DataNode {
  return {
    key: String(node.id),
    title: (
      <div className="inline-flex items-center justify-between gap-4 p-3 my-1 rounded-2xl bg-amber-50/70 border-2 border-dashed border-amber-300 hover:border-amber-400 transition-all w-full max-w-4xl shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 font-bold text-xs flex items-center justify-center shrink-0 text-amber-800">
            <UserCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-950 text-xs">{node.username}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                {node.directReports?.length || 0} Staff
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
              {node.designation}
            </span>
          </div>
        </div>
      </div>
    ),
    children: (node.directReports || []).map(mapNode),
  };
}

function buildEmployeeNode(
  node: HierarchyNodeUser,
  mapNode: MapNode,
  { canManageHierarchy, onSelectEmployee, onEditManager }: BuildHierarchyTreeOptions
): DataNode {
  // Founder/CEO styling is based on designation (job title), not the RBAC role.
  const isFounder = Boolean(
    !node.reporting_manager_id &&
      (node.designation?.toLowerCase().includes('founder') ||
        node.designation?.toLowerCase().includes('ceo'))
  );
  const reports = node.directReports ?? [];
  const hasReports = reports.length > 0;
  const deptColor = getDepartmentColor(node.department);

  return {
    key: String(node.id),
    title: (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelectEmployee(node);
        }}
        className="inline-flex items-center justify-between gap-4 p-3 my-1 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all w-full max-w-4xl shadow-xs cursor-pointer group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {node.image_url ? (
            <img
              src={node.image_url}
              alt={node.username}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                isFounder ? 'bg-amber-500 text-white shadow-amber-200' : 'text-white'
              }`}
              style={!isFounder ? { backgroundColor: deptColor.text } : {}}>
              {isFounder ? (
                <Crown size={16} className="text-white" />
              ) : node.username ? (
                node.username.slice(0, 2).toUpperCase()
              ) : (
                'U'
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-xs group-hover:text-primary transition-colors">
                {node.username}
              </span>
              {isFounder ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                  <Crown size={10} className="text-amber-600" /> {node.designation || 'Founder & CEO'}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {node.role || node.designation || 'Staff'}
                </span>
              )}
              {node.department && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: deptColor.bg, color: deptColor.text }}>
                  {node.department}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px] truncate">
              <span className="truncate">{node.email}</span>
              {node.designation && (
                <span className="text-slate-400 shrink-0">• {node.designation}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {hasReports && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
              {reports.length} {reports.length === 1 ? 'Direct Report' : 'Direct Reports'}
            </span>
          )}
          {canManageHierarchy && (
            <button
              type="button"
              onClick={() => onEditManager(node)}
              title="Change Reporting Manager"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer">
              <Edit2 size={12} />
            </button>
          )}
        </div>
      </div>
    ),
    children: hasReports ? reports.map(mapNode) : undefined,
  };
}

type MapNode = (node: HierarchyNodeUser) => DataNode;

export function buildHierarchyTreeData(
  filteredTree: HierarchyNodeUser[],
  options: BuildHierarchyTreeOptions
): DataNode[] {
  const mapNode: MapNode = (node) =>
    node.id === -999
      ? buildUnassignedNode(node, mapNode)
      : buildEmployeeNode(node, mapNode, options);
  return filteredTree.map(mapNode);
}
