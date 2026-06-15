// ─── KanbanStore — localStorage (imediato) + PostgreSQL (server sync) ─────────

import { getToken } from '../lib/auth'

export interface KanbanCard {
  id: string
  nome: string
  responsavel: string
  solicitante: string
  dataEntrada: string
  prazo: string
  prioridade: 'Alta' | 'Média' | 'Baixa'
  coluna: string
  observacoes: string
  tags: string[]
  dataAnalise: string
  dataDesenvolvimento: string
  dataRevisao: string
  dataConcluido: string
  dataArquivamento: string
  arquivado: boolean
  briefing: {
    titulo: string
    objetivo: string[]
    indicadores: string[]
    vendas: string[]
    despesas: string[]
    devolucoes: string[]
    dre: string[]
    alertas: string[]
    decisoes: string[]
    agentes: string[]
    extras: Record<string, string[]>
    notas: Record<string, string>
    resumo?: string
  }
}

const KEY = 'chua_cards'
const API = import.meta.env.VITE_API_URL || ''

function authHeaders(): Record<string, string> {
  const token = getToken()
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

function readAll(): KanbanCard[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as KanbanCard[]
  } catch {
    return []
  }
}

function writeAll(cards: KanbanCard[]): void {
  localStorage.setItem(KEY, JSON.stringify(cards))
}

// ─── Leitura (sync) ───────────────────────────────────────────────────────────

export function getCards(): KanbanCard[] {
  return readAll().filter(c => !c.arquivado)
}

export function getArquivados(): KanbanCard[] {
  return readAll().filter(c => c.arquivado)
}

// ─── Escrita (sync local + async server) ─────────────────────────────────────

export function saveCard(card: KanbanCard): void {
  const all = readAll()
  const idx = all.findIndex(c => c.id === card.id)
  if (idx >= 0) { all[idx] = card } else { all.push(card) }
  writeAll(all)
  fetch(`${API}/api/kanban/${card.id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(card),
  }).catch(() => {})
}

export function arquivarCard(id: string): void {
  const all = readAll()
  const idx = all.findIndex(c => c.id === id)
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      arquivado: true,
      dataArquivamento: new Date().toISOString().slice(0, 10),
    }
    writeAll(all)
  }
  fetch(`${API}/api/kanban/${id}/archive`, {
    method: 'PATCH',
    headers: authHeaders(),
  }).catch(() => {})
}

export function deleteCard(id: string): void {
  writeAll(readAll().filter(c => c.id !== id))
  fetch(`${API}/api/kanban/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).catch(() => {})
}

// ─── Carga inicial do servidor (chama no mount do Kanban) ─────────────────────

export async function loadKanbanFromServer(): Promise<void> {
  const token = getToken()
  if (!token) return
  const res = await fetch(`${API}/api/kanban`, { headers: authHeaders() })
  if (!res.ok) return
  const cards: KanbanCard[] = await res.json()
  if (cards.length > 0) writeAll(cards)
}
