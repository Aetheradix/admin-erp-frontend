import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DEFAULT_FORM_CONFIG,
  getFormConfiguration,
  saveFormConfiguration,
  type FormSectionConfig,
} from '@/services/employeeProfileService';
import { useSaveFormConfigurationMutation } from '@/store/api/employeeProfileApiSlice';
import { recordAuditLog } from '@/services/auditService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { FieldDraft } from '../types';
import { buildFieldFromDraft, moveSection } from '../utils';

export function useFormBuilder() {
  const { user } = useAuth();
  const [sections, setSections] = useState<FormSectionConfig[]>(() => getFormConfiguration());
  const [saveConfigApi, { isLoading: isSavingApi }] = useSaveFormConfigurationMutation();

  const move = (index: number, direction: 'up' | 'down') =>
    setSections((prev) => moveSection(prev, index, direction));

  const toggleSectionHidden = (sectionId: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, hidden: !s.hidden } : s)));
  };

  const toggleSectionRequired = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, required: !s.required } : s))
    );
  };

  const changeSectionTeam = (sectionId: string, team: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, assignedToTeam: team } : s))
    );
  };

  const toggleFieldRequired = (sectionId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: s.fields.map((f) =>
            f.id === fieldId || f.key === fieldId ? { ...f, required: !f.required } : f
          ),
        };
      })
    );
  };

  const toggleFieldHidden = (sectionId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: s.fields.map((f) =>
            f.id === fieldId || f.key === fieldId ? { ...f, hidden: !f.hidden } : f
          ),
        };
      })
    );
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: s.fields.filter((f) => f.id !== fieldId && f.key !== fieldId),
        };
      })
    );
    showToast.info('Field removed.');
  };

  const addField = (draft: FieldDraft, sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: [...s.fields, buildFieldFromDraft(draft, sectionId, s.fields.length + 1)],
        };
      })
    );
    showToast.success(`Added field "${draft.label.trim()}"`);
  };

  const save = async () => {
    try {
      saveFormConfiguration(
        sections,
        user?.username || 'Hiring Admin',
        user?.email || '',
        user?.role || 'HrAdmin'
      );
      try {
        await saveConfigApi({ sections }).unwrap();
      } catch {
        // Backend optional dual-write
      }

      recordAuditLog({
        action: 'Form Configuration Updated',
        category: 'admin',
        user: user?.username || 'Hiring Admin',
        userEmail: user?.email || '',
        target: 'Onboarding Form Builder',
        details: `Updated onboarding form fields (${sections.length} sections)`,
        status: 'Success',
      });

      showToast.success('Form configuration published successfully!');
    } catch {
      showToast.error('Failed to save form configuration.');
    }
  };

  const resetDefaults = () => {
    if (
      window.confirm(
        'Reset form configuration to default system templates? Custom fields will be reverted.'
      )
    ) {
      setSections(DEFAULT_FORM_CONFIG);
      saveFormConfiguration(DEFAULT_FORM_CONFIG);
      showToast.info('Form configuration reset to defaults.');
    }
  };

  return {
    sections,
    isSavingApi,
    move,
    toggleSectionHidden,
    toggleSectionRequired,
    changeSectionTeam,
    toggleFieldRequired,
    toggleFieldHidden,
    removeField,
    addField,
    save,
    resetDefaults,
  };
}
