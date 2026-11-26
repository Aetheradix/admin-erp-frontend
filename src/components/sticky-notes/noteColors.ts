import type { StickyNoteColor } from '@/store/api/stickyNotesApiSlice';

export interface NoteTheme {
  id: StickyNoteColor;
  label: string;
  swatch: string;
  bg: string;
  headerBg: string;
  border: string;
  text: string;
}

export const STICKY_NOTE_THEMES: Record<StickyNoteColor, NoteTheme> = {
  amber: {
    id: 'amber',
    label: 'Amber',
    swatch: '#f59e0b',
    bg: '#fffbeb',
    headerBg: '#fef3c7',
    border: '#fcd34d',
    text: '#451a03',
  },
  blue: {
    id: 'blue',
    label: 'Sky',
    swatch: '#3b82f6',
    bg: '#eff6ff',
    headerBg: '#dbeafe',
    border: '#93c5fd',
    text: '#172554',
  },
  emerald: {
    id: 'emerald',
    label: 'Mint',
    swatch: '#10b981',
    bg: '#ecfdf5',
    headerBg: '#d1fae5',
    border: '#6ee7b7',
    text: '#022c22',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    swatch: '#f43f5e',
    bg: '#fff1f2',
    headerBg: '#ffe4e6',
    border: '#fda4af',
    text: '#4c0519',
  },
  violet: {
    id: 'violet',
    label: 'Lavender',
    swatch: '#8b5cf6',
    bg: '#f5f3ff',
    headerBg: '#ede9fe',
    border: '#c4b5fd',
    text: '#2e1065',
  },
  slate: {
    id: 'slate',
    label: 'Graphite',
    swatch: '#64748b',
    bg: '#f8fafc',
    headerBg: '#e2e8f0',
    border: '#cbd5e1',
    text: '#0f172a',
  },
};

export const STICKY_NOTE_COLOR_LIST = Object.values(STICKY_NOTE_THEMES);
