import { TrendingUp, TrendingDown } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { indicadores } from '../data/mockData'

const fmt = (v: number, unidade: string) => {
  if (unidade === 'R$') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
  if (unidade === '%') return `${v}%`
  return `${v} ${unidade}`
}

export default function Indicadores() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Indicadores</h2>
        <p className="page-subtitle">Visão completa de todos os indicadores da empresa</p>
      </div>

      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Todos os indicadores · Jan 2024</h3>
          <button className="btn-secondary">Exportar</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor Atual</th>
              <th>Meta</th>
              <th>Variação</th>
              <th>Período</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {indicadores.map((ind, i) => (
              <tr key={i}>
                <td className="font-medium text-slate-800">{ind.nome}</td>
                <td className="font-semibold text-slate-900">{fmt(ind.valor, ind.unidade)}</td>
                <td className="text-slate-500">{fmt(ind.meta, ind.unidade)}</td>
                <td>
                  <div className="flex items-center gap-1">
                    {ind.variacao > 0
                      ? <TrendingUp size={14} className="text-green-500" />
                      : <TrendingDown size={14} className="text-red-500" />
                    }
                    <span className={`text-xs font-medium ${ind.variacao > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {ind.variacao > 0 ? '+' : ''}{ind.variacao}%
                    </span>
                  </div>
                </td>
                <td className="text-slate-500">{ind.periodo}</td>
                <td><StatusBadge status={ind.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
