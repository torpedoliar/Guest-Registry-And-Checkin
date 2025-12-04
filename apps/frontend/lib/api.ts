export function apiBase() {
  // Always use same-origin '/api' in the browser so that LAN devices work
  if (typeof window !== 'undefined') return '/api';
  // On the server (SSR/build), fall back to env or local dev default
  if (process.env.BACKEND_ORIGIN) {
    return `${process.env.BACKEND_ORIGIN}/api`;
  }
  if (process.env.IS_DOCKER === 'true') {
    const backendPort = process.env.BACKEND_PORT || '4000';
    return `http://backend:${backendPort}/api`;
  }
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase) return envBase;
  // Fallback to localhost with configurable port
  const backendPort = process.env.BACKEND_PORT || '4000';
  return `http://localhost:${backendPort}/api`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function toApiUrl(path?: string | null): string {
  const p = path ?? '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/api/')) {
    // apiBase() ends with '/api', so strip '/api' from the relative path
    return `${apiBase()}${p.substring(4)}`;
  }
  return p;
}

