import { useState, useMemo } from 'react';
import { useMatch } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Drawer,
  Empty,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  StickyNote as StickyNoteIcon,
  Plus,
  Search,
  Pin,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
  FolderKanban,
} from 'lucide-react';
import {
  useGetStickyNotesQuery,
  useCreateStickyNoteMutation,
  useUpdateStickyNoteMutation,
  useDeleteStickyNoteMutation,
  type StickyNote,
  type UpdateStickyNotePayload,
} from '@/store/api/stickyNotesApiSlice';
import { useGetRawProjectsQuery } from '@/store/api/projectApiSlice';
import { STICKY_NOTE_THEMES } from './noteColors';
import { StickyNoteCard } from './StickyNoteCard';

export function StickyNotesManager() {
  const projectMatch = useMatch('/projects/:id');
  const currentRouteProjectId =
    projectMatch?.params?.id && !isNaN(Number(projectMatch.params.id))
      ? Number(projectMatch.params.id)
      : null;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<number | 'personal' | 'all'>('all');
  const [topZ, setTopZ] = useState(20);

  const { data: projects = [] } = useGetRawProjectsQuery(undefined);

  const {
    data: activeNotes = [],
    isLoading: loadingActive,
    isError: errorActive,
    refetch: refetchActive,
  } = useGetStickyNotesQuery();

  const {
    data: archivedNotes = [],
    isLoading: loadingArchived,
    isError: errorArchived,
    refetch: refetchArchived,
  } = useGetStickyNotesQuery(
    { archived: true, search: search.trim() || undefined },
    { skip: !drawerOpen || viewMode !== 'archived' }
  );

  const [createNote, { isLoading: isCreating }] = useCreateStickyNoteMutation();
  const [updateNote] = useUpdateStickyNoteMutation();
  const [deleteNote] = useDeleteStickyNoteMutation();

  const openNotes = useMemo(
    () => activeNotes.filter((n) => n.is_open && !n.is_archived),
    [activeNotes]
  );

  const filteredDrawerNotes = useMemo(() => {
    const source = viewMode === 'archived' ? archivedNotes : activeNotes;
    const q = search.trim().toLowerCase();
    return source.filter((n) => {
      if (projectFilter === 'personal' && n.project_id) return false;
      if (typeof projectFilter === 'number' && n.project_id !== projectFilter) return false;
      if (!q) return true;
      const titleMatch = (n.title || '').toLowerCase().includes(q);
      const contentMatch = (n.content || '').replace(/<[^>]+>/g, ' ').toLowerCase().includes(q);
      const checkMatch = (n.checklist || []).some((c) => c.text.toLowerCase().includes(q));
      const projectMatchText = (n.project_name || '').toLowerCase().includes(q);
      return titleMatch || contentMatch || checkMatch || projectMatchText;
    });
  }, [activeNotes, archivedNotes, viewMode, search, projectFilter]);

  const handleCreateNote = async () => {
    try {
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      const defaultProjectId =
        typeof projectFilter === 'number'
          ? projectFilter
          : projectFilter === 'personal'
            ? null
            : currentRouteProjectId;
      await createNote({
        project_id: defaultProjectId,
        title: '',
        content: '',
        color: 'amber',
        is_open: true,
        z_index: nextZ,
      }).unwrap();
    } catch {
      message.error('Failed to create sticky note');
    }
  };

  const handleUpdateNote = async (payload: UpdateStickyNotePayload) => {
    return updateNote(payload).unwrap();
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote(id).unwrap();
      message.success('Note deleted');
    } catch {
      message.error('Failed to delete note');
    }
  };

  const handleBringToFront = (id: number) => {
    const target = activeNotes.find((n) => n.id === id);
    if (!target) return;
    if ((target.z_index || 1) >= topZ) return;
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    updateNote({ id, z_index: nextZ });
  };

  const isLoading = viewMode === 'archived' ? loadingArchived : loadingActive;
  const isError = viewMode === 'archived' ? errorArchived : errorActive;
  const refetch = viewMode === 'archived' ? refetchArchived : refetchActive;

  return (
    <>
      {/* Global Floating Trigger Button (positioned cleanly above Copilot button) */}
      <div className="fixed bottom-24 right-6 z-40">
        <Tooltip title="Sticky Notes" placement="left">
          <Badge count={openNotes.length} size="small" offset={[-4, 4]}>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open Sticky Notes"
              className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-lg hover:shadow-xl border border-amber-300 flex items-center justify-center transition-all cursor-pointer active:scale-95">
              <StickyNoteIcon size={20} />
            </button>
          </Badge>
        </Tooltip>
      </div>

      {/* Floating Open Sticky Notes Across Viewport */}
      {openNotes.map((note: StickyNote) => (
        <StickyNoteCard
          key={note.id}
          note={note}
          projects={projects}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onBringToFront={handleBringToFront}
        />
      ))}

      {/* Sticky Notes Hub Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <StickyNoteIcon size={18} className="text-amber-500" />
            <span>Sticky Notes</span>
          </div>
        }
        placement="right"
        width={380}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<Plus size={14} />}
            loading={isCreating}
            onClick={handleCreateNote}>
            New Note
          </Button>
        }>
        <div className="space-y-3">
          <Input
            prefix={<Search size={14} className="text-muted" />}
            placeholder="Search notes, checklists & projects..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            className="w-full"
            showSearch
            optionFilterProp="label"
            value={projectFilter}
            onChange={(val) => setProjectFilter(val)}
            options={[
              { value: 'all', label: 'All Notes (Personal & Projects)' },
              { value: 'personal', label: 'Personal Notes Only (No Project)' },
              ...projects.map((p) => ({
                value: p.project_id,
                label: p.project_key ? `[${p.project_key}] ${p.project_name}` : p.project_name,
              })),
            ]}
          />

          <Segmented
            block
            value={viewMode}
            onChange={(val) => setViewMode(val as 'active' | 'archived')}
            options={[
              { label: `Active (${activeNotes.length})`, value: 'active' },
              { label: 'Archived', value: 'archived' },
            ]}
          />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spin tip="Loading notes..." />
            </div>
          ) : isError ? (
            <Alert
              type="error"
              showIcon
              message="Could not load sticky notes"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : filteredDrawerNotes.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                viewMode === 'archived'
                  ? 'No archived notes'
                  : search
                    ? 'No matching notes found'
                    : 'No sticky notes yet. Create one!'
              }>
              {viewMode === 'active' && !search && (
                <Button type="primary" icon={<Plus size={14} />} onClick={handleCreateNote}>
                  Create Sticky Note
                </Button>
              )}
            </Empty>
          ) : (
            <div className="space-y-2.5">
              {filteredDrawerNotes.map((note) => {
                const theme = STICKY_NOTE_THEMES[note.color] || STICKY_NOTE_THEMES.amber;
                const plainPreview = (note.content || '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                return (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                    className="p-3 rounded-xl border shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {note.is_pinned && <Pin size={12} className="fill-current shrink-0" />}
                          <span className="text-xs font-bold truncate">
                            {note.title || 'Untitled note'}
                          </span>
                          {note.project_name ? (
                            <Tag className="text-[10px] m-0 inline-flex items-center gap-1">
                              <FolderKanban size={10} />
                              {note.project_key ? `${note.project_key} · ` : ''}
                              {note.project_name}
                            </Tag>
                          ) : (
                            <Tag className="text-[10px] m-0 opacity-75">Personal</Tag>
                          )}
                        </div>
                        <p className="text-[11px] opacity-75 line-clamp-2 mt-1 mb-0">
                          {plainPreview ||
                            (note.checklist?.length
                              ? `${note.checklist.length} checklist item(s)`
                              : 'Empty note')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-black/10">
                      <span className="text-[10px] opacity-60">
                        {note.is_open && !note.is_archived ? 'Open on screen' : 'Closed'}
                      </span>

                      <div className="flex items-center gap-1">
                        {viewMode === 'active' ? (
                          <>
                            <Tooltip title={note.is_open ? 'Bring to front' : 'Show on screen'}>
                              <Button
                                size="small"
                                type="text"
                                icon={<Eye size={13} />}
                                onClick={() => {
                                  const nextZ = topZ + 1;
                                  setTopZ(nextZ);
                                  updateNote({
                                    id: note.id,
                                    is_open: true,
                                    is_minimized: false,
                                    z_index: nextZ,
                                  });
                                }}
                              />
                            </Tooltip>
                            <Tooltip title={note.is_pinned ? 'Unpin' : 'Pin'}>
                              <Button
                                size="small"
                                type="text"
                                icon={<Pin size={13} />}
                                onClick={() =>
                                  updateNote({ id: note.id, is_pinned: !note.is_pinned })
                                }
                              />
                            </Tooltip>
                            <Tooltip title="Archive">
                              <Button
                                size="small"
                                type="text"
                                icon={<Archive size={13} />}
                                onClick={() =>
                                  updateNote({ id: note.id, is_archived: true, is_open: false })
                                }
                              />
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Restore">
                            <Button
                              size="small"
                              type="text"
                              icon={<RotateCcw size={13} />}
                              onClick={() =>
                                updateNote({ id: note.id, is_archived: false, is_open: true })
                              }
                            />
                          </Tooltip>
                        )}

                        <Popconfirm
                          title="Delete permanently?"
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDeleteNote(note.id)}>
                          <Button size="small" type="text" danger icon={<Trash2 size={13} />} />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
