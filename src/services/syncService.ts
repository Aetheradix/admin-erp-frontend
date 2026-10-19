import { store } from '@/store';
import { apiSlice } from '@/store/api/apiSlice';

export type SyncEventType = 'invitations' | 'audit_logs' | 'users' | 'onboarding' | 'all';

const tagMapping: Record<SyncEventType, Array<'SystemInvitations' | 'SystemAuditLogs' | 'User' | 'ApprovalLogs'>> = {
  invitations: ['SystemInvitations', 'SystemAuditLogs'],
  audit_logs: ['SystemAuditLogs'],
  users: ['User', 'ApprovalLogs'],
  onboarding: ['SystemInvitations', 'SystemAuditLogs', 'User', 'ApprovalLogs'],
  all: ['SystemInvitations', 'SystemAuditLogs', 'User', 'ApprovalLogs'],
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const pendingTags = new Set<any>();

function flushTagInvalidations() {
  if (pendingTags.size === 0) return;
  const tagsToInvalidate = Array.from(pendingTags);
  pendingTags.clear();
  try {
    store.dispatch(apiSlice.util.invalidateTags(tagsToInvalidate));
  } catch (err) {
    console.warn('Sync invalidation dispatch warning:', err);
  }
}

function queueTagInvalidation(tags: any[]) {
  tags.forEach((tag) => pendingTags.add(tag));
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushTagInvalidations, 250);
}

/**
 * Broadcast an event across tabs and trigger reactive tag invalidation
 * without any periodic loop polling.
 */
export function broadcastSync(type: SyncEventType) {
  const tags = tagMapping[type] || ['SystemInvitations', 'SystemAuditLogs'];

  // 1. Invalidate locally (instant update for current tab)
  queueTagInvalidation(tags);

  // 2. Broadcast to other open browser tabs/windows
  if (typeof window !== 'undefined') {
    try {
      const channel = new BroadcastChannel('aether_erp_events');
      channel.postMessage({ type, timestamp: Date.now() });
      channel.close();
    } catch {
      // Fallback: storage event
      try {
        localStorage.setItem(
          'aether_sync_trigger',
          JSON.stringify({ type, timestamp: Date.now() })
        );
      } catch {}
    }

    // Custom window event for local non-Redux listeners
    window.dispatchEvent(new CustomEvent(`aether_${type}_updated`, { detail: { type } }));
  }
}

let isInitialized = false;

/**
 * Initialize global event listener (once per application lifetime).
 * Subscribes to BroadcastChannel and storage events to react to cross-tab updates.
 */
export function initGlobalSyncListener() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  try {
    const channel = new BroadcastChannel('aether_erp_events');
    channel.onmessage = (event) => {
      const type: SyncEventType = event.data?.type || 'all';
      const tags = tagMapping[type] || ['SystemInvitations', 'SystemAuditLogs'];
      queueTagInvalidation(tags);
    };
  } catch {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'aether_sync_trigger' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const type: SyncEventType = parsed.type || 'all';
        const tags = tagMapping[type] || ['SystemInvitations', 'SystemAuditLogs'];
        queueTagInvalidation(tags);
      } catch {}
    }
  });
}
