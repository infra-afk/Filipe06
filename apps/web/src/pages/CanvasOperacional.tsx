import { useState } from 'react'
import {
  Target, BarChart2, ShoppingCart, Receipt, RefreshCcw, FileText,
  Bell, Lightbulb, Bot, ChevronRight, ChevronLeft,
  CheckCircle2, Plus, X, FileOutput, Sparkles,
} from 'lucide-react'

// ─── Etapas ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'objetivos', label: 'Objetivos', icon: Target,
    gradient: 'from-blue-600 to-blue-500',
    accent: '#2563eb',
    descricao: 'Qual é o objetivo principal? Para quem é este dashboard?',
    sugestoes: ['Aumentar Receita','Reduzir Custos','Melhorar Margem','Reduzir Churn','Aumentar Vendas','Controle Financeiro','Eficiência Operacional','Expansão de Mercado'],
    extras: [{ campo: 'audiencia', label: 'Audiência', opcoes: ['Diretoria','Gerentes','Equipe Comercial','Equipe Financeira','Todos'], multiSelect: true }],
  },
  {
    key: 'indicadores', label: 'Indicadores', icon: BarChart2,
    gradient: 'from-blue-700 to-blue-600',
    accent: '#1d4ed8',
    descricao: 'Quais KPIs e métricas devem aparecer no dashboard?',
    sugestoes: ['Receita Total','Ticket Médio','Crescimento %','EBITDA','Margem Líquida','CAC','Clientes Novos','Clientes Recorrentes','Conversão','Despesas Totais'],
    extras: [{ campo: 'freq', label: 'Freq. de atualização', opcoes: ['Tempo real','Diário','Semanal','Mensal'] }],
  },
  {
    key: 'vendas', label: 'Vendas', icon: ShoppingCart,
    gradient: 'from-emerald-600 to-teal-500',
    accent: '#059669',
    descricao: 'Como as vendas devem ser analisadas e apresentadas?',
    sugestoes: ['Vendas por Período','Por Produto','Por Canal','Por Vendedor','Por Região','Por Cliente','Meta vs Realizado','Comparação Mensal','Funil de Vendas','Devoluções'],
    extras: [{ campo: 'grafico', label: 'Visualização preferida', opcoes: ['Linha','Barra','Pizza','Tabela','Cards'] }],
  },
  {
    key: 'despesas', label: 'Despesas', icon: Receipt,
    gradient: 'from-red-600 to-rose-500',
    accent: '#dc2626',
    descricao: 'Quais despesas devem ser monitoradas e como?',
    sugestoes: ['Despesas Totais','Fixas vs Variáveis','Por Departamento','Por Fornecedor','Orçamento vs Realizado','Top 10 Gastos','Tendência Mensal','Custo com Pessoal'],
    extras: [{ campo: 'limite', label: 'Limite para alerta (R$)', opcoes: [], input: true }],
  },
  {
    key: 'devolucoes', label: 'Devoluções', icon: RefreshCcw,
    gradient: 'from-orange-500 to-amber-500',
    accent: '#f97316',
    descricao: 'Como as devoluções devem ser analisadas?',
    sugestoes: ['Taxa de Devolução','Por Produto','Por Motivo','Por Período','Custo das Devoluções','Comparação com Meta','Por Canal','Impacto na Margem'],
    extras: [{ campo: 'limite', label: 'Taxa limite (%)', opcoes: [], input: true }],
  },
  {
    key: 'dre', label: 'DRE', icon: FileText,
    gradient: 'from-teal-600 to-cyan-500',
    accent: '#0d9488',
    descricao: 'Quais linhas do DRE devem aparecer e como comparar?',
    sugestoes: ['Receita Bruta','Deduções','Receita Líquida','Custo das Vendas','Lucro Bruto','Despesas Operacionais','EBITDA','EBIT','Resultado Financeiro','Lucro Líquido'],
    extras: [{ campo: 'comparacao', label: 'Comparativo', opcoes: ['Mês atual vs anterior','Mesmo mês do ano passado','YTD acumulado','Budget vs Realizado'] }],
  },
  {
    key: 'alertas', label: 'Alertas', icon: Bell,
    gradient: 'from-rose-600 to-pink-500',
    accent: '#e11d48',
    descricao: 'Quando e como o time deve ser notificado?',
    sugestoes: ['Margem abaixo da meta','Despesas acima do orçamento','Meta de vendas não atingida','Devolução acima do limite','EBITDA negativo','Queda de receita no mês'],
    extras: [{ campo: 'canal', label: 'Canal de notificação', opcoes: ['E-mail','WhatsApp','Dashboard','Todos'] }],
  },
  {
    key: 'decisoes', label: 'Decisões', icon: Lightbulb,
    gradient: 'from-yellow-500 to-orange-400',
    accent: '#d97706',
    descricao: 'Quais decisões serão tomadas com base neste dashboard?',
    sugestoes: ['Revisar precificação se margem cair','Acionar comercial se vendas caírem','Cortar custos se despesas subirem','Revisar fornecedores se custo subir','Criar plano de ação se meta não for atingida','Abrir novo canal se crescimento estiver baixo'],
    extras: [{ campo: 'responsavel', label: 'Responsável', opcoes: ['Diretor','Gerente Financeiro','Gerente Comercial','Equipe','Todos'] }],
  },
  {
    key: 'agentes', label: 'Agentes IA', icon: Bot,
    gradient: 'from-teal-700 to-teal-600',
    accent: '#0f766e',
    descricao: 'Quais análises e automações de IA o dashboard deve gerar?',
    sugestoes: ['Análise automática de tendências','Previsão de vendas','Identificar anomalias em despesas','Resumo executivo semanal','Diagnóstico de margem','Alerta inteligente de desvios','Sugestão de ações corretivas'],
    extras: [{ campo: 'automacoes', label: 'Automação', opcoes: ['Relatório semanal','Alerta por desvio','Atualização automática','Resumo mensal por e-mail'] }],
  },
] as const

type StepKey = typeof STEPS[number]['key']
type CanvasState = {
  notas: Record<StepKey, string>
  extras: Record<string, string>
  custom: Record<StepKey, string[]>
} & Record<string, any>

function initState(): CanvasState {
  return { notas: {} as any, extras: {} as any, custom: {} as any }
}

// ─── Tag ───────────────────────────────────────────────────────────────────────

function Tag({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent: string }) {
  const [pop, setPop] = useState(false)
  function handle() { setPop(true); onClick(); setTimeout(() => setPop(false), 150) }
  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-150 select-none ${
        pop ? 'scale-95' : 'hover:scale-105'
      } ${
        active
          ? 'text-white border-transparent shadow-md'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
      style={active ? { background: accent, borderColor: accent } : {}}
    >
      {active && <CheckCircle2 size={12} className="flex-shrink-0" />}
      {label}
    </button>
  )
}

// ─── Plano Final ──────────────────────────────────────────────────────────────

function PlanoFinal({ state, onVoltar }: { state: CanvasState; onVoltar: () => void }) {
  const [enviado, setEnviado] = useState(false)

  const secoes = STEPS.map(s => ({
    ...s,
    itens: [...((state[s.key] as string[]) || []), ...((state.custom[s.key]) || [])],
    extras: Object.entries(state.extras)
      .filter(([k]) => k.startsWith(s.key + '_'))
      .map(([, v]) => v.split('|').filter(Boolean).join(', '))
      .filter(Boolean),
  })).filter(s => s.itens.length > 0 || s.extras.length > 0)

  function enviarParaKanban() {
    const objetivo = ((state['objetivos'] as string[]) || [])[0] || 'Dashboard do Canvas'
    const audiencia = (state.extras['objetivos_audiencia'] || '').split('|').filter(Boolean).join(', ')
    const card = {
      id: `canvas_${Date.now()}`,
      nome: `Dashboard: ${objetivo}`,
      responsavel: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      prazo: '',
      prioridade: 'Média',
      coluna: 'entrada',
      observacoes: `Briefing gerado via Canvas.${audiencia ? ` Audiência: ${audiencia}.` : ''}`,
      tags: ['Canvas'],
    }
    const existing = JSON.parse(localStorage.getItem('kanban_from_canvas') || '[]')
    localStorage.setItem('kanban_from_canvas', JSON.stringify([...existing, card]))
    setEnviado(true)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Briefing do Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Pronto para o profissional montar o dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {enviado ? (
            <span className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={14} /> Card criado no Kanban
            </span>
          ) : (
            <button
              onClick={enviarParaKanban}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}
            >
              <FileOutput size={14} /> Enviar para Kanban
            </button>
          )}
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={14} /> Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {secoes.map(({ key, label, icon: Icon, gradient, itens, extras: extrasVal }, i) => {
          const nota = state.notas[key as StepKey]
          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center gap-2`}>
                <Icon size={13} color="white" />
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="ml-auto text-xs text-white/70">{itens.length + extrasVal.length}</span>
              </div>
              <div className="p-4 space-y-1.5">
                {[...itens, ...extrasVal].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                    {item}
                  </div>
                ))}
                {nota && (
                  <p className="text-xs italic text-slate-400 mt-2 pt-2 border-t border-slate-100">{nota}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-yellow-400" />
          <h3 className="font-bold text-sm">Checklist para o Profissional</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {secoes.map(({ label, gradient }, i) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-slate-300 animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0`}>
                <CheckCircle2 size={10} color="white" />
              </div>
              Montar seção de {label.toLowerCase()}
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
  const [state, setState] = useState<CanvasState>(initState)
  const [plano, setPlano] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [stepKey, setStepKey] = useState(0)

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1
  const selected: string[] = (state[step.key] as string[]) || []
  const customItens: string[] = state.custom[step.key] || []
  const filled = STEPS.filter(s => ((state[s.key] as string[]) || []).length > 0).length
  const pct = Math.round((filled / STEPS.length) * 100)

  function goTo(idx: number) {
    setStepIdx(idx)
    setStepKey(k => k + 1)
    setCustomInput('')
  }

  function toggle(val: string) {
    setState(prev => {
      const arr: string[] = (prev[step.key] as string[]) || []
      return { ...prev, [step.key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
    })
  }

  function toggleExtra(campo: string, val: string, multiSelect?: boolean) {
    const k = `${step.key}_${campo}`
    setState(prev => {
      if (multiSelect) {
        const current = prev.extras[k] ? prev.extras[k].split('|') : []
        const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
        return { ...prev, extras: { ...prev.extras, [k]: next.join('|') } }
      }
      return { ...prev, extras: { ...prev.extras, [k]: prev.extras[k] === val ? '' : val } }
    })
  }

  function addCustom() {
    const t = customInput.trim()
    if (!t) return
    setState(prev => ({
      ...prev,
      custom: { ...prev.custom, [step.key]: [...(prev.custom[step.key] || []), t] },
    }))
    setCustomInput('')
  }

  function removeCustom(i: number) {
    setState(prev => ({
      ...prev,
      custom: { ...prev.custom, [step.key]: (prev.custom[step.key] || []).filter((_, j) => j !== i) },
    }))
  }

  if (plano) return <PlanoFinal state={state} onVoltar={() => setPlano(false)} />

  return (
    <div className="flex gap-4 lg:gap-6 min-h-0">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="hidden sm:flex w-44 lg:w-52 flex-shrink-0 flex-col gap-3">

        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Canvas do Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Briefing para montar o painel</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500">{filled} de {STEPS.length}</span>
            <span className="text-xs font-bold" style={{ color: step.accent }}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%`, background: `linear-gradient(to right, ${step.accent}, ${step.accent}99)` }}
            />
          </div>
        </div>

        {/* Step nav */}
        <nav className="flex-1 space-y-0.5">
          {STEPS.map((s, i) => {
            const done = ((state[s.key] as string[]) || []).length > 0
            const active = i === stepIdx
            const count = ((state[s.key] as string[]) || []).length + (state.custom[s.key] || []).length
            return (
              <button
                key={s.key}
                onClick={() => goTo(i)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left group ${
                  active
                    ? 'text-white shadow-sm'
                    : done
                      ? 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
                style={active ? { background: `linear-gradient(135deg, ${s.accent}ee, ${s.accent}bb)` } : {}}
              >
                <s.icon size={12} className="flex-shrink-0" />
                <span className="flex-1 truncate">{s.label}</span>
                {done && !active && (
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: s.accent }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
                {active && <ChevronRight size={10} className="opacity-60 flex-shrink-0" />}
              </button>
            )
          })}
        </nav>

        {filled >= 3 && (
          <button
            onClick={() => setPlano(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:opacity-90 animate-fade-up"
            style={{ background: 'linear-gradient(135deg, #1e40af, #0f766e)' }}
          >
            <FileOutput size={12} /> Ver Briefing
          </button>
        )}
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0" key={stepKey}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-step-in">

          {/* Header com gradiente */}
          <div className={`bg-gradient-to-r ${step.gradient} px-5 py-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <step.icon size={18} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  Etapa {stepIdx + 1} / {STEPS.length}
                </div>
                <h2 className="text-base font-bold text-white leading-tight">{step.label}</h2>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed line-clamp-1 lg:line-clamp-none">
                  {step.descricao}
                </p>
              </div>
              {(selected.length + customItens.length) > 0 && (
                <div className="flex-shrink-0 bg-white/20 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1.5">
                  <CheckCircle2 size={11} color="white" />
                  <span className="text-xs font-bold text-white">{selected.length + customItens.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-5 space-y-5">

            {/* Tags de sugestão + customs na mesma linha */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Selecione os itens relevantes
              </p>
              <div className="flex flex-wrap gap-2">
                {(step.sugestoes as readonly string[]).map(s => (
                  <Tag
                    key={s} label={s}
                    active={selected.includes(s)}
                    onClick={() => toggle(s)}
                    accent={step.accent}
                  />
                ))}
                {customItens.map((item, i) => (
                  <span
                    key={`c${i}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white animate-fade-up"
                    style={{ background: step.accent }}
                  >
                    {item}
                    <button onClick={() => removeCustom(i)} className="hover:opacity-70 transition-opacity">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Extras + input personalizado: layout horizontal */}
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-start border-t border-slate-100 pt-4">
              {step.extras.map(extra => (
                <div key={extra.campo} className="flex-shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{extra.label}</p>
                  {(extra as any).input ? (
                    <input
                      value={state.extras[`${step.key}_${extra.campo}`] || ''}
                      onChange={e => setState(prev => ({
                        ...prev,
                        extras: { ...prev.extras, [`${step.key}_${extra.campo}`]: e.target.value },
                      }))}
                      placeholder="Digite o valor..."
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-40"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {extra.opcoes.map((opt: string) => {
                        const k = `${step.key}_${extra.campo}`
                        const isMulti = !!(extra as any).multiSelect
                        const isActive = isMulti
                          ? (state.extras[k] || '').split('|').filter(Boolean).includes(opt)
                          : state.extras[k] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleExtra(extra.campo, opt, isMulti)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                              isActive ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                            style={isActive ? { background: step.accent, borderColor: step.accent } : {}}
                          >
                            {isActive && isMulti && <CheckCircle2 size={10} className="inline mr-1 mb-0.5" />}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Input personalizado inline */}
              <div className="flex-1 min-w-[180px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adicionar item</p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustom()}
                    placeholder="Item personalizado..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all min-w-0"
                  />
                  <button
                    onClick={addCustom}
                    disabled={!customInput.trim()}
                    className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-90 flex-shrink-0"
                    style={{ background: step.accent }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Observação inline */}
              <div className="flex-1 min-w-[220px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observação</p>
                <textarea
                  value={state.notas[step.key] || ''}
                  onChange={e => setState(prev => ({
                    ...prev,
                    notas: { ...prev.notas, [step.key]: e.target.value },
                  }))}
                  placeholder="Detalhe extra para o profissional..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Footer navegação ── */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              onClick={() => goTo(Math.max(0, stepIdx - 1))}
              disabled={stepIdx === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} /> Anterior
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => {
                const done = ((state[STEPS[i].key] as string[]) || []).length > 0
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === stepIdx ? 'w-5 h-2' : done ? 'w-2 h-2 bg-green-400' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    style={i === stepIdx ? { background: step.accent } : {}}
                  />
                )
              })}
            </div>

            {isLast ? (
              <button
                onClick={() => setPlano(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1e40af, #0f766e)' }}
              >
                <FileOutput size={13} /> Gerar Briefing
              </button>
            ) : (
              <button
                onClick={() => goTo(Math.min(STEPS.length - 1, stepIdx + 1))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: step.accent }}
              >
                Próxima <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile step strip */}
        <div className="sm:hidden mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {STEPS.map((s, i) => {
            const done = ((state[s.key] as string[]) || []).length > 0
            const active = i === stepIdx
            return (
              <button
                key={s.key}
                onClick={() => goTo(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  active ? 'text-white shadow-sm' : done ? 'bg-slate-100 text-slate-600' : 'bg-white text-slate-400 border border-slate-100'
                }`}
                style={active ? { background: `linear-gradient(135deg, ${s.accent}, ${s.accent}cc)` } : {}}
              >
                <s.icon size={11} />
                {s.label}
                {done && !active && <CheckCircle2 size={10} className="text-green-500" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
