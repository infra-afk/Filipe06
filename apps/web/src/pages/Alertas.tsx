import AlertCard from '../components/AlertCard'
import { alertas } from '../data/mockData'
import { Bell } from 'lucide-react'

const categorias = ['Todos', 'Crítico', 'Alto', 'Médio', 'Baixo']

export default function Alertas() {
  const critico = alertas.filter(a => a.severidade === 'critico').length
  const alto = alertas.filter(a => a.severidade === 'alto').length
  const medio = alertas.filter(a => a.severidade === 'medio').length

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Alertas</h2>
          <p className="page-subtitle">Monitoramento de alertas e notificações do sistema</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Bell size={16} />
          Configurar alertas
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Alertas', value: alertas.length, color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Críticos', value: critico, color: 'bg-red-50 border-red-200 text-red-700' },
          { label: 'Altos', value: alto, color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Médios', value: medio, color: 'bg-amber-50 border-amber-200 text-amber-700' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {categorias.map(cat => (
          <button key={cat} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === 'Todos' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {alertas.map(alerta => (
          <AlertCard
            key={alerta.id}
            titulo={alerta.titulo}
            descricao={alerta.descricao}
            severidade={alerta.severidade}
            data={alerta.data}
          />
        ))}
      </div>
    </div>
  )
}
