import { Lightbulb, Clock, CheckCircle, ArrowRight } from 'lucide-react'

type Prioridade = 'alta' | 'media' | 'baixa'
type StatusDecisao = 'pendente' | 'em_andamento' | 'aprovada' | 'concluida'

const prioridadeConfig = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-slate-100 text-slate-600',
}

const statusConfig = {
  pendente: { label: 'Pendente', icon: Clock, className: 'text-amber-500' },
  em_andamento: { label: 'Em andamento', icon: ArrowRight, className: 'text-blue-500' },
  aprovada: { label: 'Aprovada', icon: CheckCircle, className: 'text-green-500' },
  concluida: { label: 'Concluída', icon: CheckCircle, className: 'text-slate-400' },
}

interface DecisionCardProps {
  titulo: string
  descricao: string
  prioridade: Prioridade
  status: StatusDecisao
  categoria?: string
}

export default function DecisionCard({ titulo, descricao, prioridade, status, categoria }: DecisionCardProps) {
  const StatusIcon = statusConfig[status].icon

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{titulo}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${prioridadeConfig[prioridade]}`}>
              {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
            </span>
          </div>
          {categoria && <p className="text-xs text-slate-400 mt-0.5">{categoria}</p>}
        </div>
      </div>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{descricao}</p>
      <div className="flex items-center gap-1.5">
        <StatusIcon size={13} className={statusConfig[status].className} />
        <span className="text-xs text-slate-500">{statusConfig[status].label}</span>
      </div>
    </div>
  )
}
