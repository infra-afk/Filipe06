import { useState } from 'react'
import {
  ClipboardList, Plus, X, CheckCircle2, Send,
  Calendar, Flag, Tag, User, AlignLeft, Layers,
} from 'lucide-react'

type Priority = 'Alta' | 'Média' | 'Baixa'

interface FormData {
  nome: string
  responsavel: string
  prioridade: Priority
  coluna: string
  prazo: string
  tags: string
  observacoes: string
}

const COLUNAS = ['Entrada', 'Em análise', 'Em desenvolvimento', 'Em revisão', 'Concluído']

const PRIORITY_CFG: Record<Priority, { bg: string; text: string; border: string; dot: string }> = {
  Alta:  { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-400',   dot: 'bg-red-500'   },
  Média: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400', dot: 'bg-amber-500' },
  Baixa: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-400', dot: 'bg-green-500' },
}

function blank(): FormData {
  return { nome: '', responsavel: '', prioridade: 'Média', coluna: 'Entrada', prazo: '', tags: '', observacoes: '' }
}

export default function Formulario() {
  const [form, setForm]     = useState<FormData>(blank())
  const [enviado, setEnviado] = useState(false)
  const [historico, setHistorico] = useState<FormData[]>([])

  const set = (f: keyof FormData, v: string) => setForm(p => ({ ...p, [f]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setHistorico(p => [form, ...p])

    // Salva no localStorage para o Kanban pegar
    const card = {
      id: `form_${Date.now()}`,
      nome: form.nome,
      responsavel: form.responsavel,
      prioridade: form.prioridade,
      coluna: form.coluna.toLowerCase().replace(/\s+/g, '_').replace('é', 'e').replace('ã', 'a'),
      dataEntrada: new Date().toISOString().slice(0, 10),
      prazo: form.prazo,
      observacoes: form.observacoes,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const existing = JSON.parse(localStorage.getItem('kanban_from_canvas') || '[]')
    localStorage.setItem('kanban_from_canvas', JSON.stringify([...existing, card]))

    setForm(blank())
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  function limpar() { setForm(blank()) }

  const preenchido = form.nome.trim().length > 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}>
          <ClipboardList size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Formulário de Dashboard</h1>
          <p className="text-sm text-slate-400">Solicite um novo dashboard para o Kanban</p>
        </div>
      </div>

      {/* Sucesso */}
      {enviado && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 animate-fade-up">
          <CheckCircle2 size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Card enviado para o Kanban!</p>
            <p className="text-xs text-green-600 mt-0.5">Acesse a aba Kanban para visualizar e mover o card.</p>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Barra superior */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
          <Plus size={15} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">Novo Card de Dashboard</h2>
        </div>

        <div className="p-6 space-y-5">

          {/* Nome */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <AlignLeft size={11} /> Nome do Dashboard *
            </label>
            <input
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Dashboard Financeiro, Dashboard de Vendas..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Responsável + Coluna */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                <User size={11} /> Responsável
              </label>
              <input
                value={form.responsavel}
                onChange={e => set('responsavel', e.target.value)}
                placeholder="Nome do responsável"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Layers size={11} /> Coluna no Kanban
              </label>
              <select
                value={form.coluna}
                onChange={e => set('coluna', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-white transition-all"
              >
                {COLUNAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <Flag size={11} /> Prioridade
            </label>
            <div className="flex gap-3">
              {(['Alta', 'Média', 'Baixa'] as Priority[]).map(p => {
                const cfg = PRIORITY_CFG[p]
                const active = form.prioridade === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('prioridade', p)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? cfg.dot : 'bg-slate-300'}`} />
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prazo + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Calendar size={11} /> Prazo
              </label>
              <input
                type="date"
                value={form.prazo}
                onChange={e => set('prazo', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Tag size={11} /> Tags
              </label>
              <input
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="Vendas, DRE, Financeiro..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">Separe por vírgula</p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              <AlignLeft size={11} /> Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              placeholder="Descreva o objetivo do dashboard, quais dados serão usados, quem vai acessar..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={limpar}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-all"
          >
            <X size={14} /> Limpar
          </button>
          <button
            type="submit"
            disabled={!preenchido}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all shadow-md hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#0f766e)' }}
          >
            <Send size={14} /> Enviar para Kanban
          </button>
        </div>
      </form>

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Enviados nesta sessão</h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">{historico.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {historico.map((h, i) => {
              const cfg = PRIORITY_CFG[h.prioridade]
              return (
                <div key={i} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{h.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {h.responsavel && <span className="text-xs text-slate-400">{h.responsavel}</span>}
                      {h.coluna && <span className="text-xs text-slate-300">· {h.coluna}</span>}
                      {h.prazo && <span className="text-xs text-slate-300">· {h.prazo}</span>}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {h.prioridade}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
