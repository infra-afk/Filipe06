type Status = 'ok' | 'alerta' | 'critico' | 'baixo' | 'medio' | 'alto' | 'pago' | 'pendente' | 'cancelado' | 'ativo' | 'inativo' | 'aprovada' | 'em_andamento'

const statusConfig: Record<Status, { label: string; className: string }> = {
  ok: { label: 'OK', className: 'bg-green-100 text-green-700' },
  alerta: { label: 'Alerta', className: 'bg-amber-100 text-amber-700' },
  critico: { label: 'Crítico', className: 'bg-red-100 text-red-700' },
  baixo: { label: 'Baixo', className: 'bg-slate-100 text-slate-600' },
  medio: { label: 'Médio', className: 'bg-amber-100 text-amber-700' },
  alto: { label: 'Alto', className: 'bg-orange-100 text-orange-700' },
  pago: { label: 'Pago', className: 'bg-green-100 text-green-700' },
  pendente: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  ativo: { label: 'Ativo', className: 'bg-green-100 text-green-700' },
  inativo: { label: 'Inativo', className: 'bg-slate-100 text-slate-600' },
  aprovada: { label: 'Aprovada', className: 'bg-blue-100 text-blue-700' },
  em_andamento: { label: 'Em andamento', className: 'bg-purple-100 text-purple-700' },
}

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
