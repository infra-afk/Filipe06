import { getToken, removeToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || ''

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    removeToken()
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export function api(_token?: string) {
  return {
    canvases: {
      list: () => apiFetch('/api/canvases'),

      get: (id: string) => apiFetch(`/api/canvases/${id}`),

      create: (data: { name: string; description?: string; seed?: boolean }) =>
        apiFetch('/api/canvases', { method: 'POST', body: JSON.stringify(data) }),

      update: (id: string, data: { name?: string; description?: string | null; status?: string }) =>
        apiFetch(`/api/canvases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

      delete: (id: string) =>
        apiFetch(`/api/canvases/${id}`, { method: 'DELETE' }),

      ensureSection: async (canvasId: string, s: { key: string; title: string; position: number }) => {
        // No-op: sections are created on the backend when canvas is seeded
        return null
      },

      createItem: (canvasId: string, data: {
        section_id: string
        title: string
        description?: string | null
        color?: string
      }) => apiFetch(`/api/canvases/${canvasId}/items`, { method: 'POST', body: JSON.stringify(data) }),

      reorderItems: (_canvasId: string, data: {
        section_id: string
        items: Array<{ id: string; position: number }>
      }) => apiFetch(`/api/canvases/${_canvasId}/items/reorder`, { method: 'PATCH', body: JSON.stringify({ items: data.items }) }),
    },

    items: {
      update: (id: string, data: { title?: string; description?: string | null; color?: string }) =>
        apiFetch(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

      delete: (id: string) =>
        apiFetch(`/api/items/${id}`, { method: 'DELETE' }),
    },
  }
}
