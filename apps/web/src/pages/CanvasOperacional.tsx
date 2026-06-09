import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveCard, getCards, KanbanCard } from '../store/kanbanStore'
import {
  Target, BarChart2, ShoppingCart, Receipt, RefreshCcw,
  FileText, Bell, Lightbulb, Bot, ChevronRight, ChevronLeft,
  CheckCircle2, Plus, X, FileOutput, Sparkles, Check,
  Search, ExternalLink,
} from 'lucide-react'

// ─── Configuração das etapas ──────────────────────────────────────────────────

const STEPS = [
  {
    key: 'objetivos', label: 'Objetivos', icon: Target,
    from: '#2563eb', to: '#1d4ed8',
    descricao: 'Qual é o objetivo principal? Para quem é este dashboard?',
    sugestoes: ['Aumentar Receita','Reduzir Custos','Melhorar Margem','Reduzir Churn','Aumentar Vendas','Controle Financeiro','Eficiência Operacional','Expansão de Mercado'],
    extras: [{ campo: 'audiencia', label: 'Audiência', opcoes: ['Diretoria','Gerentes','Equipe Comercial','Equipe Financeira','Todos'], multi: true, input: false }],
  },
  {
    key: 'indicadores', label: 'Indicadores', icon: BarChart2,
    from: '#1d4ed8', to: '#1e40af',
    descricao: 'Quais KPIs e métricas devem aparecer no dashboard?',
    sugestoes: ['Receita Total','Ticket Médio','Crescimento %','EBITDA','Margem Líquida','CAC','Clientes Novos','Clientes Recorrentes','Conversão','Despesas Totais'],
    extras: [{ campo: 'freq', label: 'Freq. de atualização', opcoes: ['Tempo real','Diário','Semanal','Mensal'], multi: false, input: false }],
  },
  {
    key: 'vendas', label: 'Vendas', icon: ShoppingCart,
    from: '#059669', to: '#0f766e',
    descricao: 'Como as vendas devem ser analisadas e apresentadas?',
    sugestoes: ['Vendas por Período','Por Produto','Por Canal','Por Vendedor','Por Região','Por Cliente','Meta vs Realizado','Comparação Mensal','Funil de Vendas','Devoluções'],
    extras: [{ campo: 'grafico', label: 'Visualização preferida', opcoes: ['Linha','Barra','Pizza','Tabela','Cards'], multi: false, input: false }],
  },
  {
    key: 'despesas', label: 'Despesas', icon: Receipt,
    from: '#dc2626', to: '#b91c1c',
    descricao: 'Quais despesas devem ser monitoradas e como?',
    sugestoes: ['Despesas Totais','Fixas vs Variáveis','Por Departamento','Por Fornecedor','Orçamento vs Realizado','Top 10 Gastos','Tendência Mensal','Custo com Pessoal'],
    extras: [{ campo: 'limite', label: 'Limite para alerta (R$)', opcoes: [], multi: false, input: true }],
  },
  {
    key: 'devolucoes', label: 'Devoluções', icon: RefreshCcw,
    from: '#f97316', to: '#ea580c',
    descricao: 'Como as devoluções devem ser analisadas?',
    sugestoes: ['Taxa de Devolução','Por Produto','Por Motivo','Por Período','Custo das Devoluções','Comparação com Meta','Por Canal','Impacto na Margem'],
    extras: [{ campo: 'limite', label: 'Taxa limite (%)', opcoes: [], multi: false, input: true }],
  },
  {
    key: 'dre', label: 'DRE', icon: FileText,
    from: '#0d9488', to: '#0f766e',
    descricao: 'Quais linhas do DRE devem aparecer e como comparar?',
    sugestoes: ['Receita Bruta','Deduções','Receita Líquida','Custo das Vendas','Lucro Bruto','Despesas Operacionais','EBITDA','EBIT','Resultado Financeiro','Lucro Líquido'],
    extras: [{ campo: 'comparacao', label: 'Comparativo', opcoes: ['Mês atual vs anterior','Mesmo mês do ano passado','YTD acumulado','Budget vs Realizado'], multi: false, input: false }],
  },
  {
    key: 'alertas', label: 'Alertas', icon: Bell,
    from: '#e11d48', to: '#be123c',
    descricao: 'Quando e como o time deve ser notificado?',
    sugestoes: ['Margem abaixo da meta','Despesas acima do orçamento','Meta de vendas não atingida','Devolução acima do limite','EBITDA negativo','Queda de receita no mês'],
    extras: [{ campo: 'canal', label: 'Canal de notificação', opcoes: ['E-mail','WhatsApp','Dashboard','Todos'], multi: false, input: false }],
  },
  {
    key: 'decisoes', label: 'Decisões', icon: Lightbulb,
    from: '#d97706', to: '#b45309',
    descricao: 'Quais decisões serão tomadas com base neste dashboard?',
    sugestoes: ['Revisar precificação se margem cair','Acionar comercial se vendas caírem','Cortar custos se despesas subirem','Revisar fornecedores se custo subir','Criar plano de ação se meta não for atingida','Abrir novo canal se crescimento estiver baixo'],
    extras: [{ campo: 'responsavel', label: 'Responsável', opcoes: ['Diretor','Gerente Financeiro','Gerente Comercial','Equipe','Todos'], multi: true, input: false }],
  },
  {
    key: 'agentes', label: 'Agentes IA', icon: Bot,
    from: '#0f766e', to: '#134e4a',
    descricao: 'Quais análises e automações de IA o dashboard deve gerar?',
    sugestoes: ['Análise automática de tendências','Previsão de vendas','Identificar anomalias em despesas','Resumo executivo semanal','Diagnóstico de margem','Alerta inteligente de desvios','Sugestão de ações corretivas'],
    extras: [{ campo: 'automacoes', label: 'Automação', opcoes: ['Relatório semanal','Alerta por desvio','Atualização automática','Resumo mensal por e-mail'], multi: true, input: false }],
  },
] as const

type StepKey = typeof STEPS[number]['key']

type CanvasState = {
  [K in StepKey]: string[]
} & {
  titulo: string
  responsavel: string
  solicitante: string
  extras: Record<string, string[]>
  custom: Record<StepKey, string[]>
  notas: Record<StepKey, string>
}

function initState(): CanvasState {
  const sel = Object.fromEntries(STEPS.map(s => [s.key, []])) as any
  return {
    ...sel, titulo: '', responsavel: '', solicitante: '',
    extras: {},
    custom: Object.fromEntries(STEPS.map(s => [s.key, []])) as any,
    notas: Object.fromEntries(STEPS.map(s => [s.key, ''])) as any,
  }
}

// ─── Progresso circular ───────────────────────────────────────────────────────

function CircularProgress({ pct, accent }: { pct: number; accent: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = circ * pct / 100
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={accent} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-black text-slate-800">{pct}%</span>
      </div>
    </div>
  )
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

function Tag({ label, active, accent, onClick }: { label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 select-none"
      style={active
        ? { background: accent, borderColor: accent, color: '#fff' }
        : { background: '#fff', borderColor: '#e2e8f0', color: '#475569' }
      }
    >
      {active && <Check size={13} className="flex-shrink-0" />}
      {label}
    </button>
  )
}

// ─── Ondas decorativas do banner ──────────────────────────────────────────────

function WaveDecor() {
  return (
    <svg className="absolute right-0 bottom-0 opacity-20" width="320" height="160" viewBox="0 0 320 160" fill="none">
      <path d="M320 0 Q240 80 160 60 Q80 40 0 120 L0 160 L320 160 Z" fill="white" />
      <path d="M320 40 Q260 100 180 80 Q100 60 20 140 L0 160 L320 160 Z" fill="white" opacity="0.5" />
    </svg>
  )
}

// ─── Plano Final ──────────────────────────────────────────────────────────────

function PlanoFinal({ state, onVoltar }: { state: CanvasState; titulo: string; onVoltar: () => void }) {
  const secoes = STEPS.map(s => ({
    ...s,
    itens: [...(state[s.key] as string[]), ...(state.custom[s.key] || [])],
    extras: Object.entries(state.extras)
      .filter(([k]) => k.startsWith(s.key + '_'))
      .flatMap(([, v]) => v),
    nota: state.notas[s.key],
  })).filter(s => s.itens.length > 0 || s.extras.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
        <div className="relative px-8 py-8">
          <WaveDecor />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileOutput size={26} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest">Canvas Completo</p>
              <h2 className="text-white text-3xl font-black mt-0.5">{state.titulo || 'Briefing Operacional'}</h2>
              <p className="text-white/80 text-sm mt-1">{secoes.length} seções preenchidas · pronto para execução</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {secoes.map(s => {
          const Icon = s.icon
          return (
            <div key={s.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100"
                style={{ background: s.from + '12' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.from }}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700">{s.label}</span>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  {s.itens.map(item => (
                    <span key={item} className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                      style={{ background: s.from }}>
                      {item}
                    </span>
                  ))}
                  {s.extras.map((e, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200 text-slate-600 bg-slate-50">
                      {e}
                    </span>
                  ))}
                </div>
                {s.nota && <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2">{s.nota}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Próximos passos */}
      <div className="mt-6 rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <ChevronRight size={16} /> Próximos Passos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {['Conectar as fontes de dados selecionadas','Configurar indicadores no banco de dados','Definir metas para cada indicador','Ativar os alertas automáticos','Configurar os agentes de IA','Programar as automações','Acessar o Dashboard com dados reais'].map((p, i) => (
            <div key={p} className="flex items-center gap-2 text-sm text-blue-100">
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              {p}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={onVoltar}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
          <X size={14} /> Editar Canvas
        </button>
      </div>
    </div>
  )
}

// ─── Busca de cards existentes no Kanban ─────────────────────────────────────

const COLUNA_CFG: Record<string, { label: string; color: string }> = {
  entrada:        { label: 'Entrada',           color: '#475569' },
  analise:        { label: 'Em Análise',         color: '#2563eb' },
  desenvolvimento:{ label: 'Em Desenvolvimento', color: '#0369a1' },
  revisao:        { label: 'Em Revisão',         color: '#f59e0b' },
  concluido:      { label: 'Concluído',          color: '#059669' },
}

const PRIORITY_DOT: Record<string, string> = {
  Alta: '#ef4444', Média: '#f59e0b', Baixa: '#22c55e',
}

function BuscaKanban({ onNavigate }: { onNavigate: () => void }) {
  const [busca, setBusca] = useState('')
  const cards = useMemo(() => getCards(), [])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return []
    const q = busca.toLowerCase()
    return cards.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      c.responsavel.toLowerCase().includes(q) ||
      c.solicitante.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      (c.briefing?.titulo || '').toLowerCase().includes(q)
    ).slice(0, 6)
  }, [busca, cards])

  const colCfg = (col: string) => COLUNA_CFG[col] || { label: col, color: '#94a3b8' }

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/60">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Search size={12} /> Pesquisar dashboards já criados no Kanban
      </p>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, responsável, tag..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={13} className="text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Resultados */}
      {busca.trim() && (
        <div className="mt-3 space-y-2">
          {filtrados.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">
              Nenhum card encontrado para "<strong>{busca}</strong>"
            </p>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 mb-1">{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
              {filtrados.map(card => {
                const col = colCfg(card.coluna)
                return (
                  <div key={card.id}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-blue-200 hover:shadow-sm transition-all">
                    {/* Dot prioridade */}
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PRIORITY_DOT[card.prioridade] || '#94a3b8' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{card.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {card.responsavel && (
                          <span className="text-[10px] text-slate-500">{card.responsavel}</span>
                        )}
                        {card.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Status coluna */}
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white flex-shrink-0"
                      style={{ background: col.color }}>
                      {col.label}
                    </span>
                  </div>
                )
              })}
              {/* Link para o Kanban */}
              <button
                onClick={onNavigate}
                className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 py-2 hover:bg-blue-50 rounded-xl transition-all">
                <ExternalLink size={11} /> Ver todos no Kanban
              </button>
            </>
          )}
        </div>
      )}

      {!busca.trim() && cards.length > 0 && (
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          {cards.length} card{cards.length !== 1 ? 's' : ''} no Kanban · Pesquise para ver se já existe um similar
        </p>
      )}
      {!busca.trim() && cards.length === 0 && (
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Nenhum dashboard criado ainda. Preencha o Canvas para criar o primeiro!
        </p>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CanvasOperacional() {
  const navigate = useNavigate()
  const [stepIdx, setStepIdx] = useState(0)
  const [state, setState] = useState<CanvasState>(initState)
  const [customInput, setCustomInput] = useState('')

  const step = STEPS[stepIdx]
  const Icon = step.icon
  const total = STEPS.length

  // quantas etapas têm pelo menos 1 item
  const concluidas = STEPS.filter(s => (state[s.key] as string[]).length > 0).length
  const pct = Math.round((concluidas / total) * 100)

  function toggleItem(key: StepKey, val: string) {
    setState(p => {
      const arr = p[key] as string[]
      return { ...p, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
    })
  }

  function toggleExtra(stepKey: string, campo: string, val: string, multi: boolean) {
    const k = `${stepKey}_${campo}`
    setState(p => {
      const arr = p.extras[k] || []
      const next = multi
        ? (arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
        : (arr.includes(val) ? [] : [val])
      return { ...p, extras: { ...p.extras, [k]: next } }
    })
  }

  function addCustom() {
    const v = customInput.trim()
    if (!v) return
    setState(p => {
      const arr = p.custom[step.key] || []
      if (arr.includes(v)) return p
      return { ...p, custom: { ...p.custom, [step.key]: [...arr, v] } }
    })
    setCustomInput('')
  }

  function removeCustom(val: string) {
    setState(p => ({ ...p, custom: { ...p.custom, [step.key]: (p.custom[step.key] || []).filter(v => v !== val) } }))
  }

  const selectedItems = [...(state[step.key] as string[]), ...(state.custom[step.key] || [])]

  function gerarBriefingEIrParaKanban() {
    const pick = (key: StepKey) => [
      ...(state[key] as string[]),
      ...(state.custom[key] || []),
    ]

    const extrasForKey = (key: StepKey): string[] =>
      Object.entries(state.extras)
        .filter(([k]) => k.startsWith(key + '_'))
        .flatMap(([, v]) => v)

    const card = {
      id: `canvas_${Date.now()}`,
      nome: state.titulo || 'Dashboard do Canvas',
      responsavel: state.responsavel || '',
      solicitante: state.solicitante || '',
      dataEntrada: new Date().toISOString().slice(0, 10),
      prazo: '',
      prioridade: 'Alta' as const,
      coluna: 'entrada',
      observacoes: '',
      tags: ['Canvas'],
      dataAnalise: '',
      dataDesenvolvimento: '',
      dataRevisao: '',
      dataConcluido: '',
      dataArquivamento: '',
      arquivado: false,
      briefing: {
        titulo: state.titulo,
        objetivo:    [...pick('objetivos'),   ...extrasForKey('objetivos')],
        indicadores: [...pick('indicadores'), ...extrasForKey('indicadores')],
        vendas:      [...pick('vendas'),      ...extrasForKey('vendas')],
        despesas:    [...pick('despesas'),    ...extrasForKey('despesas')],
        devolucoes:  [...pick('devolucoes'),  ...extrasForKey('devolucoes')],
        dre:         [...pick('dre'),         ...extrasForKey('dre')],
        alertas:     [...pick('alertas'),     ...extrasForKey('alertas')],
        decisoes:    [...pick('decisoes'),    ...extrasForKey('decisoes')],
        agentes:     [...pick('agentes'),     ...extrasForKey('agentes')],
        extras: state.extras,
        notas: state.notas as Record<string, string>,
      },
    }

    saveCard(card)
    navigate('/kanban')
  }

  return (
    <div className="flex gap-5 h-full min-h-0" style={{ minHeight: '600px' }}>

      {/* ── Painel esquerdo ── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-4">
        {/* Progresso */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Progresso do briefing</p>
          <div className="flex flex-col items-center gap-2">
            <CircularProgress pct={pct} accent={step.from} />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">{concluidas} de {total}</p>
              <p className="text-xs text-slate-400">etapas concluídas</p>
            </div>
            {/* Barra linear */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: `linear-gradient(to right, ${step.from}, ${step.to})` }} />
            </div>
          </div>
          {state.titulo && (
            <p className="text-xs font-bold text-center mt-3 truncate px-1" style={{ color: step.from }}>
              {state.titulo}
            </p>
          )}
          <p className="text-[11px] text-slate-400 text-center mt-1 leading-tight">
            {concluidas === total
              ? 'Todas as etapas foram concluídas. Seu Canvas está pronto!'
              : 'Siga as etapas para montar seu Canvas Operacional'}
          </p>
        </div>

        {/* Lista de etapas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
          <div className="divide-y divide-slate-50">
            {STEPS.map((s, i) => {
              const SIcon = s.icon
              const done = (state[s.key] as string[]).length > 0
              const active = i === stepIdx
              return (
                <button key={s.key} onClick={() => setStepIdx(i)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all group"
                  style={active ? { background: s.from + '15' } : {}}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black transition-all"
                    style={active || done
                      ? { background: active ? s.from : '#10b981', color: '#fff' }
                      : { background: '#f1f5f9', color: '#94a3b8' }}>
                    {done && !active ? <Check size={11} /> : i + 1}
                  </div>
                  <SIcon size={14} className="flex-shrink-0" style={{ color: active ? s.from : '#94a3b8' }} />
                  <span className="text-sm flex-1 truncate font-medium"
                    style={{ color: active ? s.from : done ? '#334155' : '#94a3b8' }}>
                    {s.label}
                  </span>
                  {active && <ChevronRight size={12} style={{ color: s.from }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Banner gradiente */}
        <div className="rounded-2xl overflow-hidden relative flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${step.from}, ${step.to})` }}>
          <WaveDecor />
          <div className="relative z-10 flex items-center gap-4 px-7 py-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon size={26} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                ETAPA {stepIdx + 1} DE {total}
              </p>
              <h2 className="text-white text-2xl font-black mt-0.5">{step.label}</h2>
              <p className="text-white/80 text-sm mt-0.5">{step.descricao}</p>
              {/* Título do canvas exibido em todas as etapas (exceto a primeira onde é digitado) */}
              {stepIdx > 0 && (state.titulo || state.responsavel || state.solicitante) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.titulo && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <FileOutput size={11} /> {state.titulo}
                    </span>
                  )}
                  {state.responsavel && (
                    <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
                      👷 Responsável: {state.responsavel}
                    </span>
                  )}
                  {state.solicitante && (
                    <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
                      👤 Solicitante: {state.solicitante}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo da etapa */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Campo de título — apenas na etapa Objetivos */}
            {stepIdx === 0 && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Título do Canvas</p>
                <input
                  value={state.titulo}
                  onChange={e => setState(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Canvas Financeiro Q3, Canvas Comercial 2026, Canvas de Operações..."
                  className="w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all font-medium"
                  style={{
                    borderColor: state.titulo ? step.from : '#e2e8f0',
                    boxShadow: state.titulo ? `0 0 0 3px ${step.from}18` : 'none',
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Este título será exibido em todas as etapas e no briefing final.
                </p>
                {/* Responsável e Solicitante */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Responsável pela elaboração
                    </label>
                    <input
                      value={state.responsavel}
                      onChange={e => setState(p => ({ ...p, responsavel: e.target.value }))}
                      placeholder="Quem vai construir o dashboard?"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Solicitante
                    </label>
                    <input
                      value={state.solicitante}
                      onChange={e => setState(p => ({ ...p, solicitante: e.target.value }))}
                      placeholder="Quem está solicitando a criação?"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Busca de cards existentes no Kanban — apenas em Objetivos */}
            {stepIdx === 0 && (
              <BuscaKanban onNavigate={() => navigate('/kanban')} />
            )}

            {/* Tags principais */}
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Selecione os itens relevantes</p>
              <div className="flex flex-wrap gap-2">
                {step.sugestoes.map(s => (
                  <Tag key={s} label={s}
                    active={(state[step.key] as string[]).includes(s)}
                    accent={step.from}
                    onClick={() => toggleItem(step.key, s)} />
                ))}
                {/* Itens customizados */}
                {(state.custom[step.key] || []).map(v => (
                  <div key={v} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white"
                    style={{ background: step.from }}>
                    <Check size={13} />
                    {v}
                    <button onClick={() => removeCustom(v)} className="ml-0.5 hover:opacity-70">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras + Adicionar + Observação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Extras da etapa */}
              {step.extras.map(ex => (
                <div key={ex.campo}>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {ex.label}
                  </p>
                  {ex.input ? (
                    <input
                      placeholder="Digite o valor..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                      value={(state.extras[`${step.key}_${ex.campo}`] || [])[0] || ''}
                      onChange={e => setState(p => ({
                        ...p,
                        extras: { ...p.extras, [`${step.key}_${ex.campo}`]: e.target.value ? [e.target.value] : [] }
                      }))}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ex.opcoes.map(o => {
                        const k = `${step.key}_${ex.campo}`
                        const active = (state.extras[k] || []).includes(o)
                        return (
                          <button key={o} onClick={() => toggleExtra(step.key, ex.campo, o, ex.multi)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                            style={active
                              ? { background: step.from, borderColor: step.from, color: '#fff' }
                              : { background: '#fff', borderColor: '#e2e8f0', color: '#64748b' }}>
                            {active && <CheckCircle2 size={11} />}
                            {o}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Adicionar item personalizado */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Adicionar item <span className="normal-case font-normal">(opcional)</span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="Item personalizado..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all min-w-0"
                  />
                  <button onClick={addCustom} disabled={!customInput.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-all"
                    style={{ background: step.from }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Observação */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Observação <span className="normal-case font-normal">(opcional)</span>
                </p>
                <textarea
                  rows={3}
                  value={state.notas[step.key]}
                  onChange={e => setState(p => ({ ...p, notas: { ...p.notas, [step.key]: e.target.value } }))}
                  placeholder="Detalhe extra para o profissional..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
            {/* Anterior */}
            <button
              onClick={() => setStepIdx(p => Math.max(0, p - 1))}
              disabled={stepIdx === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all">
              <ChevronLeft size={15} /> Anterior
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => setStepIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIdx ? 20 : 8,
                    height: 8,
                    background: i === stepIdx ? step.from : (state[s.key] as string[]).length > 0 ? step.from + '60' : '#e2e8f0',
                  }} />
              ))}
            </div>

            {/* Próxima / Gerar */}
            {stepIdx < total - 1 ? (
              <button
                onClick={() => setStepIdx(p => p + 1)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all"
                style={{ background: `linear-gradient(135deg,${step.from},${step.to})` }}>
                Próxima <ChevronRight size={15} />
              </button>
            ) : (() => {
              const etapasIncompletas = STEPS.filter(s => (state[s.key] as string[]).length === 0 && (state.custom[s.key] || []).length === 0)
              const semTitulo = !state.titulo.trim()
              const bloqueado = etapasIncompletas.length > 0 || semTitulo
              return (
                <div className="flex flex-col items-end gap-1.5">
                  {bloqueado && (
                    <div className="text-right">
                      {semTitulo && (
                        <p className="text-[10px] text-red-500 font-semibold">• Título obrigatório no passo Objetivos</p>
                      )}
                      {etapasIncompletas.length > 0 && (
                        <p className="text-[10px] text-red-500 font-semibold">
                          • Preencha: {etapasIncompletas.map(s => s.label).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={bloqueado ? undefined : gerarBriefingEIrParaKanban}
                    disabled={bloqueado}
                    title={bloqueado ? 'Preencha todas as etapas antes de gerar o briefing' : ''}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: bloqueado ? '#94a3b8' : `linear-gradient(135deg,${step.from},${step.to})` }}>
                    <FileOutput size={15} /> Gerar Briefing e ir para o Kanban <ChevronRight size={15} />
                  </button>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Dica */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pb-1">
          <Sparkles size={13} />
          Dica: quanto mais contexto você informar, melhores serão os insights gerados.
        </div>
      </div>
    </div>
  )
}
