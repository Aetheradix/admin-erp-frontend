import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Lock,
  MessageSquare,
  Users,
  Plus,
  Search,
  Send,
  Smile,
  Paperclip,
  Edit2,
  Trash2,
  Pin,
  Reply,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  UserPlus,
  AtSign,
  Check,
  Copy,
  Briefcase,
} from 'lucide-react';
import { message as antMessage } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useReactToMessageMutation,
  usePinMessageMutation,
  useMarkChannelReadMutation,
  type Channel,
  type ChatMessage,
  type ChannelType,
} from '@/store/api/chatSlice';

// ─── Helpers ────────────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<ChannelType, string> = {
  public: '#6366f1',
  private: '#8b5cf6',
  direct: '#06b6d4',
  project: '#f59e0b',
};

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '🤔', '✅'];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Mock data for offline/demo ──────────────────────────────────────────────

const DEMO_CHANNELS: Channel[] = [
  {
    id: 1,
    name: 'general',
    description: 'Company-wide announcements and updates',
    type: 'public',
    members: [],
    memberCount: 24,
    unreadCount: 3,
    isPinned: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'engineering',
    description: 'Technical discussions and code reviews',
    type: 'public',
    members: [],
    memberCount: 12,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'finance-team',
    description: 'Finance department internal channel',
    type: 'private',
    members: [],
    memberCount: 6,
    unreadCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'hr-announcements',
    description: 'HR policies, benefits, and notices',
    type: 'public',
    members: [],
    memberCount: 24,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'project-erp-alpha',
    description: 'ERP Alpha project coordination',
    type: 'project',
    members: [],
    memberCount: 8,
    unreadCount: 7,
    createdAt: '2026-01-01T00:00:00Z',
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

function generateDemoMessages(channelId: number): ChatMessage[] {
  const names = ['Aryan Sharma', 'Priya Mehta', 'Rahul Singh', 'Sneha Patel', 'Admin User'];
  const desigs = ['CEO', 'HR Manager', 'Lead Engineer', 'Finance Head', 'Super Admin'];
  const sampleMessages: Record<number, string[]> = {
    1: [
      'Good morning everyone! Hope you all had a great weekend 🌟',
      'Reminder: All-hands meeting today at 3 PM in the conference room.',
      "Don't forget to submit your timesheets by end of day Friday.",
      'Welcome to our newest team member joining the Engineering team! 🎉',
      'The Q3 reports are now live on the Finance dashboard.',
    ],
    2: [
      'Just pushed the new inventory deduction feature to staging.',
      'Can someone review PR #142? It fixes the invoice export bug.',
      'Build pipeline is green ✅ — deploying to prod tonight at 11 PM.',
      'Using jsPDF for the expense reports — works great, highly recommend.',
      'We should add WebSocket support for real-time channel updates in v2.',
    ],
    3: [
      'Q3 expense reports are ready for review.',
      'Payroll run scheduled for October 25th. Please confirm all attendance.',
      'New reimbursement policy effective from November 1st.',
    ],
    4: [
      'New leave policy update: 2 extra casual leaves added for all staff.',
      'Performance review cycle starts November 1st.',
      'Benefits enrollment window closes on October 30th.',
    ],
    5: [
      'Sprint 4 kickoff tomorrow at 10 AM.',
      'ERP Alpha staging URL is now live for QA testing.',
      'Blocking issue on inventory CSV import — will fix tonight.',
      'UAT feedback round: 14 items resolved, 3 pending.',
      '🚀 Feature: Communication Channels just landed on main!',
      'Great work team — we are 80% through MVP features!',
      'Next milestone: December 7th. Stay focused! 💪',
    ],
  };
  const msgs = sampleMessages[channelId] || sampleMessages[1];
  return msgs.map((content, i) => ({
    id: i + 1,
    channelId,
    senderId: (i % names.length) + 1,
    senderName: names[i % names.length],
    senderDesignation: desigs[i % desigs.length],
    content,
    type: 'text' as const,
    reactions:
      i === 0
        ? [{ emoji: '👍', count: 3, users: [1, 2, 3] }]
        : i === 1
          ? [
              { emoji: '✅', count: 5, users: [1, 2, 3, 4, 5] },
              { emoji: '🔥', count: 2, users: [3, 4] },
            ]
          : [],
    createdAt: new Date(Date.now() - (msgs.length - i) * 15 * 60 * 1000).toISOString(),
    isPinned: i === 1,
  }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}
function Avatar({ name, size = 32, color }: AvatarProps) {
  const hue = (name.charCodeAt(0) * 37) % 360;
  const bg = color || `hsl(${hue}, 65%, 50%)`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
        letterSpacing: '-0.5px',
      }}>
      {getInitials(name)}
    </div>
  );
}

// ─── Channel List Item ───────────────────────────────────────────────────────

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}
function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
  const icon =
    channel.type === 'private' ? (
      <Lock size={13} />
    ) : channel.type === 'direct' ? (
      <AtSign size={13} />
    ) : channel.type === 'project' ? (
      <Briefcase size={13} />
    ) : (
      <Hash size={13} />
    );

  return (
    <button
      id={`channel-item-${channel.id}`}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 8,
        background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
        color: isActive ? '#6366f1' : 'var(--text-secondary, #94a3b8)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}>
      <span style={{ opacity: 0.7, flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: channel.unreadCount ? 600 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: isActive ? '#6366f1' : channel.unreadCount ? '#e2e8f0' : 'inherit',
        }}>
        {channel.name}
      </span>
      {(channel.unreadCount ?? 0) > 0 && (
        <span
          style={{
            background: '#6366f1',
            color: '#fff',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            padding: '1px 7px',
            minWidth: 20,
            textAlign: 'center',
          }}>
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

interface MessageBubbleProps {
  msg: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}
function MessageBubble({
  msg,
  isMine,
  showAvatar,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onPin,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
      style={{
        display: 'flex',
        gap: 10,
        padding: '4px 16px',
        position: 'relative',
        background: showActions ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.1s',
      }}>
      {/* Avatar */}
      <div style={{ width: 36, flexShrink: 0, paddingTop: 2 }}>
        {showAvatar && <Avatar name={msg.senderName} size={36} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {showAvatar && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
              {msg.senderName}
            </span>
            {msg.senderDesignation && (
              <span
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  background: 'rgba(99,102,241,0.1)',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>
                {msg.senderDesignation}
              </span>
            )}
            <span style={{ fontSize: 11, color: '#475569' }}>{formatTime(msg.createdAt)}</span>
            {msg.isEdited && (
              <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>(edited)</span>
            )}
            {msg.isPinned && <Pin size={11} color="#f59e0b" />}
          </div>
        )}

        {/* Reply reference */}
        {msg.replyToMessage && (
          <div
            style={{
              borderLeft: '3px solid #6366f1',
              paddingLeft: 10,
              marginBottom: 6,
              opacity: 0.7,
              fontSize: 12,
              color: '#94a3b8',
            }}>
            <strong>{msg.replyToMessage.senderName}:</strong>{' '}
            {msg.replyToMessage.content.slice(0, 80)}
            {msg.replyToMessage.content.length > 80 ? '…' : ''}
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#cbd5e1',
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}>
          {msg.content}
        </p>

        {/* Reactions */}
        {(msg.reactions?.length ?? 0) > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {msg.reactions!.map((r, i) => (
              <button
                key={i}
                onClick={() => onReact(r.emoji)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 12,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#94a3b8',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                }}>
                {r.emoji} <span style={{ fontWeight: 600, fontSize: 11 }}>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'absolute',
              right: 16,
              top: -18,
              display: 'flex',
              gap: 2,
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '4px',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
            {/* Emoji quick-pick */}
            <div style={{ position: 'relative' }}>
              <button
                id={`msg-emoji-${msg.id}`}
                title="React"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={actionBtnStyle}>
                <Smile size={14} />
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      background: 'rgba(15,23,42,0.98)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      padding: 8,
                      display: 'flex',
                      gap: 4,
                      marginBottom: 6,
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                    }}>
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact(emoji);
                          setShowEmojiPicker(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 18,
                          padding: '2px 4px',
                          borderRadius: 6,
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}>
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              id={`msg-reply-${msg.id}`}
              title="Reply"
              onClick={onReply}
              style={actionBtnStyle}>
              <Reply size={14} />
            </button>
            <button id={`msg-pin-${msg.id}`} title="Pin" onClick={onPin} style={actionBtnStyle}>
              <Pin size={14} />
            </button>
            <button
              id={`msg-copy-${msg.id}`}
              title="Copy"
              onClick={handleCopy}
              style={actionBtnStyle}>
              {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            </button>
            {isMine && (
              <>
                <button
                  id={`msg-edit-${msg.id}`}
                  title="Edit"
                  onClick={onEdit}
                  style={actionBtnStyle}>
                  <Edit2 size={14} />
                </button>
                <button
                  id={`msg-delete-${msg.id}`}
                  title="Delete"
                  onClick={onDelete}
                  style={{ ...actionBtnStyle, color: '#f87171' }}>
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#94a3b8',
  padding: '4px 6px',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.15s, background 0.15s',
};

// ─── Create Channel Modal ────────────────────────────────────────────────────

interface CreateChannelModalProps {
  onClose: () => void;
  onCreated: (ch: Channel) => void;
}
function CreateChannelModal({ onClose, onCreated }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ChannelType>('public');
  const [createChannel, { isLoading }] = useCreateChannelMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const result = await createChannel({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        type,
        memberIds: [],
      }).unwrap();
      onCreated(result);
      antMessage.success(`Channel #${name} created!`);
      onClose();
    } catch {
      // Simulate locally for demo
      const mock: Channel = {
        id: Date.now(),
        name: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        type,
        members: [],
        memberCount: 1,
        createdAt: new Date().toISOString(),
        unreadCount: 0,
      };
      onCreated(mock);
      antMessage.success(`Channel #${mock.name} created!`);
      onClose();
    }
  };

  const typeOptions: { value: ChannelType; label: string; icon: React.ReactNode; desc: string }[] =
    [
      {
        value: 'public',
        label: 'Public',
        icon: <Globe size={16} />,
        desc: 'Anyone in the org can join',
      },
      { value: 'private', label: 'Private', icon: <Lock size={16} />, desc: 'Invite-only channel' },
      {
        value: 'project',
        label: 'Project',
        icon: <Briefcase size={16} />,
        desc: 'Linked to a project',
      },
    ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 32,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              Create Channel
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Channels are where conversations happen.
            </p>
          </div>
          <button
            id="close-create-channel"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
            }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Channel type */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: 10,
              }}>
              Channel Type
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    border:
                      type === opt.value ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.08)',
                    background:
                      type === opt.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    color: type === opt.value ? '#6366f1' : '#64748b',
                    transition: 'all 0.15s',
                  }}>
                  {opt.icon}
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: 8,
              }}>
              Name
            </label>
            <div style={{ position: 'relative' }}>
              <Hash
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#475569',
                }}
              />
              <input
                id="channel-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. project-alpha"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 32px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: 8,
              }}>
              Description{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', color: '#475569' }}>
                (optional)
              </span>
            </label>
            <input
              id="channel-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            id="submit-create-channel"
            type="submit"
            disabled={isLoading || !name.trim()}
            style={{
              padding: '12px',
              borderRadius: 10,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              opacity: !name.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}>
            {isLoading ? 'Creating…' : 'Create Channel'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const { channelId: channelIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [activeChannelId, setActiveChannelId] = useState<number>(
    channelIdParam ? parseInt(channelIdParam) : 1
  );
  const [messageInput, setMessageInput] = useState('');
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [localChannels, setLocalChannels] = useState<Channel[]>(DEMO_CHANNELS);
  const [localMessages, setLocalMessages] = useState<Record<number, ChatMessage[]>>(
    Object.fromEntries(DEMO_CHANNELS.map((c) => [c.id, generateDemoMessages(c.id)]))
  );
  const [showMembers, setShowMembers] = useState(false);
  const [publicCollapsed, setPublicCollapsed] = useState(false);
  const [privateCollapsed, setPrivateCollapsed] = useState(false);
  const [projectCollapsed, setProjectCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // RTK Query
  const { data: apiChannels } = useGetChannelsQuery();
  const { data: apiMessages } = useGetMessagesQuery(
    { channelId: activeChannelId },
    { skip: !activeChannelId }
  );
  const [sendMessage] = useSendMessageMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [reactToMessage] = useReactToMessageMutation();
  const [pinMessage] = usePinMessageMutation();
  const [markChannelRead] = useMarkChannelReadMutation();

  // Merge API data with demo data
  const channels = useMemo(() => {
    if (apiChannels && apiChannels.length > 0) return apiChannels;
    return localChannels;
  }, [apiChannels, localChannels]);

  const messages = useMemo(() => {
    if (apiMessages && apiMessages.length > 0) return apiMessages;
    return localMessages[activeChannelId] || [];
  }, [apiMessages, activeChannelId, localMessages]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when switching channels
  useEffect(() => {
    setLocalChannels((prev) =>
      prev.map((c) => (c.id === activeChannelId ? { ...c, unreadCount: 0 } : c))
    );
    markChannelRead(activeChannelId).catch(() => {});
  }, [activeChannelId, markChannelRead]);

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const publicChannels = filteredChannels.filter((c) => c.type === 'public');
  const privateChannels = filteredChannels.filter((c) => c.type === 'private');
  const projectChannels = filteredChannels.filter((c) => c.type === 'project');

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      channelId: activeChannelId,
      senderId: user?.id || 0,
      senderName: user?.username || 'You',
      senderDesignation: user?.designation || '',
      content,
      type: 'text',
      reactions: [],
      replyTo: replyTo?.id,
      replyToMessage: replyTo || undefined,
      createdAt: new Date().toISOString(),
    };
    // Optimistic local update
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));
    setLocalChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId ? { ...c, lastActivity: new Date().toISOString() } : c
      )
    );
    setMessageInput('');
    setReplyTo(null);
    try {
      await sendMessage({ channelId: activeChannelId, content, replyTo: replyTo?.id }).unwrap();
    } catch {
      // Keep optimistic update
    }
  };

  const handleEdit = async (msgId: number) => {
    const content = editingContent.trim();
    if (!content) return;
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map((m) =>
        m.id === msgId ? { ...m, content, isEdited: true } : m
      ),
    }));
    setEditingMsgId(null);
    try {
      await editMessage({ id: msgId, channelId: activeChannelId, content }).unwrap();
    } catch {}
  };

  const handleDelete = async (msgId: number) => {
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].filter((m) => m.id !== msgId),
    }));
    try {
      await deleteMessage({ id: msgId, channelId: activeChannelId }).unwrap();
    } catch {}
  };

  const handleReact = async (msgId: number, emoji: string) => {
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map((m) => {
        if (m.id !== msgId) return m;
        const reactions = [...(m.reactions || [])];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (idx >= 0) {
          const updated = { ...reactions[idx], count: reactions[idx].count + 1 };
          reactions[idx] = updated;
        } else {
          reactions.push({ emoji, count: 1, users: [user?.id || 0] });
        }
        return { ...m, reactions };
      }),
    }));
    try {
      await reactToMessage({ messageId: msgId, channelId: activeChannelId, emoji }).unwrap();
    } catch {}
  };

  const handlePin = async (msgId: number) => {
    setLocalMessages((prev) => ({
      ...prev,
      [activeChannelId]: prev[activeChannelId].map((m) =>
        m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
      ),
    }));
    try {
      await pinMessage({ messageId: msgId, channelId: activeChannelId }).unwrap();
    } catch {}
    antMessage.success('Message pinned!');
  };

  const handleChannelCreated = (ch: Channel) => {
    setLocalChannels((prev) => [...prev, ch]);
    setLocalMessages((prev) => ({ ...prev, [ch.id]: [] }));
    setActiveChannelId(ch.id);
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    for (const msg of messages) {
      const dateStr = formatDate(msg.createdAt);
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [messages]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        background: '#0a0f1e',
        overflow: 'hidden',
      }}>
      {/* ── LEFT SIDEBAR ── */}
      <div
        style={{
          width: 260,
          flexShrink: 0,
          background: '#0d1526',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        {/* Header */}
        <div
          style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color="#6366f1" />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>Channels</span>
            </div>
            <button
              id="btn-create-channel"
              onClick={() => setShowCreateModal(true)}
              title="New Channel"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#6366f1',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
              }}>
              <Plus size={16} />
            </button>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#475569',
              }}
            />
            <input
              id="channel-search-input"
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              placeholder="Search channels…"
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f5f9',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Channel list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {/* Public */}
          <div>
            <button
              onClick={() => setPublicCollapsed(!publicCollapsed)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
              {publicCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              Public
            </button>
            {!publicCollapsed &&
              publicChannels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  isActive={ch.id === activeChannelId}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    navigate(`/channels/${ch.id}`);
                  }}
                />
              ))}
          </div>

          {/* Private */}
          {privateChannels.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setPrivateCollapsed(!privateCollapsed)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                {privateCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                Private
              </button>
              {!privateCollapsed &&
                privateChannels.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    isActive={ch.id === activeChannelId}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      navigate(`/channels/${ch.id}`);
                    }}
                  />
                ))}
            </div>
          )}

          {/* Project */}
          {projectChannels.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => setProjectCollapsed(!projectCollapsed)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                {projectCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                Project Channels
              </button>
              {!projectCollapsed &&
                projectChannels.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    isActive={ch.id === activeChannelId}
                    onClick={() => {
                      setActiveChannelId(ch.id);
                      navigate(`/channels/${ch.id}`);
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Channel header */}
        {activeChannel && (
          <div
            style={{
              padding: '0 20px',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: '#0d1526',
              flexShrink: 0,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${CHANNEL_COLORS[activeChannel.type]}22`,
                  color: CHANNEL_COLORS[activeChannel.type],
                }}>
                {activeChannel.type === 'private' ? (
                  <Lock size={15} />
                ) : activeChannel.type === 'project' ? (
                  <Briefcase size={15} />
                ) : (
                  <Hash size={15} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                  {activeChannel.name}
                </div>
                {activeChannel.description && (
                  <div style={{ fontSize: 12, color: '#64748b' }}>{activeChannel.description}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                id="channel-members-toggle"
                onClick={() => setShowMembers(!showMembers)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: showMembers ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                  border: showMembers
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  color: showMembers ? '#6366f1' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 500,
                }}>
                <Users size={14} />
                <span>{activeChannel.memberCount}</span>
              </button>
              <button
                id="channel-settings-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 6,
                }}>
                <Settings size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {groupedMessages.map(({ date, messages: msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {msgs.map((msg, idx) => {
                const prevMsg = idx > 0 ? msgs[idx - 1] : null;
                const showAvatar =
                  !prevMsg ||
                  prevMsg.senderId !== msg.senderId ||
                  new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() >
                    5 * 60 * 1000;
                const isMine = msg.senderId === (user?.id || 0);

                if (editingMsgId === msg.id) {
                  return (
                    <div key={msg.id} style={{ padding: '4px 16px 4px 62px' }}>
                      <div
                        style={{
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.25)',
                          borderRadius: 10,
                          padding: '10px 12px',
                        }}>
                        <input
                          autoFocus
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEdit(msg.id);
                            if (e.key === 'Escape') setEditingMsgId(null);
                          }}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#f1f5f9',
                            fontSize: 14,
                            outline: 'none',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            marginTop: 8,
                            fontSize: 12,
                            color: '#64748b',
                          }}>
                          <span>Enter to save · Esc to cancel</span>
                          <button
                            onClick={() => setEditingMsgId(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#f87171',
                              fontSize: 12,
                            }}>
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEdit(msg.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6366f1',
                              fontSize: 12,
                              fontWeight: 600,
                            }}>
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={isMine}
                    showAvatar={showAvatar}
                    onReact={(emoji) => handleReact(msg.id, emoji)}
                    onReply={() => setReplyTo(msg)}
                    onEdit={() => {
                      setEditingMsgId(msg.id);
                      setEditingContent(msg.content);
                    }}
                    onDelete={() => handleDelete(msg.id)}
                    onPin={() => handlePin(msg.id)}
                  />
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '12px 20px 16px',
            background: '#0d1526',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
          {/* Reply preview */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  marginBottom: 10,
                }}>
                <Reply size={14} color="#6366f1" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>
                    Replying to {replyTo.senderName}
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {replyTo.content}
                  </p>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}>
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '4px 8px 4px 16px',
            }}>
            <input
              ref={inputRef}
              id="message-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Select a channel'}
              disabled={!activeChannel}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                padding: '8px 0',
              }}
            />
            <button
              id="msg-attach-btn"
              title="Attach file"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: '6px',
                display: 'flex',
              }}>
              <Paperclip size={18} />
            </button>
            <button
              id="msg-emoji-btn"
              title="Emoji"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: '6px',
                display: 'flex',
              }}>
              <Smile size={18} />
            </button>
            <button
              id="msg-send-btn"
              onClick={handleSend}
              disabled={!messageInput.trim()}
              style={{
                background: messageInput.trim() ? '#6366f1' : 'rgba(99,102,241,0.2)',
                border: 'none',
                borderRadius: 10,
                cursor: messageInput.trim() ? 'pointer' : 'default',
                color: '#fff',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s',
              }}>
              <Send size={14} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#334155', marginTop: 6, textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line · @mention to notify someone
          </div>
        </div>
      </div>

      {/* ── RIGHT MEMBERS PANEL ── */}
      <AnimatePresence>
        {showMembers && activeChannel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#0d1526',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
            <div style={{ width: 240, padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>
                  Members ({activeChannel.memberCount})
                </span>
                <button
                  id="btn-add-member"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: '#6366f1',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  <UserPlus size={14} />
                </button>
              </div>
              {/* Sample members */}
              {['Aryan Sharma', 'Priya Mehta', 'Rahul Singh', 'Sneha Patel'].map((name, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar name={name} size={32} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: i < 2 ? '#22c55e' : '#64748b',
                        border: '1.5px solid #0d1526',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{name}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      {i < 2 ? '🟢 Online' : '⚫ Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create channel modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateChannelModal
            onClose={() => setShowCreateModal(false)}
            onCreated={handleChannelCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
