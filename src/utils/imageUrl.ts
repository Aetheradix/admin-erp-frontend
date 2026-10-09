import { API_BASE_URL } from '@/config/env';

/**
 * Strips Hostinger / remote origin domain from an image URL to prevent 404s
 * e.g. https://test.aetheradix.com/uploads/blogs/image.jpg -> /uploads/blogs/image.jpg
 */
export const cleanUploadPath = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Match any domain prefix pointing to /uploads/
  // e.g., https://test.aetheradix.com/uploads/blogs/image.jpg
  //       https://erp.aetheradix.com/uploads/...
  //       https://*.hostingsite.com/uploads/...
  const uploadMatch = trimmed.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  if (uploadMatch) {
    return uploadMatch[1];
  }

  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  return trimmed;
};

/**
 * Resolves local/relative/remote image URLs consistently.
 * Strips Hostinger public paths (like test.aetheradix.com/uploads) and resolves
 * against active API_BASE_URL so images load seamlessly.
 */
export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs (base64) and Blob URLs load directly
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;

  // 1. Strip Hostinger / remote origin from /uploads/ path if present
  const cleaned = cleanUploadPath(trimmed);

  // 2. If it's a relative /uploads path, prefix with active API_BASE_URL
  if (cleaned.startsWith('/uploads')) {
    const base = (API_BASE_URL || '').replace(/\/$/, '');
    return base ? `${base}${cleaned}` : cleaned;
  }

  // 3. Regular external URLs (like Unsplash, etc.) remain as-is
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }

  return cleaned;
};

/**
 * Downloads an image cleanly to the client machine.
 * Supports data URLs, blob URLs, relative backend /uploads, and remote URLs.
 */
export const downloadImageFile = async (url?: string | null, customFilename?: string): Promise<void> => {
  if (!url) return;
  const resolved = resolveImageUrl(url);
  if (!resolved) return;

  const fallbackName = `asset-${Date.now()}.jpg`;
  const filename = customFilename || fallbackName;

  try {
    if (resolved.startsWith('data:') || resolved.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = resolved;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const response = await fetch(resolved);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('[downloadImageFile] Fallback to direct navigation', err);
    window.open(resolved, '_blank');
  }
};
