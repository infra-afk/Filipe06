import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Filter } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { ultimasVendas, vendasMensais, vendasPorCanal } from '../data/mockData'
import { ShoppingCart, TrendingUp, DollarSign, Users } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function Vendas() {
  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Vendas</h2>
          <p className="page-subtitle">Análise completa de vendas por período</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Filter size={16} />
          Filtros
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Vendas" value="847 un" change={-5.9} icon={<ShoppingCart size={18} />} color="blue" />
        <StatCard title="Receita de Vendas" value="R$ 1,25M" change={4.2} icon={<DollarSign size={18} />} color="green" />
        <StatCard title="Ticket Médio" value="R$ 1.477" change={2.1} icon={<TrendingUp size={18} />} color="teal" />
        <StatCard title="Novos Clientes" value="67" change={-16.3} icon={<Users size={18} />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Vendas Mensais" subtitle="Realizado vs Meta">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={vendasMensais} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="vendasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="vendas" stroke="#2563EB" fill="url(#vendasGrad)" strokeWidth={2} name="Vendas" />
              <Area type="monotone" dataKey="meta" stroke="#F59E0B" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Meta" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vendas por Canal">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vendasPorCanal} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="canal" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="vendas" fill="#2563EB" radius={[6, 6, 0, 0]} name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Histórico de Vendas</h3>
          <button className="btn-secondary">Exportar</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Canal</th>
              <th>Vendedor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ultimasVendas.map(v => (
              <tr key={v.id}>
                <td className="text-slate-500">{v.data}</td>
                <td className="font-medium">{v.cliente}</td>
                <td className="font-semibold">{fmt(v.valor)}</td>
                <td className="text-slate-500">{v.canal}</td>
                <td className="text-slate-500">{v.vendedor}</td>
                <td><StatusBadge status={v.status as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
