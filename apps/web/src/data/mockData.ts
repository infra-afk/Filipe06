export const receitaMensal = [
  { mes: 'Jul', receita: 980000, meta: 1100000 },
  { mes: 'Ago', receita: 1050000, meta: 1100000 },
  { mes: 'Set', receita: 1120000, meta: 1150000 },
  { mes: 'Out', receita: 1080000, meta: 1150000 },
  { mes: 'Nov', receita: 1190000, meta: 1200000 },
  { mes: 'Dez', receita: 1320000, meta: 1200000 },
  { mes: 'Jan', receita: 1250000, meta: 1300000 },
]

export const despesasPorCategoria = [
  { categoria: 'RH', valor: 320000 },
  { categoria: 'Logística', valor: 92000 },
  { categoria: 'Marketing', valor: 68000 },
  { categoria: 'TI', valor: 55000 },
  { categoria: 'Infraestrutura', valor: 45000 },
  { categoria: 'Outros', valor: 200000 },
]

export const vendasPorCanal = [
  { canal: 'Online', vendas: 412 },
  { canal: 'Presencial', vendas: 263 },
  { canal: 'Telefone', vendas: 172 },
]

export const ebitdaMensal = [
  { mes: 'Jul', realizado: 210000, meta: 270000 },
  { mes: 'Ago', realizado: 245000, meta: 275000 },
  { mes: 'Set', realizado: 268000, meta: 280000 },
  { mes: 'Out', realizado: 242000, meta: 285000 },
  { mes: 'Nov', realizado: 278000, meta: 290000 },
  { mes: 'Dez', realizado: 312000, meta: 295000 },
  { mes: 'Jan', realizado: 285000, meta: 300000 },
]

export const devolucoesPorMotivo = [
  { motivo: 'Defeito', qtd: 9 },
  { motivo: 'Arrependimento', qtd: 6 },
  { motivo: 'Entrega errada', qtd: 5 },
  { motivo: 'Não atendeu expectativa', qtd: 3 },
]

export const ultimasVendas = [
  { id: 1, data: '19/01/2024', cliente: 'Empresa Alpha', valor: 12500, canal: 'Online', vendedor: 'Carlos Silva', status: 'pago' },
  { id: 2, data: '18/01/2024', cliente: 'Beta Corp', valor: 8900, canal: 'Presencial', vendedor: 'Ana Souza', status: 'pago' },
  { id: 3, data: '18/01/2024', cliente: 'Gama Ltda', valor: 23400, canal: 'Online', vendedor: 'Pedro Lima', status: 'pendente' },
  { id: 4, data: '17/01/2024', cliente: 'Delta SA', valor: 5600, canal: 'Telefone', vendedor: 'Carlos Silva', status: 'pago' },
  { id: 5, data: '17/01/2024', cliente: 'Epsilon ME', valor: 18700, canal: 'Online', vendedor: 'Ana Souza', status: 'pago' },
  { id: 6, data: '16/01/2024', cliente: 'Zeta Ltda', valor: 9300, canal: 'Presencial', vendedor: 'Pedro Lima', status: 'cancelado' },
  { id: 7, data: '16/01/2024', cliente: 'Eta Corp', valor: 31200, canal: 'Online', vendedor: 'Carlos Silva', status: 'pago' },
]

export const maioresDespesas = [
  { descricao: 'Folha de Pagamento', categoria: 'RH', valor: 320000 },
  { descricao: 'Logística e Frete', categoria: 'Operações', valor: 92000 },
  { descricao: 'Marketing Digital', categoria: 'Marketing', valor: 68000 },
  { descricao: 'Tecnologia e Software', categoria: 'TI', valor: 55000 },
  { descricao: 'Aluguel e Utilities', categoria: 'Infraestrutura', valor: 45000 },
]

export const alertas = [
  { id: 1, titulo: 'Churn acima da meta', descricao: 'Taxa de churn atingiu 3.2%, acima da meta de 2.5%', severidade: 'critico' as const, data: '19/01/2024' },
  { id: 2, titulo: 'Margem abaixo do esperado', descricao: 'Margem operacional em 37.6%, abaixo da meta de 40%', severidade: 'alto' as const, data: '18/01/2024' },
  { id: 3, titulo: 'Despesas de logística elevadas', descricao: 'Custos logísticos 12% acima do orçado', severidade: 'medio' as const, data: '17/01/2024' },
  { id: 4, titulo: 'Meta de vendas em risco', descricao: 'Vendas acumuladas 5.9% abaixo da meta mensal', severidade: 'alto' as const, data: '16/01/2024' },
  { id: 5, titulo: 'Aumento nas devoluções', descricao: 'Devoluções cresceram 18% em relação ao mês anterior', severidade: 'medio' as const, data: '15/01/2024' },
  { id: 6, titulo: 'Ticket médio estável', descricao: 'Ticket médio mantido acima de R$ 1.400', severidade: 'baixo' as const, data: '14/01/2024' },
]

export const decisoes = [
  { id: 1, titulo: 'Revisar estratégia de precificação', descricao: 'Margem abaixo da meta. Recomenda-se revisar a tabela de preços com foco nos produtos de maior volume.', prioridade: 'alta' as const, status: 'pendente' as const, categoria: 'Financeiro' },
  { id: 2, titulo: 'Acionar plano de retenção de clientes', descricao: 'Churn alto (3.2%). Implementar programa de fidelização e contato proativo com clientes em risco.', prioridade: 'alta' as const, status: 'em_andamento' as const, categoria: 'Comercial' },
  { id: 3, titulo: 'Renegociar contratos de logística', descricao: 'Custos logísticos elevados. Renegociar com 3 fornecedores principais visando redução de 10%.', prioridade: 'media' as const, status: 'pendente' as const, categoria: 'Operacional' },
  { id: 4, titulo: 'Intensificar ações de marketing', descricao: 'Vendas abaixo da meta. Aumentar investimento em canais digitais e prospecção ativa.', prioridade: 'media' as const, status: 'aprovada' as const, categoria: 'Marketing' },
]

export const objetivos = [
  { id: 1, titulo: 'Aumentar Receita', descricao: 'Atingir R$ 15M de receita anual', atual: 1250000, meta: 1300000, unidade: 'R$', prazo: 'Jan 2024' },
  { id: 2, titulo: 'Reduzir Custos', descricao: 'Reduzir despesas operacionais em 8%', atual: 780000, meta: 720000, unidade: 'R$', prazo: 'Mar 2024' },
  { id: 3, titulo: 'Melhorar Margem', descricao: 'Alcançar margem EBITDA de 25%', atual: 22.8, meta: 25, unidade: '%', prazo: 'Jun 2024' },
  { id: 4, titulo: 'Reduzir Churn', descricao: 'Churn abaixo de 2% ao mês', atual: 3.2, meta: 2.0, unidade: '%', prazo: 'Abr 2024' },
  { id: 5, titulo: 'Aumentar Vendas', descricao: 'Atingir 1.000 vendas por mês', atual: 847, meta: 1000, unidade: 'un', prazo: 'Jun 2024' },
  { id: 6, titulo: 'Reduzir Devoluções', descricao: 'Taxa de devolução abaixo de 1.5%', atual: 2.7, meta: 1.5, unidade: '%', prazo: 'Mar 2024' },
]

export const indicadores = [
  { nome: 'Receita Total', valor: 1250000, meta: 1300000, unidade: 'R$', status: 'alerta' as const, variacao: 4.2, periodo: 'Jan 2024' },
  { nome: 'Margem Bruta', valor: 43.4, meta: 45, unidade: '%', status: 'alerta' as const, variacao: -0.8, periodo: 'Jan 2024' },
  { nome: 'EBITDA', valor: 285000, meta: 300000, unidade: 'R$', status: 'alerta' as const, variacao: -5.0, periodo: 'Jan 2024' },
  { nome: 'Margem EBITDA', valor: 22.8, meta: 25, unidade: '%', status: 'alerta' as const, variacao: -1.2, periodo: 'Jan 2024' },
  { nome: 'Churn', valor: 3.2, meta: 2.5, unidade: '%', status: 'critico' as const, variacao: 0.7, periodo: 'Jan 2024' },
  { nome: 'Total de Vendas', valor: 847, meta: 900, unidade: 'un', status: 'alerta' as const, variacao: -5.9, periodo: 'Jan 2024' },
  { nome: 'Ticket Médio', valor: 1476.9, meta: 1500, unidade: 'R$', status: 'ok' as const, variacao: 2.1, periodo: 'Jan 2024' },
  { nome: 'Devoluções', valor: 23, meta: 15, unidade: 'un', status: 'critico' as const, variacao: 18.0, periodo: 'Jan 2024' },
  { nome: 'Taxa de Devolução', valor: 2.7, meta: 1.5, unidade: '%', status: 'critico' as const, variacao: 0.4, periodo: 'Jan 2024' },
  { nome: 'Novos Clientes', valor: 67, meta: 80, unidade: 'un', status: 'alerta' as const, variacao: -16.3, periodo: 'Jan 2024' },
  { nome: 'Receita Recorrente', valor: 680000, meta: 700000, unidade: 'R$', status: 'ok' as const, variacao: 3.1, periodo: 'Jan 2024' },
  { nome: 'Lucro Líquido', valor: 175000, meta: 200000, unidade: 'R$', status: 'alerta' as const, variacao: -12.5, periodo: 'Jan 2024' },
]

export const vendasMensais = [
  { mes: 'Jul', vendas: 720, meta: 800 },
  { mes: 'Ago', vendas: 785, meta: 820 },
  { mes: 'Set', vendas: 810, meta: 840 },
  { mes: 'Out', vendas: 768, meta: 860 },
  { mes: 'Nov', vendas: 890, meta: 880 },
  { mes: 'Dez', vendas: 943, meta: 900 },
  { mes: 'Jan', vendas: 847, meta: 900 },
]

export const dre = {
  receitaBruta: 1250000,
  deducoes: 87500,
  receitaLiquida: 1162500,
  custos: 620000,
  lucroBruto: 542500,
  despesasVendas: 98000,
  despesasAdministrativas: 115000,
  despesasMarketing: 68000,
  despesasOperacionais: 257500,
  ebitda: 285000,
  depreciacaoAmortizacao: 35000,
  ebit: 250000,
  resultadoFinanceiro: -18000,
  irpj: 57000,
  resultadoLiquido: 175000,
}
