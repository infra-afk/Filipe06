import { Target } from 'lucide-react'
import { objetivos } from '../data/mockData'

const fmt = (v: number, unidade: string) => {
  if (unidade === 'R$') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
  if (unidade === '%') return `${v}%`
  return `${v} ${unidade}`
}

export default function Objetivos() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Objetivos Estratégicos</h2>
        <p className="page-subtitle">Acompanhamento das metas e objetivos da empresa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objetivos.map(obj => {
          const progresso = obj.unidade === '%' && obj.titulo.toLowerCase().includes('reduz')
            ? Math.max(0, Math.min(100, ((obj.meta - obj.atual) / obj.meta) * 100 + 50))
            : Math.max(0, Math.min(100, (obj.atual / obj.meta) * 100))
          const atingido = obj.unidade === '%' && obj.titulo.toLowerCase().includes('reduz')
            ? obj.atual <= obj.meta
            : obj.atual >= obj.meta
          const cor = atingido ? 'bg-green-500' : progresso > 70 ? 'bg-blue-500' : progresso > 40 ? 'bg-amber-500' : 'bg-red-500'

          return (
            <div key={obj.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-blue-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${atingido ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {atingido ? 'Atingido' : 'Em progresso'}
                </span>
              </div>

              <h3 className="font-semibold text-slate-800 mb-1">{obj.titulo}</h3>
              <p className="text-xs text-slate-500 mb-4">{obj.descricao}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Atual: <strong className="text-slate-800">{fmt(obj.atual, obj.unidade)}</strong></span>
                  <span>Meta: <strong className="text-slate-800">{fmt(obj.meta, obj.unidade)}</strong></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${cor}`}
                    style={{ width: `${Math.min(100, progresso)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${atingido ? 'text-green-600' : 'text-slate-500'}`}>
                    {progresso.toFixed(1)}% concluído
                  </span>
                  <span className="text-slate-400">Prazo: {obj.prazo}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
