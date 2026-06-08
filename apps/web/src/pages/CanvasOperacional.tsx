import { useState } from 'react'
import {
  Target, BarChart2, ShoppingCart, Receipt, RefreshCcw, FileText,
  Bell, Lightbulb, ChevronRight, ChevronLeft, CheckCircle2, Circle,
  Plus, X, Bot, FileOutput,
} from 'lucide-react'

// ─── Definição das etapas ─────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'objetivos',
    label: 'Objetivos',
    icon: Target,
    cor: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500', ring: 'ring-blue-200' },
    descricao: 'Qual é o objetivo principal do dashboard? Para quem ele será apresentado?',
    sugestoes: [
      'Aumentar Receita', 'Reduzir Custos', 'Melhorar Margem',
      'Reduzir Churn', 'Aumentar Vendas', 'Expansão de Mercado',
      'Controle Financeiro', 'Eficiência Operacional',
    ],
    audiencia: ['Diretoria', 'Gerentes', 'Equipe Comercial', 'Equipe Financeira', 'Todos'],
  },
  {
    key: 'indicadores',
    label: 'Indicadores',
    icon: BarChart2,
    cor: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500', ring: 'ring-indigo-200' },
    descricao: 'Quais KPIs e métricas devem aparecer no dashboard?',
    sugestoes: [
      'Receita Total', 'Ticket Médio', 'Crescimento %', 'EBITDA',
      'Margem Líquida', 'Custo de Aquisição (CAC)', 'Clientes Novos',
      'Clientes Recorrentes', 'Conversão de Vendas', 'Despesas Totais',
    ],
    frequencia: ['Tempo real', 'Diário', 'Semanal', 'Mensal'],
  },
  {
    key: 'vendas',
    label: 'Vendas',
    icon: ShoppingCart,
    cor: { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-500', ring: 'ring-green-200' },
    descricao: 'Como as vendas devem ser analisadas e apresentadas?',
    sugestoes: [
      'Vendas por Período', 'Por Produto', 'Por Canal de Venda',
      'Por Vendedor', 'Por Região', 'Por Cliente', 'Meta vs Realizado',
      'Comparação Mensal', 'Comparação Anual', 'Funil de Vendas',
    ],
    grafico: ['Linha (tendência)', 'Barra (comparação)', 'Pizza (participação)', 'Tabela (detalhado)', 'Cards (resumo)'],
  },
  {
    key: 'despesas',
    label: 'Despesas',
    icon: Receipt,
    cor: { bg: 'bg-red-600', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-500', ring: 'ring-red-200' },
    descricao: 'Quais despesas devem ser monitoradas e como?',
    sugestoes: [
      'Despesas Totais', 'Fixas vs Variáveis', 'Por Departamento',
      'Por Fornecedor', 'Orçamento vs Realizado', 'Top 10 Gastos',
      'Tendência Mensal', 'Custo com Pessoal', 'Custo com Marketing',
    ],
    limiteAlerta: true,
  },
  {
    key: 'devolucoes',
    label: 'Devoluções',
    icon: RefreshCcw,
    cor: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500', ring: 'ring-orange-200' },
    descricao: 'Como as devoluções devem ser analisadas?',
    sugestoes: [
      'Taxa de Devolução', 'Por Produto', 'Por Motivo',
      'Por Período', 'Custo das Devoluções', 'Comparação com Meta',
      'Por Canal', 'Impacto na Margem',
    ],
    limiteAlerta: true,
  },
  {
    key: 'dre',
    label: 'DRE',
    icon: FileText,
    cor: { bg: 'bg-teal-600', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-500', ring: 'ring-teal-200' },
    descricao: 'Quais linhas do DRE devem aparecer e como comparar?',
    sugestoes: [
      'Receita Bruta', 'Deduções', 'Receita Líquida', 'Custo das Vendas',
      'Lucro Bruto', 'Despesas Operacionais', 'EBITDA', 'EBIT',
      'Resultado Financeiro', 'Lucro Líquido',
    ],
    comparacao: ['Mês atual vs anterior', 'Mesmo mês do ano passado', 'YTD acumulado', 'Budget vs Realizado'],
  },
  {
    key: 'alertas',
    label: 'Alertas',
    icon: Bell,
    cor: { bg: 'bg-rose-600', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-500', ring: 'ring-rose-200' },
    descricao: 'Quando e como o time deve ser avisado?',
    sugestoes: [
      'Margem abaixo da meta', 'Despesas acima do orçamento',
      'Meta de vendas não atingida', 'Devolução acima do limite',
      'EBITDA negativo', 'Queda de receita no mês',
      'Fornecedor com atraso', 'Churn acima do normal',
    ],
    canal: ['E-mail', 'WhatsApp', 'Notificação no dashboard', 'Todos os canais'],
  },
  {
    key: 'decisoes',
    label: 'Decisões',
    icon: Lightbulb,
    cor: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500', ring: 'ring-yellow-200' },
    descricao: 'Quais decisões serão tomadas com base neste dashboard?',
    sugestoes: [
      'Revisar precificação se margem cair',
      'Acionar comercial se vendas caírem',
      'Cortar custos se despesas subirem',
      'Revisar fornecedores se custo subir',
      'Criar plano de ação se meta não for atingida',
      'Abrir novo canal se crescimento estiver baixo',
      'Revisar qualidade se devoluções subirem',
    ],
    responsavel: ['Diretor', 'Gerente Financeiro', 'Gerente Comercial', 'Equipe', 'Todos'],
  },
  {
    key: 'agentes',
    label: 'Agentes IA',
    icon: Bot,
    cor: { bg: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-500', ring: 'ring-violet-200' },
    descricao: 'Quais análises automáticas e insights de IA o dashboard deve gerar?',
    sugestoes: [
      'Análise automática de tendências', 'Previsão de vendas',
      'Identificar anomalias em despesas', 'Resumo executivo semanal',
      'Comparação com benchmark do setor', 'Diagnóstico de margem',
      'Alerta inteligente de desvios', 'Sugestão de ações corretivas',
    ],
    automacoes: ['Relatório semanal automático', 'Disparo de alerta por desvio', 'Atualização automática dos dados', 'Resumo por e-mail mensal'],
  },
] as const

type StepKey = typeof STEPS[number]['key']

// ─── Estado ───────────────────────────────────────────────────────────────────

interface CanvasState {
  objetivos: string[]
  objetivos_audiencia: string[]
  indicadores: string[]
  indicadores_freq: string
  vendas: string[]
  vendas_grafico: string
  despesas: string[]
  despesas_limite: string
  devolucoes: string[]
  devolucoes_limite: string
  dre: string[]
  dre_comparacao: string[]
  alertas: string[]
  alertas_canal: string[]
  decisoes: string[]
  decisoes_responsavel: string[]
  agentes: string[]
  agentes_automacoes: string[]
  notas: Record<StepKey, string>
  itensCustom: Record<StepKey, string[]>
}

const INITIAL: CanvasState = {
  objetivos: [], objetivos_audiencia: [],
  indicadores: [], indicadores_freq: '',
  vendas: [], vendas_grafico: '',
  despesas: [], despesas_limite: '',
  devolucoes: [], devolucoes_limite: '',
  dre: [], dre_comparacao: [],
  alertas: [], alertas_canal: [],
  decisoes: [], decisoes_responsavel: [],
  agentes: [], agentes_automacoes: [],
  notas: {} as Record<StepKey, string>,
  itensCustom: {} as Record<StepKey, string[]>,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggle<T extends string>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

function stepFilled(key: StepKey, s: CanvasState): boolean {
  const map: Record<StepKey, boolean> = {
    objetivos:   s.objetivos.length > 0,
    indicadores: s.indicadores.length > 0,
    vendas:      s.vendas.length > 0,
    despesas:    s.despesas.length > 0,
    devolucoes:  s.devolucoes.length > 0,
    dre:         s.dre.length > 0,
    alertas:     s.alertas.length > 0,
    decisoes:    s.decisoes.length > 0,
    agentes:     s.agentes.length > 0,
  }
  return map[key]
}

// ─── Componentes de UI ────────────────────────────────────────────────────────

function Tag({ label, active, onClick, cor }: {
  label: string; active: boolean; onClick: () => void
  cor: { bg: string; text: string }
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? `${cor.bg} text-white border-transparent`
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
      }`}
    >
      {active ? <CheckCircle2 size={11} /> : <Circle size={11} className="opacity-40" />}
      {label}
    </button>
  )
}

// ─── Plano Final ─────────────────────────────────────────────────────────────

function PlanoFinal({ state, onVoltar }: { state: CanvasState; onVoltar: () => void }) {
  const secoes = [
    { key: 'objetivos',   label: 'Objetivos',    icon: Target,       itens: [...state.objetivos, ...state.objetivos_audiencia.map(a => `Audiência: ${a}`)], cor: 'bg-blue-50 text-blue-700 border-blue-100' },
    { key: 'indicadores', label: 'Indicadores',  icon: BarChart2,    itens: [...state.indicadores, ...(state.indicadores_freq ? [`Frequência: ${state.indicadores_freq}`] : [])], cor: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { key: 'vendas',      label: 'Vendas',        icon: ShoppingCart, itens: [...state.vendas, ...(state.vendas_grafico ? [`Gráfico: ${state.vendas_grafico}`] : [])], cor: 'bg-green-50 text-green-700 border-green-100' },
    { key: 'despesas',    label: 'Despesas',      icon: Receipt,      itens: [...state.despesas, ...(state.despesas_limite ? [`Limite de alerta: ${state.despesas_limite}`] : [])], cor: 'bg-red-50 text-red-700 border-red-100' },
    { key: 'devolucoes',  label: 'Devoluções',   icon: RefreshCcw,   itens: [...state.devolucoes, ...(state.devolucoes_limite ? [`Limite: ${state.devolucoes_limite}%`] : [])], cor: 'bg-orange-50 text-orange-700 border-orange-100' },
    { key: 'dre',         label: 'DRE',           icon: FileText,     itens: [...state.dre, ...state.dre_comparacao], cor: 'bg-teal-50 text-teal-700 border-teal-100' },
    { key: 'alertas',     label: 'Alertas',       icon: Bell,         itens: [...state.alertas, ...state.alertas_canal.map(c => `Canal: ${c}`)], cor: 'bg-rose-50 text-rose-700 border-rose-100' },
    { key: 'decisoes',    label: 'Decisões',     icon: Lightbulb,    itens: [...state.decisoes, ...state.decisoes_responsavel.map(r => `Responsável: ${r}`)], cor: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { key: 'agentes',     label: 'Agentes IA',   icon: Bot,          itens: [...state.agentes, ...state.agentes_automacoes], cor: 'bg-violet-50 text-violet-700 border-violet-100' },
  ]

  const preenchidas = secoes.filter(s => s.itens.length > 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileOutput size={20} className="text-blue-600" />
            Briefing do Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Documento completo para o profissional montar o dashboard
          </p>
        </div>
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-xl transition-all"
        >
          <ChevronLeft size={14} />
          Editar
        </button>
      </div>

      {/* Cards por seção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preenchidas.map(({ key, label, icon: Icon, itens, cor }) => {
          const nota = state.notas[key as StepKey]
          const custom = state.itensCustom[key as StepKey] || []
          const todosItens = [...itens, ...custom]
          return (
            <div key={key} className={`rounded-2xl border p-4 ${cor}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} />
                <h3 className="text-xs font-bold uppercase tracking-wide">{label}</h3>
                <span className="ml-auto text-xs font-bold opacity-60">{todosItens.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {todosItens.map(item => (
                  <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-white/70 border border-current/10 font-medium">
                    {item}
                  </span>
                ))}
              </div>
              {nota && (
                <p className="mt-3 text-xs italic opacity-70 border-t border-current/10 pt-2">
                  Obs: {nota}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Próximos passos */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-sm mb-4 text-slate-100">Checklist para o Profissional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            preenchidas.some(s => s.key === 'objetivos')     && '✓ Alinhar objetivos e audiência do dashboard',
            preenchidas.some(s => s.key === 'indicadores')   && '✓ Configurar os KPIs e cards no topo',
            preenchidas.some(s => s.key === 'vendas')        && '✓ Montar a seção de análise de vendas',
            preenchidas.some(s => s.key === 'despesas')      && '✓ Montar a seção de controle de despesas',
            preenchidas.some(s => s.key === 'devolucoes')    && '✓ Montar o painel de devoluções',
            preenchidas.some(s => s.key === 'dre')           && '✓ Adicionar visão de DRE com comparativos',
            preenchidas.some(s => s.key === 'alertas')       && '✓ Configurar as regras de alerta',
            preenchidas.some(s => s.key === 'decisoes')      && '✓ Documentar as decisões no painel de insights',
            preenchidas.some(s => s.key === 'agentes')       && '✓ Integrar agentes de IA e automações',
          ].filter(Boolean).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span>{item as string}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CanvasOperacional() {
  const [stepIdx, setStepIdx] = useState(0)
  const [state, setState] = useState<CanvasState>(INITIAL)
  const [mostrarPlano, setMostrarPlano] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const step = STEPS[stepIdx]
  const cor = step.cor
  const isUltimo = stepIdx === STEPS.length - 1
  const preenchidas = STEPS.filter(s => stepFilled(s.key, state)).length

  function tog(field: keyof CanvasState, val: string) {
    setState(prev => ({ ...prev, [field]: toggle(prev[field] as string[], val) }))
  }

  function setField(field: keyof CanvasState, val: string) {
    setState(prev => ({ ...prev, [field]: val }))
  }

  function togArr(field: keyof CanvasState, val: string) {
    setState(prev => ({ ...prev, [field]: toggle(prev[field] as string[], val) }))
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    setState(prev => ({
      ...prev,
      itensCustom: {
        ...prev.itensCustom,
        [step.key]: [...(prev.itensCustom[step.key] || []), t],
      },
    }))
    setCustomInput('')
  }

  function removeCustom(idx: number) {
    setState(prev => ({
      ...prev,
      itensCustom: {
        ...prev.itensCustom,
        [step.key]: (prev.itensCustom[step.key] || []).filter((_, i) => i !== idx),
      },
    }))
  }

  if (mostrarPlano) {
    return <PlanoFinal state={state} onVoltar={() => setMostrarPlano(false)} />
  }

  const sugestoes: string[] = (step as any).sugestoes || []
  const customItens: string[] = state.itensCustom[step.key] || []
  const selecionados: string[] = (state[step.key as keyof CanvasState] as string[]) || []

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Canvas do Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Preencha cada etapa para o profissional montar o dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-700">{preenchidas}</span>/{STEPS.length} etapas
          </div>
          {preenchidas >= 3 && (
            <button
              onClick={() => setMostrarPlano(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all"
            >
              <FileOutput size={13} />
              Ver Briefing
            </button>
          )}
        </div>
      </div>

      {/* Navegação de etapas */}
      <div className="flex gap-1 flex-wrap">
        {STEPS.map((s, i) => {
          const filled = stepFilled(s.key, state)
          const active = i === stepIdx
          return (
            <button
              key={s.key}
              onClick={() => setStepIdx(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                active
                  ? `${s.cor.bg} text-white border-transparent shadow-sm`
                  : filled
                    ? 'bg-slate-100 text-slate-600 border-slate-100'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
              }`}
            >
              <s.icon size={13} />
              <span className="hidden sm:inline">{s.label}</span>
              {filled && !active && <CheckCircle2 size={11} className="text-green-500" />}
            </button>
          )
        })}
      </div>

      {/* Card da etapa atual */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Header da etapa */}
        <div className={`px-6 py-5 border-b border-slate-100 ${cor.light}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${cor.bg} flex items-center justify-center`}>
              <step.icon size={18} color="white" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${cor.text}`}>{step.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{step.descricao}</p>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              Etapa {stepIdx + 1} de {STEPS.length}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Sugestões */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Selecione os itens relevantes</p>
            <div className="flex flex-wrap gap-2">
              {sugestoes.map(s => (
                <Tag
                  key={s}
                  label={s}
                  active={selecionados.includes(s)}
                  onClick={() => tog(step.key as keyof CanvasState, s)}
                  cor={cor}
                />
              ))}
            </div>
          </div>

          {/* Opções extras por etapa */}

          {step.key === 'objetivos' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Audiência do dashboard</p>
              <div className="flex flex-wrap gap-2">
                {(step as any).audiencia.map((a: string) => (
                  <Tag key={a} label={a} active={state.objetivos_audiencia.includes(a)} onClick={() => togArr('objetivos_audiencia', a)} cor={cor} />
                ))}
              </div>
            </div>
          )}

          {step.key === 'indicadores' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Frequência de atualização</p>
              <div className="flex gap-2 flex-wrap">
                {(step as any).frequencia.map((f: string) => (
                  <button
                    key={f}
                    onClick={() => setField('indicadores_freq', state.indicadores_freq === f ? '' : f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      state.indicadores_freq === f ? `${cor.bg} text-white border-transparent` : 'text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>
          )}

          {step.key === 'vendas' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Tipo de visualização preferida</p>
              <div className="flex gap-2 flex-wrap">
                {(step as any).grafico.map((g: string) => (
                  <button
                    key={g}
                    onClick={() => setField('vendas_grafico', state.vendas_grafico === g ? '' : g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      state.vendas_grafico === g ? `${cor.bg} text-white border-transparent` : 'text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >{g}</button>
                ))}
              </div>
            </div>
          )}

          {step.key === 'despesas' && (step as any).limiteAlerta && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Limite para alerta de despesas (R$)</p>
              <input
                type="text"
                value={state.despesas_limite}
                onChange={e => setField('despesas_limite', e.target.value)}
                placeholder="Ex: 50.000"
                className="w-48 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          )}

          {step.key === 'devolucoes' && (step as any).limiteAlerta && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Taxa limite de devoluções (%)</p>
              <input
                type="text"
                value={state.devolucoes_limite}
                onChange={e => setField('devolucoes_limite', e.target.value)}
                placeholder="Ex: 3"
                className="w-32 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          )}

          {step.key === 'dre' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Comparativos a incluir</p>
              <div className="flex flex-wrap gap-2">
                {(step as any).comparacao.map((c: string) => (
                  <Tag key={c} label={c} active={state.dre_comparacao.includes(c)} onClick={() => togArr('dre_comparacao', c)} cor={cor} />
                ))}
              </div>
            </div>
          )}

          {step.key === 'alertas' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Canal de notificação</p>
              <div className="flex flex-wrap gap-2">
                {(step as any).canal.map((c: string) => (
                  <Tag key={c} label={c} active={state.alertas_canal.includes(c)} onClick={() => togArr('alertas_canal', c)} cor={cor} />
                ))}
              </div>
            </div>
          )}

          {step.key === 'decisoes' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Quem toma as decisões</p>
              <div className="flex flex-wrap gap-2">
                {(step as any).responsavel.map((r: string) => (
                  <Tag key={r} label={r} active={state.decisoes_responsavel.includes(r)} onClick={() => togArr('decisoes_responsavel', r)} cor={cor} />
                ))}
              </div>
            </div>
          )}

          {step.key === 'agentes' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Automações a configurar</p>
              <div className="flex flex-wrap gap-2">
                {(step as any).automacoes.map((a: string) => (
                  <Tag key={a} label={a} active={state.agentes_automacoes.includes(a)} onClick={() => togArr('agentes_automacoes', a)} cor={cor} />
                ))}
              </div>
            </div>
          )}

          {/* Itens customizados */}
          {customItens.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customItens.map((item, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cor.bg} text-white`}>
                  {item}
                  <button onClick={() => removeCustom(i)} className="hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Adicionar item custom */}
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder={`Adicionar item personalizado em ${step.label.toLowerCase()}...`}
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              onClick={addCustom}
              disabled={!customInput.trim()}
              className={`p-2.5 rounded-xl text-white transition-all disabled:opacity-40 ${cor.bg}`}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Observação (opcional)</p>
            <textarea
              value={state.notas[step.key] || ''}
              onChange={e => setState(prev => ({ ...prev, notas: { ...prev.notas, [step.key]: e.target.value } }))}
              placeholder="Algum detalhe extra que o profissional precisa saber sobre esta etapa..."
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer navegação */}
        <div className={`px-6 py-4 border-t border-slate-100 flex items-center justify-between ${cor.light}`}>
          <button
            onClick={() => setStepIdx(i => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={15} />
            Anterior
          </button>

          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === stepIdx ? `${cor.bg} w-4` : stepFilled(STEPS[i].key, state) ? 'bg-green-400' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {isUltimo ? (
            <button
              onClick={() => setMostrarPlano(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold ${cor.text} hover:opacity-80 transition-all`}
            >
              <FileOutput size={14} />
              Gerar Briefing
            </button>
          ) : (
            <button
              onClick={() => setStepIdx(i => Math.min(STEPS.length - 1, i + 1))}
              className={`flex items-center gap-1.5 text-xs font-medium ${cor.text} hover:opacity-80 transition-all`}
            >
              Próxima
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
