import { useState } from 'react'
import {
  Plus, X, Calendar, AlertCircle, Clock, CheckCircle2,
  Inbox, Search, Code2, Eye, BarChart2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'Alta' | 'Média' | 'Baixa'
type ColumnId = 'entrada' | 'analise' | 'desenvolvimento' | 'revisao' | 'concluido'

interface KanbanCard {
  id: string
  nome: string
  responsavel: string
  dataEntrada: string
  prazo: string
  prioridade: Priority
  coluna: ColumnId
  observacoes: string
}

// ─── Configuração das colunas ─────────────────────────────────────────────────

const COLUMNS: {
  id: ColumnId
  label: string
  icon: React.ElementType
  gradient: string
  accent: string
  soft: string
}[] = [
  { id: 'entrada',        label: 'Entrada',            icon: Inbox,        gradient: 'from-slate-600 to-slate-500',    accent: '#475569', soft: '#f1f5f9' },
  { id: 'analise',        label: 'Em análise',          icon: Search,       gradient: 'from-blue-600 to-blue-500',      accent: '#2563eb', soft: '#eff6ff' },
  { id: 'desenvolvimento',label: 'Em desenvolvimento',  icon: Code2,        gradient: 'from-violet-600 to-indigo-500',  accent: '#7c3aed', soft: '#f5f3ff' },
  { id: 'revisao',        label: 'Em revisão',          icon: Eye,          gradient: 'from-amber-500 to-orange-500',   accent: '#f59e0b', soft: '#fffbeb' },
  { id: 'concluido',      label: 'Concluído',           icon: CheckCircle2, gradient: 'from-emerald-600 to-teal-500',   accent: '#059669', soft: '#ecfdf5' },
]

const PRIORITY: Record<Priority, { bg: string; text: string; dot: string }> = {
  Alta:  { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500'   },
  Média: { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-500' },
  Baixa: { bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-600' },
}

// ─── Dados de exemplo ─────────────────────────────────────────────────────────

const INITIAL_CARDS: KanbanCard[] = [
  { id: '1', nome: 'Dashboard Comercial',   responsavel: 'Ana Lima',     dataEntrada: '2026-06-01', prazo: '2026-06-20', prioridade: 'Alta',  coluna: 'desenvolvimento', observacoes: 'Foco em meta vs realizado por vendedor' },
  { id: '2', nome: 'Dashboard Financeiro',  responsavel: 'Carlos Melo',  dataEntrada: '2026-05-28', prazo: '2026-06-15', prioridade: 'Alta',  coluna: 'revisao',          observacoes: '' },
  { id: '3', nome: 'Dashboard de RH',       responsavel: 'Marina Souza', dataEntrada: '2026-06-05', prazo: '2026-06-30', prioridade: 'Média', coluna: 'analise',          observacoes: 'Incluir turnover e absenteísmo' },
  { id: '4', nome: 'Dashboard de Operações',responsavel: 'João Silva',   dataEntrada: '2026-06-07', prazo: '2026-07-10', prioridade: 'Baixa', coluna: 'entrada',          observacoes: '' },
  { id: '5', nome: 'Dashboard Executivo',   responsavel: 'Filipe',       dataEntrada: '2026-05-10', prazo: '2026-05-30', prioridade: 'Alta',  coluna: 'concluido',        observacoes: 'Entregue na data combinada' },
  { id: '6', nome: 'Dashboard de Estoque',  responsavel: 'Bia Alves',    dataEntrada: '2026-06-08', prazo: '2026-07-05', prioridade: 'Média', coluna: 'entrada',          observacoes: '' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function daysLeft(prazo: string): number | null {
  if (!prazo) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dl = new Date(prazo)
  return Math.ceil((dl.getTime() - today.getTime()) / 86_400_000)
}

function initials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ─── Modal de edição / criação ────────────────────────────────────────────────

type CardDraft = Omit<KanbanCard, 'id'> & { id?: string }

function blank(col: ColumnId): CardDraft {
  return {
    nome: '', responsavel: '', prioridade: 'Média', coluna: col,
    dataEntrada: new Date().toISOString().slice(0, 10),
    prazo: '', observacoes: '',
  }
}

function Modal({ draft, onSave, onClose, onDelete }: {
  draft: CardDraft
  onSave: (d: CardDraft) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState(draft)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            {draft.id ? 'Editar card' : 'Novo card'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do dashboard *</label>
            <input
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Dashboard Comercial"
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</label>
              <input
                value={form.responsavel}
                onChange={e => set('responsavel', e.target.value)}
                placeholder="Nome"
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</label>
              <select
                value={form.prioridade}
                onChange={e => set('prioridade', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de entrada</label>
              <input
                type="date"
                value={form.dataEntrada}
                onChange={e => set('dataEntrada', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prazo de entrega</label>
              <input
                type="date"
                value={form.prazo}
                onChange={e => set('prazo', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Etapa</label>
            <select
              value={form.coluna}
              onChange={e => set('coluna', e.target.value)}
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            >
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              placeholder="Detalhes adicionais, contexto, requisitos..."
              rows={3}
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button onClick={onDelete} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
              Excluir
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => { if (form.nome.trim()) onSave(form) }}
              disabled={!form.nome.trim()}
              className="px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card do Kanban ───────────────────────────────────────────────────────────

function KCard({ card, accent, dragging, onDragStart, onDragEnd, onClick }: {
  card: KanbanCard; accent: string; dragging: boolean
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void
}) {
  const days = daysLeft(card.prazo)
  const overdue = days !== null && days < 0
  const soon    = days !== null && days >= 0 && days <= 3
  const p = PRIORITY[card.prioridade]

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-200 ${
        dragging ? 'opacity-30 scale-95 shadow-none' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Nome + prioridade */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{card.nome}</p>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${p.bg} ${p.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {card.prioridade}
        </span>
      </div>

      {/* Responsável */}
      {card.responsavel && (
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: accent }}
          >
            {initials(card.responsavel)}
          </div>
          <span className="text-xs text-slate-500 truncate">{card.responsavel}</span>
        </div>
      )}

      {/* Datas */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={10} />
          <span>{fmt(card.dataEntrada)}</span>
        </div>
        {card.prazo && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {overdue ? <AlertCircle size={10} /> : <Clock size={10} />}
            <span>
              {overdue
                ? `${Math.abs(days!)}d atrasado`
                : days === 0 ? 'Vence hoje'
                : `${days}d restantes`}
            </span>
          </div>
        )}
      </div>

      {/* Observação */}
      {card.observacoes && (
        <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">{card.observacoes}</p>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Kanban() {
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS)
  const [dragId, setDragId]   = useState<string | null>(null)
  const [overCol, setOverCol] = useState<ColumnId | null>(null)
  const [modal, setModal]     = useState<CardDraft | null>(null)

  function moveCard(id: string, to: ColumnId) {
    setCards(p => p.map(c => c.id === id ? { ...c, coluna: to } : c))
  }

  function handleDrop(colId: ColumnId) {
    if (dragId) moveCard(dragId, colId)
    setDragId(null)
    setOverCol(null)
  }

  function saveCard(d: CardDraft) {
    if (d.id) {
      setCards(p => p.map(c => c.id === d.id ? { ...c, ...d, id: c.id } : c))
    } else {
      setCards(p => [...p, { ...d, id: `k-${Date.now()}` }])
    }
    setModal(null)
  }

  function deleteCard(id: string) {
    setCards(p => p.filter(c => c.id !== id))
    setModal(null)
  }

  const total = cards.length
  const done  = cards.filter(c => c.coluna === 'concluido').length

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kanban de Dashboards</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {done} de {total} dashboards concluídos · arraste os cards para mover entre etapas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progresso geral */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${total ? Math.round((done / total) * 100) : 0}%`,
                  background: 'linear-gradient(to right, #059669, #0d9488)',
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600">
              {total ? Math.round((done / total) * 100) : 0}%
            </span>
          </div>
          <button
            onClick={() => setModal(blank('entrada'))}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          >
            <Plus size={15} /> Novo card
          </button>
        </div>
      </div>

      {/* ── Board ── */}
      <div className="flex gap-3 flex-1 overflow-x-auto pb-2 min-h-0">
        {COLUMNS.map(col => {
          const colCards = cards.filter(c => c.coluna === col.id)
          const isOver   = overCol === col.id && dragId !== null

          return (
            <div
              key={col.id}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverCol(col.id) }}
              onDragLeave={e => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null)
              }}
              onDrop={e => { e.preventDefault(); handleDrop(col.id) }}
              className="flex flex-col flex-shrink-0 w-64 rounded-2xl transition-all duration-200"
              style={{
                background: isOver ? col.accent + '14' : col.soft,
                outline: isOver ? `2px solid ${col.accent}55` : 'none',
                outlineOffset: '2px',
              }}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2 px-3.5 py-3 rounded-t-2xl bg-gradient-to-r ${col.gradient} flex-shrink-0`}>
                <col.icon size={13} color="white" />
                <span className="text-sm font-bold text-white flex-1 truncate">{col.label}</span>
                <span className="text-xs font-bold bg-white/25 text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                  {colCards.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-16">
                {colCards.map(card => (
                  <KCard
                    key={card.id}
                    card={card}
                    accent={col.accent}
                    dragging={dragId === card.id}
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null) }}
                    onClick={() => setModal({ ...card })}
                  />
                ))}

                {/* Drop placeholder */}
                {isOver && (
                  <div
                    className="rounded-xl h-14 border-2 border-dashed transition-all"
                    style={{ borderColor: col.accent + '55', background: col.accent + '0a' }}
                  />
                )}

                {/* Empty state */}
                {colCards.length === 0 && !isOver && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300 select-none">
                    <col.icon size={20} />
                    <p className="text-xs mt-2 font-medium">Vazio</p>
                  </div>
                )}
              </div>

              {/* Add button */}
              <div className="p-2.5 pt-0 flex-shrink-0">
                <button
                  onClick={() => setModal(blank(col.id))}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-white transition-all"
                >
                  <Plus size={11} /> Adicionar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          draft={modal}
          onSave={saveCard}
          onClose={() => setModal(null)}
          onDelete={modal.id ? () => deleteCard(modal.id!) : undefined}
        />
      )}
    </div>
  )
}
