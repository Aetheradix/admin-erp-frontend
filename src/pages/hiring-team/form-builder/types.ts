import type { FieldType } from '@/services/employeeProfileService';

export interface FieldDraft {
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  description: string;
}

export interface SectionHandlers {
  onToggleExpanded: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onChangeTeam: (team: string) => void;
  onToggleRequired: () => void;
  onToggleHidden: () => void;
  onToggleFieldRequired: (fieldId: string) => void;
  onToggleFieldHidden: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
  onOpenAddField: () => void;
}
