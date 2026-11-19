import type { FormFieldConfig, FormSectionConfig } from '@/services/employeeProfileService';
import type { FieldDraft } from './types';

export function moveSection(
  sections: FormSectionConfig[],
  index: number,
  direction: 'up' | 'down'
): FormSectionConfig[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return sections;

  const next = [...sections];
  const temp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = temp;

  // Re-number the order property to match the new positions
  return next.map((s, idx) => ({ ...s, order: idx + 1 }));
}

export function generateFieldKey(draft: FieldDraft): string {
  if (draft.key.trim()) return draft.key.trim();
  return draft.label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');
}

export function buildFieldFromDraft(
  draft: FieldDraft,
  sectionId: string,
  order: number
): FormFieldConfig {
  const generatedKey = generateFieldKey(draft);
  return {
    id: `${sectionId}_${generatedKey}`,
    key: generatedKey,
    section: sectionId,
    order,
    label: draft.label.trim(),
    type: draft.type || 'text',
    required: !!draft.required,
    placeholder: draft.placeholder.trim() || undefined,
    description: draft.description.trim() || undefined,
    hidden: false,
  };
}
