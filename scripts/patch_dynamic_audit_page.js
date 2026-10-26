import fs from 'fs';

const filePath = 'd:/arx-aether-erp/admin-erp-frontend/src/pages/settings/AuditLogPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure useAuth import
if (!content.includes("import { useAuth } from '@/hooks/useAuth';")) {
  content = content.replace(
    "import { PageHeader } from '@/components/ui/composed/PageHeader';",
    "import { PageHeader } from '@/components/ui/composed/PageHeader';\nimport { useAuth } from '@/hooks/useAuth';"
  );
}

// 2. Update buildJourney signature and implementation
const oldBuildJourneyRegex =
  /function buildJourney\([\s\S]*?return \[\s*\{\s*label: 'Invitation Dispatched',[\s\S]*?logEntry: inviteSentLog,\s*\},/;
const newBuildJourneyStart = `function buildJourney(
  invitation: InvitationRecord,
  logs: AuditLogEntry[],
  currentAuthUser?: any
): JourneyStep[] {
  const email = invitation.email.toLowerCase();

  const fallbackAdminName = currentAuthUser?.username || currentAuthUser?.name || 'Hasmukh';
  const fallbackAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const fallbackAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';

  const adminName =
    invitation.invitedBy?.name &&
    invitation.invitedBy.name !== 'Sarah Chen' &&
    invitation.invitedBy.name !== 'Admin'
      ? invitation.invitedBy.name
      : fallbackAdminName;
  const adminRole =
    invitation.invitedBy?.role && invitation.invitedBy.role !== 'Admin'
      ? invitation.invitedBy.role
      : fallbackAdminRole;
  const adminEmail =
    invitation.invitedBy?.email &&
    !invitation.invitedBy.email.includes('sarah') &&
    !invitation.invitedBy.email.includes('admin@')
      ? invitation.invitedBy.email
      : fallbackAdminEmail;

  // Find relevant log entries for this email
  const inviteSentLog = logs.find(
    (l) =>
      l.category === 'invitation' &&
      l.action.toLowerCase().includes('dispatched') &&
      (l.targetEmail?.toLowerCase() === email || l.target.toLowerCase().includes(email))
  );

  const passwordLog = logs.find(
    (l) =>
      l.category === 'security' &&
      l.action.toLowerCase().includes('password') &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const onboardingCompleteLog = logs.find(
    (l) =>
      l.category === 'invitation' &&
      (l.action.toLowerCase().includes('onboarding') || l.action.toLowerCase().includes('completed')) &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const profileLog = logs.find(
    (l) =>
      l.category === 'profile' &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const isAccepted = invitation.status === 'accepted';
  const isRevoked = invitation.status === 'revoked';
  const isExpired = invitation.status === 'expired';

  return [
    {
      label: 'Invitation Dispatched',
      description: \`Dispatched by Admin \${adminName} (\${adminRole} · \${adminEmail}) to \${invitation.name || invitation.email} for role \${invitation.role} (\${invitation.department})\`,
      timestamp: invitation.invitedAt,
      status: 'done',
      icon: Mail,
      logEntry: inviteSentLog,
    },`;

content = content.replace(oldBuildJourneyRegex, newBuildJourneyStart);

// 3. Update JourneyCard to use useAuth dynamically
const oldJourneyCardRegex =
  /function JourneyCard\(\{ invitation, logs \}: \{ invitation: InvitationRecord; logs: AuditLogEntry\[\] \}\) \{[\s\S]*?const steps = buildJourney\(invitation, logs\);[\s\S]*?const doneCount = steps\.filter\(\(s\) => s\.status === 'done'\)\.length;/;
const newJourneyCardStart = `function JourneyCard({ invitation, logs }: { invitation: InvitationRecord; logs: AuditLogEntry[] }) {
  const { user: currentAuthUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const steps = buildJourney(invitation, logs, currentAuthUser);
  const doneCount = steps.filter((s) => s.status === 'done').length;

  const fallbackAdminName = currentAuthUser?.username || currentAuthUser?.name || 'Hasmukh';
  const fallbackAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const fallbackAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';

  const adminName =
    invitation.invitedBy?.name &&
    invitation.invitedBy.name !== 'Sarah Chen' &&
    invitation.invitedBy.name !== 'Admin'
      ? invitation.invitedBy.name
      : fallbackAdminName;
  const adminRole =
    invitation.invitedBy?.role && invitation.invitedBy.role !== 'Admin'
      ? invitation.invitedBy.role
      : fallbackAdminRole;
  const adminEmail =
    invitation.invitedBy?.email &&
    !invitation.invitedBy.email.includes('sarah') &&
    !invitation.invitedBy.email.includes('admin@')
      ? invitation.invitedBy.email
      : fallbackAdminEmail;`;

content = content.replace(oldJourneyCardRegex, newJourneyCardStart);

// 4. In JourneyCard header, replace invitation.invitedBy with dynamic adminName, adminRole, adminEmail
content = content.replace(
  /<strong className="text-foreground font-bold">\{invitation\.invitedBy\.name\}<\/strong>[\s\S]*?\{invitation\.invitedBy\.role \|\| 'Admin'\}[\s\S]*?\(\{invitation\.invitedBy\.email\}\)/,
  `<strong className="text-foreground font-bold">{adminName}</strong>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {adminRole}
              </span>
              <span className="text-[10px] text-muted font-mono">({adminEmail})</span>`
);

// 5. In AuditLogPage component, add currentAuthUser dynamic definitions
const oldAuditLogPageStart = 'export function AuditLogPage() {';
const newAuditLogPageStart = `export function AuditLogPage() {
  const { user: currentAuthUser } = useAuth();
  const activeAdminName = currentAuthUser?.username || currentAuthUser?.name || 'Hasmukh';
  const activeAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const activeAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';`;

if (!content.includes('const activeAdminName =')) {
  content = content.replace(oldAuditLogPageStart, newAuditLogPageStart);
}

// 6. Update getActorRole to remove hardcoded Sarah
const oldGetActorRoleRegex =
  /const getActorRole = \(record: AuditLogEntry\): string => \{[\s\S]*?return 'Staff';\s*\};/;
const newGetActorRole = `const getActorRole = (record: AuditLogEntry): string => {
    if (record.userRole) return record.userRole;
    if (
      currentAuthUser &&
      (record.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
        record.user?.toLowerCase() === currentAuthUser.username?.toLowerCase())
    ) {
      return currentAuthUser.role || 'SuperAdmin';
    }
    const inv = invitations.find(
      (i) => i.invitedBy?.email?.toLowerCase() === record.userEmail?.toLowerCase()
    );
    if (inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin') return inv.invitedBy.role;
    if (
      record.userEmail?.toLowerCase().includes('admin') ||
      record.user?.toLowerCase().includes('admin')
    ) {
      return activeAdminRole;
    }
    if (record.category === 'invitation' || record.category === 'admin') return activeAdminRole;
    return 'Staff';
  };`;

content = content.replace(oldGetActorRoleRegex, newGetActorRole);

// 7. Update Actor column rendering
const oldActorColumnRegex =
  /title: 'Actor \(Admin \/ Initiator\)',[\s\S]*?key: 'actor',[\s\S]*?render: \(_, record\) => \{[\s\S]*?return \([\s\S]*?<span className="text-\[10px\] text-muted font-mono">\{displayEmail\}<\/span>[\s\S]*?\);\s*\},/;
const newActorColumn = `title: 'Actor (Admin / Initiator)',
      key: 'actor',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const role = getActorRole(record);
        const isAdminAction = record.category === 'invitation' || record.category === 'admin';
        const isSelf =
          currentAuthUser &&
          (record.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
            record.user === currentAuthUser.username ||
            record.user === 'Sarah Chen' ||
            record.user === 'Admin');
        const displayName = isSelf
          ? activeAdminName
          : isAdminAction &&
            inv?.invitedBy?.name &&
            inv.invitedBy.name !== 'Sarah Chen' &&
            inv.invitedBy.name !== 'Admin'
          ? inv.invitedBy.name
          : record.user === 'Sarah Chen' || record.user === 'Admin'
          ? activeAdminName
          : record.user;
        const displayEmail = isSelf
          ? activeAdminEmail
          : isAdminAction &&
            inv?.invitedBy?.email &&
            !inv.invitedBy.email.includes('sarah') &&
            !inv.invitedBy.email.includes('admin@')
          ? inv.invitedBy.email
          : record.userEmail?.includes('sarah') || record.userEmail === 'admin@aetheradix.com'
          ? activeAdminEmail
          : record.userEmail;
        const displayRole =
          isAdminAction && inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin'
            ? inv.invitedBy.role
            : role;

        return (
          <div className="flex items-center gap-2.5">
            <div
              className={\`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 \${
                isAdminAction ? 'bg-primary/10 text-primary' : 'bg-surface-subtle text-muted'
              }\`}>
              {isAdminAction ? <Shield size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">{displayName}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {displayRole}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">{displayEmail}</span>
            </div>
          </div>
        );
      },`;

content = content.replace(oldActorColumnRegex, newActorColumn);

// 8. Update Target column rendering
const oldTargetColumnRegex =
  /title: 'Target \(Invitee \/ Entity\)',[\s\S]*?key: 'target',[\s\S]*?render: \(_, record\) => \{[\s\S]*?<strong className="text-foreground">\{adminName\}<\/strong>[\s\S]*?\);\s*\},/;
const newTargetColumn = `title: 'Target (Invitee / Entity)',
      key: 'target',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const adminName =
          inv?.invitedBy?.name &&
          inv.invitedBy.name !== 'Sarah Chen' &&
          inv.invitedBy.name !== 'Admin'
            ? inv.invitedBy.name
            : activeAdminName;
        const adminRole =
          inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin'
            ? inv.invitedBy.role
            : activeAdminRole;

        return (
          <div className="flex flex-col gap-1 max-w-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-semibold text-foreground tracking-wide">
                {inv?.name || record.target}
              </span>
              {inv?.role && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                  Role: {inv.role}
                </span>
              )}
            </div>
            {record.targetEmail && (
              <span className="text-[10px] text-muted font-mono truncate">
                {record.targetEmail} {inv?.department ? \`• \${inv.department}\` : ''}
              </span>
            )}
            {/* Explicit Admin Name Badge */}
            <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15 w-fit">
              <Shield size={10} className="shrink-0" />
              <span>Admin:</span>
              <strong className="text-foreground">{adminName}</strong>
              <span className="text-[8.5px] text-primary/80 uppercase">({adminRole})</span>
            </div>
          </div>
        );
      },`;

content = content.replace(oldTargetColumnRegex, newTargetColumn);

// 9. Update Modal Admin attribution
const oldModalAttributionRegex =
  /\{\(\(\) => \{[\s\S]*?const inv = getMatchingInvitation\(selectedLog\);[\s\S]*?Admin \/ Initiator[\s\S]*?<\/div>\s*\)\(\)\}/;
const newModalAttribution = `{((): any => {
              const inv = getMatchingInvitation(selectedLog);
              const actorRole = getActorRole(selectedLog);
              const isLogSelf =
                currentAuthUser &&
                (selectedLog.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
                  selectedLog.user === currentAuthUser.username ||
                  selectedLog.user === 'Sarah Chen' ||
                  selectedLog.user === 'Admin');
              const adminName =
                inv?.invitedBy?.name &&
                inv.invitedBy.name !== 'Sarah Chen' &&
                inv.invitedBy.name !== 'Admin'
                  ? inv.invitedBy.name
                  : isLogSelf
                  ? activeAdminName
                  : selectedLog.user === 'Sarah Chen' || selectedLog.user === 'Admin'
                  ? activeAdminName
                  : selectedLog.user;
              const adminEmail =
                inv?.invitedBy?.email &&
                !inv.invitedBy.email.includes('sarah') &&
                !inv.invitedBy.email.includes('admin@')
                  ? inv.invitedBy.email
                  : isLogSelf
                  ? activeAdminEmail
                  : selectedLog.userEmail?.includes('sarah') ||
                    selectedLog.userEmail === 'admin@aetheradix.com'
                  ? activeAdminEmail
                  : selectedLog.userEmail;
              const adminRole =
                inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin'
                  ? inv.invitedBy.role
                  : activeAdminRole;

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-surface-subtle to-white border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <UserPlus size={14} />
                      Admin & Invitee Attribution
                    </span>
                    {inv?.status && (
                      <span
                        className={\`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider \${invStatusBadge[inv.status]}\`}>
                        Status: {inv.status}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Admin Block */}
                    <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                        Admin / Initiator
                      </span>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {adminName}
                        <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-black uppercase border border-primary/20">
                          {adminRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted font-mono truncate">
                        {adminEmail}
                      </div>
                    </div>

                    {/* Invitee Block */}
                    <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                        Invitee (Target User)
                      </span>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {inv?.name || selectedLog.target}
                        {inv?.role && (
                          <span className="px-1.5 py-0.2 rounded bg-surface-subtle border border-border-subtle text-[9px] font-black uppercase">
                            {inv.role}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted font-mono truncate">
                        {inv?.email || selectedLog.targetEmail || selectedLog.target}
                      </div>
                      {inv?.department && (
                        <div className="text-[10px] text-muted">Department: {inv.department}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}`;

content = content.replace(oldModalAttributionRegex, newModalAttribution);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully dynamically patched AuditLogPage.tsx');
