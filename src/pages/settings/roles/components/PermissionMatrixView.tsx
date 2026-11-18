import { Check, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from 'antd';
import type { PermissionItem, RoleItem } from '@/store/api/roleApiSlice';

interface PermissionMatrixViewProps {
  roles: RoleItem[];
  modules: Record<string, PermissionItem[]>;
  currentMatrixRole: RoleItem | null;
  canEdit: boolean;
  isSuperadmin: boolean;
  onSelectRole: (roleId: number) => void;
  onTogglePermission: (permId: number) => void;
  onToggleModule: (modulePerms: PermissionItem[]) => void;
}

export function PermissionMatrixView({
  roles,
  modules,
  currentMatrixRole,
  canEdit,
  isSuperadmin,
  onSelectRole,
  onTogglePermission,
  onToggleModule,
}: PermissionMatrixViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4">
      {/* Role Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">Select Role to Inspect/Edit:</span>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const isSelected = currentMatrixRole?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/50 text-foreground border-border/60 hover:bg-muted'
                  }`}>
                  {r.is_system && <Lock className="w-3 h-3 text-amber-500" />}
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>

        {currentMatrixRole && (
          <div className="flex items-center gap-2">
            {currentMatrixRole.is_system ? (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Immutable System Role
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Custom Role (Click checkbox to toggle)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/60">
          {Object.entries(modules).map(([moduleName, modulePerms]) => {
            const currentPermIds = currentMatrixRole?.permissions.map((p) => p.id) || [];
            const allSelected = modulePerms.every((p) => currentPermIds.includes(p.id));

            return (
              <div key={moduleName} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Module Info */}
                  <div className="w-48 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground capitalize text-sm">
                        {moduleName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-semibold">
                        {modulePerms.length}
                      </span>
                    </div>
                    {canEdit && (!currentMatrixRole?.is_system || isSuperadmin) && (
                      <button
                        type="button"
                        onClick={() => onToggleModule(modulePerms)}
                        className="text-[11px] text-primary hover:underline font-semibold mt-1 block">
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    )}
                  </div>

                  {/* Action Checkboxes */}
                  <div className="flex-1 flex flex-wrap gap-3">
                    {modulePerms.map((perm) => {
                      const isGranted = currentPermIds.includes(perm.id);
                      const isEditable = canEdit && (!currentMatrixRole?.is_system || isSuperadmin);

                      return (
                        <Tooltip key={perm.id} title={perm.description || perm.name}>
                          <button
                            type="button"
                            disabled={!isEditable}
                            onClick={() => onTogglePermission(perm.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                              isGranted
                                ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-xs'
                                : 'bg-muted/30 border-border/40 text-muted-foreground hover:border-border'
                            } ${!isEditable ? 'cursor-default opacity-85' : 'cursor-pointer hover:scale-[1.02]'}`}>
                            <span
                              className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                                isGranted
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/30 bg-background'
                              }`}>
                              {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span>{perm.action}</span>
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
