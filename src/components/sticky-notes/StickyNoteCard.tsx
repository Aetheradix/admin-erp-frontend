import { useEffect, useRef, useState, useCallback } from 'react';
import { Checkbox, Input, Popconfirm, Popover, Select, Tooltip } from 'antd';
import {
  Pin,
  PinOff,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Archive,
  Trash2,
  Palette,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare,
  Plus,
  GripHorizontal,
  FolderKanban,
} from 'lucide-react';
import type {
  StickyChecklistItem,
  StickyNote,
  StickyNoteColor,
  UpdateStickyNotePayload,
} from '@/store/api/stickyNotesApiSlice';
import type { BackendProject } from '@/store/api/projectApiSlice';
import { STICKY_NOTE_COLOR_LIST, STICKY_NOTE_THEMES } from './noteColors';

interface StickyNoteCardProps {
  note: StickyNote;
  projects: BackendProject[];
  onUpdate: (payload: UpdateStickyNotePayload) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  onBringToFront: (id: number) => void;
}

export function StickyNoteCard({
  note,
  projects,
  onUpdate,
  onDelete,
  onBringToFront,
}: StickyNoteCardProps) {
  const theme = STICKY_NOTE_THEMES[note.color] || STICKY_NOTE_THEMES.amber;

  const [title, setTitle] = useState(note.title);
  const [checklist, setChecklist] = useState<StickyChecklistItem[]>(note.checklist || []);
  const [newCheckText, setNewCheckText] = useState('');
  const [showCheckInput, setShowCheckInput] = useState(false);

  const [pos, setPos] = useState({ x: note.pos_x, y: note.pos_y });
  const [size, setSize] = useState({ w: note.width, h: note.height });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const editorRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef(note.content);

  // Sync external updates (e.g. from drawer or initial load)
  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    setChecklist(note.checklist || []);
  }, [note.checklist]);

  useEffect(() => {
    setPos({ x: note.pos_x, y: note.pos_y });
    setSize({ w: note.width, h: note.height });
  }, [note.pos_x, note.pos_y, note.width, note.height]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== note.content) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = note.content || '';
        lastContentRef.current = note.content || '';
      }
    }
  }, [note.content]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const persistUpdate = useCallback(
    async (patch: Omit<UpdateStickyNotePayload, 'id'>) => {
      setSaveState('saving');
      try {
        await onUpdate({ id: note.id, ...patch });
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    },
    [note.id, onUpdate]
  );

  const scheduleSave = useCallback(
    (patch: Omit<UpdateStickyNotePayload, 'id'>, delayMs = 550) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveState('saving');
      saveTimerRef.current = setTimeout(() => {
        persistUpdate(patch);
      }, delayMs);
    },
    [persistUpdate]
  );

  // Dragging
  const handleDragStart = (e: React.PointerEvent) => {
    if (note.is_maximized) return;
    if ((e.target as HTMLElement).closest('button, input')) return;
    e.preventDefault();
    onBringToFront(note.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    let latestX = origX;
    let latestY = origY;

    const onMove = (moveEvent: PointerEvent) => {
      const maxX = Math.max(16, window.innerWidth - Math.min(size.w, window.innerWidth - 24) - 8);
      const maxY = Math.max(72, window.innerHeight - 60);
      latestX = Math.min(maxX, Math.max(8, origX + (moveEvent.clientX - startX)));
      latestY = Math.min(maxY, Math.max(68, origY + (moveEvent.clientY - startY)));
      setPos({ x: latestX, y: latestY });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (latestX !== origX || latestY !== origY) {
        persistUpdate({ pos_x: Math.round(latestX), pos_y: Math.round(latestY) });
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Resizing
  const handleResizeStart = (e: React.PointerEvent) => {
    if (note.is_maximized || note.is_minimized) return;
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(note.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const origW = size.w;
    const origH = size.h;
    let latestW = origW;
    let latestH = origH;

    const onMove = (moveEvent: PointerEvent) => {
      const maxW = Math.max(260, window.innerWidth - pos.x - 16);
      const maxH = Math.max(220, window.innerHeight - pos.y - 16);
      latestW = Math.min(maxW, Math.max(240, origW + (moveEvent.clientX - startX)));
      latestH = Math.min(maxH, Math.max(200, origH + (moveEvent.clientY - startY)));
      setSize({ w: latestW, h: latestH });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (latestW !== origW || latestH !== origH) {
        persistUpdate({ width: Math.round(latestW), height: Math.round(latestH) });
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const applyFormat = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastContentRef.current = html;
      scheduleSave({ content: html });
    }
  };

  const handleAddChecklistItem = () => {
    const trimmed = newCheckText.trim();
    if (!trimmed) return;
    const next: StickyChecklistItem[] = [
      ...checklist,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: trimmed, done: false },
    ];
    setChecklist(next);
    setNewCheckText('');
    persistUpdate({ checklist: next });
  };

  const handleToggleChecklistItem = (itemId: string) => {
    const next = checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setChecklist(next);
    persistUpdate({ checklist: next });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    const next = checklist.filter((item) => item.id !== itemId);
    setChecklist(next);
    persistUpdate({ checklist: next });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const cardStyle: React.CSSProperties = note.is_maximized
    ? {
        position: 'fixed',
        top: '10vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(680px, calc(100vw - 24px))',
        height: '76vh',
        zIndex: 1050,
        backgroundColor: theme.bg,
        borderColor: theme.border,
        color: theme.text,
      }
    : {
        position: 'fixed',
        left: isMobile ? 12 : pos.x,
        top: isMobile ? Math.max(72, Math.min(pos.y, window.innerHeight - 240)) : pos.y,
        width: isMobile ? 'calc(100vw - 24px)' : size.w,
        height: note.is_minimized ? 'auto' : size.h,
        zIndex: 900 + (note.z_index || 1),
        backgroundColor: theme.bg,
        borderColor: theme.border,
        color: theme.text,
      };

  const colorPickerContent = (
    <div className="flex items-center gap-2 p-1">
      {STICKY_NOTE_COLOR_LIST.map((c) => (
        <button
          key={c.id}
          type="button"
          title={c.label}
          onClick={() => persistUpdate({ color: c.id as StickyNoteColor })}
          className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
            note.color === c.id ? 'border-slate-900 scale-110' : 'border-white shadow-xs'
          }`}
          style={{ backgroundColor: c.swatch }}
        />
      ))}
    </div>
  );

  return (
    <div
      style={cardStyle}
      onPointerDown={() => onBringToFront(note.id)}
      className="rounded-xl border shadow-xl flex flex-col overflow-hidden transition-shadow select-none">
      {/* Header / Drag Handle */}
      <div
        onPointerDown={handleDragStart}
        style={{ backgroundColor: theme.headerBg, borderColor: theme.border }}
        className={`flex items-center justify-between gap-1.5 px-2.5 py-2 border-b ${
          note.is_maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <GripHorizontal size={14} className="opacity-50 shrink-0" />
          <input
            type="text"
            value={title}
            placeholder="Note title..."
            onChange={(e) => {
              const val = e.target.value;
              setTitle(val);
              scheduleSave({ title: val });
            }}
            className="bg-transparent border-none outline-none text-xs font-bold w-full truncate placeholder:opacity-50"
            style={{ color: theme.text }}
          />
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip title={note.is_pinned ? 'Unpin' : 'Pin'}>
            <button
              type="button"
              onClick={() => persistUpdate({ is_pinned: !note.is_pinned })}
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              {note.is_pinned ? <Pin size={13} className="fill-current" /> : <PinOff size={13} />}
            </button>
          </Tooltip>

          <Popover content={colorPickerContent} trigger="click" placement="bottomRight">
            <button
              type="button"
              title="Note color"
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              <Palette size={13} />
            </button>
          </Popover>

          <Tooltip title={note.is_minimized ? 'Restore' : 'Minimize'}>
            <button
              type="button"
              onClick={() =>
                persistUpdate({ is_minimized: !note.is_minimized, is_maximized: false })
              }
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              <Minus size={13} />
            </button>
          </Tooltip>

          <Tooltip title={note.is_maximized ? 'Restore size' : 'Maximize'}>
            <button
              type="button"
              onClick={() =>
                persistUpdate({ is_maximized: !note.is_maximized, is_minimized: false })
              }
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              {note.is_maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </Tooltip>

          <Tooltip title="Archive">
            <button
              type="button"
              onClick={() => persistUpdate({ is_archived: true, is_open: false })}
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              <Archive size={13} />
            </button>
          </Tooltip>

          <Popconfirm
            title="Delete this note?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(note.id)}>
            <button
              type="button"
              title="Delete"
              className="p-1 rounded hover:bg-red-500/15 hover:text-red-600 transition-colors cursor-pointer">
              <Trash2 size={13} />
            </button>
          </Popconfirm>

          <Tooltip title="Close (keep in hub)">
            <button
              type="button"
              onClick={() => persistUpdate({ is_open: false, is_maximized: false })}
              className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer">
              <X size={13} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Body */}
      {!note.is_minimized && (
        <>
          {/* Project Link Strip */}
          <div
            style={{ borderColor: theme.border }}
            className="flex items-center gap-1.5 px-2.5 py-1 border-b bg-black/[0.03]">
            <FolderKanban size={12} className="opacity-65 shrink-0" />
            <Select
              size="small"
              variant="borderless"
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Personal (Global note)"
              value={note.project_id ?? undefined}
              onChange={(val) => persistUpdate({ project_id: val ?? null })}
              className="w-full text-[11px]"
              popupMatchSelectWidth={220}
              options={projects.map((p) => ({
                value: p.project_id,
                label: p.project_key ? `[${p.project_key}] ${p.project_name}` : p.project_name,
              }))}
            />
          </div>

          {/* Rich Text Formatting Toolbar */}
          <div
            style={{ borderColor: theme.border }}
            className="flex items-center gap-1 px-2 py-1 border-b bg-black/[0.02]">
            <Tooltip title="Bold">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('bold')}
                className="p-1 rounded hover:bg-black/10 cursor-pointer">
                <Bold size={12} />
              </button>
            </Tooltip>
            <Tooltip title="Italic">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('italic')}
                className="p-1 rounded hover:bg-black/10 cursor-pointer">
                <Italic size={12} />
              </button>
            </Tooltip>
            <Tooltip title="Underline">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('underline')}
                className="p-1 rounded hover:bg-black/10 cursor-pointer">
                <Underline size={12} />
              </button>
            </Tooltip>
            <div className="w-px h-3.5 bg-black/15 mx-0.5" />
            <Tooltip title="Bullet list">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('insertUnorderedList')}
                className="p-1 rounded hover:bg-black/10 cursor-pointer">
                <List size={12} />
              </button>
            </Tooltip>
            <Tooltip title="Numbered list">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('insertOrderedList')}
                className="p-1 rounded hover:bg-black/10 cursor-pointer">
                <ListOrdered size={12} />
              </button>
            </Tooltip>
            <div className="w-px h-3.5 bg-black/15 mx-0.5" />
            <Tooltip title="Add checklist item">
              <button
                type="button"
                onClick={() => setShowCheckInput((s) => !s)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium hover:bg-black/10 cursor-pointer">
                <CheckSquare size={12} />
                <span>Checklist</span>
              </button>
            </Tooltip>
          </div>

          {/* Content & Checklist Area */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 select-text text-xs custom-scrollbar">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const html = e.currentTarget.innerHTML;
                lastContentRef.current = html;
                scheduleSave({ content: html });
              }}
              data-placeholder="Write a quick note..."
              className="min-h-[80px] outline-none leading-relaxed break-words [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 empty:before:content-[attr(data-placeholder)] empty:before:opacity-45"
            />

            {(checklist.length > 0 || showCheckInput) && (
              <div
                style={{ borderColor: theme.border }}
                className="pt-2 border-t border-dashed space-y-1.5">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 group">
                    <Checkbox
                      checked={item.done}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="text-xs">
                      <span
                        className={item.done ? 'line-through opacity-55' : ''}
                        style={{ color: theme.text }}>
                        {item.text}
                      </span>
                    </Checkbox>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 cursor-pointer">
                      <X size={11} />
                    </button>
                  </div>
                ))}

                {showCheckInput && (
                  <div className="flex items-center gap-1 pt-1">
                    <Input
                      size="small"
                      value={newCheckText}
                      onChange={(e) => setNewCheckText(e.target.value)}
                      onPressEnter={handleAddChecklistItem}
                      placeholder="Add checklist item..."
                      className="text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="p-1 rounded bg-black/10 hover:bg-black/20 cursor-pointer">
                      <Plus size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer + Resize Handle */}
          <div
            style={{ borderColor: theme.border }}
            className="flex items-center justify-between px-2.5 py-1 border-t text-[10px] opacity-70">
            <span>
              {saveState === 'saving' && 'Saving...'}
              {saveState === 'saved' && 'Saved'}
              {saveState === 'error' && (
                <button
                  type="button"
                  onClick={() => persistUpdate({ title, content: lastContentRef.current, checklist })}
                  className="text-red-600 font-semibold underline cursor-pointer">
                  Save failed · Retry
                </button>
              )}
              {saveState === 'idle' &&
                (checklist.length > 0
                  ? `${checklist.filter((c) => c.done).length}/${checklist.length} done`
                  : 'Autosave on')}
            </span>

            {!note.is_maximized && !isMobile && (
              <div
                onPointerDown={handleResizeStart}
                title="Drag to resize"
                className="w-3.5 h-3.5 cursor-nwse-resize flex items-end justify-end opacity-60 hover:opacity-100">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M9 1L1 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
