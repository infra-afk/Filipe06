const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function headers(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (res.status === 204) return undefined as T
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro na requisição')
  return json
}

export function api(token: string) {
  return {
    canvases: {
      list: () =>
        request<any[]>(`${BASE}/api/canvases`, { headers: headers(token) }),

      get: (id: string) =>
        request<any>(`${BASE}/api/canvases/${id}`, { headers: headers(token) }),

      create: (data: { name: string; description?: string; seed?: boolean }) =>
        request<any>(`${BASE}/api/canvases`, {
          method: 'POST',
          headers: headers(token),
          body: JSON.stringify(data),
        }),

      update: (id: string, data: { name?: string; description?: string | null; status?: string }) =>
        request<any>(`${BASE}/api/canvases/${id}`, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        request<void>(`${BASE}/api/canvases/${id}`, {
          method: 'DELETE',
          headers: headers(token),
        }),

      createItem: (canvasId: string, data: {
        section_id: string
        title: string
        description?: string | null
        color?: string
      }) =>
        request<any>(`${BASE}/api/canvases/${canvasId}/items`, {
          method: 'POST',
          headers: headers(token),
          body: JSON.stringify(data),
        }),

      reorderItems: (canvasId: string, data: {
        section_id: string
        items: Array<{ id: string; position: number }>
      }) =>
        request<any>(`${BASE}/api/canvases/${canvasId}/items/reorder`, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify(data),
        }),
    },

    items: {
      update: (id: string, data: { title?: string; description?: string | null; color?: string }) =>
        request<any>(`${BASE}/api/items/${id}`, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify(data),
        }),

      delete: (id: string) =>
        request<void>(`${BASE}/api/items/${id}`, {
          method: 'DELETE',
          headers: headers(token),
        }),
    },
  }
}
