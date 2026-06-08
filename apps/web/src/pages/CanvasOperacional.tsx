import { useState } from 'react'
import {
  Target, TrendingUp, TrendingDown, Database, Users,
  Lightbulb, BarChart2, Bell, Bot, Zap, ChevronRight,
  CheckCircle, Circle, Plus, X, FileText, ArrowRight
} from 'lucide-react'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Objetivo = 'aumentar_receita' | 'reduzir_custo' | null

interface CanvasState {
  objetivo: Objetivo
  indicadores: string[]
  dados: string[]
  origens: string[]
  pessoas: string[]
  decisoes: string[]
  analises: string[]
  alertas: string[]
  agentes: string[]
  automacoes: string[]
}

// ─── Dados de sugestão ────────────────────────────────────────────────────────
const INDICADORES_MAP = {
  aumentar_receita: [
    'Receita Total', 'Vendas por Período', 'Ticket Médio',
    'Conversão de Vendas', 'Receita por Canal', 'Receita por Produto',
    'Clientes Novos', 'Clientes Recorrentes', 'Margem de Lucro',
  ],
  reduzir_custo: [
    'Despesas Totais', 'Custo Fixo', 'Custo Variável',
    'Custo por Departamento', 'Custo com Fornecedores', 'Desperdícios',
    'Margem Operacional', 'Economia Gerada', 'Centro de Custo',
  ],
}

const DADOS_SUGERIDOS = [
  'Vendas', 'Despesas', 'Devoluções', 'DRE', 'Clientes',
  'Produtos', 'Metas', 'Orçamentos', 'Custos', 'Fornecedores',
]

const ORIGENS_DADOS = [
  'Supabase', 'Excel', 'Google Sheets', 'ERP',
  'CRM', 'Sistema financeiro', 'Inserção manual', 'Banco de dados',
]

const PESSOAS_SUGERIDAS = [
  'Diretor financeiro', 'Gerente comercial', 'Gerente financeiro',
  'Analista de dados', 'Gestor da área', 'Vendedor', 'Operação',
]

const DECISOES_SUGERIDAS = [
  'Se EBITDA cair, revisar despesas',
  'Se vendas caírem, acionar comercial',
  'Se devoluções aumentarem, revisar qualidade',
  'Se margem cair, revisar preço ou custo',
  'Se meta não for atingida, criar plano de ação',
]

const ANALISES_SUGERIDAS = [
  'Análise de vendas', 'Análise de despesas', 'Análise de margem',
  'Análise de DRE', 'Análise de devoluções', 'Análise por período',
  'Análise por canal', 'Análise por responsável',
]

const ALERTAS_SUGERIDOS = [
  'Avisar quando a margem ficar abaixo da meta',
  'Avisar quando o EBITDA cair',
  'Avisar quando as despesas subirem',
  'Avisar quando o churn aumentar',
  'Avisar quando as devoluções ultrapassarem o limite',
]

const AGENTES_SUGERIDOS = [
  'Agente de Vendas', 'Agente Financeiro', 'Agente de Despesas',
  'Agente de DRE', 'Agente de Alertas', 'Agente de Análise Executiva',
]

const AUTOMACOES_SUGERIDAS = [
  'Gerar relatório automático',
  'Enviar alerta por e-mail ou WhatsApp',
  'Atualizar indicadores automaticamente',
  'Criar tarefa quando uma meta não for atingida',
  'Acionar responsável quando houver desvio',
  'Gerar resumo executivo semanal',
]

// ─── Componente de bloco ──────────────────────────────────────────────────────
function CanvasBloco({
  icon, title, color, children,
}: {
  icon: React.ReactNode
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${color} shadow-sm p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-600">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Tag selecionável ─────────────────────────────────────────────────────────
function Tag({
  label, selected, onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
      }`}
    >
      {selected ? <CheckCircle size={12} /> : <Circle size={12} />}
      {label}
    </button>
  )
}

// ─── Progresso ────────────────────────────────────────────────────────────────
function Progresso({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step ? 'bg-blue-600 w-8' : 'bg-slate-200 w-4'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CanvasOperacional() {
  const [canvas, setCanvas] = useState<CanvasState>({
    objetivo: null,
    indicadores: [],
    dados: [],
    origens: [],
    pessoas: [],
    decisoes: [],
    analises: [],
    alertas: [],
    agentes: [],
    automacoes: [],
  })
  const [planoGerado, setPlanoGerado] = useState(false)

  const toggle = (field: keyof Omit<CanvasState, 'objetivo'>, value: string) => {
    setCanvas(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as string[]).filter(v => v !== value)
        : [...(prev[field] as string[]), value],
    }))
  }

  const stepAtual = [
    canvas.objetivo !== null,
    canvas.indicadores.length > 0,
    canvas.dados.length > 0,
    canvas.pessoas.length > 0,
    canvas.decisoes.length > 0,
    canvas.analises.length > 0,
    canvas.alertas.length > 0,
    canvas.agentes.length > 0,
    canvas.automacoes.length > 0,
  ].filter(Boolean).length

  if (planoGerado) {
    return <PlanoOperacional canvas={canvas} onVoltar={() => setPlanoGerado(false)} />
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Canvas Operacional</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mapeie sua operação antes de montar qualquer dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Progresso step={stepAtual} total={9} />
          <span className="text-xs text-slate-400">{stepAtual}/9 etapas</span>
        </div>
      </div>

      {/* Fluxo */}
      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        {['Objetivos','Indicadores','Dados','Pessoas','Decisões','Análises','Alertas','Agentes IA','Automações','Plano'].map((s, i, arr) => (
          <span key={s} className="flex items-center gap-2">
            <span className={stepAtual > i ? 'text-blue-600 font-medium' : ''}>{s}</span>
            {i < arr.length - 1 && <ArrowRight size={12} />}
          </span>
        ))}
      </div>

      {/* 1. Objetivos */}
      <CanvasBloco icon={<Target size={16} />} title="1. Objetivos" color="border-blue-500">
        <p className="text-xs text-slate-400 mb-3">Qual é o objetivo principal da operação?</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setCanvas(prev => ({ ...prev, objetivo: 'aumentar_receita', indicadores: [] }))}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              canvas.objetivo === 'aumentar_receita'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-slate-200 text-slate-600 hover:border-green-300'
            }`}
          >
            <TrendingUp size={16} />
            Aumentar Receita
          </button>
          <button
            onClick={() => setCanvas(prev => ({ ...prev, objetivo: 'reduzir_custo', indicadores: [] }))}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
              canvas.objetivo === 'reduzir_custo'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-200 text-slate-600 hover:border-red-300'
            }`}
          >
            <TrendingDown size={16} />
            Reduzir Custo
          </button>
        </div>
      </CanvasBloco>

      {/* 2. Indicadores */}
      {canvas.objetivo && (
        <CanvasBloco icon={<BarChart2 size={16} />} title="2. Indicadores" color="border-indigo-500">
          <p className="text-xs text-slate-400 mb-3">Selecione os indicadores que farão parte da operação</p>
          <div className="flex flex-wrap gap-2">
            {INDICADORES_MAP[canvas.objetivo].map(ind => (
              <Tag
                key={ind}
                label={ind}
                selected={canvas.indicadores.includes(ind)}
                onClick={() => toggle('indicadores', ind)}
              />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 3. Dados */}
      {canvas.indicadores.length > 0 && (
        <CanvasBloco icon={<Database size={16} />} title="3. Dados" color="border-purple-500">
          <p className="text-xs text-slate-400 mb-3">Quais dados serão necessários?</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DADOS_SUGERIDOS.map(d => (
              <Tag key={d} label={d} selected={canvas.dados.includes(d)} onClick={() => toggle('dados', d)} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-3">Qual a origem dos dados?</p>
          <div className="flex flex-wrap gap-2">
            {ORIGENS_DADOS.map(o => (
              <Tag key={o} label={o} selected={canvas.origens.includes(o)} onClick={() => toggle('origens', o)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 4. Pessoas */}
      {canvas.dados.length > 0 && (
        <CanvasBloco icon={<Users size={16} />} title="4. Pessoas" color="border-orange-500">
          <p className="text-xs text-slate-400 mb-3">Quem participa da operação?</p>
          <div className="flex flex-wrap gap-2">
            {PESSOAS_SUGERIDAS.map(p => (
              <Tag key={p} label={p} selected={canvas.pessoas.includes(p)} onClick={() => toggle('pessoas', p)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 5. Decisões */}
      {canvas.pessoas.length > 0 && (
        <CanvasBloco icon={<Lightbulb size={16} />} title="5. Decisões" color="border-yellow-500">
          <p className="text-xs text-slate-400 mb-3">Quais decisões serão tomadas a partir dos indicadores?</p>
          <div className="flex flex-wrap gap-2">
            {DECISOES_SUGERIDAS.map(d => (
              <Tag key={d} label={d} selected={canvas.decisoes.includes(d)} onClick={() => toggle('decisoes', d)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 6. Análises */}
      {canvas.decisoes.length > 0 && (
        <CanvasBloco icon={<BarChart2 size={16} />} title="6. Análises" color="border-teal-500">
          <p className="text-xs text-slate-400 mb-3">Quais análises serão necessárias?</p>
          <div className="flex flex-wrap gap-2">
            {ANALISES_SUGERIDAS.map(a => (
              <Tag key={a} label={a} selected={canvas.analises.includes(a)} onClick={() => toggle('analises', a)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 7. Alertas */}
      {canvas.analises.length > 0 && (
        <CanvasBloco icon={<Bell size={16} />} title="7. Alertas" color="border-red-500">
          <p className="text-xs text-slate-400 mb-3">Configure regras de alerta para sua operação</p>
          <div className="flex flex-wrap gap-2">
            {ALERTAS_SUGERIDOS.map(a => (
              <Tag key={a} label={a} selected={canvas.alertas.includes(a)} onClick={() => toggle('alertas', a)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 8. Agentes IA */}
      {canvas.alertas.length > 0 && (
        <CanvasBloco icon={<Bot size={16} />} title="8. Agentes IA" color="border-violet-500">
          <p className="text-xs text-slate-400 mb-3">Quais agentes de IA atuarão na operação?</p>
          <div className="flex flex-wrap gap-2">
            {AGENTES_SUGERIDOS.map(a => (
              <Tag key={a} label={a} selected={canvas.agentes.includes(a)} onClick={() => toggle('agentes', a)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* 9. Automações */}
      {canvas.agentes.length > 0 && (
        <CanvasBloco icon={<Zap size={16} />} title="9. Automações" color="border-amber-500">
          <p className="text-xs text-slate-400 mb-3">Defina automações futuras para sua operação</p>
          <div className="flex flex-wrap gap-2">
            {AUTOMACOES_SUGERIDAS.map(a => (
              <Tag key={a} label={a} selected={canvas.automacoes.includes(a)} onClick={() => toggle('automacoes', a)} />
            ))}
          </div>
        </CanvasBloco>
      )}

      {/* Gerar Plano */}
      {canvas.automacoes.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => setPlanoGerado(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-200"
          >
            <FileText size={16} />
            Gerar Plano Operacional
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Plano Operacional Final ──────────────────────────────────────────────────
function PlanoOperacional({ canvas, onVoltar }: { canvas: CanvasState; onVoltar: () => void }) {
  const secoes = [
    { icon: <Target size={14} />, title: 'Objetivo', items: [canvas.objetivo === 'aumentar_receita' ? 'Aumentar Receita' : 'Reduzir Custo'], color: 'bg-blue-50 text-blue-700' },
    { icon: <BarChart2 size={14} />, title: 'Indicadores', items: canvas.indicadores, color: 'bg-indigo-50 text-indigo-700' },
    { icon: <Database size={14} />, title: 'Dados Necessários', items: canvas.dados, color: 'bg-purple-50 text-purple-700' },
    { icon: <Database size={14} />, title: 'Fontes dos Dados', items: canvas.origens, color: 'bg-purple-50 text-purple-700' },
    { icon: <Users size={14} />, title: 'Pessoas', items: canvas.pessoas, color: 'bg-orange-50 text-orange-700' },
    { icon: <Lightbulb size={14} />, title: 'Decisões', items: canvas.decisoes, color: 'bg-yellow-50 text-yellow-700' },
    { icon: <BarChart2 size={14} />, title: 'Análises', items: canvas.analises, color: 'bg-teal-50 text-teal-700' },
    { icon: <Bell size={14} />, title: 'Alertas', items: canvas.alertas, color: 'bg-red-50 text-red-700' },
    { icon: <Bot size={14} />, title: 'Agentes IA', items: canvas.agentes, color: 'bg-violet-50 text-violet-700' },
    { icon: <Zap size={14} />, title: 'Automações', items: canvas.automacoes, color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Plano Operacional</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resumo completo do Canvas Operacional configurado</p>
        </div>
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-lg"
        >
          <X size={14} /> Editar Canvas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secoes.map(s => s.items.length > 0 && (
          <div key={s.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-500">{s.icon}</span>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{s.title}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.items.map(item => (
                <span key={item} className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Próximos passos */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <ChevronRight size={16} /> Próximos Passos
        </h3>
        <div className="space-y-2">
          {[
            'Conectar as fontes de dados selecionadas',
            'Configurar os indicadores no banco de dados',
            'Definir as metas para cada indicador',
            'Ativar os alertas automáticos',
            'Configurar os agentes de IA',
            'Programar as automações',
            'Acessar o Dashboard com dados reais',
          ].map((p, i) => (
            <div key={p} className="flex items-center gap-2 text-sm text-blue-100">
              <span className="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
