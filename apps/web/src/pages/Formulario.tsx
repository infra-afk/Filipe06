import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCards, getArquivados, saveCard as storeSaveCard, loadKanbanFromServer, KanbanCard,
} from '../store/kanbanStore'
import {
  ChevronDown, ChevronUp, Printer, Search, X, Filter,
  Sparkles, FileText, CheckSquare, Clock, Edit3, Check,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const COLUNAS: Record<string, string> = {
  entrada: 'Entrada', analise: 'Em Análise',
  desenvolvimento: 'Em Desenvolvimento', revisao: 'Em Revisão',
  concluido: 'Concluído', saida: 'Saída',
}

const BRIEFING_SECTIONS = [
  { key: 'objetivo',    label: 'Objetivos'     },
  { key: 'indicadores', label: 'Indicadores'   },
  { key: 'vendas',      label: 'Vendas'        },
  { key: 'despesas',    label: 'Despesas'      },
  { key: 'devolucoes',  label: 'Devoluções'    },
  { key: 'dre',         label: 'DRE'           },
  { key: 'alertas',     label: 'Alertas'       },
  { key: 'decisoes',    label: 'Decisões'      },
  { key: 'agentes',     label: 'Agentes IA'    },
] as const

// ─── Auto-gerador de resumo executivo ────────────────────────────────────────

function gerarResumoAutomatico(card: KanbanCard): string {
  const b = card.briefing
  const titulo = b.titulo || card.nome
  const resp = card.responsavel ? `desenvolvido por ${card.responsavel}` : 'em desenvolvimento'
  const solic = card.solicitante ? ` a pedido de ${card.solicitante}` : ''

  const parts: string[] = []

  parts.push(`O dashboard "${titulo}" é ${resp}${solic}.`)

  if (b.objetivo?.length)
    parts.push(`Tem como objetivo ${b.objetivo.join(', ').toLowerCase()}.`)

  if (b.indicadores?.length)
    parts.push(`Monitora os seguintes indicadores: ${b.indicadores.join(', ')}.`)

  if (b.vendas?.length)
    parts.push(`Para análise de vendas, contempla: ${b.vendas.join(', ')}.`)

  if (b.despesas?.length)
    parts.push(`No controle de despesas, abrange: ${b.despesas.join(', ')}.`)

  if (b.devolucoes?.length)
    parts.push(`Em devoluções, analisa: ${b.devolucoes.join(', ')}.`)

  if (b.dre?.length)
    parts.push(`Apresenta no DRE: ${b.dre.join(', ')}.`)

  if (b.alertas?.length)
    parts.push(`Emite alertas para: ${b.alertas.join(', ')}.`)

  if (b.decisoes?.length)
    parts.push(`Suporta decisões como: ${b.decisoes.join(', ')}.`)

  if (b.agentes?.length)
    parts.push(`Conta com agentes de IA para: ${b.agentes.join(', ')}.`)

  if (card.observacoes)
    parts.push(`Observação adicional: ${card.observacoes}`)

  if (parts.length <= 1)
    return `O dashboard "${titulo}" está em processo de documentação. Complete o Canvas Operacional para gerar um resumo detalhado.`

  return parts.join(' ')
}

// ─── Resumo Executivo (editável + auto-gerado) ────────────────────────────────

function ResumoExecutivo({ card, onSave }: { card: KanbanCard; onSave: (resumo: string) => void }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(card.briefing.resumo || '')
  const [gerando, setGerando] = useState(false)

  function handleGerar() {
    setGerando(true)
    // Simula geração com pequeno delay para feedback visual
    setTimeout(() => {
      const gerado = gerarResumoAutomatico(card)
      setTexto(gerado)
      setGerando(false)
      setEditando(true)
    }, 600)
  }

  function handleSalvar() {
    onSave(texto)
    setEditando(false)
  }

  const temResumo = !!card.briefing.resumo

  return (
    <div className="border-b border-slate-100">
      {/* Header da seção */}
      <div className="px-8 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full bg-slate-800" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Resumo Executivo
          </h3>
          {temResumo && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Documentado
            </span>
          )}
        </div>
        <div className="no-print flex items-center gap-2">
          {!editando && (
            <>
              <button
                onClick={handleGerar}
                disabled={gerando}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                <Sparkles size={12} className={gerando ? 'animate-spin' : ''} />
                {gerando ? 'Gerando…' : temResumo ? 'Regenerar' : 'Gerar Resumo'}
              </button>
              {temResumo && (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Edit3 size={12} /> Editar
                </button>
              )}
            </>
          )}
          {editando && (
            <>
              <button
                onClick={() => { setTexto(card.briefing.resumo || ''); setEditando(false) }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all"
              >
                <Check size={12} /> Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-8 pb-5">
        {editando ? (
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={5}
            autoFocus
            placeholder="Descreva o propósito do dashboard, como funciona, quem usa e quais decisões suporta..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 resize-none transition-all font-normal"
          />
        ) : temResumo ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-sm text-slate-700 leading-relaxed">{card.briefing.resumo}</p>
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl px-5 py-5 text-center">
            <Sparkles size={20} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400 mb-1">Nenhum resumo gerado</p>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Clique em <strong>"Gerar Resumo"</strong> para criar automaticamente um texto
              explicativo a partir dos dados do Canvas, ou escreva o seu próprio.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Card de Registro (documento formal + bonito) ─────────────────────────────

function RegistroCard({
  card, index, forceOpen, onCardUpdate,
}: {
  card: KanbanCard
  index: number
  forceOpen: boolean
  onCardUpdate: (card: KanbanCard) => void
}) {
  const [aberto, setAberto] = useState(false)
  const open = forceOpen || aberto

  const etapas = [
    { label: 'Entrada',             data: card.dataEntrada,         done: !!card.dataEntrada         },
    { label: 'Em Análise',          data: card.dataAnalise,         done: !!card.dataAnalise         },
    { label: 'Em Desenvolvimento',  data: card.dataDesenvolvimento, done: !!card.dataDesenvolvimento },
    { label: 'Em Revisão',          data: card.dataRevisao,         done: !!card.dataRevisao         },
    { label: 'Concluído',           data: card.dataConcluido,       done: !!card.dataConcluido       },
    { label: 'Arquivado',           data: card.dataArquivamento,    done: !!card.dataArquivamento    },
  ]

  const etapasConcluidas = etapas.filter(e => e.done).length
  const secoesBriefing = BRIEFING_SECTIONS.map(s => ({
    ...s,
    itens: (card.briefing[s.key] as string[]) || [],
    nota:  card.briefing.notas?.[s.key] || '',
  }))
  const temBriefing = secoesBriefing.some(s => s.itens.length > 0)

  function saveResumo(resumo: string) {
    const updated: KanbanCard = {
      ...card,
      briefing: { ...card.briefing, resumo },
    }
    storeSaveCard(updated)
    onCardUpdate(updated)
  }

  const status = card.arquivado ? 'Arquivado' : (COLUNAS[card.coluna] || card.coluna)
  const prioColor = { Alta: '#ef4444', Média: '#f59e0b', Baixa: '#22c55e' }[card.prioridade]

  return (
    <div
      id={`registro-${card.id}`}
      className="registro-card bg-white rounded-2xl overflow-hidden transition-shadow"
      style={{ boxShadow: open ? '0 4px 24px 0 rgba(15,23,42,0.08)' : '0 1px 4px 0 rgba(15,23,42,0.06)', border: '1px solid #e8ecf0' }}
    >
      {/* ── Cabeçalho do card ── */}
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-start gap-4 min-w-0 flex-1">

          {/* Número */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mt-0.5">
            <span className="text-xs font-black text-slate-500 font-mono">
              {String(index).padStart(2, '0')}
            </span>
          </div>

          {/* Título + metadados */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {card.briefing?.titulo || card.nome}
              </h2>
              {/* Status pill */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mt-0.5 flex-shrink-0"
                style={{ borderColor: prioColor + '50', color: prioColor, background: prioColor + '10' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: prioColor }} />
                {card.prioridade}
              </span>
            </div>

            {/* Linha de metadados */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
              {[
                { label: 'Responsável', value: card.responsavel },
                { label: 'Solicitante', value: card.solicitante },
                { label: 'Status', value: status },
                { label: 'Entrada', value: fmt(card.dataEntrada) },
                ...(card.prazo ? [{ label: 'Prazo', value: fmt(card.prazo) }] : []),
              ].filter(m => m.value && m.value !== '—').map(m => (
                <span key={m.label} className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">{m.label}: </span>
                  <span className="text-slate-700">{m.value}</span>
                </span>
              ))}
            </div>

            {/* Tags */}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {card.tags.map(t => (
                  <span key={t} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progresso etapas + botão */}
        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <CheckSquare size={13} />
            <span className="font-semibold text-slate-600">{etapasConcluidas}</span>
            <span>/6 etapas</span>
          </div>
          <button
            onClick={() => setAberto(v => !v)}
            className="no-print flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? 'Fechar' : 'Abrir'}
          </button>
        </div>
      </div>

      {/* ── Conteúdo expandido ── */}
      {open && (
        <div className="border-t border-slate-100">

          {/* RESUMO EXECUTIVO */}
          <ResumoExecutivo card={card} onSave={saveResumo} />

          {/* RASTREABILIDADE */}
          <div className="px-8 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full bg-slate-800" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Rastreabilidade — Histórico de Etapas
              </h3>
            </div>

            {/* Timeline visual */}
            <div className="flex items-start gap-0 overflow-x-auto pb-1">
              {etapas.map((e, i) => (
                <div key={e.label} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[90px]">
                    {/* Círculo */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      e.done
                        ? 'bg-slate-800 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}>
                      {e.done
                        ? <Check size={13} className="text-white" />
                        : <Clock size={12} className="text-slate-300" />
                      }
                    </div>
                    {/* Label */}
                    <p className={`text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-[80px] ${
                      e.done ? 'text-slate-700' : 'text-slate-300'
                    }`}>{e.label}</p>
                    {/* Data */}
                    <p className={`text-[10px] mt-0.5 font-mono ${
                      e.done ? 'text-slate-500' : 'text-slate-200'
                    }`}>{e.done ? fmt(e.data) : '—'}</p>
                  </div>
                  {/* Linha conectora */}
                  {i < etapas.length - 1 && (
                    <div className={`w-8 h-0.5 mb-8 flex-shrink-0 ${
                      etapas[i + 1].done ? 'bg-slate-800' : 'bg-slate-100'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          {card.observacoes && (
            <div className="px-8 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-5 rounded-full bg-slate-800" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Observações
                </h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{card.observacoes}</p>
            </div>
          )}

          {/* CANVAS OPERACIONAL */}
          <div className="px-8 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full bg-slate-800" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Canvas Operacional — Documentação Técnica
              </h3>
            </div>

            {!temBriefing ? (
              <div className="border border-dashed border-slate-200 rounded-xl px-5 py-5 text-center">
                <FileText size={18} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhuma seção do Canvas documentada.</p>
                <p className="text-xs text-slate-300 mt-1">Acesse Kanban → card → aba "Briefing do Canvas" para preencher.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-32">Seção</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Itens Documentados</th>
                      <th className="text-left py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-48">Anotação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {secoesBriefing.map(s => (
                      <tr key={s.key} className="align-top hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-600 text-xs">{s.label}</td>
                        <td className="py-2.5 px-4 text-slate-700 text-xs leading-relaxed">
                          {s.itens.length > 0
                            ? s.itens.join(' · ')
                            : <span className="text-slate-300 italic">Não preenchido</span>
                          }
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-xs italic">
                          {s.nota || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rodapé do registro */}
          <div className="px-8 py-3 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">ID: {card.id}</span>
            <button
              onClick={e => {
                const alvo = (e.currentTarget as HTMLElement).closest('.registro-card')
                document.querySelectorAll('.registro-card.print-target').forEach(el => el.classList.remove('print-target'))
                alvo?.classList.add('print-target')
                document.body.classList.add('printing-single')
                window.print()
              }}
              className="no-print flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
              <Printer size={11} /> Imprimir este registro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Formulario() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<KanbanCard[]>(() => [...getCards(), ...getArquivados()])

  // Sincroniza com o servidor para garantir que cards arquivados recentes apareçam
  useEffect(() => {
    loadKanbanFromServer()
      .then(() => setCards([...getCards(), ...getArquivados()]))
      .catch(() => {})
  }, [])

  // Limpeza após impressão: remove o modo "imprimir só este registro"
  useEffect(() => {
    function aposImprimir() {
      document.body.classList.remove('printing-single')
      document.querySelectorAll('.registro-card.print-target')
        .forEach(el => el.classList.remove('print-target'))
    }
    window.addEventListener('afterprint', aposImprimir)
    return () => window.removeEventListener('afterprint', aposImprimir)
  }, [])
  const [busca, setBusca]                 = useState('')
  const [filtroStatus, setFiltroStatus]   = useState<'todos' | 'ativo' | 'arquivado'>('todos')
  const [filtroResp, setFiltroResp]       = useState('')
  const [expandirTodos, setExpandirTodos] = useState(false)

  const responsaveis = [...new Set(cards.map(c => c.responsavel).filter(Boolean))]

  const filtrados = cards.filter(c => {
    if (filtroStatus === 'ativo'     && c.arquivado)  return false
    if (filtroStatus === 'arquivado' && !c.arquivado) return false
    if (filtroResp && c.responsavel !== filtroResp)   return false
    if (busca) {
      const q = busca.toLowerCase()
      return (
        c.nome.toLowerCase().includes(q) ||
        (c.briefing?.titulo || '').toLowerCase().includes(q) ||
        c.responsavel.toLowerCase().includes(q) ||
        c.solicitante.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const handleCardUpdate = useCallback((updated: KanbanCard) => {
    setCards(p => p.map(c => c.id === updated.id ? updated : c))
  }, [])

  const ativos     = cards.filter(c => !c.arquivado).length
  const arquivados = cards.filter(c =>  c.arquivado).length
  const comResumo  = cards.filter(c =>  c.briefing?.resumo).length

  return (
    <div className="max-w-5xl mx-auto px-1">

      {/* ── Cabeçalho institucional ── */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4 pb-5 border-b-2 border-slate-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              CHUÁ — ALÉM DA DISTRIBUIÇÃO
            </p>
            <h1 className="text-3xl font-black text-slate-900 leading-none">
              Registro de Dashboards
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-lg">
              Documentação técnica e operacional para fins de auditoria, rastreabilidade e governança de dados.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-6 mb-3">
              {[
                { n: ativos,     label: 'Ativos'     },
                { n: arquivados, label: 'Arquivados'  },
                { n: comResumo,  label: 'Resumidos'   },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-slate-900 leading-none">{n}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setExpandirTodos(true); setTimeout(() => window.print(), 200) }}
              className="no-print inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              <Printer size={13} /> Exportar / Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* ── Nenhum card ── */}
      {cards.length === 0 && (
        <div className="text-center py-24 border border-slate-200 rounded-2xl bg-white">
          <FileText size={36} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-600 font-bold text-base mb-2">Nenhum registro encontrado</p>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Crie um Canvas Operacional completo para gerar o primeiro registro de dashboard.
          </p>
          <button
            onClick={() => navigate('/canvases')}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-slate-900 px-6 py-3 rounded-xl hover:bg-slate-700 transition-colors"
          >
            Ir para o Canvas Operacional
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <>
          {/* ── Barra de filtros ── */}
          <div className="no-print flex flex-wrap gap-3 items-center mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Filter size={13} className="text-slate-400 flex-shrink-0" />

            <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, responsável, tag..."
                className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
              />
              {busca && <button onClick={() => setBusca('')}><X size={11} className="text-slate-400" /></button>}
            </div>

            <div className="flex items-center gap-0 rounded-xl border border-slate-200 overflow-hidden bg-white">
              {(['todos', 'ativo', 'arquivado'] as const).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${
                    filtroStatus === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}>
                  {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Arquivados'}
                </button>
              ))}
            </div>

            {responsaveis.length > 0 && (
              <select value={filtroResp} onChange={e => setFiltroResp(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none bg-white focus:border-slate-400">
                <option value="">Todos responsáveis</option>
                {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-slate-400 font-mono">
                {filtrados.length}/{cards.length} registros
              </span>
              <button
                onClick={() => setExpandirTodos(v => !v)}
                className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 transition-all"
              >
                {expandirTodos ? 'Recolher todos' : 'Expandir todos'}
              </button>
            </div>
          </div>

          {/* ── Lista de registros ── */}
          {filtrados.length === 0 ? (
            <p className="text-center py-12 text-sm text-slate-400">Nenhum registro para os filtros aplicados.</p>
          ) : (
            <div className="space-y-4 print:space-y-0">
              {filtrados.map((c, i) => (
                <RegistroCard
                  key={c.id}
                  card={c}
                  index={i + 1}
                  forceOpen={expandirTodos}
                  onCardUpdate={handleCardUpdate}
                />
              ))}
            </div>
          )}

          {/* ── Rodapé de assinatura para impressão ── */}
          {filtrados.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200 print-footer">
              <div className="grid grid-cols-3 gap-10">
                {['Elaborado por', 'Revisado por', 'Aprovado por'].map(label => (
                  <div key={label} className="text-center">
                    <div className="border-b-2 border-slate-300 mb-3 h-10" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Data: ___/___/______</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-300 text-center mt-8 font-mono">
                CHUÁ Dashboard Executivo · {new Date().toLocaleString('pt-BR')} · Documento de uso interno
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
