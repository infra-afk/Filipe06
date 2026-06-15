import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

type Severidade = 'baixo' | 'medio' | 'alto' | 'critico'

const severidadeConfig = {
  baixo: { icon: Info, className: 'bg-slate-50 border-slate-200', iconClass: 'text-slate-400', badge: 'bg-slate-100 text-slate-600' },
  medio: { icon: AlertCircle, className: 'bg-amber-50 border-amber-200', iconClass: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
  alto: { icon: AlertTriangle, className: 'bg-orange-50 border-orange-200', iconClass: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  critico: { icon: AlertCircle, className: 'bg-red-50 border-red-200', iconClass: 'text-red-500', badge: 'bg-red-100 text-red-700' },
}

const severidadeLabel = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto', critico: 'Crítico' }

interface AlertCardProps {
  titulo: string
  descricao: string
  severidade: Severidade
  data: string
}

export default function AlertCard({ titulo, descricao, severidade, data }: AlertCardProps) {
  const config = severidadeConfig[severidade]
  const Icon = config.icon

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${config.className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={18} className={config.iconClass} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800">{titulo}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${config.badge}`}>
            {severidadeLabel[severidade]}
          </span>
        </div>
        <p className="text-xs text-slate-600">{descricao}</p>
        <p className="text-xs text-slate-400 mt-1">{data}</p>
      </div>
    </div>
  )
}
