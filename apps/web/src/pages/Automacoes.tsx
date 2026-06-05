import { useState } from 'react'
import AutomationCard from '../components/AutomationCard'
import { Plus } from 'lucide-react'

const automacoesMock = [
  { id: 1, nome: 'Alerta de Meta', descricao: 'Gera alerta automaticamente quando um indicador fica abaixo da meta definida por mais de 3 dias.', ativo: true, execucoes: 47 },
  { id: 2, nome: 'Decisão Recomendada', descricao: 'Cria uma decisão recomendada automaticamente baseada em regras de negócio pré-configuradas.', ativo: true, execucoes: 23 },
  { id: 3, nome: 'Resumo Semanal', descricao: 'Envia resumo executivo com os principais indicadores toda segunda-feira às 08:00.', ativo: true, execucoes: 8 },
  { id: 4, nome: 'Relatório Mensal', descricao: 'Gera e envia relatório PDF completo no primeiro dia útil de cada mês.', ativo: false, execucoes: 2 },
  { id: 5, nome: 'Log de Eventos', descricao: 'Registra todas as mudanças significativas nos indicadores com timestamp e contexto.', ativo: true, execucoes: 312 },
]

export default function Automacoes() {
  const [automacoes, setAutomacoes] = useState(automacoesMock)

  const toggleAutomacao = (id: number) => {
    setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a))
  }

  const ativas = automacoes.filter(a => a.ativo).length

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Automações</h2>
          <p className="page-subtitle">Automatizações e fluxos de trabalho configurados</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova automação
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Automações ativas', value: ativas, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Inativas', value: automacoes.length - ativas, color: 'bg-slate-50 border-slate-200 text-slate-600' },
          { label: 'Execuções totais', value: automacoes.reduce((s, a) => s + a.execucoes, 0), color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automacoes.map(automacao => (
          <AutomationCard
            key={automacao.id}
            nome={automacao.nome}
            descricao={automacao.descricao}
            ativo={automacao.ativo}
            execucoes={automacao.execucoes}
            onToggle={() => toggleAutomacao(automacao.id)}
          />
        ))}
      </div>
    </div>
  )
}
