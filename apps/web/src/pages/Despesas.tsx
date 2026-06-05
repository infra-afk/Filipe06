import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ChartCard from '../components/ChartCard'
import StatCard from '../components/StatCard'
import { maioresDespesas, despesasPorCategoria } from '../data/mockData'
import { TrendingDown, AlertTriangle, Receipt, DollarSign } from 'lucide-react'

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#64748B']
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const despesasMensais = [
  { mes: 'Jul', valor: 680000 },
  { mes: 'Ago', valor: 710000 },
  { mes: 'Set', valor: 725000 },
  { mes: 'Out', valor: 760000 },
  { mes: 'Nov', valor: 748000 },
  { mes: 'Dez', valor: 792000 },
  { mes: 'Jan', valor: 780000 },
]

export default function Despesas() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Despesas</h2>
        <p className="page-subtitle">Controle e análise de despesas por categoria</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Despesas" value={fmt(780000)} change={2.3} icon={<Receipt size={18} />} color="red" />
        <StatCard title="vs Orçamento" value="+3,2%" change={3.2} icon={<TrendingDown size={18} />} color="yellow" />
        <StatCard title="Maior Categoria" value="RH" icon={<DollarSign size={18} />} color="blue" />
        <StatCard title="Alertas Custo" value="2 ativos" icon={<AlertTriangle size={18} />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Evolução de Despesas" subtitle="Últimos 7 meses">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={despesasMensais} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="valor" fill="#DC2626" radius={[6, 6, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por Categoria">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={despesasPorCategoria} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="valor" nameKey="categoria" paddingAngle={2}>
                {despesasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Detalhamento de Despesas</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th className="text-right">Valor</th>
              <th className="text-right">% do Total</th>
            </tr>
          </thead>
          <tbody>
            {maioresDespesas.map((d, i) => (
              <tr key={i}>
                <td className="font-medium">{d.descricao}</td>
                <td><span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full">{d.categoria}</span></td>
                <td className="text-right font-semibold text-slate-800">{fmt(d.valor)}</td>
                <td className="text-right text-slate-500">{((d.valor / 780000) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
