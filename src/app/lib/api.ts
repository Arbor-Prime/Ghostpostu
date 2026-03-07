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
    // Only redirect if we're not already on a public page
    if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
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

  // For file uploads (voice recording)
  upload: async (path: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type — browser sets it with boundary for multipart
    });

    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload failed: ${res.status}`);
    return data;
  },
};
