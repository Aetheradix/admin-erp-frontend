import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Select, message } from 'antd';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Briefcase,
  GitBranch,
  HelpCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  useGetLeaveApproverConfigQuery,
  useUpdateLeaveApproverConfigMutation,
} from '@/store/api/leaveSlice';
import { useGetRolesQuery } from '@/store/api/roleApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';

interface LeaveApproverConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LeaveApproverConfigModal({ visible, onClose }: LeaveApproverConfigModalProps) {
  const { data: configData, refetch } = useGetLeaveApproverConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateLeaveApproverConfigMutation();

  const { data: rolesData } = useGetRolesQuery();
  const { data: usersData } = useGetUsersQuery();

  const currentConfig = configData?.data;

  const [ruleType, setRuleType] = useState<string>('default_founder');
  const [targetRoleId, setTargetRoleId] = useState<number | null>(null);
  const [specificUserId, setSpecificUserId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (currentConfig) {
      setRuleType(currentConfig.rule_type || 'default_founder');
      setTargetRoleId(currentConfig.target_role_id || null);
      setSpecificUserId(currentConfig.specific_user_id || null);
      setDescription(currentConfig.description || '');
    }
  }, [currentConfig, visible]);

  const roles = rolesData?.data || [];
  const users = usersData || [];

  const handleSave = async () => {
    try {
      if (ruleType === 'specific_user' && !specificUserId) {
        message.error('Please select an authorized user for leave approvals.');
        return;
      }
      if (ruleType === 'role' && !targetRoleId) {
        message.error('Please select an authorized role for leave approvals.');
        return;
      }

      await updateConfig({
        rule_type: ruleType,
        target_role_id: ruleType === 'role' ? targetRoleId : null,
        specific_user_id: ruleType === 'specific_user' ? specificUserId : null,
        description: description || `Rule: ${ruleType}`,
      }).unwrap();

      message.success('Leave approver workflow updated successfully!');
      refetch();
      onClose();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update leave approver configuration.');
    }
  };

  const ruleOptions = [
    {
      value: 'default_founder',
      title: 'Founder / Primary Executive (Default)',
      description: 'By default, company Founder or System Executive is assigned as primary Leave Approver.',
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    },
    {
      value: 'reporting_manager',
      title: 'Direct Reporting Manager (Hierarchy)',
      description: "Dynamically assigns each employee's direct reporting manager based on the organizational hierarchy.",
      icon: <GitBranch className="w-5 h-5 text-indigo-500" />,
    },
    {
      value: 'hr',
      title: 'Human Resources (HR)',
      description: 'Authorized HR managers responsible for personnel and leaves process all approvals.',
      icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
    },
    {
      value: 'specific_user',
      title: 'Specific Authorized Person',
      description: 'Assign a designated individual within the company as the single leave authority.',
      icon: <UserCheck className="w-5 h-5 text-amber-500" />,
    },
    {
      value: 'role',
      title: 'Authorized Role Group',
      description: 'Any active member holding the selected role is empowered to approve requests.',
      icon: <Users className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      header="Leave Approver & Workflow Management"
      className="max-w-2xl">
      <div className="space-y-6 pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Configure how leave and WFH requests are routed for administrative review. Rules can route requests
          to the <strong>Founder</strong>, <strong>HR</strong>, the employee's <strong>Direct Manager</strong> in the organization hierarchy, or a custom approver.
        </p>

        {/* Rule Selector Options */}
        <div className="space-y-3">
          <label className="text-xs font-black text-foreground uppercase tracking-wider block">
            Select Active Approval Routing Strategy
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {ruleOptions.map((opt) => {
              const isSelected = ruleType === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setRuleType(opt.value)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs'
                      : 'border-border/60 hover:border-primary/40 hover:bg-muted/30 bg-card'
                  }`}>
                  <div className="mt-0.5 shrink-0">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-foreground">{opt.title}</h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Condition: Specific User Selection */}
        {ruleType === 'specific_user' && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 animate-in fade-in">
            <label className="text-xs font-bold text-foreground block">
              Designate Authorized Approver *
            </label>
            <Select
              showSearch
              placeholder="Select an employee or manager..."
              className="w-full"
              value={specificUserId || undefined}
              onChange={(val) => setSpecificUserId(Number(val))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((u: any) => ({
                value: u.id,
                label: `${u.name || u.username} (${u.email}) -- ${u.role || 'Staff'}`,
              }))}
            />
          </div>
        )}

        {/* Dynamic Condition: Role Selection */}
        {ruleType === 'role' && (
          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 animate-in fade-in">
            <label className="text-xs font-bold text-foreground block">
              Designate Authorized Role *
            </label>
            <Select
              placeholder="Select a role..."
              className="w-full"
              value={targetRoleId || undefined}
              onChange={(val) => setTargetRoleId(Number(val))}
              options={roles.map((r) => ({
                value: r.id,
                label: `${r.name} (${r.description || 'System Role'})`,
              }))}
            />
          </div>
        )}

        {/* Explanatory Fallback Note */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Dynamic Fallback Guarantee:</strong> If an employee has no assigned reporting manager or the designated approver is unavailable, requests automatically fall back to the Founder / SuperAdmin to ensure no request remains unaddressed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button variant="ghost" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isUpdating}
            className="gap-2 px-6">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

