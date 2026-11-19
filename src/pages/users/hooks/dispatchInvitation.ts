import type { UserRole } from '@/config/navItems';
import type { User } from '@/types/auth';
import type { InviteForm, UserRecord } from '../types';
import {
  ADMIN_FALLBACK_EMAIL,
  ADMIN_FALLBACK_NAME,
  ADMIN_FALLBACK_ROLE,
} from '../constants';
import { buildOnboardingUrl, getInitials } from '../utils';

interface CreateInvitationPayload {
  token?: string;
  invitation?: { tempPassword?: string };
}

type CreateSystemInvitationTrigger = (body: {
  email: string;
  name: string;
  role: string;
  department: string;
  invitedBy?: { name: string; email: string; role: string };
}) => { unwrap: () => Promise<{ success: boolean; data?: unknown }> };

type GenerateInvitationTrigger = (body: { email: string; role: string }) => {
  unwrap: () => Promise<{ link?: string; tempPass?: string }>;
};

type SendInvitationTrigger = (body: { email: string; role: UserRole }) => {
  unwrap: () => Promise<unknown>;
};

type CreateStaffTrigger = (body: Partial<{
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}>) => { unwrap: () => Promise<unknown> };

interface DispatchInvitationParams {
  form: InviteForm;
  currentAuthUser: User | null;
  createSystemInvitation: CreateSystemInvitationTrigger;
  generateInvitation: GenerateInvitationTrigger;
  sendInvitation: SendInvitationTrigger;
}

export async function dispatchInvitation({
  form,
  currentAuthUser,
  createSystemInvitation,
  generateInvitation,
  sendInvitation,
}: DispatchInvitationParams): Promise<{ serverLink: string; serverPass: string }> {
  const adminActor = currentAuthUser
    ? {
        name: (currentAuthUser.username || ADMIN_FALLBACK_NAME).trim(),
        email: currentAuthUser.email || ADMIN_FALLBACK_EMAIL,
        role: currentAuthUser.role || ADMIN_FALLBACK_ROLE,
      }
    : undefined;

  let serverLink = buildOnboardingUrl(form.email);
  let serverPass = `Aether@${Math.floor(100000 + Math.random() * 900000)}!`;

  try {
    const res = await createSystemInvitation({
      email: form.email,
      name: form.name,
      role: form.role,
      department: form.department,
      invitedBy: adminActor,
    }).unwrap();
    const payload = res.data as CreateInvitationPayload | undefined;
    if (payload?.token) {
      serverLink = buildOnboardingUrl(form.email, payload.token);
    }
    if (payload?.invitation?.tempPassword) serverPass = payload.invitation.tempPassword;
  } catch {
    // Fallback: try legacy backend invitation endpoint
    try {
      const res = await generateInvitation({ email: form.email, role: form.role }).unwrap();
      if (res.link) serverLink = res.link;
      if (res.tempPass) serverPass = res.tempPass;
    } catch {
      try {
        await sendInvitation({ email: form.email, role: form.role as UserRole }).unwrap();
      } catch {
        // Both invitation backends failed; the result dialog still surfaces generated credentials.
      }
    }
  }

  return { serverLink, serverPass };
}

export async function registerStaff(
  form: InviteForm,
  createStaff: CreateStaffTrigger,
  setLocalUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>
): Promise<void> {
  try {
    await createStaff({
      name: form.name,
      email: form.email,
      role: form.role,
      department: form.department,
      status: 'Active',
    }).unwrap();
  } catch {
    setLocalUsers((prev) => [
      {
        id: Date.now(),
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        status: 'Active',
        avatar: getInitials(form.name),
        createdAt: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
  }
}
