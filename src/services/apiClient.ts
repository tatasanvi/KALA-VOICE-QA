// =============================================================================
// KALA VOICE QA — Client HTTP API (Frontend → Backend)
// Intercepteur JWT automatique + fallback localStorage en cas d'API hors ligne
// =============================================================================

const API_BASE = '/api'; // proxy Vite → http://localhost:8000

// ─── Gestion Token ────────────────────────────────────────────────────────────
export const tokenStore = {
  get:    ()           => localStorage.getItem('kala_jwt') ?? null,
  set:    (t: string)  => localStorage.setItem('kala_jwt', t),
  clear:  ()           => localStorage.removeItem('kala_jwt'),
  getUser: () => {
    const raw = localStorage.getItem('kala_auth_user');
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (u: any) => localStorage.setItem('kala_auth_user', JSON.stringify(u)),
  clearAll: () => { localStorage.removeItem('kala_jwt'); localStorage.removeItem('kala_auth_user'); },
};

// ─── Fetch avec JWT automatique ───────────────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

export async function apiCall<T = any>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown
): Promise<ApiResponse<T>> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (res.status === 401) {
      // Token expiré → on nettoie
      tokenStore.clearAll();
      window.dispatchEvent(new CustomEvent('kala:logout'));
    }

    return {
      data: res.ok ? data : undefined,
      error: !res.ok ? (data?.error ?? `Erreur ${res.status}`) : undefined,
      status: res.status,
      ok: res.ok,
    };
  } catch {
    return { error: 'API indisponible — mode hors-ligne actif.', status: 0, ok: false };
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiCall<{ token: string; user: any }>('/auth/login', 'POST', { email, password });
    if (res.ok && res.data) {
      tokenStore.set(res.data.token);
      tokenStore.setUser(res.data.user);
    }
    return res;
  },
  me:     () => apiCall('/auth/me'),
  logout: async () => {
    await apiCall('/auth/logout', 'POST');
    tokenStore.clearAll();
  },
  isOnline: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

// ─── Users API ───────────────────────────────────────────────────────────────
export const usersApi = {
  list:         ()             => apiCall('/users'),
  get:          (id: string)   => apiCall(`/users/${id}`),
  create:       (data: any)    => apiCall('/users', 'POST', data),
  update:       (id: string, data: any) => apiCall(`/users/${id}`, 'PUT', data),
  delete:       (id: string)   => apiCall(`/users/${id}`, 'DELETE'),
  toggleActive: (id: string)   => apiCall(`/users/${id}/toggle-active`, 'PATCH'),
  changeRole:   (id: string, role: string) => apiCall(`/users/${id}/role`, 'PATCH', { role }),
};

// ─── Calls API ────────────────────────────────────────────────────────────────
export const callsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/calls${qs}`);
  },
  get:            (id: string)   => apiCall(`/calls/${id}`),
  create:         (data: any)    => apiCall('/calls', 'POST', data),
  patchSegment:   (callId: string, segId: string, correctedText: string) =>
    apiCall(`/calls/${callId}/segments/${segId}`, 'PATCH', { correctedText }),
};

// ─── Quality API ──────────────────────────────────────────────────────────────
export const qualityApi = {
  list:          ()           => apiCall('/evaluations'),
  getByCall:     (callId: string) => apiCall(`/evaluations/call/${callId}`),
  save:          (data: any)  => apiCall('/evaluations', 'POST', data),
  listCriteria:  ()           => apiCall('/criteria'),
  updateCriterion: (id: string, data: any) => apiCall(`/criteria/${id}`, 'PUT', data),
};

// ─── Agents & Teams API ───────────────────────────────────────────────────────
export const agentsApi = {
  list: () => apiCall('/agents'),
  get:  (id: string) => apiCall(`/agents/${id}`),
};
export const teamsApi     = { list: () => apiCall('/teams') };
export const campaignsApi = { list: () => apiCall('/campaigns') };

// ─── Coaching API ─────────────────────────────────────────────────────────────
export const coachingApi = {
  list:        ()           => apiCall('/coaching'),
  getByAgent:  (agentId: string) => apiCall(`/coaching/agent/${agentId}`),
  save:        (data: any)  => apiCall('/coaching', 'POST', data),
};

// ─── Training API ─────────────────────────────────────────────────────────────
export const trainingApi = {
  listModules:  ()          => apiCall('/training/modules'),
  listSessions: ()          => apiCall('/training/sessions'),
  addSession:   (data: any) => apiCall('/training/sessions', 'POST', data),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  metrics: () => apiCall('/dashboard/metrics'),
};

// ─── Audit API ────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (limit = 100) => apiCall(`/audit?limit=${limit}`),
};

// ─── Experiments API ──────────────────────────────────────────────────────────
export const experimentsApi = {
  configs:  () => apiCall('/experiments/configs'),
  samples:  () => apiCall('/experiments/samples'),
};
