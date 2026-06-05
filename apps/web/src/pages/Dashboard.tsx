import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart,
  RefreshCcw, Target, Users, BarChart2
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import StatusBadge from '../components/StatusBadge'
import {
  receitaMensal, despesasPorCategoria, vendasPorCanal,
  ebitdaMensal, devolucoesPorMotivo, ultimasVendas,
  maioresDespesas, alertas
} from '../data/mockData'

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#64748B']

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receita Total" value={fmt(1250000)} change={4.2} changeLabel="vs mês ant." icon={<DollarSign size={18} />} color="blue" />
        <StatCard title="EBITDA" value={fmt(285000)} change={-5.0} changeLabel="vs mês ant." icon={<TrendingUp size={18} />} color="green" />
        <StatCard title="Margem" value="37,6%" change={-1.2} changeLabel="vs mês ant." icon={<BarChart2 size={18} />} color="purple" />
        <StatCard title="Churn" value="3,2%" change={0.7} changeLabel="vs mês ant." icon={<TrendingDown size={18} />} color="red" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Vendas" value="847 un" change={-5.9} changeLabel="vs mês ant." icon={<ShoppingCart size={18} />} color="blue" />
        <StatCard title="Despesas" value={fmt(780000)} change={2.3} changeLabel="vs mês ant." icon={<TrendingDown size={18} />} color="yellow" />
        <StatCard title="Devoluções" value="23 un" change={18.0} changeLabel="vs mês ant." icon={<RefreshCcw size={18} />} color="red" />
        <StatCard title="Ticket Médio" value="R$ 1.477" change={2.1} changeLabel="vs mês ant." icon={<Target size={18} />} color="green" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Receita por Mês" subtitle="Realizado vs Meta">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={receitaMensal} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="receita" stroke="#2563EB" fill="url(#receitaGrad)" strokeWidth={2} name="Receita" />
              <Line type="monotone" dataKey="meta" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Meta" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="EBITDA vs Meta" subtitle="Realizado vs Meta mensal">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ebitdaMensal} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="realizado" fill="#2563EB" radius={[4, 4, 0, 0]} name="Realizado" />
              <Bar dataKey="meta" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Despesas por Categoria">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={despesasPorCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="valor" nameKey="categoria" paddingAngle={2}>
                {despesasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vendas por Canal">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={vendasPorCanal} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="vendas" nameKey="canal" paddingAngle={2}>
                {vendasPorCanal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Devoluções por Motivo">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={devolucoesPorMotivo} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="motivo" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="qtd" fill="#DC2626" radius={[0, 4, 4, 0]} barSize={18} name="Qtd" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="table-container">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Últimas Vendas</h3>
            <a href="/vendas" className="text-xs text-blue-600 hover:underline">Ver todas</a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Canal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVendas.slice(0, 5).map(v => (
                <tr key={v.id}>
                  <td className="font-medium">{v.cliente}</td>
                  <td>{fmt(v.valor)}</td>
                  <td className="text-slate-500">{v.canal}</td>
                  <td><StatusBadge status={v.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Alertas Ativos</h3>
            <a href="/alertas" className="text-xs text-blue-600 hover:underline">Ver todos</a>
          </div>
          <div className="p-4 space-y-3">
            {alertas.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  a.severidade === 'critico' ? 'bg-red-100 text-red-700' :
                  a.severidade === 'alto' ? 'bg-orange-100 text-orange-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{a.severidade}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{a.titulo}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.data}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maiores despesas */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Maiores Despesas do Mês</h3>
          <a href="/despesas" className="text-xs text-blue-600 hover:underline">Ver todas</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th className="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {maioresDespesas.map((d, i) => (
              <tr key={i}>
                <td className="font-medium">{d.descricao}</td>
                <td><span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{d.categoria}</span></td>
                <td className="text-right font-semibold text-slate-800">{fmt(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
