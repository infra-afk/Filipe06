import DecisionCard from '../components/DecisionCard'
import { decisoes } from '../data/mockData'
import { Plus } from 'lucide-react'

export default function Decisoes() {
  const pendentes = decisoes.filter(d => d.status === 'pendente').length
  const emAndamento = decisoes.filter(d => d.status === 'em_andamento').length
  const aprovadas = decisoes.filter(d => d.status === 'aprovada').length

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Decisões</h2>
          <p className="page-subtitle">Recomendações e decisões estratégicas pendentes</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova decisão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendentes', value: pendentes, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Em andamento', value: emAndamento, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Aprovadas', value: aprovadas, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Recomendações automáticas</h3>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>Regras ativas:</strong> Se EBITDA abaixo da meta → revisar despesas · Se margem baixa → revisar preços · Se churn alto → acionar plano de retenção · Se devoluções aumentarem → revisar qualidade
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisoes.map(d => (
            <DecisionCard
              key={d.id}
              titulo={d.titulo}
              descricao={d.descricao}
              prioridade={d.prioridade}
              status={d.status}
              categoria={d.categoria}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
