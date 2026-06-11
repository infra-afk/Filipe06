import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import canvasRoutes from './modules/canvas/canvas.routes'
import itemsRoutes from './modules/canvas/items.routes'
import authRoutes from './auth/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/canvases', canvasRoutes)
app.use('/api/items', itemsRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/dashboard/resumo', (_req, res) => {
  res.json({
    receita: 1250000,
    despesas: 780000,
    margem: 37.6,
    ebitda: 285000,
    vendas: 847,
    devolucoes: 23,
    ticketMedio: 1476.9,
    churn: 3.2,
  })
})

app.get('/indicadores', (_req, res) => {
  res.json([
    { nome: 'Receita', valor: 1250000, meta: 1300000, unidade: 'R$', status: 'alerta', variacao: 4.2 },
    { nome: 'Margem', valor: 37.6, meta: 40, unidade: '%', status: 'alerta', variacao: -1.2 },
    { nome: 'EBITDA', valor: 285000, meta: 300000, unidade: 'R$', status: 'alerta', variacao: -5.0 },
    { nome: 'Churn', valor: 3.2, meta: 2.5, unidade: '%', status: 'critico', variacao: 0.7 },
    { nome: 'Vendas', valor: 847, meta: 900, unidade: 'un', status: 'alerta', variacao: -5.9 },
    { nome: 'Ticket Médio', valor: 1476.9, meta: 1500, unidade: 'R$', status: 'ok', variacao: 2.1 },
  ])
})

app.get('/vendas', (_req, res) => {
  res.json([
    { id: 1, data: '2024-01-15', cliente: 'Empresa Alpha', valor: 12500, canal: 'Online', vendedor: 'Carlos Silva' },
    { id: 2, data: '2024-01-16', cliente: 'Beta Corp', valor: 8900, canal: 'Presencial', vendedor: 'Ana Souza' },
    { id: 3, data: '2024-01-17', cliente: 'Gama Ltda', valor: 23400, canal: 'Online', vendedor: 'Pedro Lima' },
    { id: 4, data: '2024-01-18', cliente: 'Delta SA', valor: 5600, canal: 'Telefone', vendedor: 'Carlos Silva' },
    { id: 5, data: '2024-01-19', cliente: 'Epsilon ME', valor: 18700, canal: 'Online', vendedor: 'Ana Souza' },
  ])
})

app.get('/despesas', (_req, res) => {
  res.json([
    { id: 1, descricao: 'Folha de Pagamento', categoria: 'RH', valor: 320000, data: '2024-01-31' },
    { id: 2, descricao: 'Aluguel', categoria: 'Infraestrutura', valor: 45000, data: '2024-01-05' },
    { id: 3, descricao: 'Marketing Digital', categoria: 'Marketing', valor: 68000, data: '2024-01-10' },
    { id: 4, descricao: 'Logística', categoria: 'Operações', valor: 92000, data: '2024-01-15' },
    { id: 5, descricao: 'Tecnologia', categoria: 'TI', valor: 55000, data: '2024-01-20' },
  ])
})

app.get('/devolucoes', (_req, res) => {
  res.json([
    { id: 1, data: '2024-01-10', produto: 'Produto A', motivo: 'Defeito', valor: 1200, cliente: 'Cliente X' },
    { id: 2, data: '2024-01-12', produto: 'Produto B', motivo: 'Arrependimento', valor: 890, cliente: 'Cliente Y' },
    { id: 3, data: '2024-01-14', produto: 'Produto C', motivo: 'Entrega errada', valor: 2300, cliente: 'Cliente Z' },
  ])
})

app.get('/dre', (_req, res) => {
  res.json({
    receitaBruta: 1250000,
    deducoes: 87500,
    receitaLiquida: 1162500,
    custos: 620000,
    lucroBruto: 542500,
    despesasOperacionais: 257500,
    ebitda: 285000,
    depreciacaoAmortizacao: 35000,
    ebit: 250000,
    resultadoFinanceiro: -18000,
    resultadoLiquido: 175000,
  })
})

app.get('/alertas', (_req, res) => {
  res.json([
    { id: 1, titulo: 'Churn acima da meta', descricao: 'Taxa de churn atingiu 3.2%, acima da meta de 2.5%', severidade: 'critico', data: '2024-01-19' },
    { id: 2, titulo: 'Margem abaixo do esperado', descricao: 'Margem operacional em 37.6%, abaixo da meta de 40%', severidade: 'alto', data: '2024-01-18' },
    { id: 3, titulo: 'Despesas de logística elevadas', descricao: 'Custos logísticos 12% acima do orçado', severidade: 'medio', data: '2024-01-17' },
    { id: 4, titulo: 'Meta de vendas em risco', descricao: 'Vendas acumuladas 5.9% abaixo da meta mensal', severidade: 'alto', data: '2024-01-16' },
    { id: 5, titulo: 'Aumento nas devoluções', descricao: 'Devoluções cresceram 18% em relação ao mês anterior', severidade: 'medio', data: '2024-01-15' },
  ])
})

app.get('/decisoes', (_req, res) => {
  res.json([
    { id: 1, titulo: 'Revisar estratégia de precificação', descricao: 'Margem abaixo da meta. Recomenda-se revisar a tabela de preços', prioridade: 'alta', status: 'pendente' },
    { id: 2, titulo: 'Acionar plano de retenção', descricao: 'Churn alto. Implementar programa de fidelização para clientes em risco', prioridade: 'alta', status: 'em_andamento' },
    { id: 3, titulo: 'Renegociar contratos de logística', descricao: 'Custos logísticos elevados. Renegociar com 3 fornecedores principais', prioridade: 'media', status: 'pendente' },
    { id: 4, titulo: 'Intensificar ações de marketing', descricao: 'Vendas abaixo da meta. Aumentar investimento em canais digitais', prioridade: 'media', status: 'aprovada' },
  ])
})

app.get('/agentes', (_req, res) => {
  res.json([
    { id: 1, nome: 'Agente Financeiro', descricao: 'Analisa indicadores financeiros e sugere otimizações', status: 'ativo', ultimaExecucao: '2024-01-19 08:00' },
    { id: 2, nome: 'Agente Comercial', descricao: 'Monitora vendas e identifica oportunidades', status: 'ativo', ultimaExecucao: '2024-01-19 07:30' },
    { id: 3, nome: 'Agente de Alertas', descricao: 'Detecta anomalias e gera alertas automáticos', status: 'ativo', ultimaExecucao: '2024-01-19 09:00' },
    { id: 4, nome: 'Agente de Metas', descricao: 'Acompanha progresso das metas e gera previsões', status: 'ativo', ultimaExecucao: '2024-01-19 06:00' },
    { id: 5, nome: 'Agente Executivo', descricao: 'Gera resumo executivo diário com insights', status: 'ativo', ultimaExecucao: '2024-01-19 07:00' },
  ])
})

app.get('/automacoes', (_req, res) => {
  res.json([
    { id: 1, nome: 'Alerta de Meta', descricao: 'Gera alerta quando indicador fica abaixo da meta', ativo: true, execucoes: 47 },
    { id: 2, nome: 'Decisão Recomendada', descricao: 'Cria decisão automática baseada em regras de negócio', ativo: true, execucoes: 23 },
    { id: 3, nome: 'Resumo Semanal', descricao: 'Envia resumo executivo toda segunda-feira', ativo: true, execucoes: 8 },
    { id: 4, nome: 'Relatório Mensal', descricao: 'Gera relatório PDF no início de cada mês', ativo: false, execucoes: 2 },
    { id: 5, nome: 'Log de Eventos', descricao: 'Registra todas as mudanças significativas nos indicadores', ativo: true, execucoes: 312 },
  ])
})

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`)
})
