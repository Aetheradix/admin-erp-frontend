import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, Layers } from 'lucide-react';
import type { FormSectionConfig } from '@/services/employeeProfileService';
import { SECTION_ICONS, TEAM_OPTIONS } from '../constants';
import type { SectionHandlers } from '../types';
import { SectionFields } from './SectionFields';

interface SectionCardProps {
  section: FormSectionConfig;
  index: number;
  totalSections: number;
  expanded: boolean;
  handlers: SectionHandlers;
}

export function SectionCard({
  section,
  index,
  totalSections,
  expanded,
  handlers,
}: SectionCardProps) {
  const Icon = SECTION_ICONS[section.id] || Layers;

  return (
    <div
      className={`rounded-3xl border transition-all ${
        section.hidden
          ? 'bg-surface-subtle/50 border-dashed border-border-subtle opacity-70'
          : 'bg-white border-border-subtle shadow-xs'
      }`}>
      {/* Section Header Accordion */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer select-none"
          onClick={handlers.onToggleExpanded}>
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
            onChange={(e) => handlers.onChangeTeam(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            title="Assigned handling team">
            {TEAM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Toggle Required */}
          <button
            type="button"
            onClick={handlers.onToggleRequired}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              section.required
                ? 'bg-error/10 text-error border border-error/20'
                : 'bg-surface-subtle text-muted hover:text-foreground'
            }`}>
            {section.required ? 'Mandatory' : 'Optional'}
          </button>

          {/* Toggle Hidden */}
          <button
            type="button"
            onClick={handlers.onToggleHidden}
            className={`p-2 rounded-xl transition-all ${
              section.hidden
                ? 'bg-warning/10 text-warning'
                : 'bg-surface-subtle text-muted hover:text-foreground'
            }`}
            title={section.hidden ? 'Show Section' : 'Hide Section'}>
            <Eye size={15} />
          </button>

          {/* Move Up/Down */}
          <div className="flex items-center gap-1 border-l border-border-subtle pl-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => handlers.onMove('up')}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle disabled:opacity-30"
              title="Move Up">
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              disabled={index === totalSections - 1}
              onClick={() => handlers.onMove('down')}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle disabled:opacity-30"
              title="Move Down">
              <ArrowDown size={14} />
            </button>
          </div>

          <button type="button" onClick={handlers.onToggleExpanded} className="p-2 text-muted hover:text-foreground">
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Fields List */}
      {expanded && (
        <SectionFields
          section={section}
          onOpenAddField={handlers.onOpenAddField}
          onToggleFieldRequired={handlers.onToggleFieldRequired}
          onToggleFieldHidden={handlers.onToggleFieldHidden}
          onRemoveField={handlers.onRemoveField}
        />
      )}
    </div>
  );
}
