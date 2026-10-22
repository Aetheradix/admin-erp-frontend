import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  CreditCard,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Camera,
  Sliders,
} from 'lucide-react';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Dialog } from '@/components/ui/composed/Dialog';
import {
  getFormConfiguration,
  saveFormConfiguration,
  DEFAULT_FORM_CONFIG,
  type FormSectionConfig,
  type FormFieldConfig,
} from '@/services/employeeProfileService';
import { useSaveFormConfigurationMutation } from '@/store/api/employeeProfileApiSlice';
import { recordAuditLog } from '@/services/auditService';
import { useAuth } from '@/hooks/useAuth';

const SECTION_ICONS: Record<string, any> = {
  personal: User,
  bank: CreditCard,
  identity: Shield,
  employment: Briefcase,
  education: GraduationCap,
  certifications: Award,
  profile_picture: Camera,
};

export default function FormBuilderPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<FormSectionConfig[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>('personal');

  // New field state
  const [newField, setNewField] = useState<Partial<FormFieldConfig>>({
    label: '',
    key: '',
    type: 'text',
    required: false,
    placeholder: '',
    description: '',
  });

  const [saveConfigApi, { isLoading: isSavingApi }] = useSaveFormConfigurationMutation();

  useEffect(() => {
    const current = getFormConfiguration();
    setSections(current);
  }, []);

  // Section Ordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update order property
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(newSections);
  };

  // Toggle Section Visibility
  const toggleSectionHidden = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, hidden: !s.hidden } : s))
    );
  };

  // Toggle Section Requirement
  const toggleSectionRequired = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, required: !s.required } : s))
    );
  };

  // Change Section Team Assignment
  const changeSectionTeam = (sectionId: string, team: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, assignedToTeam: team } : s))
    );
  };

  // Field Toggles
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

  // Add Custom Field
  const handleOpenAddField = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setNewField({
      label: '',
      key: '',
      type: 'text',
      required: false,
      placeholder: '',
      description: '',
    });
    setIsNewFieldModalOpen(true);
  };

  const handleCreateField = () => {
    if (!newField.label || !newField.label.trim()) {
      showToast.error('Please enter a field label.');
      return;
    }

    const generatedKey =
      newField.key && newField.key.trim()
        ? newField.key.trim()
        : newField.label
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_');

    const targetSection = sections.find((s) => s.id === targetSectionId);
    const nextOrder = (targetSection?.fields.length || 0) + 1;

    const fieldToAdd: FormFieldConfig = {
      id: `${targetSectionId}_${generatedKey}`,
      key: generatedKey,
      section: targetSectionId,
      order: nextOrder,
      label: newField.label.trim(),
      type: newField.type || 'text',
      required: !!newField.required,
      placeholder: newField.placeholder?.trim() || undefined,
      description: newField.description?.trim() || undefined,
      hidden: false,
    };

    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== targetSectionId) return s;
        return {
          ...s,
          fields: [...s.fields, fieldToAdd],
        };
      })
    );

    setIsNewFieldModalOpen(false);
    showToast.success(`Added field "${fieldToAdd.label}"`);
  };

  // Save Configuration
  const handleSave = async () => {
    try {
      saveFormConfiguration(sections, user?.username || 'Hiring Admin', user?.email || '', user?.role || 'HrAdmin');
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

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset form configuration to default system templates? Custom fields will be reverted.')) {
      setSections(DEFAULT_FORM_CONFIG);
      saveFormConfiguration(DEFAULT_FORM_CONFIG);
      showToast.info('Form configuration reset to defaults.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <PageHeader
        title="Dynamic Form Builder"
        subtitle="Customize sections, fields, validations, and role assignments for employee onboarding."
        back
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-xs font-bold text-muted hover:text-foreground transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-white hover:bg-surface-subtle text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
            >
              <Eye size={14} className="text-primary" />
              Preview Form
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSavingApi}
              className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              Publish Configuration
            </button>
          </div>
        }
      />

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sliders size={20} className="text-primary shrink-0" />
          <div className="text-xs text-foreground">
            <strong>Dynamic Form Engine:</strong> Changes made here take effect immediately for all pending and new employee onboarding sessions without needing backend code deployments.
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
          {sections.filter((s) => !s.hidden).length} Active Sections
        </span>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.id] || Layers;
          const isExpanded = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className={`rounded-3xl border transition-all ${
                section.hidden
                  ? 'bg-surface-subtle/50 border-dashed border-border-subtle opacity-70'
                  : 'bg-white border-border-subtle shadow-xs'
              }`}
            >
              {/* Section Header Accordion */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                >
                  <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-primary">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-foreground">{section.title}</h4>
                      {section.required && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-error bg-error/10 px-2 py-0.5 rounded-md">
                          Required
                        </span>
                      )}
                      {section.hidden && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-surface-subtle px-2 py-0.5 rounded-md">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{section.description}</p>
                  </div>
                </div>

                {/* Section Quick Controls */}
                <div className="flex items-center gap-2">
                  {/* Responsible Team Dropdown */}
                  <select
                    value={section.assignedToTeam || 'Employee'}
                    onChange={(e) => changeSectionTeam(section.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    title="Assigned handling team"
                  >
                    <option value="Employee">Team: Employee</option>
                    <option value="HiringTeam">Team: Hiring Team</option>
                    <option value="Finance">Team: Finance</option>
                    <option value="DeptHead">Team: Dept Head</option>
                  </select>

                  {/* Toggle Required */}
                  <button
                    type="button"
                    onClick={() => toggleSectionRequired(section.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      section.required
                        ? 'bg-error/10 text-error border border-error/20'
                        : 'bg-surface-subtle text-muted hover:text-foreground'
                    }`}
                  >
                    {section.required ? 'Mandatory' : 'Optional'}
                  </button>

                  {/* Toggle Hidden */}
                  <button
                    type="button"
                    onClick={() => toggleSectionHidden(section.id)}
                    className={`p-2 rounded-xl transition-all ${
                      section.hidden
                        ? 'bg-warning/10 text-warning'
                        : 'bg-surface-subtle text-muted hover:text-foreground'
                    }`}
                    title={section.hidden ? 'Show Section' : 'Hide Section'}
                  >
                    <Eye size={15} />
                  </button>

                  {/* Move Up/Down */}
                  <div className="flex items-center gap-1 border-l border-border-subtle pl-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, 'up')}
                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, 'down')}
                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="p-2 text-muted hover:text-foreground"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Fields List */}
              {isExpanded && (
                <div className="border-t border-border-subtle p-5 bg-surface-subtle/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Fields in this section ({section.fields.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddField(section.id)}
                      className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1 border border-primary/20"
                    >
                      <Plus size={13} />
                      Add Field
                    </button>
                  </div>

                  {section.fields.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white border border-border-subtle text-center text-xs text-muted">
                      No custom fields configured for this section yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.fields.map((field) => (
                        <div
                          key={field.key}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                            field.hidden
                              ? 'bg-surface-subtle border-dashed border-border-subtle opacity-60'
                              : 'bg-white border-border-subtle'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">{field.label}</span>
                              {field.required && (
                                <span className="text-error font-bold text-xs">*</span>
                              )}
                              <span className="text-[10px] font-mono text-muted bg-surface-subtle px-1.5 py-0.5 rounded">
                                {field.type}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-muted">
                              key: {field.key}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleFieldRequired(section.id, field.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                field.required
                                  ? 'bg-error/10 text-error'
                                  : 'bg-surface-subtle text-muted hover:text-foreground'
                              }`}
                              title="Toggle Required"
                            >
                              {field.required ? 'Req' : 'Opt'}
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleFieldHidden(section.id, field.id)}
                              className={`p-1.5 rounded-lg text-xs ${
                                field.hidden
                                  ? 'bg-warning/10 text-warning'
                                  : 'text-muted hover:text-foreground'
                              }`}
                              title={field.hidden ? 'Show Field' : 'Hide Field'}
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeField(section.id, field.id)}
                              className="p-1.5 rounded-lg text-muted hover:text-error transition-colors"
                              title="Delete Field"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── ADD FIELD MODAL ── */}
      <Dialog
        visible={isNewFieldModalOpen}
        onHide={() => setIsNewFieldModalOpen(false)}
        width={480}
        header={<h3 className="text-base font-black text-foreground">Add Custom Field</h3>}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Field Label *
            </label>
            <input
              type="text"
              placeholder="e.g. LinkedIn Profile URL"
              value={newField.label}
              onChange={(e) => setNewField((prev) => ({ ...prev, label: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                Field Key (Variable Name)
              </label>
              <input
                type="text"
                placeholder="e.g. linkedin_url"
                value={newField.key}
                onChange={(e) => setNewField((prev) => ({ ...prev, key: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                Field Type
              </label>
              <select
                value={newField.type}
                onChange={(e) => setNewField((prev) => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="text">Text Input</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="date">Date</option>
                <option value="textarea">Text Area</option>
                <option value="file">File Upload</option>
                <option value="select">Dropdown Select</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
              Placeholder
            </label>
            <input
              type="text"
              placeholder="e.g. https://linkedin.com/in/username"
              value={newField.placeholder}
              onChange={(e) => setNewField((prev) => ({ ...prev, placeholder: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fieldRequired"
              checked={newField.required}
              onChange={(e) => setNewField((prev) => ({ ...prev, required: e.target.checked }))}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="fieldRequired" className="text-xs font-bold text-foreground cursor-pointer">
              Mark this field as mandatory for profile submission
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsNewFieldModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateField}
              className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add Field
            </button>
          </div>
        </div>
      </Dialog>

      {/* ── PREVIEW FORM MODAL ── */}
      <Dialog
        visible={isPreviewOpen}
        onHide={() => setIsPreviewOpen(false)}
        width={750}
        header={
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-primary" />
            <h3 className="text-base font-black text-foreground">Employee Form Preview</h3>
          </div>
        }
      >
        <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-2">
          <p className="text-xs text-muted">
            This is how the onboarding form will look to employees during profile completion based on your current configuration:
          </p>

          {sections
            .filter((s) => !s.hidden)
            .map((sec) => {
              const Icon = SECTION_ICONS[sec.id] || Layers;
              return (
                <div key={sec.id} className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {sec.title} {sec.required && <span className="text-error">*</span>}
                      </h4>
                      <p className="text-[11px] text-muted">{sec.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {sec.fields
                      .filter((f) => !f.hidden)
                      .map((field) => (
                        <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                          <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                            {field.label} {field.required && <span className="text-error">*</span>}
                          </label>
                          <input
                            type="text"
                            disabled
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-xs text-muted cursor-not-allowed"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
        </div>
      </Dialog>
    </div>
  );
}
