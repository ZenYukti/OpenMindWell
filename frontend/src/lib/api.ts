const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to make authenticated API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await (await import('./supabase')).supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

// Journal API
export const journalApi = {
  getAll: () => apiFetch('/api/journal'),

  create: (entry: { title: string; content: string; mood?: number; tags?: string[] }) =>
    apiFetch('/api/journal', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  update: (id: string, entry: { title: string; content: string; mood?: number; tags?: string[] }) =>
    apiFetch(`/api/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    }),

  delete: (id: string) =>
    apiFetch(`/api/journal/${id}`, {
      method: 'DELETE',
    }),
};

// Habits API
export const habitsApi = {
  getAll: () => apiFetch('/api/habits'),

  getTodayLogs: () => apiFetch('/api/habits/today'),

  create: (habit: { name: string; description?: string; frequency?: 'daily' | 'weekly' }) =>
    apiFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    }),

  log: (habitId: string, notes?: string) =>
    apiFetch(`/api/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  getLogs: (habitId: string) => apiFetch(`/api/habits/${habitId}/logs`),

  update: (id: string, habit: { name: string; description?: string; frequency?: 'daily' | 'weekly' }) =>
    apiFetch(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habit),
    }),

  delete: (id: string) =>
    apiFetch(`/api/habits/${id}`, {
      method: 'DELETE',
    }),
};

// Resources API
export const resourcesApi = {
  getAll: (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return apiFetch(`/api/resources${query}`);
  },
};

// Rooms API
export const roomsApi = {
  getAll: () => apiFetch('/api/rooms'),

  getMessages: (roomId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiFetch(`/api/rooms/${roomId}/messages${query}`);
  },
};

// Moderation API
export const moderationApi = {
  getFlagged: () => apiFetch('/api/moderation/flagged'),

  createReport: (messageId: string, reason: string) =>
    apiFetch('/api/moderation/reports', {
      method: 'POST',
      body: JSON.stringify({ messageId, reason }),
    }),

  getReports: () => apiFetch('/api/moderation/reports'),
};
