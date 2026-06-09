// ─── KanbanStore — persiste cards no localStorage ─────────────────────────────

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
  // datas de passagem por etapa
  dataAnalise: string
  dataDesenvolvimento: string
  dataRevisao: string
  dataConcluido: string
  dataArquivamento: string
  arquivado: boolean
  // briefing do canvas
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
    resumo?: string          // resumo executivo para auditoria
  }
}

const KEY = 'chua_cards'

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

export function getCards(): KanbanCard[] {
  return readAll().filter(c => !c.arquivado)
}

export function getArquivados(): KanbanCard[] {
  return readAll().filter(c => c.arquivado)
}

export function saveCard(card: KanbanCard): void {
  const all = readAll()
  const idx = all.findIndex(c => c.id === card.id)
  if (idx >= 0) {
    all[idx] = card
  } else {
    all.push(card)
  }
  writeAll(all)
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
}

export function deleteCard(id: string): void {
  writeAll(readAll().filter(c => c.id !== id))
}
