import AgentCard from '../components/AgentCard'
import { Bot, Plus } from 'lucide-react'

const agentes = [
  { id: 1, nome: 'Agente Financeiro', descricao: 'Analisa indicadores financeiros, detecta anomalias e sugere otimizações de custo e receita automaticamente.', status: 'ativo' as const, ultimaExecucao: '19/01/2024 08:00' },
  { id: 2, nome: 'Agente Comercial', descricao: 'Monitora pipeline de vendas, identifica oportunidades de upsell e emite alertas de metas em risco.', status: 'ativo' as const, ultimaExecucao: '19/01/2024 07:30' },
  { id: 3, nome: 'Agente de Alertas', descricao: 'Detecta anomalias em tempo real e gera alertas automáticos baseados em regras configuráveis.', status: 'ativo' as const, ultimaExecucao: '19/01/2024 09:00' },
  { id: 4, nome: 'Agente de Metas', descricao: 'Acompanha o progresso das metas, gera previsões de fechamento e recomenda ações corretivas.', status: 'ativo' as const, ultimaExecucao: '19/01/2024 06:00' },
  { id: 5, nome: 'Agente Executivo', descricao: 'Gera resumo executivo diário com os principais insights, riscos e oportunidades identificados.', status: 'ativo' as const, ultimaExecucao: '19/01/2024 07:00' },
]

export default function Agentes() {
  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Agentes IA</h2>
          <p className="page-subtitle">Agentes inteligentes de análise e automação</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Novo agente
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">5 agentes ativos</p>
            <p className="text-xs text-blue-600">Todos os agentes estão operando normalmente · Última sincronização: há 5 minutos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentes.map(agente => (
          <AgentCard
            key={agente.id}
            nome={agente.nome}
            descricao={agente.descricao}
            status={agente.status}
            ultimaExecucao={agente.ultimaExecucao}
          />
        ))}
      </div>
    </div>
  )
}
