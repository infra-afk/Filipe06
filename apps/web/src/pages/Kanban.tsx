import { useState, useRef } from 'react'
import {
  Plus, X, Calendar, AlertCircle, Clock, CheckCircle2,
  Inbox, Search, Code2, Eye, MoreHorizontal, Edit2, Trash2,
  ChevronDown, ChevronRight, Layers, SlidersHorizontal,
  Zap, Flag, Star, PauseCircle, FileOutput, Tag, Lock,
  GripVertical, Filter, Users, Archive, FileText,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'Alta' | 'Média' | 'Baixa'
type SwimlaneMode = 'none' | 'prioridade' | 'responsavel'

interface KanbanCard {
  id: string
  nome: string
  responsavel: string
  dataEntrada: string
  prazo: string
  prioridade: Priority
  coluna: string
  observacoes: string
  tags: string[]
  // datas por etapa
  dataAnalise?: string
  dataDesenvolvimento?: string
  dataRevisao?: string
  dataConcluido?: string
}

interface CardArquivado extends KanbanCard {
  dataArquivamento: string
}

interface KanbanColumn {
  id: string
  label: string
  accent: string
  gradient: string
  iconKey: string
  wip: number        // 0 = sem limite
  collapsed: boolean
}

// ─── Ícones e cores disponíveis ───────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  inbox: Inbox, search: Search, code: Code2, eye: Eye,
  check: CheckCircle2, zap: Zap, flag: Flag, star: Star,
  pause: PauseCircle, layers: Layers,
}

const COLOR_PRESETS = [
  { accent: '#475569', gradient: 'from-slate-600 to-slate-500'   },
  { accent: '#2563eb', gradient: 'from-blue-600 to-blue-500'     },
  { accent: '#0f766e', gradient: 'from-teal-700 to-teal-600'    },
  { accent: '#059669', gradient: 'from-emerald-600 to-teal-500'  },
  { accent: '#f59e0b', gradient: 'from-amber-500 to-orange-500'  },
  { accent: '#dc2626', gradient: 'from-red-600 to-rose-500'      },
  { accent: '#e11d48', gradient: 'from-rose-600 to-pink-500'     },
  { accent: '#0d9488', gradient: 'from-teal-600 to-cyan-500'     },
  { accent: '#0284c7', gradient: 'from-sky-600 to-sky-500'       },
  { accent: '#ea580c', gradient: 'from-orange-600 to-orange-500' },
]

const PRIORITY_CFG: Record<Priority, { bg: string; text: string; dot: string; label: string }> = {
  Alta:  { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500',   label: 'Alta'  },
  Média: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Média' },
  Baixa: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-600', label: 'Baixa' },
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700',
  'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700',
  'bg-red-100 text-red-700', 'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700',
]

// ─── Dados iniciais ───────────────────────────────────────────────────────────

const INIT_COLS: KanbanColumn[] = [
  { id: 'entrada',        label: 'Entrada',            accent: '#475569', gradient: 'from-slate-600 to-slate-500',    iconKey: 'inbox', wip: 0, collapsed: false },
  { id: 'analise',        label: 'Em análise',          accent: '#2563eb', gradient: 'from-blue-600 to-blue-500',      iconKey: 'search',wip: 0, collapsed: false },
  { id: 'desenvolvimento',label: 'Em desenvolvimento',  accent: '#0369a1', gradient: 'from-sky-700 to-sky-600',        iconKey: 'code',  wip: 5, collapsed: false },
  { id: 'revisao',        label: 'Em revisão',          accent: '#f59e0b', gradient: 'from-amber-500 to-orange-500',   iconKey: 'eye',   wip: 3, collapsed: false },
  { id: 'concluido',      label: 'Concluído',           accent: '#059669', gradient: 'from-emerald-600 to-teal-500',   iconKey: 'check', wip: 0, collapsed: false },
]

function loadCards(): KanbanCard[] {
  const base: KanbanCard[] = [
    { id: '1', nome: 'Dashboard Comercial',    responsavel: 'Ana Lima',     dataEntrada: '2026-06-01', prazo: '2026-06-20', prioridade: 'Alta',  coluna: 'desenvolvimento', observacoes: 'Foco em meta vs realizado por vendedor', tags: ['Vendas','Urgente'] },
    { id: '2', nome: 'Dashboard Financeiro',   responsavel: 'Carlos Melo',  dataEntrada: '2026-05-28', prazo: '2026-06-15', prioridade: 'Alta',  coluna: 'revisao',          observacoes: '', tags: ['DRE'] },
    { id: '3', nome: 'Dashboard de RH',        responsavel: 'Marina Souza', dataEntrada: '2026-06-05', prazo: '2026-06-30', prioridade: 'Média', coluna: 'analise',          observacoes: 'Incluir turnover e absenteísmo', tags: ['RH'] },
    { id: '4', nome: 'Dashboard de Operações', responsavel: 'João Silva',   dataEntrada: '2026-06-07', prazo: '2026-07-10', prioridade: 'Baixa', coluna: 'entrada',          observacoes: '', tags: [] },
    { id: '5', nome: 'Dashboard Executivo',    responsavel: 'Filipe',       dataEntrada: '2026-05-10', prazo: '2026-05-30', prioridade: 'Alta',  coluna: 'concluido',        observacoes: 'Entregue na data combinada', tags: ['Exec'] },
    { id: '6', nome: 'Dashboard de Estoque',   responsavel: 'Bia Alves',    dataEntrada: '2026-06-08', prazo: '2026-07-05', prioridade: 'Média', coluna: 'entrada',          observacoes: '', tags: [] },
    { id: '7', nome: 'Dashboard de Suporte',   responsavel: 'Carlos Melo',  dataEntrada: '2026-06-09', prazo: '2026-07-20', prioridade: 'Baixa', coluna: 'analise',          observacoes: '', tags: ['Suporte'] },
  ]
  try {
    const pending = JSON.parse(localStorage.getItem('kanban_from_canvas') || '[]') as KanbanCard[]
    if (pending.length > 0) {
      localStorage.removeItem('kanban_from_canvas')
      return [...base, ...pending]
    }
  } catch { /* ignore */ }
  return base
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function daysLeft(prazo: string): number | null {
  if (!prazo) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(prazo).getTime() - today.getTime()) / 86_400_000)
}

function initials(name: string) {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function tagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

// ─── Modal de Coluna ──────────────────────────────────────────────────────────

type ColDraft = Omit<KanbanColumn, 'collapsed' | 'id'> & { id?: string }

function blankCol(): ColDraft {
  return { label: '', accent: COLOR_PRESETS[0].accent, gradient: COLOR_PRESETS[0].gradient, iconKey: 'inbox', wip: 0 }
}

function ColumnModal({ draft, onSave, onClose, onDelete }: {
  draft: ColDraft; onSave: (d: ColDraft) => void
  onClose: () => void; onDelete?: () => void
}) {
  const [form, setForm] = useState(draft)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{draft.id ? 'Editar coluna' : 'Nova coluna'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={15} className="text-slate-500" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome da coluna *</label>
            <input
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex: Em espera, Bloqueado..."
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Cor */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cor</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.accent}
                  onClick={() => setForm(f => ({ ...f, accent: p.accent, gradient: p.gradient }))}
                  className={`w-8 h-8 rounded-xl transition-all ${form.accent === p.accent ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                  style={{ background: p.accent }}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ícone</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(ICON_MAP).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, iconKey: key }))}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    form.iconKey === key ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  style={form.iconKey === key ? { background: form.accent } : {}}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* WIP */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limite WIP</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, wip: f.wip > 0 ? 0 : 3 }))}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.wip > 0 ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.wip > 0 ? 'left-6' : 'left-1'}`} />
              </button>
              {form.wip > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setForm(f => ({ ...f, wip: Math.max(1, f.wip - 1) }))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">-</button>
                  <span className="text-sm font-bold text-slate-700 w-6 text-center">{form.wip}</span>
                  <button onClick={() => setForm(f => ({ ...f, wip: f.wip + 1 }))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">+</button>
                  <span className="text-xs text-slate-400">cards máx.</span>
                </div>
              )}
              {form.wip === 0 && <span className="text-xs text-slate-400">Sem limite de cards</span>}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-slate-100">
          <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${form.gradient}`}>
            {(() => { const Icon = ICON_MAP[form.iconKey] || Inbox; return <Icon size={12} color="white" /> })()}
            <span className="text-xs font-bold text-white flex-1">{form.label || 'Prévia'}</span>
            {form.wip > 0 && <span className="text-[10px] bg-white/25 text-white rounded-full px-1.5 font-bold">0/{form.wip}</span>}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          {onDelete ? (
            <button onClick={onDelete} className="text-xs font-semibold text-red-500 hover:text-red-700">Excluir coluna</button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
            <button
              onClick={() => { if (form.label.trim()) onSave(form) }}
              disabled={!form.label.trim()}
              className="px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all"
              style={{ background: form.accent }}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de Card ────────────────────────────────────────────────────────────

type CardDraft = Omit<KanbanCard, 'id'> & { id?: string }

function blankCard(coluna: string): CardDraft {
  return {
    nome: '', responsavel: '', prioridade: 'Média', coluna,
    dataEntrada: new Date().toISOString().slice(0, 10),
    prazo: '', observacoes: '', tags: [],
    dataAnalise: '', dataDesenvolvimento: '', dataRevisao: '', dataConcluido: '',
  }
}

const ETAPA_DATAS: { campo: keyof KanbanCard; label: string; col: string }[] = [
  { campo: 'dataEntrada',        label: 'Entrada',          col: 'entrada'         },
  { campo: 'dataAnalise',        label: 'Em Análise',       col: 'analise'         },
  { campo: 'dataDesenvolvimento',label: 'Em Desenvolvimento',col: 'desenvolvimento' },
  { campo: 'dataRevisao',        label: 'Em Revisão',       col: 'revisao'         },
  { campo: 'dataConcluido',      label: 'Concluído',        col: 'concluido'       },
]

function CardModal({ draft, columns, onSave, onClose, onDelete, onArquivar }: {
  draft: CardDraft; columns: KanbanColumn[]
  onSave: (d: CardDraft) => void; onClose: () => void; onDelete?: () => void; onArquivar?: () => void
}) {
  const [form, setForm] = useState(draft)
  const [tagInput, setTagInput] = useState('')
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  function addTag() {
    const t = tagInput.trim()
    if (!t || form.tags.includes(t)) return
    setForm(p => ({ ...p, tags: [...p.tags, t] }))
    setTagInput('')
  }

  function removeTag(t: string) {
    setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{draft.id ? 'Editar card' : 'Novo card'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={15} className="text-slate-500" /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome *</label>
            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do dashboard"
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</label>
              <input value={form.responsavel} onChange={e => set('responsavel', e.target.value)} placeholder="Nome"
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</label>
              <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white transition-all">
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de entrada</label>
              <input type="date" value={form.dataEntrada} onChange={e => set('dataEntrada', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prazo</label>
              <input type="date" value={form.prazo} onChange={e => set('prazo', e.target.value)}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coluna</label>
            <select value={form.coluna} onChange={e => set('coluna', e.target.value)}
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white transition-all">
              {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Datas por etapa */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
              Datas por Etapa
            </label>
            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {ETAPA_DATAS.map(e => (
                <div key={e.campo} className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-semibold text-slate-500 w-36 flex-shrink-0">{e.label}</span>
                  <input
                    type="date"
                    value={(form as any)[e.campo] || ''}
                    onChange={ev => set(e.campo, ev.target.value)}
                    className="flex-1 text-sm outline-none text-slate-700 bg-transparent border-0 focus:ring-0"
                  />
                  {(form as any)[e.campo] && (
                    <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full flex-shrink-0">✓</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Registre quando o card passou por cada etapa para rastreabilidade e auditoria.</p>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => (
                <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tagColor(t)}`}>
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:opacity-70"><X size={9} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Nova tag..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              <button onClick={addTag} disabled={!tagInput.trim()}
                className="px-3 py-2 text-xs font-bold text-white rounded-xl disabled:opacity-40 bg-blue-600 hover:bg-blue-700 transition-all">
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</label>
            <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
              placeholder="Detalhes adicionais..." rows={3}
              className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {onDelete && (
              <button onClick={onDelete} className="text-xs font-semibold text-red-500 hover:text-red-700">Excluir</button>
            )}
            {onArquivar && draft.coluna === 'concluido' && (
              <button onClick={onArquivar}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-all">
                <Archive size={12} /> Arquivar no Relatório
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
            <button onClick={() => { if (form.nome.trim()) onSave(form) }} disabled={!form.nome.trim()}
              className="px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function KCard({ card, accent, dragging, onDragStart, onDragEnd, onClick }: {
  card: KanbanCard; accent: string; dragging: boolean
  onDragStart: () => void; onDragEnd: () => void; onClick: () => void
}) {
  const days = daysLeft(card.prazo)
  const overdue = days !== null && days < 0
  const soon    = days !== null && days >= 0 && days <= 3
  const p = PRIORITY_CFG[card.prioridade]

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
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{card.nome}</p>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${p.bg} ${p.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>
      </div>

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(t => (
            <span key={t} className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tagColor(t)}`}>{t}</span>
          ))}
        </div>
      )}

      {/* Responsável */}
      {card.responsavel && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: accent }}>
            {initials(card.responsavel)}
          </div>
          <span className="text-xs text-slate-500 truncate">{card.responsavel}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={10} />
          <span>{fmt(card.dataEntrada)}</span>
        </div>
        {card.prazo && (
          <div className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-600' : soon ? 'text-amber-600' : 'text-slate-400'}`}>
            {overdue ? <AlertCircle size={10} /> : <Clock size={10} />}
            <span>{overdue ? `${Math.abs(days!)}d atrasado` : days === 0 ? 'Hoje' : `${days}d`}</span>
          </div>
        )}
      </div>

      {card.observacoes && (
        <p className="mt-1.5 text-xs text-slate-400 italic line-clamp-1">{card.observacoes}</p>
      )}
    </div>
  )
}

// ─── Coluna Kanban ────────────────────────────────────────────────────────────

function KColumn({ col, cards, dragId, overCol, swimRow,
  onDragOver, onDragLeave, onDrop,
  onCardDragStart, onCardDragEnd,
  onCardClick, onAddCard,
  onEditCol, onDeleteCol,
}: {
  col: KanbanColumn; cards: KanbanCard[]; dragId: string | null
  overCol: string | null; swimRow?: string
  onDragOver: () => void; onDragLeave: (e: React.DragEvent) => void
  onDrop: () => void
  onCardDragStart: (id: string) => void; onCardDragEnd: () => void
  onCardClick: (card: KanbanCard) => void
  onAddCard: () => void; onEditCol: () => void; onDeleteCol: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropKey = swimRow ? `${col.id}:${swimRow}` : col.id
  const isOver  = overCol === dropKey && dragId !== null
  const wipExceeded = col.wip > 0 && cards.length >= col.wip
  const ColIcon = ICON_MAP[col.iconKey] || Inbox

  if (col.collapsed) {
    return (
      <div className="flex-shrink-0 w-12 flex flex-col rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className={`flex-1 flex flex-col items-center py-3 bg-gradient-to-b ${col.gradient} cursor-pointer`}
          onClick={onEditCol} title={col.label}>
          <ColIcon size={14} color="white" />
          <span className="mt-2 text-[10px] font-bold text-white/80 writing-mode-vertical rotate-180"
            style={{ writingMode: 'vertical-rl' }}>
            {col.label}
          </span>
          <span className="mt-2 text-xs font-bold bg-white/25 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {cards.length}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop() }}
      className="flex flex-col flex-shrink-0 w-64 rounded-2xl transition-all duration-200"
      style={{
        background: isOver ? col.accent + '14' : col.accent + '0a',
        outline: isOver ? `2px solid ${col.accent}55` : 'none',
        outlineOffset: '2px',
      }}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-2xl bg-gradient-to-r ${col.gradient} flex-shrink-0`}>
        <ColIcon size={13} color="white" />
        <span className="text-sm font-bold text-white flex-1 truncate">{col.label}</span>

        {/* WIP badge */}
        <span className={`text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 flex items-center justify-center flex-shrink-0 ${
          wipExceeded ? 'bg-red-500 text-white animate-pulse' : 'bg-white/25 text-white'
        }`}>
          {col.wip > 0 ? `${cards.length}/${col.wip}` : cards.length}
        </span>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(p => !p)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <MoreHorizontal size={13} color="white" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-30 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-44 animate-fade-up"
              onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { onEditCol(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Edit2 size={12} /> Editar coluna
              </button>
              <button onClick={() => { onAddCard(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Plus size={12} /> Adicionar card
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button onClick={() => onDeleteCol()}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50">
                <Trash2 size={12} /> Excluir coluna
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WIP warning */}
      {wipExceeded && (
        <div className="px-2.5 py-1.5 bg-red-50 border-b border-red-100 flex items-center gap-1.5">
          <Lock size={10} className="text-red-500" />
          <span className="text-[10px] font-semibold text-red-600">Limite WIP atingido ({col.wip})</span>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-16">
        {cards.map(card => (
          <KCard key={card.id} card={card} accent={col.accent}
            dragging={dragId === card.id}
            onDragStart={() => onCardDragStart(card.id)}
            onDragEnd={onCardDragEnd}
            onClick={() => onCardClick(card)}
          />
        ))}

        {isOver && (
          <div className="rounded-xl h-14 border-2 border-dashed transition-all"
            style={{ borderColor: col.accent + '55', background: col.accent + '0a' }} />
        )}

        {cards.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300 select-none">
            <ColIcon size={20} />
            <p className="text-xs mt-2 font-medium">Vazio</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="p-2.5 pt-0 flex-shrink-0">
        <button onClick={onAddCard}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-white transition-all">
          <Plus size={11} /> Adicionar
        </button>
      </div>
    </div>
  )
}

// ─── Formulário Rápido ────────────────────────────────────────────────────────

function FormRapido({ columns, onSave }: {
  columns: KanbanColumn[]
  onSave: (d: CardDraft) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState<CardDraft>(blankCard(columns[0]?.id || ''))

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  function addTag() {
    const t = tagInput.trim()
    if (!t || form.tags.includes(t)) return
    setForm(p => ({ ...p, tags: [...p.tags, t] }))
    setTagInput('')
  }

  function removeTag(t: string) {
    setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))
  }

  function handleSave() {
    if (!form.nome.trim()) return
    onSave(form)
    setForm(blankCard(columns[0]?.id || ''))
    setTagInput('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 2500)
  }

  return (
    <div className="flex-shrink-0 border-t border-slate-100 pt-4 mt-2">
      {/* Toggle */}
      <button
        onClick={() => setAberto(p => !p)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white transition-all ${aberto ? 'bg-slate-400 rotate-45' : 'bg-blue-600'}`}>
          <Plus size={12} />
        </div>
        {aberto ? 'Fechar formulário' : 'Adicionar novo card rapidamente'}
      </button>

      {aberto && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-up">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Novo Card</h3>
                <p className="text-[11px] text-slate-400">Preencha os campos e clique em Adicionar</p>
              </div>
            </div>
            {enviado && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle2 size={12} /> Card adicionado!
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Nome */}
              <div className="lg:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Nome do Dashboard *
                </label>
                <input
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="Ex: Dashboard Financeiro, Dashboard de Vendas..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Coluna */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Coluna
                </label>
                <select
                  value={form.coluna}
                  onChange={e => set('coluna', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white transition-all"
                >
                  {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Responsável
                </label>
                <input
                  value={form.responsavel}
                  onChange={e => set('responsavel', e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Prioridade */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Prioridade
                </label>
                <div className="flex gap-2">
                  {(['Alta', 'Média', 'Baixa'] as Priority[]).map(p => {
                    const cfg = PRIORITY_CFG[p]
                    return (
                      <button
                        key={p}
                        onClick={() => setForm(f => ({ ...f, prioridade: p }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          form.prioridade === p
                            ? `${cfg.bg} ${cfg.text} border-current`
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Prazo */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Prazo
                </label>
                <input
                  type="date"
                  value={form.prazo}
                  onChange={e => set('prazo', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Tags
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-wrap items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 min-h-[42px]">
                    {form.tags.map(t => (
                      <span key={t} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tagColor(t)}`}>
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:opacity-70"><X size={9} /></button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                      placeholder={form.tags.length === 0 ? 'Digite uma tag e pressione Enter...' : 'Mais tags...'}
                      className="flex-1 min-w-[120px] text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
                    />
                  </div>
                  {tagInput.trim() && (
                    <button
                      onClick={addTag}
                      className="px-3 py-2 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-all flex-shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Observações
                </label>
                <textarea
                  value={form.observacoes}
                  onChange={e => set('observacoes', e.target.value)}
                  placeholder="Detalhes, contexto ou requisitos do dashboard..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                />
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {form.nome.trim() ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Pronto para adicionar
                  </span>
                ) : (
                  '* Nome obrigatório'
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setForm(blankCard(columns[0]?.id || '')); setTagInput('') }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Limpar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.nome.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all shadow-md hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}
                >
                  <Plus size={14} /> Adicionar Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

function loadArquivados(): CardArquivado[] {
  try { return JSON.parse(localStorage.getItem('kanban_arquivados') || '[]') } catch { return [] }
}

export default function Kanban() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INIT_COLS)
  const [cards,   setCards]   = useState<KanbanCard[]>(loadCards)
  const [dragId,  setDragId]  = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null>(null)
  const [cardModal, setCardModal] = useState<CardDraft | null>(null)
  const [colModal,  setColModal]  = useState<ColDraft | null>(null)
  const [arquivados, setArquivados] = useState<CardArquivado[]>(loadArquivados)
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false)

  // Filtros
  const [search,    setSearch]    = useState('')
  const [filterPri, setFilterPri] = useState<Priority | ''>('')
  const [filterResp,setFilterResp]= useState('')
  const [swimlane,  setSwimlane]  = useState<SwimlaneMode>('none')
  const [showFilters, setShowFilters] = useState(false)

  // Derived
  const visibleCards = cards.filter(c => {
    if (search     && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.responsavel.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPri  && c.prioridade !== filterPri) return false
    if (filterResp && c.responsavel !== filterResp) return false
    return true
  })

  const allResps = [...new Set(cards.map(c => c.responsavel).filter(Boolean))]

  const swimGroups: string[] = swimlane === 'prioridade'
    ? ['Alta', 'Média', 'Baixa']
    : swimlane === 'responsavel'
      ? allResps
      : []

  const done  = cards.filter(c => c.coluna === 'concluido').length
  const total = cards.length
  const activeFilters = [search, filterPri, filterResp].filter(Boolean).length

  // Drag
  function handleDrop(colId: string) {
    if (dragId) setCards(p => p.map(c => c.id === dragId ? { ...c, coluna: colId } : c))
    setDragId(null); setOverCol(null)
  }

  // Cards CRUD
  function saveCard(d: CardDraft) {
    if (d.id) setCards(p => p.map(c => c.id === d.id ? { ...c, ...d, id: c.id } : c))
    else       setCards(p => [...p, { ...d, id: `k-${Date.now()}` }])
    setCardModal(null)
  }
  function deleteCard(id: string) { setCards(p => p.filter(c => c.id !== id)); setCardModal(null) }

  function arquivarCard(id: string) {
    const card = cards.find(c => c.id === id)
    if (!card) return
    const arquivado: CardArquivado = { ...card, dataArquivamento: new Date().toISOString().slice(0, 10) }
    const novos = [...arquivados, arquivado]
    setArquivados(novos)
    localStorage.setItem('kanban_arquivados', JSON.stringify(novos))
    setCards(p => p.filter(c => c.id !== id))
    setCardModal(null)
  }

  // Columns CRUD
  function saveColumn(d: ColDraft) {
    if (d.id) {
      setColumns(p => p.map(c => c.id === d.id ? { ...c, ...d, collapsed: c.collapsed } : c))
    } else {
      const id = `col-${Date.now()}`
      setColumns(p => [...p, { ...d, id, collapsed: false }])
    }
    setColModal(null)
  }
  function deleteColumn(id: string) {
    setColumns(p => p.filter(c => c.id !== id))
    setCards(p => p.filter(c => c.coluna !== id))
    setColModal(null)
  }
  function toggleCollapse(id: string) {
    setColumns(p => p.map(c => c.id === id ? { ...c, collapsed: !c.collapsed } : c))
  }

  // Render
  function colCards(colId: string, group?: string) {
    return visibleCards.filter(c => {
      if (c.coluna !== colId) return false
      if (group && swimlane === 'prioridade'  && c.prioridade  !== group) return false
      if (group && swimlane === 'responsavel' && c.responsavel !== group) return false
      return true
    })
  }

  function dragKey(colId: string, group?: string) {
    return group ? `${colId}:${group}` : colId
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0 gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kanban de Dashboards</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {done}/{total} concluídos · {columns.length} colunas · {cards.length} cards
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Progresso */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${total ? Math.round((done / total) * 100) : 0}%`, background: 'linear-gradient(to right,#059669,#0d9488)' }} />
            </div>
            <span className="text-xs font-bold text-slate-600">{total ? Math.round((done / total) * 100) : 0}%</span>
          </div>

          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              showFilters || activeFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}>
            <Filter size={12} />
            Filtros
            {activeFilters > 0 && <span className="bg-white text-blue-600 rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{activeFilters}</span>}
          </button>

          <button onClick={() => setColModal(blankCol())}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
            <Plus size={12} /> Coluna
          </button>

          <button onClick={() => setMostrarRelatorio(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              mostrarRelatorio ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
            }`}>
            <FileText size={12} /> Relatório
            {arquivados.length > 0 && (
              <span className={`rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center ${mostrarRelatorio ? 'bg-white text-teal-600' : 'bg-teal-600 text-white'}`}>
                {arquivados.length}
              </span>
            )}
          </button>

          <button onClick={() => setCardModal(blankCard(columns[0]?.id || ''))}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}>
            <Plus size={14} /> Novo card
          </button>
        </div>
      </div>

      {/* ── Barra de filtros ── */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-up flex-shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[160px] border border-slate-200 rounded-xl px-3 py-2">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cards..."
              className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent" />
            {search && <button onClick={() => setSearch('')}><X size={12} className="text-slate-400" /></button>}
          </div>

          {/* Prioridade */}
          <div className="flex items-center gap-1">
            {(['', 'Alta', 'Média', 'Baixa'] as (Priority | '')[]).map(p => (
              <button key={p} onClick={() => setFilterPri(p)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filterPri === p
                    ? p === '' ? 'bg-slate-700 text-white border-slate-700'
                      : p === 'Alta' ? 'bg-red-500 text-white border-red-500'
                      : p === 'Média' ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}>
                {p || 'Todas'}
              </button>
            ))}
          </div>

          {/* Responsável */}
          <select value={filterResp} onChange={e => setFilterResp(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-400 bg-white">
            <option value="">Todos responsáveis</option>
            {allResps.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Swimlane */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1"><Layers size={11} /> Swimlane:</span>
            {([['none','Nenhuma'],['prioridade','Prioridade'],['responsavel','Responsável']] as [SwimlaneMode, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setSwimlane(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${swimlane === k ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Recolher colunas */}
          <div className="flex items-center gap-1 ml-auto">
            {columns.map(c => (
              <button key={c.id} onClick={() => toggleCollapse(c.id)} title={c.collapsed ? `Expandir ${c.label}` : `Recolher ${c.label}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                  c.collapsed ? 'text-white border-transparent' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
                style={c.collapsed ? { background: c.accent } : {}}>
                {(() => { const Icon = ICON_MAP[c.iconKey] || Inbox; return <Icon size={11} /> })()}
              </button>
            ))}
            <span className="text-xs text-slate-400 ml-1">recolher</span>
          </div>
        </div>
      )}

      {/* ── Board ── */}
      {swimlane === 'none' ? (
        /* Modo normal */
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: '480px' }}>
          {columns.map(col => (
            <KColumn key={col.id} col={col}
              cards={colCards(col.id)}
              dragId={dragId} overCol={overCol}
              onDragOver={() => setOverCol(col.id)}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null) }}
              onDrop={() => handleDrop(col.id)}
              onCardDragStart={id => setDragId(id)}
              onCardDragEnd={() => { setDragId(null); setOverCol(null) }}
              onCardClick={card => setCardModal({ ...card })}
              onAddCard={() => setCardModal(blankCard(col.id))}
              onEditCol={() => setColModal({ id: col.id, label: col.label, accent: col.accent, gradient: col.gradient, iconKey: col.iconKey, wip: col.wip })}
              onDeleteCol={() => deleteColumn(col.id)}
            />
          ))}

          {/* Add column */}
          <button onClick={() => setColModal(blankCol())}
            className="flex-shrink-0 w-48 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all self-start py-8">
            <Plus size={20} />
            <span className="text-xs font-semibold">Nova coluna</span>
          </button>
        </div>
      ) : (
        /* Modo swimlane */
        <div className="overflow-auto pb-2" style={{ minHeight: '480px' }}>
          {/* Column headers */}
          <div className="flex gap-3 mb-2 pl-32 sticky top-0 z-10 pb-1 bg-inherit">
            {columns.filter(c => !c.collapsed).map(col => {
              const ColIcon = ICON_MAP[col.iconKey] || Inbox
              return (
                <div key={col.id} className={`flex-shrink-0 w-64 rounded-xl bg-gradient-to-r ${col.gradient} px-3 py-2 flex items-center gap-2`}>
                  <ColIcon size={12} color="white" />
                  <span className="text-xs font-bold text-white truncate flex-1">{col.label}</span>
                  <span className="text-[10px] bg-white/25 text-white rounded-full px-1.5 font-bold">
                    {visibleCards.filter(c => c.coluna === col.id).length}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Swimlane rows */}
          <div className="space-y-3">
            {swimGroups.map(group => {
              const p = swimlane === 'prioridade' ? PRIORITY_CFG[group as Priority] : null
              const groupCards = visibleCards.filter(c =>
                swimlane === 'prioridade' ? c.prioridade === group : c.responsavel === group
              )
              return (
                <div key={group} className="flex gap-3">
                  {/* Row label */}
                  <div className="w-28 flex-shrink-0 flex flex-col items-center justify-start pt-3 gap-1">
                    {p ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.bg} ${p.text} flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                        {group}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                          {initials(group)}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[72px]">{group}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400">{groupCards.length} cards</span>
                  </div>

                  {/* Column cells */}
                  {columns.filter(c => !c.collapsed).map(col => {
                    const cellCards = colCards(col.id, group)
                    const key = dragKey(col.id, group)
                    const isOver = overCol === key && dragId !== null
                    return (
                      <div key={col.id}
                        onDragOver={e => { e.preventDefault(); setOverCol(key) }}
                        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null) }}
                        onDrop={e => { e.preventDefault(); handleDrop(col.id) }}
                        className="flex-shrink-0 w-64 rounded-xl p-2 space-y-2 min-h-16 transition-all"
                        style={{ background: isOver ? col.accent + '18' : col.accent + '08', outline: isOver ? `2px solid ${col.accent}44` : 'none' }}>
                        {cellCards.map(card => (
                          <KCard key={card.id} card={card} accent={col.accent}
                            dragging={dragId === card.id}
                            onDragStart={() => setDragId(card.id)}
                            onDragEnd={() => { setDragId(null); setOverCol(null) }}
                            onClick={() => setCardModal({ ...card })}
                          />
                        ))}
                        {isOver && <div className="rounded-xl h-12 border-2 border-dashed" style={{ borderColor: col.accent + '55' }} />}
                        {cellCards.length === 0 && !isOver && (
                          <div className="h-10 flex items-center justify-center">
                            <span className="text-xs text-slate-300">—</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Modais ── */}
      {cardModal && (
        <CardModal draft={cardModal} columns={columns}
          onSave={saveCard} onClose={() => setCardModal(null)}
          onDelete={cardModal.id ? () => deleteCard(cardModal.id!) : undefined}
          onArquivar={cardModal.id ? () => arquivarCard(cardModal.id!) : undefined} />
      )}
      {colModal && (
        <ColumnModal draft={colModal}
          onSave={saveColumn} onClose={() => setColModal(null)}
          onDelete={colModal.id ? () => deleteColumn(colModal.id!) : undefined} />
      )}

      {/* ── Relatório de Arquivados ── */}
      {mostrarRelatorio && (
        <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
                <Archive size={15} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Relatório de Dashboards Arquivados</h3>
                <p className="text-[11px] text-slate-400">{arquivados.length} registro{arquivados.length !== 1 ? 's' : ''} arquivado{arquivados.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {arquivados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <Archive size={32} />
              <p className="text-sm mt-2 font-medium">Nenhum card arquivado ainda</p>
              <p className="text-xs mt-1 text-slate-400">Mova cards para "Concluído" e arquive-os aqui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entrada</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Análise</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Dev.</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Revisão</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluído</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arquivado</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioridade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {arquivados.map(a => {
                    const p = PRIORITY_CFG[a.prioridade]
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{a.nome}</p>
                          {a.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {a.tags.map(t => (
                                <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tagColor(t)}`}>{t}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{a.responsavel || '—'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{a.dataEntrada ? fmt(a.dataEntrada) : '—'}</td>
                        <td className="px-4 py-3 text-xs">
                          {a.dataAnalise ? <span className="text-blue-600 font-medium">{fmt(a.dataAnalise)}</span> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.dataDesenvolvimento ? <span className="text-sky-600 font-medium">{fmt(a.dataDesenvolvimento)}</span> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.dataRevisao ? <span className="text-amber-600 font-medium">{fmt(a.dataRevisao)}</span> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {a.dataConcluido ? <span className="text-green-600 font-medium">{fmt(a.dataConcluido)}</span> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">{fmt(a.dataArquivamento)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.bg} ${p.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                            {a.prioridade}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Formulário rápido ── */}
      <FormRapido columns={columns} onSave={saveCard} />
    </div>
  )
}
