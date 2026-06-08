import { useState, useMemo } from 'react'
import {
  Plus, X, Target, BarChart2, Database, Users, Lightbulb,
  PieChart, Bell, Bot, Zap, FileText, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react'
import type { Canvas } from '../types'

// ─── Sugestões ────────────────────────────────────────────────────────────────

const SUGESTOES: Record<string, string[]> = {
  indicadores_receita: [
    'Receita Total', 'Vendas por Período', 'Ticket Médio',
    'Conversão de Vendas', 'Receita por Canal', 'Receita por Produto',
    'Clientes Novos', 'Clientes Recorrentes', 'Margem de Lucro',
  ],
  indicadores_custo: [
    'Despesas Totais', 'Custo Fixo', 'Custo Variável',
    'Custo por Departamento', 'Custo com Fornecedores', 'Desperdícios',
    'Margem Operacional', 'Economia Gerada', 'Centro de Custo',
  ],
  dados: [
    'Vendas', 'Despesas', 'Devoluções', 'DRE', 'Clientes',
    'Produtos', 'Metas', 'Orçamentos', 'Custos', 'Fornecedores',
  ],
  pessoas: [
    'Diretor financeiro', 'Gerente comercial', 'Gerente financeiro',
    'Analista de dados', 'Gestor da área', 'Vendedor', 'Operação',
  ],
  decisoes: [
    'Se EBITDA cair → revisar despesas',
    'Se vendas caírem → acionar comercial',
    'Se devoluções subirem → revisar qualidade',
    'Se margem cair → revisar preço ou custo',
    'Se meta não for atingida → criar plano de ação',
  ],
  analises: [
    'Análise de vendas', 'Análise de despesas', 'Análise de margem',
    'Análise de DRE', 'Análise de devoluções', 'Análise por período',
    'Análise por canal', 'Análise por responsável',
  ],
  alertas: [
    'Avisar quando a margem ficar abaixo da meta',
    'Avisar quando o EBITDA cair',
    'Avisar quando as despesas subirem',
    'Avisar quando o churn aumentar',
    'Avisar quando as devoluções ultrapassarem o limite',
  ],
  agentes: [
    'Agente de Vendas', 'Agente Financeiro', 'Agente de Despesas',
    'Agente de DRE', 'Agente de Alertas', 'Agente de Análise Executiva',
  ],
  automacoes: [
    'Gerar relatório automático',
    'Enviar alerta por e-mail ou WhatsApp',
    'Atualizar indicadores automaticamente',
    'Criar tarefa quando meta não for atingida',
    'Acionar responsável quando houver desvio',
    'Gerar resumo executivo semanal',
  ],
}

const FONTES_DADOS = [
  'Supabase', 'Excel', 'Google Sheets', 'ERP', 'CRM',
  'Sistema financeiro', 'Inserção manual', 'Banco de dados',
]

// ─── Section meta ─────────────────────────────────────────────────────────────

const META: Record<string, { label: string; Icon: any; accent: string; light: string }> = {
  objetivos:   { label: 'Objetivos',    Icon: Target,    accent: '#2563eb', light: '#eff6ff' },
  indicadores: { label: 'Indicadores',  Icon: BarChart2, accent: '#16a34a', light: '#f0fdf4' },
  dados:       { label: 'Dados',        Icon: Database,  accent: '#4f46e5', light: '#eef2ff' },
  pessoas:     { label: 'Pessoas',      Icon: Users,     accent: '#7c3aed', light: '#f5f3ff' },
  decisoes:    { label: 'Decisões',     Icon: Lightbulb, accent: '#d97706', light: '#fffbeb' },
  analises:    { label: 'Análises',     Icon: PieChart,  accent: '#0891b2', light: '#ecfeff' },
  alertas:     { label: 'Alertas',      Icon: Bell,      accent: '#ea580c', light: '#fff7ed' },
  agentes:     { label: 'Agentes IA',   Icon: Bot,       accent: '#9333ea', light: '#faf5ff' },
  automacoes:  { label: 'Automações',   Icon: Zap,       accent: '#e11d48', light: '#fff1f2' },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  canvas: Canvas
  onAddItem: (sectionId: string, title: string, description?: string) => void
  onDeleteItem: (itemId: string, sectionId: string) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useSection(canvas: Canvas, key: string) {
  return useMemo(
    () => canvas.sections?.find(s => s.key === key),
    [canvas.sections, key]
  )
}

// ─── ItemChip ─────────────────────────────────────────────────────────────────

function ItemChip({ label, sub, onRemove }: { label: string; sub?: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 group/chip">
      <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
      <span className="leading-tight">{label}</span>
      {sub && <span className="text-slate-400">· {sub}</span>}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/chip:opacity-100"
      >
        <X size={10} />
      </button>
    </div>
  )
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({
  sectionKey, canvas, onAddItem, onDeleteItem, suggestKey, customPlaceholder, fullWidth = false,
}: {
  sectionKey: string
  canvas: Canvas
  onAddItem: Props['onAddItem']
  onDeleteItem: Props['onDeleteItem']
  suggestKey?: string
  customPlaceholder?: string
  fullWidth?: boolean
}) {
  const section  = useSection(canvas, sectionKey)
  const meta     = META[sectionKey]
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')

  const items    = section?.items ?? []
  const titles   = items.map(i => i.title)
  const sectionId = section?.id ?? ''

  const suggestions = useMemo(() => {
    const key = suggestKey ?? sectionKey
    const all = SUGESTOES[key] ?? []
    return all.filter(s => !titles.includes(s))
  }, [suggestKey, sectionKey, titles])

  if (!section) return null

  function addSuggestion(title: string) {
    onAddItem(sectionId, title)
  }

  function addCustom() {
    const t = custom.trim()
    if (!t) return
    onAddItem(sectionId, t)
    setCustom('')
  }

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(15,23,42,.06)', gridColumn: fullWidth ? '1/-1' : undefined }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-slate-50"
        style={{ background: meta.light }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: meta.accent }}>
            <meta.Icon size={14} color="white" />
          </div>
          <span className="text-sm font-bold" style={{ color: meta.accent }}>{meta.label}</span>
          {items.length > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: meta.accent }}>
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/70"
          style={{ color: meta.accent }}
        >
          <Sparkles size={12} />
          Sugestões
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Suggestions */}
      {open && suggestions.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 font-medium mb-2">Clique para adicionar:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { addSuggestion(s); }}
                className="text-xs px-2.5 py-1 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-current hover:text-white transition-all"
                style={{ ['--tw-border-opacity' as any]: 1 }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = meta.accent
                  el.style.borderColor = meta.accent
                  el.style.color = 'white'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = ''
                  el.style.borderColor = ''
                  el.style.color = ''
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {open && suggestions.length === 0 && (
        <div className="px-4 py-2 border-b border-slate-50 text-[11px] text-slate-400 text-center">
          Todas as sugestões já foram adicionadas
        </div>
      )}

      {/* Items */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {items.map(item => (
              <ItemChip
                key={item.id}
                label={item.title}
                sub={item.description ?? undefined}
                onRemove={() => onDeleteItem(item.id, sectionId)}
              />
            ))}
          </div>
        )}

        {/* Custom input */}
        <div className="flex gap-2 mt-auto pt-1">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder={customPlaceholder ?? `Adicionar ${meta.label.toLowerCase()}...`}
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all"
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            className="p-2 rounded-xl text-white transition-colors disabled:opacity-40"
            style={{ background: meta.accent }}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DadosSection ─────────────────────────────────────────────────────────────

function DadosSection({ canvas, onAddItem, onDeleteItem }: Props) {
  const section = useSection(canvas, 'dados')
  const meta    = META['dados']
  const [open,   setOpen]   = useState(false)
  const [nome,   setNome]   = useState('')
  const [fonte,  setFonte]  = useState(FONTES_DADOS[0])

  const items     = section?.items ?? []
  const titles    = items.map(i => i.title)
  const sectionId = section?.id ?? ''

  const suggestions = SUGESTOES['dados'].filter(s => !titles.includes(s))

  if (!section) return null

  function addItem(title: string, description?: string) {
    onAddItem(sectionId, title, description)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(15,23,42,.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50" style={{ background: meta.light }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: meta.accent }}>
            <meta.Icon size={14} color="white" />
          </div>
          <span className="text-sm font-bold" style={{ color: meta.accent }}>Dados</span>
          {items.length > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: meta.accent }}>
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-white/70 transition-colors"
          style={{ color: meta.accent }}
        >
          <Sparkles size={12} />
          Sugestões
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 font-medium mb-2">Clique para adicionar:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => addItem(s)}
                className="text-xs px-2.5 py-1 rounded-xl border border-dashed border-slate-300 text-slate-600 transition-all"
                onMouseEnter={e => { e.currentTarget.style.background = meta.accent; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = meta.accent }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = '' }}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {items.map(item => (
              <ItemChip
                key={item.id}
                label={item.title}
                sub={item.description ?? undefined}
                onRemove={() => onDeleteItem(item.id, sectionId)}
              />
            ))}
          </div>
        )}

        {/* Add form with source */}
        <div className="mt-auto pt-1 space-y-2">
          <div className="flex gap-2">
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && nome.trim()) { addItem(nome.trim(), fonte); setNome('') } }}
              placeholder="Nome do dado..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
            <select
              value={fonte}
              onChange={e => setFonte(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2 py-2 outline-none focus:border-indigo-300 bg-white"
            >
              {FONTES_DADOS.map(f => <option key={f}>{f}</option>)}
            </select>
            <button
              onClick={() => { if (nome.trim()) { addItem(nome.trim(), fonte); setNome('') } }}
              disabled={!nome.trim()}
              className="p-2 rounded-xl text-white disabled:opacity-40"
              style={{ background: meta.accent }}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ObjetivosSection ─────────────────────────────────────────────────────────

function ObjetivosSection({ canvas, onAddItem, onDeleteItem }: Props) {
  const section   = useSection(canvas, 'objetivos')
  const meta      = META['objetivos']
  const [custom, setCustom] = useState('')

  const items     = section?.items ?? []
  const sectionId = section?.id ?? ''
  const selected  = items.map(i => i.title)

  const OPCOES = [
    { label: 'Aumentar Receita', icon: TrendingUp,   color: '#16a34a', light: '#f0fdf4', desc: 'Focar em crescimento de vendas, ticket médio e novos clientes' },
    { label: 'Reduzir Custo',    icon: TrendingDown,  color: '#dc2626', light: '#fef2f2', desc: 'Focar em eficiência, despesas e otimização de processos' },
  ]

  if (!section) return null

  function toggle(label: string) {
    const existing = items.find(i => i.title === label)
    if (existing) {
      onDeleteItem(existing.id, sectionId)
    } else {
      onAddItem(sectionId, label)
    }
  }

  function addCustom() {
    const t = custom.trim()
    if (!t) return
    onAddItem(sectionId, t)
    setCustom('')
  }

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(15,23,42,.06)', gridColumn: '1/-1' }}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-50" style={{ background: meta.light }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: meta.accent }}>
          <Target size={16} color="white" />
        </div>
        <div>
          <span className="text-sm font-bold" style={{ color: meta.accent }}>Objetivos</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Escolha o objetivo principal da operação</p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPCOES.map(({ label, icon: Icon, color, light, desc }) => {
            const active = selected.includes(label)
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                className="flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all"
                style={{
                  borderColor: active ? color : '#e2e8f0',
                  background: active ? light : 'white',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: active ? color : '#f8fafc' }}
                >
                  <Icon size={18} color={active ? 'white' : '#94a3b8'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: active ? color : '#334155' }}>{label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                </div>
                {active && <CheckCircle2 size={16} color={color} className="flex-shrink-0 mt-0.5" />}
              </button>
            )
          })}
        </div>

        {/* Custom */}
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Outro objetivo personalizado..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all"
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            className="p-2 rounded-xl text-white disabled:opacity-40"
            style={{ background: meta.accent }}
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Custom items */}
        {items.filter(i => !['Aumentar Receita', 'Reduzir Custo'].includes(i.title)).map(item => (
          <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-xl">
            <span className="text-xs font-semibold text-blue-700">{item.title}</span>
            <button onClick={() => onDeleteItem(item.id, sectionId)} className="p-0.5 rounded hover:bg-red-100 text-blue-300 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PlanoOperacional ─────────────────────────────────────────────────────────

function PlanoOperacional({ canvas }: { canvas: Canvas }) {
  const [open, setOpen] = useState(false)

  const sectionByKey = useMemo(() => {
    const m: Record<string, any> = {}
    canvas.sections?.forEach(s => { m[s.key] = s })
    return m
  }, [canvas.sections])

  const getItems = (key: string) => (sectionByKey[key]?.items ?? []) as { title: string; description?: string | null }[]

  const filledCount = Object.keys(META).filter(k => (sectionByKey[k]?.items ?? []).length > 0).length
  if (filledCount < 2) return null

  const objetivo  = getItems('objetivos')
  const indicadores = getItems('indicadores')
  const dados     = getItems('dados')
  const pessoas   = getItems('pessoas')
  const decisoes  = getItems('decisoes')
  const analises  = getItems('analises')
  const alertas   = getItems('alertas')
  const agentes   = getItems('agentes')
  const automacoes = getItems('automacoes')

  const PLAN_SECTIONS = [
    { label: 'Objetivo',            icon: Target,    items: objetivo,    empty: 'Nenhum objetivo definido' },
    { label: 'Indicadores',         icon: BarChart2, items: indicadores, empty: 'Nenhum indicador mapeado' },
    { label: 'Dados necessários',   icon: Database,  items: dados,       empty: 'Nenhum dado mapeado', showSub: true },
    { label: 'Pessoas',             icon: Users,     items: pessoas,     empty: 'Nenhuma pessoa mapeada' },
    { label: 'Decisões',            icon: Lightbulb, items: decisoes,    empty: 'Nenhuma decisão mapeada' },
    { label: 'Análises',            icon: PieChart,  items: analises,    empty: 'Nenhuma análise mapeada' },
    { label: 'Alertas',             icon: Bell,      items: alertas,     empty: 'Nenhum alerta configurado' },
    { label: 'Agentes IA',          icon: Bot,       items: agentes,     empty: 'Nenhum agente mapeado' },
    { label: 'Automações',          icon: Zap,       items: automacoes,  empty: 'Nenhuma automação definida' },
  ]

  const proxPassos = [
    dados.length > 0   && `Configurar pipeline de dados: ${dados.map(d => d.description ? `${d.title} (${d.description})` : d.title).join(', ')}`,
    alertas.length > 0 && `Implementar ${alertas.length} regra${alertas.length > 1 ? 's' : ''} de alerta`,
    agentes.length > 0 && `Desenvolver ${agentes.length} agente${agentes.length > 1 ? 's' : ''} de IA`,
    automacoes.length > 0 && `Automatizar ${automacoes.length} processo${automacoes.length > 1 ? 's' : ''}`,
    analises.length > 0 && `Construir ${analises.length} análise${analises.length > 1 ? 's' : ''} no dashboard`,
  ].filter(Boolean) as string[]

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(15,23,42,.06)', gridColumn: '1/-1' }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-800">
            <FileText size={15} color="white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">Plano Operacional</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Resumo completo do canvas — {filledCount}/{Object.keys(META).length} seções preenchidas</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {PLAN_SECTIONS.map(({ label, icon: Icon, items, empty, showSub }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">{label}</p>
                </div>
                {items.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic pl-5">{empty}</p>
                ) : (
                  <ul className="space-y-1 pl-5">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[12px] text-slate-600">
                        <ArrowRight size={10} className="text-slate-300 mt-1 flex-shrink-0" />
                        <span>
                          {item.title}
                          {showSub && item.description && (
                            <span className="text-slate-400"> · {item.description}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {proxPassos.length > 0 && (
            <div className="mt-5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-2">Próximos passos</p>
              <ul className="space-y-1.5">
                {proxPassos.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-blue-700">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CanvasBoard (main) ────────────────────────────────────────────────────────

export default function CanvasBoard({ canvas, onAddItem, onDeleteItem }: Props) {
  const sectionByKey = useMemo(() => {
    const m: Record<string, any> = {}
    canvas.sections?.forEach(s => { m[s.key] = s })
    return m
  }, [canvas.sections])

  // Indicator suggestions depend on selected objective
  const objetivoItems: string[] = (sectionByKey['objetivos']?.items ?? []).map((i: any) => i.title)
  const indicSuggestKey = objetivoItems.includes('Aumentar Receita')
    ? 'indicadores_receita'
    : objetivoItems.includes('Reduzir Custo')
      ? 'indicadores_custo'
      : 'indicadores_receita'

  const filledCount = Object.keys(META).filter(k => (sectionByKey[k]?.items ?? []).length > 0).length
  const totalCount  = Object.keys(META).length

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(filledCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">
          {filledCount}/{totalCount} seções
        </span>
      </div>

      {/* Flow hint */}
      {filledCount === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-700">
          <Sparkles size={14} className="flex-shrink-0" />
          <span>Comece escolhendo o <strong>objetivo</strong> da operação. O canvas irá sugerir indicadores, dados e decisões adequadas.</span>
        </div>
      )}

      {/* Canvas grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ gridAutoRows: 'auto' }}>

        {/* Row 1: Objetivos (full) */}
        <ObjetivosSection canvas={canvas} onAddItem={onAddItem} onDeleteItem={onDeleteItem} />

        {/* Row 2: Indicadores | Dados | Pessoas */}
        <SectionCard
          sectionKey="indicadores"
          canvas={canvas}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          suggestKey={indicSuggestKey}
          customPlaceholder="Adicionar indicador..."
        />
        <DadosSection canvas={canvas} onAddItem={onAddItem} onDeleteItem={onDeleteItem} />
        <SectionCard
          sectionKey="pessoas"
          canvas={canvas}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          customPlaceholder="Adicionar pessoa..."
        />

        {/* Row 3: Decisões | Análises (2-col) */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 contents">
          <SectionCard
            sectionKey="decisoes"
            canvas={canvas}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            customPlaceholder="Se X acontecer → fazer Y..."
          />
          <SectionCard
            sectionKey="analises"
            canvas={canvas}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            customPlaceholder="Adicionar análise..."
          />
        </div>
        {/* Alertas alone in col 3 of row 3 */}
        <SectionCard
          sectionKey="alertas"
          canvas={canvas}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          customPlaceholder="Avisar quando..."
        />

        {/* Row 4: Agentes | Automações */}
        <SectionCard
          sectionKey="agentes"
          canvas={canvas}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          customPlaceholder="Adicionar agente..."
        />
        <SectionCard
          sectionKey="automacoes"
          canvas={canvas}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          customPlaceholder="Adicionar automação..."
          fullWidth={false}
        />
        <div /> {/* spacer */}

        {/* Plano Operacional */}
        <PlanoOperacional canvas={canvas} />
      </div>
    </div>
  )
}
