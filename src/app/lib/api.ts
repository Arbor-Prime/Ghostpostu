const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Don't redirect for auth check calls - let auth context handle it
    if (path === '/auth/me') {
      throw new Error('Not authenticated');
    }
    // Only redirect for actual app requests when user should be logged in
    const publicPaths = ['/login', '/signup', '/', '/onboarding'];
    const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
    if (!isPublic) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  get: (path: string) => request(path),

  post: (path: string, body?: any) =>
    request(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (path: string, body?: any) =>
    request(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (path: string, body?: any) =>
    request(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (path: string) =>
    request(path, { method: 'DELETE' }),

  upload: async (path: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload failed: ${res.status}`);
    return data;
  },
};
