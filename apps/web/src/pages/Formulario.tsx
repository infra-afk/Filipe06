import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, ChevronDown, ChevronUp, Printer,
  Calendar, Target, BarChart2, ShoppingCart, Receipt,
  RefreshCcw, FileText, Bell, Lightbulb, Bot, Search,
  X, Filter, Eye, EyeOff, Archive, Layers,
} from 'lucide-react'
import { getCards, getArquivados, KanbanCard } from '../store/kanbanStore'

// ─── Seções do briefing ───────────────────────────────────────────────────────

const BRIEFING_SECTIONS: {
  key: keyof KanbanCard['briefing']
  label: string
  color: string
  icon: React.ElementType
}[] = [
  { key: 'objetivo',    label: 'Objetivos',   color: '#2563eb', icon: Target       },
  { key: 'indicadores', label: 'Indicadores', color: '#1d4ed8', icon: BarChart2    },
  { key: 'vendas',      label: 'Vendas',      color: '#059669', icon: ShoppingCart },
  { key: 'despesas',    label: 'Despesas',    color: '#dc2626', icon: Receipt      },
  { key: 'devolucoes',  label: 'Devoluções',  color: '#f97316', icon: RefreshCcw   },
  { key: 'dre',         label: 'DRE',         color: '#0d9488', icon: FileText     },
  { key: 'alertas',     label: 'Alertas',     color: '#e11d48', icon: Bell         },
  { key: 'decisoes',    label: 'Decisões',    color: '#d97706', icon: Lightbulb    },
  { key: 'agentes',     label: 'Agentes IA',  color: '#0f766e', icon: Bot          },
]

const PRIORITY_CFG = {
  Alta:  { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500'   },
  Média: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Baixa: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-600' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function hasBriefingData(b: KanbanCard['briefing']): boolean {
  return BRIEFING_SECTIONS.some(s => {
    const v = b[s.key]
    return Array.isArray(v) && (v as string[]).length > 0
  })
}

// ─── Briefing Visual ──────────────────────────────────────────────────────────

function BriefingView({ briefing }: { briefing: KanbanCard['briefing'] }) {
  const secoes = BRIEFING_SECTIONS.filter(s => {
    const v = briefing[s.key]
    return Array.isArray(v) && (v as string[]).length > 0
  })

  if (secoes.length === 0) return null

  return (
    <div className="p-4 space-y-3 bg-slate-50 border-t border-slate-100">
      {briefing.titulo && (
        <div className="rounded-xl px-4 py-2.5 text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
          {briefing.titulo}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {secoes.map(s => {
          const Icon = s.icon
          const items = briefing[s.key] as string[]
          const nota = briefing.notas?.[s.key as string]
          return (
            <div key={s.key as string} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100"
                style={{ background: s.color + '12' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: s.color }}>
                  <Icon size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-slate-700">{s.label}</span>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <span key={item} className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                      style={{ background: s.color }}>
                      {item}
                    </span>
                  ))}
                </div>
                {nota && (
                  <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2">{nota}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Timeline de datas ────────────────────────────────────────────────────────

function Timeline({ card }: { card: KanbanCard }) {
  const steps = [
    { label: 'Entrada',          date: card.dataEntrada,         color: '#475569' },
    { label: 'Em Análise',       date: card.dataAnalise,         color: '#2563eb' },
    { label: 'Em Desenvolvimento',date: card.dataDesenvolvimento, color: '#0369a1' },
    { label: 'Em Revisão',       date: card.dataRevisao,         color: '#f59e0b' },
    { label: 'Concluído',        date: card.dataConcluido,       color: '#059669' },
    { label: 'Arquivado',        date: card.dataArquivamento,    color: '#0d9488' },
  ].filter(s => s.date)

  if (steps.length === 0) return null

  return (
    <div className="px-4 py-3 bg-white border-t border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Timeline</p>
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 leading-none">{s.label}</p>
              <p className="text-[10px] text-slate-400">{fmt(s.date)}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-slate-200 mx-1 self-center" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card expansível ──────────────────────────────────────────────────────────

function CardRegistro({ card }: { card: KanbanCard }) {
  const [expandido, setExpandido] = useState(false)
  const p = PRIORITY_CFG[card.prioridade]
  const temBriefing = hasBriefingData(card.briefing)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <BarChart2 size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{card.nome}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {card.responsavel && (
                <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  {card.responsavel}
                </span>
              )}
              {card.solicitante && (
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                  Solicitante: {card.solicitante}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${p.bg} ${p.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                {card.prioridade}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers size={10} /> {card.coluna}
              </span>
              {card.arquivado && (
                <span className="text-xs bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Archive size={10} /> Arquivado
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => window.print()} title="Imprimir"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <Printer size={13} className="text-slate-400" />
          </button>
          <button onClick={() => setExpandido(p => !p)}
            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
            {expandido ? <EyeOff size={12} /> : <Eye size={12} />}
            {expandido ? 'Fechar' : 'Expandir'}
            {expandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {card.tags.map(t => (
            <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Expandido */}
      {expandido && (
        <>
          <Timeline card={card} />
          {card.observacoes && (
            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observações</p>
              <p className="text-sm text-slate-600">{card.observacoes}</p>
            </div>
          )}
          {temBriefing && <BriefingView briefing={card.briefing} />}
          {!temBriefing && (
            <div className="px-5 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-300">Este card não possui briefing do Canvas</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Formulario() {
  const navigate = useNavigate()
  const [cards]     = useState<KanbanCard[]>(() => [...getCards(), ...getArquivados()])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'arquivado'>('todos')
  const [filtroResp, setFiltroResp] = useState('')

  const responsaveis = [...new Set(cards.map(c => c.responsavel).filter(Boolean))]

  const filtrados = cards.filter(c => {
    if (filtroStatus === 'ativo'    && c.arquivado) return false
    if (filtroStatus === 'arquivado' && !c.arquivado) return false
    if (filtroResp && c.responsavel !== filtroResp) return false
    if (busca) {
      const q = busca.toLowerCase()
      if (!c.nome.toLowerCase().includes(q) &&
          !c.responsavel.toLowerCase().includes(q) &&
          !c.solicitante.toLowerCase().includes(q)) return false
    }
    return true
  })

  const ativos     = cards.filter(c => !c.arquivado).length
  const arquivados = cards.filter(c => c.arquivado).length

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
        <div className="relative px-7 py-7">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Registro de Documentação</p>
              <h1 className="text-white text-2xl font-black mt-0.5">Dashboards</h1>
              <p className="text-white/80 text-sm mt-0.5">
                {ativos} ativo{ativos !== 1 ? 's' : ''} · {arquivados} arquivado{arquivados !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nenhum card */}
      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList size={40} className="mb-4 opacity-30" />
          <p className="text-base font-bold text-slate-600 mb-1">Nenhum card encontrado</p>
          <p className="text-sm text-slate-400 mb-5">Crie um briefing no Canvas Operacional para começar</p>
          <button
            onClick={() => navigate('/canvases')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
            Ir para o Canvas Operacional
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <Filter size={13} className="text-slate-400 flex-shrink-0" />

            {/* Busca */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-slate-200 rounded-xl px-3 py-2">
              <Search size={12} className="text-slate-400 flex-shrink-0" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, responsável..."
                className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent" />
              {busca && <button onClick={() => setBusca('')}><X size={11} className="text-slate-400" /></button>}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1">
              {(['todos', 'ativo', 'arquivado'] as const).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filtroStatus === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Arquivados'}
                </button>
              ))}
            </div>

            {/* Responsável */}
            {responsaveis.length > 0 && (
              <select value={filtroResp} onChange={e => setFiltroResp(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-400 bg-white">
                <option value="">Todos responsáveis</option>
                {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            <span className="text-xs text-slate-400 font-medium ml-auto flex-shrink-0">
              {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Lista */}
          {filtrados.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum resultado para os filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtrados.map(c => (
                <CardRegistro key={c.id} card={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
