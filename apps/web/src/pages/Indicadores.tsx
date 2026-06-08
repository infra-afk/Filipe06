import { useState, useEffect, useId } from 'react'
import {
  Plus, TrendingUp, TrendingDown, Edit2, Trash2, Search,
  LayoutGrid, List, CheckCircle2, AlertTriangle, XCircle,
  Minus, X, Target
} from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

type Unidade    = 'R$' | '%' | 'un' | 'dias' | 'hrs' | 'pontos'
type Categoria  = 'Financeiro' | 'Comercial' | 'Operacional' | 'RH' | 'Marketing' | 'TI' | 'Outro'
type Frequencia = 'Diário' | 'Semanal' | 'Mensal' | 'Trimestral'
type Status     = 'ok' | 'alerta' | 'critico'

interface Indicador {
  id: string
  nome: string
  categoria: Categoria
  descricao: string
  valor: number
  meta: number
  unidade: Unidade
  variacao: number
  periodo: string
  frequencia: Frequencia
  maiorMelhor: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORIAS: Categoria[] = ['Financeiro', 'Comercial', 'Operacional', 'RH', 'Marketing', 'TI', 'Outro']
const UNIDADES: Unidade[]     = ['R$', '%', 'un', 'dias', 'hrs', 'pontos']
const FREQUENCIAS: Frequencia[] = ['Diário', 'Semanal', 'Mensal', 'Trimestral']

function calcStatus(ind: Indicador): Status {
  const ratio = ind.valor / ind.meta
  if (ind.maiorMelhor) {
    if (ratio >= 0.95) return 'ok'
    if (ratio >= 0.80) return 'alerta'
    return 'critico'
  } else {
    if (ratio <= 1.05) return 'ok'
    if (ratio <= 1.20) return 'alerta'
    return 'critico'
  }
}

function calcAtingimento(ind: Indicador): number {
  if (ind.meta === 0) return 0
  const ratio = ind.maiorMelhor
    ? (ind.valor / ind.meta) * 100
    : (ind.meta / ind.valor) * 100
  return Math.min(Math.round(ratio), 999)
}

function fmt(v: number, u: Unidade): string {
  if (u === 'R$') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
  if (u === '%')  return `${v}%`
  return `${v} ${u}`
}

function generateSparkline(valor: number, variacao: number, meta: number) {
  const labels = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan']
  return labels.map((label, i) => {
    const frac = i / 6
    const noise = 1 + (Math.sin(i * 2.5) * 0.04)
    const baseVal = valor * (1 - (variacao / 100) * (1 - frac)) * noise
    return { label, valor: Math.round(baseVal), meta }
  })
}

function uid() {
  return Math.random().toString(36).slice(2)
}

const CAT_COLOR: Record<Categoria, string> = {
  Financeiro:   'bg-blue-100 text-blue-700',
  Comercial:    'bg-green-100 text-green-700',
  Operacional:  'bg-orange-100 text-orange-700',
  RH:           'bg-teal-100 text-teal-700',
  Marketing:    'bg-pink-100 text-pink-700',
  TI:           'bg-cyan-100 text-cyan-700',
  Outro:        'bg-slate-100 text-slate-600',
}

const STATUS_CFG = {
  ok:      { label: 'Em dia',   color: 'text-green-600',  bg: 'bg-green-50',  bar: 'bg-green-500',  Icon: CheckCircle2 },
  alerta:  { label: 'Alerta',   color: 'text-amber-600',  bg: 'bg-amber-50',  bar: 'bg-amber-400',  Icon: AlertTriangle },
  critico: { label: 'Crítico',  color: 'text-red-600',    bg: 'bg-red-50',    bar: 'bg-red-500',    Icon: XCircle },
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT: Indicador[] = [
  { id: uid(), nome: 'Receita Total',      categoria: 'Financeiro',  descricao: 'Receita bruta mensal', valor: 1250000, meta: 1300000, unidade: 'R$', variacao: 4.2,   periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true  },
  { id: uid(), nome: 'Margem Bruta',       categoria: 'Financeiro',  descricao: 'Margem bruta sobre receita', valor: 43.4, meta: 45, unidade: '%', variacao: -0.8, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true  },
  { id: uid(), nome: 'EBITDA',             categoria: 'Financeiro',  descricao: 'Lucro antes de juros e amortização', valor: 285000, meta: 300000, unidade: 'R$', variacao: -5.0, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Margem EBITDA',      categoria: 'Financeiro',  descricao: 'EBITDA / Receita', valor: 22.8, meta: 25, unidade: '%', variacao: -1.2, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Churn',              categoria: 'Comercial',   descricao: 'Taxa de cancelamento mensal', valor: 3.2, meta: 2.5, unidade: '%', variacao: 0.7, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: false },
  { id: uid(), nome: 'Total de Vendas',    categoria: 'Comercial',   descricao: 'Unidades vendidas', valor: 847, meta: 900, unidade: 'un', variacao: -5.9, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Ticket Médio',       categoria: 'Comercial',   descricao: 'Valor médio por venda', valor: 1477, meta: 1500, unidade: 'R$', variacao: 2.1, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Devoluções',         categoria: 'Operacional', descricao: 'Quantidade de devoluções', valor: 23, meta: 15, unidade: 'un', variacao: 18.0, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: false },
  { id: uid(), nome: 'Taxa de Devolução',  categoria: 'Operacional', descricao: '% de vendas devolvidas', valor: 2.7, meta: 1.5, unidade: '%', variacao: 0.4, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: false },
  { id: uid(), nome: 'Novos Clientes',     categoria: 'Comercial',   descricao: 'Clientes adquiridos no mês', valor: 67, meta: 80, unidade: 'un', variacao: -16.3, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Receita Recorrente', categoria: 'Financeiro',  descricao: 'MRR - receita recorrente', valor: 680000, meta: 700000, unidade: 'R$', variacao: 3.1, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
  { id: uid(), nome: 'Lucro Líquido',      categoria: 'Financeiro',  descricao: 'Resultado líquido após impostos', valor: 175000, meta: 200000, unidade: 'R$', variacao: -12.5, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true },
]

// ─── Form blank ───────────────────────────────────────────────────────────────

const BLANK: Omit<Indicador, 'id'> = {
  nome: '', categoria: 'Financeiro', descricao: '',
  valor: 0, meta: 0, unidade: 'R$',
  variacao: 0, periodo: 'Jan 2026', frequencia: 'Mensal', maiorMelhor: true,
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function Modal({
  initial, onSave, onClose,
}: {
  initial: Omit<Indicador, 'id'>
  onSave: (d: Omit<Indicador, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState(initial)
  const id = useId()

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white'
  const selectCls = inputCls

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {initial.nome ? 'Editar Indicador' : 'Novo Indicador'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Preencha os dados do indicador</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); onSave(form) }}
          className="px-6 py-5 space-y-4"
        >
          {/* Nome */}
          <div>
            <label htmlFor={id + 'nome'} className={labelCls}>Nome do indicador *</label>
            <input
              id={id + 'nome'} required maxLength={80}
              value={form.nome} onChange={e => set('nome', e.target.value)}
              className={inputCls} placeholder="Ex: Receita Total, Churn, NPS..."
            />
          </div>

          {/* Categoria + Frequência */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={id + 'cat'} className={labelCls}>Categoria *</label>
              <select id={id + 'cat'} value={form.categoria} onChange={e => set('categoria', e.target.value as Categoria)} className={selectCls}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={id + 'freq'} className={labelCls}>Frequência</label>
              <select id={id + 'freq'} value={form.frequencia} onChange={e => set('frequencia', e.target.value as Frequencia)} className={selectCls}>
                {FREQUENCIAS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Valor + Meta + Unidade */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor={id + 'val'} className={labelCls}>Valor atual *</label>
              <input
                id={id + 'val'} type="number" step="any" required
                value={form.valor} onChange={e => set('valor', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor={id + 'meta'} className={labelCls}>Meta *</label>
              <input
                id={id + 'meta'} type="number" step="any" required
                value={form.meta} onChange={e => set('meta', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor={id + 'un'} className={labelCls}>Unidade *</label>
              <select id={id + 'un'} value={form.unidade} onChange={e => set('unidade', e.target.value as Unidade)} className={selectCls}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Variação + Período */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={id + 'var'} className={labelCls}>Variação vs período ant. (%)</label>
              <input
                id={id + 'var'} type="number" step="0.1"
                value={form.variacao} onChange={e => set('variacao', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor={id + 'per'} className={labelCls}>Período de referência</label>
              <input
                id={id + 'per'} value={form.periodo}
                onChange={e => set('periodo', e.target.value)}
                className={inputCls} placeholder="Jan 2026"
              />
            </div>
          </div>

          {/* Maior é melhor */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <button
              type="button"
              onClick={() => set('maiorMelhor', !form.maiorMelhor)}
              className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${form.maiorMelhor ? 'bg-blue-500' : 'bg-slate-300'}`}
              style={{ width: 40, height: 22 }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform"
                style={{ transform: form.maiorMelhor ? 'translateX(18px)' : 'translateX(0)' }}
              />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                {form.maiorMelhor ? 'Maior valor é melhor' : 'Menor valor é melhor'}
              </p>
              <p className="text-[11px] text-slate-400">
                {form.maiorMelhor
                  ? 'Ex: Receita, Vendas, NPS — quanto maior, melhor'
                  : 'Ex: Churn, Devoluções, Custo — quanto menor, melhor'}
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor={id + 'desc'} className={labelCls}>Descrição / fórmula <span className="text-slate-400 font-normal">(opcional)</span></label>
            <textarea
              id={id + 'desc'} rows={2} maxLength={200}
              value={form.descricao} onChange={e => set('descricao', e.target.value)}
              className={inputCls + ' resize-none'}
              placeholder="Como este indicador é calculado..."
            />
          </div>

          {/* Preview de status */}
          {form.valor > 0 && form.meta > 0 && (() => {
            const tmpInd = { ...form, id: '' }
            const st = calcStatus(tmpInd)
            const at = calcAtingimento(tmpInd)
            const cfg = STATUS_CFG[st]
            return (
              <div className={`flex items-center gap-2.5 p-3 rounded-xl ${cfg.bg}`}>
                <cfg.Icon size={15} className={cfg.color} />
                <span className={`text-xs font-semibold ${cfg.color}`}>
                  {cfg.label} — {at}% da meta atingida
                </span>
              </div>
            )
          })()}

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={!form.nome.trim() || form.meta === 0}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {initial.nome ? 'Salvar alterações' : 'Criar indicador'}
            </button>
            <button type="button" onClick={onClose} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────

function IndicadorCard({ ind, onEdit, onDelete }: {
  ind: Indicador
  onEdit: () => void
  onDelete: () => void
}) {
  const status  = calcStatus(ind)
  const at      = calcAtingimento(ind)
  const cfg     = STATUS_CFG[status]
  const spark   = generateSparkline(ind.valor, ind.variacao, ind.meta)
  const isUp    = ind.variacao > 0

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 group transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.06)')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[ind.categoria]}`}>
            {ind.categoria}
          </span>
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 leading-snug">{ind.nome}</h3>
        {ind.descricao && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ind.descricao}</p>}
      </div>

      {/* Value + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-black text-slate-900 leading-none">{fmt(ind.valor, ind.unidade)}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {ind.variacao === 0
              ? <Minus size={12} className="text-slate-400" />
              : isUp
                ? <TrendingUp size={12} className="text-green-500" />
                : <TrendingDown size={12} className="text-red-500" />
            }
            <span className={`text-xs font-semibold ${
              ind.variacao === 0 ? 'text-slate-400' :
              isUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {ind.variacao > 0 ? '+' : ''}{ind.variacao}%
            </span>
            <span className="text-[11px] text-slate-400">vs ant.</span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-24 h-12 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-white border border-slate-100 rounded-lg px-2 py-1 text-[11px] shadow-md">
                      <p className="font-semibold text-slate-800">{fmt(payload[0].value as number, ind.unidade)}</p>
                      <p className="text-slate-400">{payload[0].payload.label}</p>
                    </div>
                  ) : null
                }
              />
              <Line type="monotone" dataKey="valor" stroke={status === 'ok' ? '#22c55e' : status === 'alerta' ? '#f59e0b' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Target size={10} />
            <span>Meta: {fmt(ind.meta, ind.unidade)}</span>
          </div>
          <span className={`text-[11px] font-bold ${cfg.color}`}>{at}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${cfg.bar}`}
            style={{ width: `${Math.min(at, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <span className="text-[11px] text-slate-400">{ind.periodo}</span>
        <span className="text-[11px] text-slate-400">{ind.frequencia}</span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Indicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>(() => {
    try {
      const saved = localStorage.getItem('chua_indicadores')
      return saved ? JSON.parse(saved) : DEFAULT
    } catch { return DEFAULT }
  })
  const [view,    setView]    = useState<'cards' | 'table'>('cards')
  const [search,  setSearch]  = useState('')
  const [catFlt,  setCatFlt]  = useState<Categoria | 'Todos'>('Todos')
  const [modal,   setModal]   = useState<{ open: boolean; editing: Indicador | null }>({ open: false, editing: null })

  useEffect(() => {
    localStorage.setItem('chua_indicadores', JSON.stringify(indicadores))
  }, [indicadores])

  const filtered = indicadores.filter(ind => {
    const matchSearch = ind.nome.toLowerCase().includes(search.toLowerCase()) ||
      ind.descricao.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFlt === 'Todos' || ind.categoria === catFlt
    return matchSearch && matchCat
  })

  const counts = {
    ok:      indicadores.filter(i => calcStatus(i) === 'ok').length,
    alerta:  indicadores.filter(i => calcStatus(i) === 'alerta').length,
    critico: indicadores.filter(i => calcStatus(i) === 'critico').length,
  }

  function handleSave(data: Omit<Indicador, 'id'>) {
    if (modal.editing) {
      setIndicadores(prev => prev.map(i => i.id === modal.editing!.id ? { ...data, id: i.id } : i))
    } else {
      setIndicadores(prev => [{ ...data, id: uid() }, ...prev])
    }
    setModal({ open: false, editing: null })
  }

  function handleDelete(id: string) {
    if (!confirm('Remover este indicador permanentemente?')) return
    setIndicadores(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Indicadores</h1>
          <p className="page-subtitle">Acompanhe e gerencie os KPIs da sua operação</p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
        >
          <Plus size={15} />
          Novo indicador
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Em dia',  count: counts.ok,      icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100' },
          { label: 'Alerta',  count: counts.alerta,  icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Crítico', count: counts.critico, icon: XCircle,       color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-100'   },
        ].map(({ label, count, icon: Icon, color, bg, border }) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${bg} ${border}`}>
            <Icon size={18} className={color} />
            <div>
              <p className={`text-xl font-black leading-none ${color}`}>{count}</p>
              <p className={`text-[11px] font-medium mt-0.5 ${color} opacity-80`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar indicador..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['Todos', ...CATEGORIAS] as const).map(c => (
            <button
              key={c}
              onClick={() => setCatFlt(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                catFlt === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto border border-slate-200 rounded-xl p-1 bg-white flex-shrink-0">
          <button
            onClick={() => setView('cards')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'cards' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('table')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Target size={26} className="text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Nenhum indicador encontrado</p>
          <p className="text-xs text-slate-400">Tente outro filtro ou crie um novo indicador</p>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(ind => (
            <IndicadorCard
              key={ind.id}
              ind={ind}
              onEdit={() => setModal({ open: true, editing: ind })}
              onDelete={() => handleDelete(ind.id)}
            />
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Indicador', 'Categoria', 'Valor Atual', 'Meta', 'Atingimento', 'Variação', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 first:pl-5 last:pr-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ind => {
                const st  = calcStatus(ind)
                const at  = calcAtingimento(ind)
                const cfg = STATUS_CFG[st]
                const isUp = ind.variacao > 0
                return (
                  <tr key={ind.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 pl-5">
                      <p className="text-sm font-semibold text-slate-900">{ind.nome}</p>
                      {ind.descricao && <p className="text-[11px] text-slate-400 mt-0.5">{ind.descricao}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[ind.categoria]}`}>
                        {ind.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm">{fmt(ind.valor, ind.unidade)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{fmt(ind.meta, ind.unidade)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                          <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.min(at, 100)}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${cfg.color}`}>{at}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {ind.variacao === 0
                          ? <Minus size={12} className="text-slate-400" />
                          : isUp
                            ? <TrendingUp size={12} className="text-green-500" />
                            : <TrendingDown size={12} className="text-red-500" />
                        }
                        <span className={`text-xs font-semibold ${isUp ? 'text-green-600' : ind.variacao === 0 ? 'text-slate-400' : 'text-red-600'}`}>
                          {ind.variacao > 0 ? '+' : ''}{ind.variacao}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        <cfg.Icon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ open: true, editing: ind })} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(ind.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <Modal
          initial={modal.editing ? { ...modal.editing } : BLANK}
          onSave={handleSave}
          onClose={() => setModal({ open: false, editing: null })}
        />
      )}
    </div>
  )
}
