const API_URL = import.meta.env.VITE_API_URL || ''

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export async function authLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
  setToken(data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function authRegister(email: string, password: string, full_name?: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
  setToken(data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function authLogout() {
  removeToken()
}
