import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCards, getArquivados, KanbanCard } from '../store/kanbanStore'
import { ChevronDown, ChevronUp, Printer, Search, X, Filter } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function fmtHora() {
  return new Date().toLocaleString('pt-BR')
}

const COLUNAS: Record<string, string> = {
  entrada: 'Entrada',
  analise: 'Em Análise',
  desenvolvimento: 'Em Desenvolvimento',
  revisao: 'Em Revisão',
  concluido: 'Concluído',
}

const BRIEFING_SECTIONS: { key: keyof KanbanCard['briefing']; label: string }[] = [
  { key: 'objetivo',    label: 'Objetivos'     },
  { key: 'indicadores', label: 'Indicadores'   },
  { key: 'vendas',      label: 'Vendas'        },
  { key: 'despesas',    label: 'Despesas'      },
  { key: 'devolucoes',  label: 'Devoluções'    },
  { key: 'dre',         label: 'DRE'           },
  { key: 'alertas',     label: 'Alertas'       },
  { key: 'decisoes',    label: 'Decisões'      },
  { key: 'agentes',     label: 'Agentes IA'    },
]

// ─── Documento de Auditoria por Card ─────────────────────────────────────────

function DocumentoCard({ card, index }: { card: KanbanCard; index: number }) {
  const [aberto, setAberto] = useState(false)

  const etapas = [
    { label: 'Entrada',            data: card.dataEntrada         },
    { label: 'Em Análise',         data: card.dataAnalise         },
    { label: 'Em Desenvolvimento', data: card.dataDesenvolvimento },
    { label: 'Em Revisão',         data: card.dataRevisao         },
    { label: 'Concluído',          data: card.dataConcluido       },
    { label: 'Arquivado',          data: card.dataArquivamento    },
  ]

  const secoesBriefing = BRIEFING_SECTIONS.map(s => ({
    ...s,
    itens: (card.briefing[s.key] as string[]) || [],
    nota: card.briefing.notas?.[s.key as string] || '',
  }))

  const temBriefing = secoesBriefing.some(s => s.itens.length > 0)

  return (
    <div className="border border-slate-300 bg-white print-card">
      {/* Cabeçalho do documento */}
      <div className="border-b border-slate-300 px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="text-xs font-mono text-slate-400 mt-0.5 w-8 flex-shrink-0">
            #{String(index).padStart(3, '0')}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {card.briefing?.titulo || card.nome}
            </h2>
            {card.briefing?.titulo && card.briefing.titulo !== card.nome && (
              <p className="text-xs text-slate-500 mt-0.5">Referência interna: {card.nome}</p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Responsável: </span>
                {card.responsavel || '—'}
              </span>
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Solicitante: </span>
                {card.solicitante || '—'}
              </span>
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Prioridade: </span>
                {card.prioridade}
              </span>
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Status: </span>
                {card.arquivado ? 'Arquivado' : COLUNAS[card.coluna] || card.coluna}
              </span>
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Data de entrada: </span>
                {fmt(card.dataEntrada)}
              </span>
              {card.prazo && (
                <span className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Prazo: </span>
                  {fmt(card.prazo)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setAberto(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-300 px-3 py-1.5 transition-colors flex-shrink-0"
        >
          {aberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {aberto ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {aberto && (
        <div className="divide-y divide-slate-200">

          {/* Seção 1 — Rastreabilidade */}
          <div className="px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              1. Rastreabilidade — Histórico de Etapas
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1.5 pr-6 font-semibold text-slate-600 w-48">Etapa</th>
                  <th className="text-left py-1.5 font-semibold text-slate-600">Data de Registro</th>
                </tr>
              </thead>
              <tbody>
                {etapas.map(e => (
                  <tr key={e.label} className="border-b border-slate-100">
                    <td className="py-1.5 pr-6 text-slate-700">{e.label}</td>
                    <td className={`py-1.5 font-mono ${e.data ? 'text-slate-800' : 'text-slate-300'}`}>
                      {e.data ? fmt(e.data) : 'Não registrado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seção 2 — Tags e Observações */}
          {(card.tags.length > 0 || card.observacoes) && (
            <div className="px-6 py-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                2. Classificação e Observações
              </h3>
              {card.tags.length > 0 && (
                <p className="text-xs text-slate-700 mb-2">
                  <span className="font-semibold text-slate-500">Tags: </span>
                  {card.tags.join(', ')}
                </p>
              )}
              {card.observacoes && (
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-500">Observações: </span>
                  {card.observacoes}
                </p>
              )}
            </div>
          )}

          {/* Seção 3 — Canvas Operacional */}
          <div className="px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              3. Canvas Operacional — Documentação Técnica
            </h3>

            {!temBriefing ? (
              <p className="text-xs text-slate-400 italic">
                Nenhuma seção do Canvas foi documentada para este card. Para preencher, acesse o Kanban → abra o card → aba "Briefing do Canvas".
              </p>
            ) : (
              <div>
                {card.briefing?.titulo && (
                  <p className="text-xs text-slate-700 mb-4">
                    <span className="font-semibold text-slate-500">Título do Canvas: </span>
                    {card.briefing.titulo}
                  </p>
                )}
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50">
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 w-36">Seção</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600">Itens Documentados</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 w-56">Anotação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secoesBriefing.map(s => (
                      <tr key={s.key as string} className="border-b border-slate-100 align-top">
                        <td className="py-2 px-3 font-medium text-slate-600">{s.label}</td>
                        <td className="py-2 px-3 text-slate-700">
                          {s.itens.length > 0
                            ? s.itens.join(' · ')
                            : <span className="text-slate-300">—</span>
                          }
                        </td>
                        <td className="py-2 px-3 text-slate-500 italic">
                          {s.nota || <span className="text-slate-200">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rodapé do documento */}
          <div className="px-6 py-3 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">ID: {card.id}</span>
            <span className="text-[10px] text-slate-400">Impresso em: {fmtHora()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Formulario() {
  const navigate = useNavigate()
  const [allCards]      = useState<KanbanCard[]>(() => [...getCards(), ...getArquivados()])
  const [busca, setBusca]             = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'arquivado'>('todos')
  const [filtroResp, setFiltroResp]   = useState('')
  const [expandirTodos, setExpandirTodos] = useState(false)

  const responsaveis = [...new Set(allCards.map(c => c.responsavel).filter(Boolean))]

  const filtrados = allCards.filter(c => {
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

  const ativos     = allCards.filter(c => !c.arquivado).length
  const arquivados = allCards.filter(c =>  c.arquivado).length

  return (
    <div className="max-w-4xl mx-auto">

      {/* Cabeçalho institucional */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 print-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              CHUÁ — ALÉM DA DISTRIBUIÇÃO
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Registro de Dashboards</h1>
            <p className="text-sm text-slate-500 mt-1">
              Documentação técnica para fins de auditoria e rastreabilidade
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-slate-400 font-mono">Gerado em: {fmtHora()}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Total: {allCards.length} registros · {ativos} ativos · {arquivados} arquivados
            </p>
            <button
              onClick={() => window.print()}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 transition-colors ml-auto"
            >
              <Printer size={12} /> Imprimir / Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Nenhum card */}
      {allCards.length === 0 && (
        <div className="text-center py-20 border border-slate-200">
          <p className="text-slate-500 font-semibold mb-2">Nenhum registro encontrado</p>
          <p className="text-sm text-slate-400 mb-5">
            Crie um Canvas Operacional para gerar o primeiro registro de dashboard.
          </p>
          <button
            onClick={() => navigate('/canvases')}
            className="text-sm font-semibold text-white bg-slate-900 px-5 py-2.5 hover:bg-slate-700 transition-colors"
          >
            Ir para o Canvas Operacional
          </button>
        </div>
      )}

      {allCards.length > 0 && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center mb-5 p-3 bg-slate-50 border border-slate-200">
            <Filter size={13} className="text-slate-400 flex-shrink-0" />

            <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-slate-300 bg-white px-3 py-2">
              <Search size={12} className="text-slate-400 flex-shrink-0" />
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, responsável, tag..."
                className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
              />
              {busca && (
                <button onClick={() => setBusca('')}><X size={11} className="text-slate-400" /></button>
              )}
            </div>

            <div className="flex items-center gap-0 border border-slate-300 overflow-hidden">
              {(['todos', 'ativo', 'arquivado'] as const).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    filtroStatus === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}>
                  {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Arquivados'}
                </button>
              ))}
            </div>

            {responsaveis.length > 0 && (
              <select
                value={filtroResp}
                onChange={e => setFiltroResp(e.target.value)}
                className="border border-slate-300 px-3 py-2 text-xs text-slate-600 outline-none focus:border-slate-500 bg-white"
              >
                <option value="">Todos responsáveis</option>
                {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-slate-400 font-mono">
                {filtrados.length} de {allCards.length} registros
              </span>
              <button
                onClick={() => setExpandirTodos(v => !v)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-2 bg-white transition-colors"
              >
                {expandirTodos ? 'Recolher todos' : 'Expandir todos'}
              </button>
            </div>
          </div>

          {/* Lista sem resultado */}
          {filtrados.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-400">
              Nenhum registro para os filtros aplicados.
            </p>
          ) : (
            <div className="space-y-0 border-t border-slate-300">
              {filtrados.map((c, i) => (
                <DocumentoCardControlled
                  key={c.id}
                  card={c}
                  index={i + 1}
                  forceOpen={expandirTodos}
                />
              ))}
            </div>
          )}

          {/* Assinatura de auditoria */}
          {filtrados.length > 0 && (
            <div className="mt-8 border-t border-slate-300 pt-6 print-footer">
              <div className="grid grid-cols-3 gap-8">
                {['Elaborado por', 'Revisado por', 'Aprovado por'].map(label => (
                  <div key={label}>
                    <div className="border-b border-slate-400 mb-2 h-8" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Data: ___/___/______</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-6 font-mono">
                CHUÁ — Dashboard Executivo · Documento gerado em {fmtHora()} · Uso interno
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Wrapper que respeita o forceOpen
function DocumentoCardControlled({
  card, index, forceOpen,
}: { card: KanbanCard; index: number; forceOpen: boolean }) {
  const [aberto, setAberto] = useState(false)
  const open = forceOpen || aberto

  const etapas = [
    { label: 'Entrada',            data: card.dataEntrada         },
    { label: 'Em Análise',         data: card.dataAnalise         },
    { label: 'Em Desenvolvimento', data: card.dataDesenvolvimento },
    { label: 'Em Revisão',         data: card.dataRevisao         },
    { label: 'Concluído',          data: card.dataConcluido       },
    { label: 'Arquivado',          data: card.dataArquivamento    },
  ]

  const secoesBriefing = BRIEFING_SECTIONS.map(s => ({
    ...s,
    itens: (card.briefing[s.key] as string[]) || [],
    nota: card.briefing.notas?.[s.key as string] || '',
  }))

  const temBriefing = secoesBriefing.some(s => s.itens.length > 0)

  return (
    <div className="border-b border-slate-300 bg-white print-card">
      {/* Cabeçalho do documento */}
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="text-xs font-mono text-slate-400 mt-0.5 w-8 flex-shrink-0 flex-shrink-0">
            #{String(index).padStart(3, '0')}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {card.briefing?.titulo || card.nome}
            </h2>
            {card.briefing?.titulo && card.briefing.titulo !== card.nome && (
              <p className="text-xs text-slate-500 mt-0.5">Ref.: {card.nome}</p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-0.5 mt-2">
              {[
                ['Responsável', card.responsavel || '—'],
                ['Solicitante', card.solicitante || '—'],
                ['Prioridade',  card.prioridade],
                ['Status',      card.arquivado ? 'Arquivado' : (COLUNAS[card.coluna] || card.coluna)],
                ['Entrada',     fmt(card.dataEntrada)],
                ...(card.prazo ? [['Prazo', fmt(card.prazo)] as [string,string]] : []),
              ].map(([label, value]) => (
                <span key={label} className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">{label}: </span>
                  {value}
                </span>
              ))}
              {card.tags.length > 0 && (
                <span className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Tags: </span>
                  {card.tags.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setAberto(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-300 px-3 py-1.5 transition-colors flex-shrink-0 bg-white"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {open ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {open && (
        <div className="divide-y divide-slate-200 border-t border-slate-200">

          {/* Rastreabilidade */}
          <div className="px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              1. Rastreabilidade — Histórico de Etapas
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1.5 pr-8 font-semibold text-slate-600">Etapa</th>
                  <th className="text-left py-1.5 font-semibold text-slate-600">Data de Registro</th>
                </tr>
              </thead>
              <tbody>
                {etapas.map(e => (
                  <tr key={e.label} className="border-b border-slate-100">
                    <td className="py-1.5 pr-8 text-slate-700">{e.label}</td>
                    <td className={`py-1.5 font-mono ${e.data ? 'text-slate-900 font-medium' : 'text-slate-300'}`}>
                      {e.data ? fmt(e.data) : 'Não registrado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observações */}
          {card.observacoes && (
            <div className="px-6 py-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                2. Observações
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{card.observacoes}</p>
            </div>
          )}

          {/* Canvas */}
          <div className="px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              {card.observacoes ? '3' : '2'}. Canvas Operacional — Documentação Técnica
            </h3>
            {!temBriefing ? (
              <p className="text-xs text-slate-400 italic">
                Nenhuma seção do Canvas documentada. Acesse Kanban → card → aba "Briefing do Canvas" para preencher.
              </p>
            ) : (
              <>
                {card.briefing?.titulo && (
                  <p className="text-xs text-slate-700 mb-3">
                    <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Título do Canvas: </span>
                    {card.briefing.titulo}
                  </p>
                )}
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 border-r border-slate-200 w-32">Seção</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 border-r border-slate-200">Itens Documentados</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 w-52">Anotação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secoesBriefing.map(s => (
                      <tr key={s.key as string} className="border-b border-slate-200 align-top">
                        <td className="py-2 px-3 font-medium text-slate-700 border-r border-slate-200">{s.label}</td>
                        <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                          {s.itens.length > 0
                            ? s.itens.join(' · ')
                            : <span className="text-slate-300">Não preenchido</span>
                          }
                        </td>
                        <td className="py-2 px-3 text-slate-500 italic text-[11px]">
                          {s.nota || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Rodapé do registro */}
          <div className="px-6 py-2.5 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">ID do registro: {card.id}</span>
            <span className="text-[10px] text-slate-400 font-mono">Visualizado em: {fmtHora()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
