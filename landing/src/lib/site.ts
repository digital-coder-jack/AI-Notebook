/**
 * Single source of truth for the production base URL.
 *
 * In production (deployed), window.location.origin returns the real
 * domain the app is served from (e.g. https://ai-notebook.vercel.app).
 * In local dev, it resolves to http://localhost:<port>.
 *
 * NEVER hardcode bolt.new, a preview hostname, or any other
 * non-production URL here. Always derive from the runtime environment.
 */

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://ai-notebook.app';
}

export function buildUrl(path: string = '/'): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function buildShareUrl(resourceId: string, resourceType: string = 'notebook'): string {
  return buildUrl(`/share/${resourceType}/${resourceId}`);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const SITE_CONFIG = {
  name: 'AI Notebook',
  tagline: 'Your AI-powered learning workspace',
  description:
    'Bring your notes, study materials, and AI-powered learning together in one organized workspace.',
  get url() {
    return getBaseUrl();
  },
};
