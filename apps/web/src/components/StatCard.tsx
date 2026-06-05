import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function StatCard({ title, value, change, changeLabel, icon, color = 'blue' }: StatCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === undefined || change === 0

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive && <TrendingUp size={14} className="text-green-500" />}
          {isNegative && <TrendingDown size={14} className="text-red-500" />}
          {isNeutral && <Minus size={14} className="text-slate-400" />}
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-500'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
