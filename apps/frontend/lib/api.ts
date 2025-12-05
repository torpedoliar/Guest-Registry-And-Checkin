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

// Helper function to parse API error messages into user-friendly messages
export function parseErrorMessage(errorText: string): string {
  const errorMap: Record<string, string> = {
    'Event not found': 'Event tidak ditemukan. Silakan pilih event yang aktif terlebih dahulu.',
    'No active event': 'Tidak ada event aktif. Silakan aktifkan event terlebih dahulu.',
    'Invalid credentials': 'Login gagal. Username atau password salah.',
    'Unauthorized': 'Sesi telah berakhir. Silakan login kembali.',
    'Invalid date format': 'Format tanggal tidak valid.',
    'Cannot delete active event': 'Tidak dapat menghapus event yang sedang aktif.',
    'Guest not found': 'Data tamu tidak ditemukan.',
    'Email settings not configured': 'Pengaturan email belum dikonfigurasi. Silakan atur SMTP terlebih dahulu.',
    'Guest does not have an email': 'Tamu ini tidak memiliki alamat email.',
    'Failed to send email': 'Gagal mengirim email. Periksa pengaturan SMTP.',
    'No logo file provided': 'File logo tidak ditemukan.',
    'No background file provided': 'File background tidak ditemukan.',
    'Password salah': 'Password yang Anda masukkan salah. Silakan coba lagi.',
    'Password diperlukan': 'Password wajib diisi untuk melakukan aksi ini.',
    'Alasan pembatalan harus diisi': 'Alasan pembatalan wajib diisi (minimal 5 karakter).',
  };

  try {
    const parsed = JSON.parse(errorText);
    const message = parsed.message || parsed.error || '';
    
    // Check if we have a friendly message for this error
    for (const [key, friendlyMessage] of Object.entries(errorMap)) {
      if (message.includes(key)) {
        return friendlyMessage;
      }
    }
    
    return message || 'Terjadi kesalahan. Silakan coba lagi.';
  } catch {
    // Not JSON, check raw text
    for (const [key, friendlyMessage] of Object.entries(errorMap)) {
      if (errorText.includes(key)) {
        return friendlyMessage;
      }
    }
    return errorText || 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

