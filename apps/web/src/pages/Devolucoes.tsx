import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ChartCard from '../components/ChartCard'
import StatCard from '../components/StatCard'
import { devolucoesPorMotivo } from '../data/mockData'
import { RefreshCcw, AlertTriangle, TrendingDown, Package } from 'lucide-react'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const devolucoesPorProduto = [
  { produto: 'Produto A', qtd: 8, valor: 9600 },
  { produto: 'Produto B', qtd: 6, valor: 5340 },
  { produto: 'Produto C', qtd: 5, valor: 11500 },
  { produto: 'Produto D', qtd: 3, valor: 2100 },
  { produto: 'Produto E', qtd: 1, valor: 890 },
]

const todasDevolucoes = [
  { id: 1, data: '10/01/2024', produto: 'Produto A', motivo: 'Defeito', valor: 1200, cliente: 'Cliente X', status: 'aprovada' },
  { id: 2, data: '12/01/2024', produto: 'Produto B', motivo: 'Arrependimento', valor: 890, cliente: 'Cliente Y', status: 'pendente' },
  { id: 3, data: '14/01/2024', produto: 'Produto C', motivo: 'Entrega errada', valor: 2300, cliente: 'Cliente Z', status: 'aprovada' },
  { id: 4, data: '15/01/2024', produto: 'Produto A', motivo: 'Defeito', valor: 1200, cliente: 'Cliente W', status: 'aprovada' },
  { id: 5, data: '16/01/2024', produto: 'Produto D', motivo: 'Não atendeu expectativa', valor: 700, cliente: 'Cliente V', status: 'pendente' },
]

export default function Devolucoes() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Devoluções</h2>
        <p className="page-subtitle">Análise e controle de devoluções por produto e motivo</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Devoluções" value="23 un" change={18.0} icon={<RefreshCcw size={18} />} color="red" />
        <StatCard title="Taxa de Devolução" value="2,7%" change={0.4} icon={<AlertTriangle size={18} />} color="red" />
        <StatCard title="Valor Devolvido" value={fmt(29340)} change={22.1} icon={<TrendingDown size={18} />} color="yellow" />
        <StatCard title="Produtos Afetados" value="5" icon={<Package size={18} />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Devoluções por Motivo">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={devolucoesPorMotivo} layout="vertical" margin={{ top: 0, right: 15, bottom: 0, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="motivo" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="qtd" fill="#DC2626" radius={[0, 6, 6, 0]} barSize={22} name="Devoluções" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Devoluções por Produto">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={devolucoesPorProduto} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="produto" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="qtd" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Qtd" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Histórico de Devoluções</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Cliente</th>
              <th>Motivo</th>
              <th className="text-right">Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {todasDevolucoes.map(d => (
              <tr key={d.id}>
                <td className="text-slate-500">{d.data}</td>
                <td className="font-medium">{d.produto}</td>
                <td className="text-slate-500">{d.cliente}</td>
                <td className="text-slate-500">{d.motivo}</td>
                <td className="text-right font-semibold text-red-600">-{fmt(d.valor)}</td>
                <td>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${d.status === 'aprovada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {d.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
