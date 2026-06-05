export const DEFAULT_SECTIONS = [
  { key: 'objetivos',   title: 'Objetivos',   description: 'Aumentar receita, reduzir custos e melhorar a operação.', icon: 'Target',   position: 0 },
  { key: 'indicadores', title: 'Indicadores', description: 'KPIs, metas, margem, receita, churn e performance.',        icon: 'BarChart2', position: 1 },
  { key: 'pessoas',     title: 'Pessoas',     description: 'Responsáveis, gestores e áreas envolvidas.',                icon: 'Users',    position: 2 },
  { key: 'decisoes',    title: 'Decisões',    description: 'Regras e condições que direcionam ações.',                  icon: 'CheckSquare', position: 3 },
  { key: 'dados',       title: 'Dados',       description: 'Fontes de dados usadas na operação.',                       icon: 'Database', position: 4 },
  { key: 'analises',    title: 'Análises',    description: 'Dashboards, relatórios e insights.',                        icon: 'LineChart', position: 5 },
  { key: 'alertas',     title: 'Alertas',     description: 'Avisos automáticos sobre metas, riscos e eventos.',         icon: 'Bell',     position: 6 },
  { key: 'agentes',     title: 'Agentes',     description: 'Agentes digitais, bots e assistentes de operação.',         icon: 'Bot',      position: 7 },
  { key: 'automacoes',  title: 'Automações',  description: 'Fluxos automáticos para tarefas recorrentes.',              icon: 'Zap',      position: 8 },
]

export const DEFAULT_ITEMS: Record<string, string[]> = {
  objetivos:   ['Aumentar Receita', 'Reduzir Custo'],
  indicadores: ['Margem', 'Folha', 'Churn', 'Vendas'],
  pessoas:     ['Diretor Financeiro', 'Gerente de Suprimentos', 'Gerente Comercial'],
  decisoes:    ['Se EBITDA < 0, rever despesas'],
  dados:       ['Vendas', 'DRE', 'Devoluções', 'Despesas'],
  analises:    ['Dashboard Executivo', 'Dashboard Mobile'],
  alertas:     ['Alerta de Meta', 'Alerta Eventual'],
  agentes:     ['Agente de Vendas', 'Chatbot de Atendimento'],
  automacoes:  ['Automação de Reembolso'],
}
