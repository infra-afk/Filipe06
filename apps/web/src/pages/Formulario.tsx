import { useState } from 'react'
import {
  ClipboardList, Plus, X, ChevronDown, ChevronUp,
  FileText, Database, Users, Target, BarChart2,
  Bell, Bot, Zap, Eye, Calendar, Building2, Search,
  CheckCircle2, Edit2, Trash2, Printer,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RegistroDashboard {
  id: string
  dataCriacao: string
  // Identificação
  nomeDashboard: string
  area: string
  responsavel: string
  usuarios: string
  // Objetivo
  objetivo: string
  problemaResolvido: string
  publicoAlvo: string
  // Dados
  fontesDados: string
  origemDados: string
  frequenciaAtualizacao: string
  // Indicadores
  indicadores: string
  metasConfiguradas: string
  // Decisões
  decisoes: string
  // Alertas
  alertas: string
  // Agentes / Automações
  agentes: string
  automacoes: string
  // Observações
  observacoes: string
}

const AREAS = [
  'Financeiro', 'Comercial', 'Operacional', 'RH', 'TI',
  'Marketing', 'Logística', 'Diretoria', 'Suporte', 'Outro',
]

const FREQUENCIAS = [
  'Tempo real', 'A cada hora', 'Diário', 'Semanal', 'Mensal',
]

// ─── Seção do formulário ──────────────────────────────────────────────────────

function Secao({
  icon, title, color, children,
}: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border-l-4 ${color} bg-white shadow-sm overflow-hidden`}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className="text-slate-500">{icon}</span>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Campo({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
const textareaCls = `${inputCls} resize-none`

// ─── Formulário ───────────────────────────────────────────────────────────────

function blank(): Omit<RegistroDashboard, 'id' | 'dataCriacao'> {
  return {
    nomeDashboard: '', area: 'Financeiro', responsavel: '', usuarios: '',
    objetivo: '', problemaResolvido: '', publicoAlvo: '',
    fontesDados: '', origemDados: '', frequenciaAtualizacao: 'Diário',
    indicadores: '', metasConfiguradas: '',
    decisoes: '', alertas: '', agentes: '', automacoes: '',
    observacoes: '',
  }
}

function FormularioCadastro({
  inicial, onSalvar, onCancelar,
}: {
  inicial?: RegistroDashboard
  onSalvar: (r: RegistroDashboard) => void
  onCancelar: () => void
}) {
  const [form, setForm] = useState(inicial ?? blank())
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  function handleSalvar() {
    if (!form.nomeDashboard.trim()) return
    onSalvar({
      ...form,
      id: inicial?.id ?? `dash_${Date.now()}`,
      dataCriacao: inicial?.dataCriacao ?? new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <div className="space-y-5">
      {/* Identificação */}
      <Secao icon={<FileText size={15} />} title="1. Identificação do Dashboard" color="border-blue-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Nome do Dashboard" required>
            <input value={form.nomeDashboard} onChange={e => set('nomeDashboard', e.target.value)}
              placeholder="Ex: Dashboard Financeiro – Receita e Margem"
              className={inputCls} />
          </Campo>
          <Campo label="Área / Setor">
            <select value={form.area} onChange={e => set('area', e.target.value)} className={inputCls}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </Campo>
          <Campo label="Responsável pelo Dashboard">
            <input value={form.responsavel} onChange={e => set('responsavel', e.target.value)}
              placeholder="Nome de quem construiu e mantém"
              className={inputCls} />
          </Campo>
          <Campo label="Quem Utiliza" hint="Liste os cargos ou pessoas que acessam este dashboard">
            <input value={form.usuarios} onChange={e => set('usuarios', e.target.value)}
              placeholder="Ex: Diretor financeiro, Gerente comercial"
              className={inputCls} />
          </Campo>
        </div>
      </Secao>

      {/* Objetivo */}
      <Secao icon={<Target size={15} />} title="2. Objetivo e Problema Resolvido" color="border-indigo-500">
        <Campo label="Qual o objetivo deste Dashboard?" required
          hint="Explique de forma clara o propósito principal">
          <textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)}
            placeholder="Ex: Monitorar a receita e margem operacional em tempo real para apoiar decisões da diretoria financeira."
            rows={3} className={textareaCls} />
        </Campo>
        <Campo label="Qual problema ele resolve?"
          hint="Descreva o problema ou necessidade que existia antes deste dashboard">
          <textarea value={form.problemaResolvido} onChange={e => set('problemaResolvido', e.target.value)}
            placeholder="Ex: As informações financeiras chegavam com atraso de 3 dias. Este dashboard permite visualização diária e tomada de decisão mais rápida."
            rows={3} className={textareaCls} />
        </Campo>
        <Campo label="Público-Alvo">
          <input value={form.publicoAlvo} onChange={e => set('publicoAlvo', e.target.value)}
            placeholder="Ex: Diretoria e gerência financeira"
            className={inputCls} />
        </Campo>
      </Secao>

      {/* Dados */}
      <Secao icon={<Database size={15} />} title="3. Dados e Fontes Utilizadas" color="border-purple-500">
        <Campo label="Quais dados são utilizados?"
          hint="Liste os tipos de dados que alimentam este dashboard">
          <textarea value={form.fontesDados} onChange={e => set('fontesDados', e.target.value)}
            placeholder="Ex: Vendas, Despesas, DRE, Devoluções, Clientes, Produtos, Metas"
            rows={2} className={textareaCls} />
        </Campo>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Origem dos Dados"
            hint="De onde vêm os dados">
            <input value={form.origemDados} onChange={e => set('origemDados', e.target.value)}
              placeholder="Ex: Supabase, ERP, Excel, Google Sheets"
              className={inputCls} />
          </Campo>
          <Campo label="Frequência de Atualização">
            <select value={form.frequenciaAtualizacao} onChange={e => set('frequenciaAtualizacao', e.target.value)}
              className={inputCls}>
              {FREQUENCIAS.map(f => <option key={f}>{f}</option>)}
            </select>
          </Campo>
        </div>
      </Secao>

      {/* Indicadores */}
      <Secao icon={<BarChart2 size={15} />} title="4. Indicadores e Metas" color="border-teal-500">
        <Campo label="Quais indicadores (KPIs) estão neste Dashboard?"
          hint="Liste todos os indicadores monitorados">
          <textarea value={form.indicadores} onChange={e => set('indicadores', e.target.value)}
            placeholder="Ex: Receita Total, EBITDA, Margem Bruta, Ticket Médio, Custo Fixo, Despesas Totais"
            rows={3} className={textareaCls} />
        </Campo>
        <Campo label="Metas Configuradas"
          hint="Quais metas foram definidas para esses indicadores">
          <textarea value={form.metasConfiguradas} onChange={e => set('metasConfiguradas', e.target.value)}
            placeholder="Ex: Receita mensal acima de R$ 1,2M / Margem acima de 35% / EBITDA mínimo de R$ 250k"
            rows={2} className={textareaCls} />
        </Campo>
      </Secao>

      {/* Decisões */}
      <Secao icon={<Users size={15} />} title="5. Decisões Apoiadas" color="border-orange-500">
        <Campo label="Quais decisões são tomadas com base neste Dashboard?"
          hint="Descreva as regras de decisão que este dashboard apoia">
          <textarea value={form.decisoes} onChange={e => set('decisoes', e.target.value)}
            placeholder={`Ex:\n- Se o EBITDA cair abaixo da meta, acionar revisão de despesas\n- Se vendas caírem 10%, acionar plano comercial\n- Se margem cair, revisar precificação`}
            rows={4} className={textareaCls} />
        </Campo>
      </Secao>

      {/* Alertas */}
      <Secao icon={<Bell size={15} />} title="6. Alertas Configurados" color="border-red-500">
        <Campo label="Quais alertas estão ativos?"
          hint="Liste os alertas automáticos configurados para este dashboard">
          <textarea value={form.alertas} onChange={e => set('alertas', e.target.value)}
            placeholder={`Ex:\n- Alerta quando margem ficar abaixo de 35%\n- Alerta quando despesas superarem o orçamento\n- Notificação semanal por e-mail para a diretoria`}
            rows={3} className={textareaCls} />
        </Campo>
      </Secao>

      {/* Agentes e Automações */}
      <Secao icon={<Bot size={15} />} title="7. Agentes IA e Automações" color="border-violet-500">
        <Campo label="Agentes de IA utilizados"
          hint="Quais agentes de IA atuam neste dashboard">
          <textarea value={form.agentes} onChange={e => set('agentes', e.target.value)}
            placeholder="Ex: Agente Financeiro — analisa tendências de despesas. Agente de Alertas — monitora desvios de meta."
            rows={2} className={textareaCls} />
        </Campo>
        <Campo label="Automações configuradas"
          hint="Quais processos automáticos foram criados">
          <textarea value={form.automacoes} onChange={e => set('automacoes', e.target.value)}
            placeholder="Ex: Relatório executivo gerado automaticamente toda sexta. Atualização de indicadores às 8h todo dia útil."
            rows={2} className={textareaCls} />
        </Campo>
      </Secao>

      {/* Observações */}
      <Secao icon={<FileText size={15} />} title="8. Observações e Contexto Adicional" color="border-slate-400">
        <Campo label="Informações adicionais para auditoria"
          hint="Qualquer contexto relevante que ajude a explicar este dashboard">
          <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
            placeholder="Ex: Este dashboard foi criado a pedido da diretoria em março/2026 para substituir o relatório manual em Excel. Passou por revisão em abril com ajuste nas metas de margem."
            rows={3} className={textareaCls} />
        </Campo>
      </Secao>

      {/* Ações */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onCancelar}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
          <X size={14} /> Cancelar
        </button>
        <button onClick={handleSalvar} disabled={!form.nomeDashboard.trim()}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 shadow-md transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
          <CheckCircle2 size={15} /> Salvar Documentação
        </button>
      </div>
    </div>
  )
}

// ─── Card de registro ─────────────────────────────────────────────────────────

function CardRegistro({
  registro, onAbrir, onEditar, onExcluir,
}: {
  registro: RegistroDashboard
  onAbrir: () => void
  onEditar: () => void
  onExcluir: () => void
}) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <BarChart2 size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{registro.nomeDashboard}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">{registro.area}</span>
              {registro.responsavel && <span className="text-xs text-slate-400">{registro.responsavel}</span>}
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Calendar size={10} /> {registro.dataCriacao}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEditar} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Editar">
            <Edit2 size={13} className="text-slate-400" />
          </button>
          <button onClick={onExcluir} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Excluir">
            <Trash2 size={13} className="text-slate-400 hover:text-red-500" />
          </button>
          <button onClick={() => window.print()} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Imprimir">
            <Printer size={13} className="text-slate-400" />
          </button>
          <button onClick={() => { setExpandido(p => !p); onAbrir() }}
            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
            <Eye size={12} /> {expandido ? 'Fechar' : 'Abrir'}
            {expandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Objetivo resumido */}
      {registro.objetivo && !expandido && (
        <div className="px-5 pb-4">
          <p className="text-xs text-slate-500 line-clamp-2">{registro.objetivo}</p>
        </div>
      )}

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {[
            { icon: <Target size={13} />, label: 'Objetivo', value: registro.objetivo },
            { icon: <Target size={13} />, label: 'Problema Resolvido', value: registro.problemaResolvido },
            { icon: <Users size={13} />, label: 'Público-Alvo', value: registro.publicoAlvo },
            { icon: <Users size={13} />, label: 'Quem Utiliza', value: registro.usuarios },
            { icon: <Database size={13} />, label: 'Dados Utilizados', value: registro.fontesDados },
            { icon: <Database size={13} />, label: 'Origem dos Dados', value: registro.origemDados },
            { icon: <Database size={13} />, label: 'Frequência de Atualização', value: registro.frequenciaAtualizacao },
            { icon: <BarChart2 size={13} />, label: 'Indicadores (KPIs)', value: registro.indicadores },
            { icon: <BarChart2 size={13} />, label: 'Metas Configuradas', value: registro.metasConfiguradas },
            { icon: <Users size={13} />, label: 'Decisões Apoiadas', value: registro.decisoes },
            { icon: <Bell size={13} />, label: 'Alertas', value: registro.alertas },
            { icon: <Bot size={13} />, label: 'Agentes IA', value: registro.agentes },
            { icon: <Zap size={13} />, label: 'Automações', value: registro.automacoes },
            { icon: <FileText size={13} />, label: 'Observações', value: registro.observacoes },
          ].filter(s => s.value).map(s => (
            <div key={s.label} className="px-5 py-3 flex gap-3">
              <span className="text-slate-300 mt-0.5 flex-shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const DEMO: RegistroDashboard[] = [
  {
    id: 'demo1',
    dataCriacao: '2026-05-10',
    nomeDashboard: 'Dashboard Executivo – Visão Geral',
    area: 'Diretoria',
    responsavel: 'Filipe',
    usuarios: 'Diretoria, Gerência Geral',
    objetivo: 'Consolidar os principais indicadores da empresa em uma única tela para apoio à tomada de decisão da diretoria.',
    problemaResolvido: 'A diretoria dependia de relatórios manuais em Excel que chegavam com atraso de 3 dias. Agora tem visão em tempo real.',
    publicoAlvo: 'Diretoria Executiva',
    fontesDados: 'Vendas, DRE, Despesas, Metas, Clientes',
    origemDados: 'Supabase, ERP',
    frequenciaAtualizacao: 'Diário',
    indicadores: 'Receita Total, EBITDA, Margem Bruta, Churn, Total de Vendas, Ticket Médio',
    metasConfiguradas: 'Receita > R$ 1,2M / EBITDA > R$ 280k / Margem > 35% / Churn < 2%',
    decisoes: 'Se EBITDA cair abaixo da meta → revisão de despesas\nSe vendas caírem → acionar plano comercial\nSe churn subir → acionar retenção',
    alertas: 'Alerta quando margem cair abaixo de 35%\nAlerta quando EBITDA cair\nResumo executivo toda sexta por e-mail',
    agentes: 'Agente Financeiro – analisa tendências\nAgente de Alertas – monitora desvios',
    automacoes: 'Relatório executivo gerado toda sexta\nAtualização automática às 8h',
    observacoes: 'Criado em maio/2026 a pedido da diretoria. Substituiu o relatório semanal em Excel.',
  },
]

export default function Formulario() {
  const [registros, setRegistros] = useState<RegistroDashboard[]>(DEMO)
  const [modo, setModo] = useState<'lista' | 'novo' | 'editar'>('lista')
  const [editando, setEditando] = useState<RegistroDashboard | undefined>()
  const [busca, setBusca] = useState('')

  function salvar(r: RegistroDashboard) {
    setRegistros(p => {
      const existe = p.find(x => x.id === r.id)
      return existe ? p.map(x => x.id === r.id ? r : x) : [r, ...p]
    })
    setModo('lista')
    setEditando(undefined)
  }

  function excluir(id: string) {
    if (confirm('Excluir este registro?')) setRegistros(p => p.filter(x => x.id !== id))
  }

  function editar(r: RegistroDashboard) {
    setEditando(r)
    setModo('editar')
  }

  const filtrados = registros.filter(r =>
    r.nomeDashboard.toLowerCase().includes(busca.toLowerCase()) ||
    r.area.toLowerCase().includes(busca.toLowerCase()) ||
    r.responsavel.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
            <ClipboardList size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Documentação de Dashboards</h1>
            <p className="text-sm text-slate-400">Registro completo para auditoria e rastreabilidade</p>
          </div>
        </div>
        {modo === 'lista' && (
          <button
            onClick={() => { setEditando(undefined); setModo('novo') }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 transition-all flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
            <Plus size={15} /> Documentar Dashboard
          </button>
        )}
      </div>

      {/* Lista */}
      {modo === 'lista' && (
        <>
          {/* Busca + contagem */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, área ou responsável..."
                className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent" />
              {busca && <button onClick={() => setBusca('')}><X size={12} className="text-slate-400" /></button>}
            </div>
            <span className="text-xs text-slate-400 font-medium flex-shrink-0">
              {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum dashboard documentado ainda</p>
              <p className="text-xs mt-1">Clique em "Documentar Dashboard" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtrados.map(r => (
                <CardRegistro key={r.id} registro={r}
                  onAbrir={() => {}}
                  onEditar={() => editar(r)}
                  onExcluir={() => excluir(r.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Formulário novo / editar */}
      {(modo === 'novo' || modo === 'editar') && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setModo('lista'); setEditando(undefined) }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X size={12} /> Voltar para a lista
            </button>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-600">
              {modo === 'editar' ? `Editando: ${editando?.nomeDashboard}` : 'Novo Registro'}
            </span>
          </div>
          <FormularioCadastro
            inicial={editando}
            onSalvar={salvar}
            onCancelar={() => { setModo('lista'); setEditando(undefined) }} />
        </div>
      )}
    </div>
  )
}
