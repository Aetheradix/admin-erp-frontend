import {
  Briefcase,
  Smartphone,
  Rocket,
  HardHat,
  Repeat,
  FilePlus2,
  type LucideIcon,
} from 'lucide-react';

export interface ProjectTypeTemplate {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  defaultMethodology: 'scrum' | 'kanban' | 'timeline_first';
  steps: string[];
}

export const PROJECT_TYPE_TEMPLATES: ProjectTypeTemplate[] = [
  {
    id: 'Client project',
    label: 'Client project',
    subtitle: 'Work you deliver for a client.',
    icon: Briefcase,
    iconColor: 'text-amber-500',
    defaultMethodology: 'timeline_first',
    steps: ['Plan', 'Design', 'Build', 'Test', 'Fix feedback', 'Deliver'],
  },
  {
    id: 'Product or app',
    label: 'Product or app',
    subtitle: 'Build and improve your own product.',
    icon: Smartphone,
    iconColor: 'text-indigo-500',
    defaultMethodology: 'scrum',
    steps: ['Discovery', 'Spec', 'Build', 'QA', 'Ship'],
  },
  {
    id: 'Launch or event',
    label: 'Launch or event',
    subtitle: 'Anything with a fixed date.',
    icon: Rocket,
    iconColor: 'text-rose-500',
    defaultMethodology: 'timeline_first',
    steps: ['Concept', 'Prep', 'Rehearsal', 'Launch', 'Wrap-up'],
  },
  {
    id: 'Construction or build',
    label: 'Construction or build',
    subtitle: 'Physical work, from design to handover.',
    icon: HardHat,
    iconColor: 'text-orange-500',
    defaultMethodology: 'timeline_first',
    steps: ['Site Survey', 'Design', 'Build', 'Inspection', 'Handover'],
  },
  {
    id: 'Ongoing work',
    label: 'Ongoing work',
    subtitle: 'Day-to-day work with no end. Just a board.',
    icon: Repeat,
    iconColor: 'text-emerald-500',
    defaultMethodology: 'kanban',
    steps: ['Backlog', 'In Progress', 'Review', 'Done'],
  },
  {
    id: 'Blank',
    label: 'Blank',
    subtitle: 'Start empty and add your own steps.',
    icon: FilePlus2,
    iconColor: 'text-slate-500',
    defaultMethodology: 'scrum',
    steps: [],
  },
];
