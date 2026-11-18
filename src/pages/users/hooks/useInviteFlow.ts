import { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { User } from '@/types/auth';
import { ensureEmployeeProfileExists } from '@/services/employeeProfileService';
import {
  useSendInvitationMutation,
  useGenerateInvitationMutation,
  useCreateSystemInvitationMutation,
} from '@/store/api/authApiSlice';
import { useCreateStaffMutation } from '@/store/api/userSlice';
import type { InviteForm, InviteResultState, OptionItem, UserRecord } from '../types';
import { EMPTY_INVITE_FORM, EMPTY_INVITE_RESULT } from '../constants';
import { dispatchInvitation, registerStaff } from './dispatchInvitation';

interface UseInviteFlowParams {
  currentAuthUser: User | null;
  availableRoles: OptionItem[];
  availableDepartments: OptionItem[];
  setLocalUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>;
  refetchAll: () => void;
}

export function useInviteFlow({
  currentAuthUser,
  availableRoles,
  availableDepartments,
  setLocalUsers,
  refetchAll,
}: UseInviteFlowParams) {
  const [sendInvitation, { isLoading: isSendingInvite }] = useSendInvitationMutation();
  const [generateInvitation, { isLoading: isGeneratingInvite }] = useGenerateInvitationMutation();
  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
  const [createSystemInvitation] = useCreateSystemInvitationMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE_FORM);
  const [inviteResult, setInviteResult] = useState<InviteResultState>(EMPTY_INVITE_RESULT);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const linkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (linkTimerRef.current) clearTimeout(linkTimerRef.current);
      if (passTimerRef.current) clearTimeout(passTimerRef.current);
    },
    []
  );

  const openInviteForm = useCallback(() => {
    setForm({
      name: '',
      email: '',
      role: availableRoles[0]?.value || 'Employee',
      department: availableDepartments[0]?.value || 'Engineering',
    });
    setShowForm(true);
  }, [availableRoles, availableDepartments]);

  const closeInviteForm = useCallback(() => {
    setShowForm(false);
    setForm(EMPTY_INVITE_FORM);
  }, []);

  const closeInviteResult = useCallback(() => {
    setInviteResult((prev) => ({ ...prev, open: false }));
  }, []);

  const handleInviteSubmit = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      message.error('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      message.error('Please enter a valid work email address.');
      return;
    }

    try {
      const { serverLink, serverPass } = await dispatchInvitation({
        form,
        currentAuthUser,
        createSystemInvitation,
        generateInvitation,
        sendInvitation,
      });

      await registerStaff(form, createStaff, setLocalUsers);

      // Initialize employee onboarding tracking profile so Hiring Team immediately monitors them
      ensureEmployeeProfileExists(Date.now(), form.email, form.name, form.role, form.department);

      setInviteResult({
        open: true,
        email: form.email,
        role: form.role,
        link: serverLink,
        tempPass: serverPass,
      });
      message.success(`Invitation dispatched to ${form.email} and saved in the database.`);
      setShowForm(false);
      setForm(EMPTY_INVITE_FORM);
      refetchAll();
    } catch (err: unknown) {
      const detail = (err as { data?: { message?: string } } | null)?.data?.message;
      message.error(detail || 'Failed to dispatch invitation');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteResult.link);
    setCopiedLink(true);
    message.success('Invite link copied to clipboard!');
    if (linkTimerRef.current) clearTimeout(linkTimerRef.current);
    linkTimerRef.current = setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(inviteResult.tempPass);
    setCopiedPass(true);
    message.success('Temporary password copied to clipboard!');
    if (passTimerRef.current) clearTimeout(passTimerRef.current);
    passTimerRef.current = setTimeout(() => setCopiedPass(false), 2500);
  };

  return {
    showForm,
    form,
    setForm,
    inviteResult,
    copiedLink,
    copiedPass,
    openInviteForm,
    closeInviteForm,
    closeInviteResult,
    handleInviteSubmit,
    handleCopyLink,
    handleCopyPass,
    isSubmittingInvite: isSendingInvite || isGeneratingInvite || isCreatingStaff,
  };
}
