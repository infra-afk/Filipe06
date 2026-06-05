import { Zap, ToggleLeft, ToggleRight, Hash } from 'lucide-react'

interface AutomationCardProps {
  nome: string
  descricao: string
  ativo: boolean
  execucoes: number
  onToggle?: () => void
}

export default function AutomationCard({ nome, descricao, ativo, execucoes, onToggle }: AutomationCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ativo ? 'bg-blue-50' : 'bg-slate-50'}`}>
            <Zap size={20} className={ativo ? 'text-blue-600' : 'text-slate-400'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{nome}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Hash size={11} className="text-slate-400" />
              <span className="text-xs text-slate-400">{execucoes} execuções</span>
            </div>
          </div>
        </div>
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-600 transition-colors">
          {ativo
            ? <ToggleRight size={28} className="text-blue-600" />
            : <ToggleLeft size={28} />
          }
        </button>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{descricao}</p>
    </div>
  )
}
