/**
 * Form Draft and Autosave Manager
 * Provides debounced autosave, draft restoration, and change detection.
 *
 * Security Design:
 * - Sensitive credentials (bank account numbers, PAN, Aadhaar, Passport numbers)
 *   are stored ONLY in sessionStorage (tab memory, cleared on browser exit)
 *   and NEVER persisted to insecure localStorage.
 * - Non-sensitive sections (personal details, address, employment, education)
 *   are stored with timestamped drafts for disaster recovery.
 */

const DRAFT_PREFIX = 'aether_form_draft_';
const SENSITIVE_SECTIONS = new Set(['bank', 'identity']);

export interface StoredDraft<T = any> {
  data: T;
  timestamp: number;
  userId: string | number;
  section: string;
}

/**
 * Strips sensitive identification and bank numbers for disk storage
 */
function sanitizeForPersistentStorage(section: string, data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (!SENSITIVE_SECTIONS.has(section)) return data;

  const clone = { ...data };
  if (section === 'bank') {
    delete clone.accountNumber;
    delete clone.confirmAccountNumber;
  } else if (section === 'identity') {
    delete clone.panNumber;
    delete clone.aadhaarNumber;
    delete clone.passportNumber;
  }
  return clone;
}

/**
 * Saves a form draft with timestamp
 */
export function saveFormDraft(
  userId: string | number,
  section: string,
  data: any
): void {
  if (!userId || !section || !data) return;

  const key = `${DRAFT_PREFIX}${userId}_${section}`;
  const draft: StoredDraft = {
    data,
    timestamp: Date.now(),
    userId,
    section,
  };

  try {
    // 1. SessionStorage always stores the current session draft (including in-memory sensitive fields for refresh recovery)
    sessionStorage.setItem(key, JSON.stringify(draft));

    // 2. LocalStorage stores persistent draft ONLY with sensitive fields sanitized
    const sanitizedData = sanitizeForPersistentStorage(section, data);
    const sanitizedDraft: StoredDraft = {
      ...draft,
      data: sanitizedData,
    };
    localStorage.setItem(key, JSON.stringify(sanitizedDraft));
  } catch (err) {
    console.warn('[FormDraftManager] Could not save draft:', err);
  }
}

/**
 * Retrieves the latest valid draft for a given user and section
 */
export function getFormDraft<T = any>(
  userId: string | number,
  section: string
): StoredDraft<T> | null {
  if (!userId || !section) return null;
  const key = `${DRAFT_PREFIX}${userId}_${section}`;

  try {
    // Check sessionStorage first (contains freshest in-session edits)
    const sessionRaw = sessionStorage.getItem(key);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && parsed.data) return parsed;
    }

    // Fallback to localStorage
    const localRaw = localStorage.getItem(key);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (parsed && parsed.data) return parsed;
    }
  } catch (err) {
    console.warn('[FormDraftManager] Could not load draft:', err);
  }
  return null;
}

/**
 * Clears draft upon successful save or submission
 */
export function clearFormDraft(userId: string | number, section: string): void {
  if (!userId || !section) return;
  const key = `${DRAFT_PREFIX}${userId}_${section}`;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Clears all drafts for a user
 */
export function clearAllUserDrafts(userId: string | number): void {
  if (!userId) return;
  const prefix = `${DRAFT_PREFIX}${userId}_`;

  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(prefix)) sessionStorage.removeItem(k);
    });
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(prefix)) localStorage.removeItem(k);
    });
  } catch {}
}

/**
 * Fast change detection between saved state and current form state
 */
export function isDataModified(saved: any, current: any): boolean {
  if (saved === current) return false;
  if (!saved && !current) return false;
  if (!saved || !current) return true;

  if (typeof saved !== 'object' || typeof current !== 'object') {
    return saved !== current;
  }

  // Fast check for arrays
  if (Array.isArray(saved) || Array.isArray(current)) {
    if (!Array.isArray(saved) || !Array.isArray(current)) return true;
    if (saved.length !== current.length) return true;
  }

  try {
    return JSON.stringify(saved) !== JSON.stringify(current);
  } catch {
    return true;
  }
}

