import { useState } from 'react';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { EMPTY_FIELD_DRAFT } from '../constants';
import type { FieldDraft } from '../types';

interface UseFormBuilderUiParams {
  addField: (draft: FieldDraft, sectionId: string) => void;
}

export function useFormBuilderUi({ addField }: UseFormBuilderUiParams) {
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('personal');
  const [fieldDraft, setFieldDraft] = useState<FieldDraft>(EMPTY_FIELD_DRAFT);

  const toggleExpanded = (sectionId: string) =>
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  const openAddField = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setFieldDraft(EMPTY_FIELD_DRAFT);
    setIsNewFieldModalOpen(true);
  };

  const closeAddField = () => setIsNewFieldModalOpen(false);

  const updateDraft = (patch: Partial<FieldDraft>) =>
    setFieldDraft((prev) => ({ ...prev, ...patch }));

  const createField = () => {
    if (!fieldDraft.label.trim()) {
      showToast.error('Please enter a field label.');
      return;
    }
    addField(fieldDraft, targetSectionId);
    setIsNewFieldModalOpen(false);
  };

  return {
    expandedSection,
    toggleExpanded,
    isPreviewOpen,
    openPreview,
    closePreview,
    isNewFieldModalOpen,
    fieldDraft,
    openAddField,
    closeAddField,
    updateDraft,
    createField,
  };
}
