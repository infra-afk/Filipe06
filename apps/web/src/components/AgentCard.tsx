import { Bot, Play, Pause, Clock } from 'lucide-react'

interface AgentCardProps {
  nome: string
  descricao: string
  status: 'ativo' | 'inativo' | 'pausado'
  ultimaExecucao: string
}

export default function AgentCard({ nome, descricao, status, ultimaExecucao }: AgentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status === 'ativo' ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className={`text-xs ${status === 'ativo' ? 'text-green-600' : 'text-slate-400'}`}>
                {status === 'ativo' ? 'Ativo' : status === 'pausado' ? 'Pausado' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
        <button className={`p-2 rounded-lg ${status === 'ativo' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
          {status === 'ativo' ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{descricao}</p>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={12} />
        <span>Última execução: {ultimaExecucao}</span>
      </div>
    </div>
  )
}
