import { useFormBuilder } from './form-builder/hooks/useFormBuilder';
import { useFormBuilderUi } from './form-builder/hooks/useFormBuilderUi';
import { FormBuilderHeader } from './form-builder/components/FormBuilderHeader';
import { FormBuilderBanner } from './form-builder/components/FormBuilderBanner';
import { SectionCard } from './form-builder/components/SectionCard';
import { AddFieldDialog } from './form-builder/components/AddFieldDialog';
import { PreviewDialog } from './form-builder/components/PreviewDialog';

export default function FormBuilderPage() {
  const builder = useFormBuilder();
  const ui = useFormBuilderUi({ addField: builder.addField });

  return (
    <div className="space-y-6 max-w-5xl">
      <FormBuilderHeader
        isSaving={builder.isSavingApi}
        onReset={builder.resetDefaults}
        onPreview={ui.openPreview}
        onSave={builder.save}
      />

      <FormBuilderBanner activeSections={builder.sections.filter((s) => !s.hidden).length} />

      <div className="space-y-4">
        {builder.sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            totalSections={builder.sections.length}
            expanded={ui.expandedSection === section.id}
            handlers={{
              onToggleExpanded: () => ui.toggleExpanded(section.id),
              onMove: (direction) => builder.move(index, direction),
              onChangeTeam: (team) => builder.changeSectionTeam(section.id, team),
              onToggleRequired: () => builder.toggleSectionRequired(section.id),
              onToggleHidden: () => builder.toggleSectionHidden(section.id),
              onToggleFieldRequired: (fieldId) => builder.toggleFieldRequired(section.id, fieldId),
              onToggleFieldHidden: (fieldId) => builder.toggleFieldHidden(section.id, fieldId),
              onRemoveField: (fieldId) => builder.removeField(section.id, fieldId),
              onOpenAddField: () => ui.openAddField(section.id),
            }}
          />
        ))}
      </div>

      <AddFieldDialog
        visible={ui.isNewFieldModalOpen}
        draft={ui.fieldDraft}
        onChange={ui.updateDraft}
        onClose={ui.closeAddField}
        onCreate={ui.createField}
      />

      <PreviewDialog
        visible={ui.isPreviewOpen}
        sections={builder.sections}
        onClose={ui.closePreview}
      />
    </div>
  );
}
