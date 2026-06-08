import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'teal' | 'purple'
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',  text: 'text-blue-700',  bar: '#1d4ed8' },
  green:  { bg: 'bg-green-50', text: 'text-green-700', bar: '#15803d' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-600', bar: '#f59e0b' },
  red:    { bg: 'bg-red-50',   text: 'text-red-600',   bar: '#dc2626' },
  teal:   { bg: 'bg-teal-50',  text: 'text-teal-700',  bar: '#0f766e' },
  purple: { bg: 'bg-teal-50',  text: 'text-teal-700',  bar: '#0f766e' },
}

export default function StatCard({ title, value, change, changeLabel, icon, color = 'blue' }: StatCardProps) {
  const c = colorMap[color]
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className="stat-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: c.bar }} />
      <div className="flex items-start justify-between mb-3 pl-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-2 pl-1 tracking-tight">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 pl-1">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-green-50 text-green-700' :
            isNegative ? 'bg-red-50 text-red-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {isPositive && <TrendingUp size={11} />}
            {isNegative && <TrendingDown size={11} />}
            {!isPositive && !isNegative && <Minus size={11} />}
            {isPositive ? '+' : ''}{change}%
          </div>
          {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
