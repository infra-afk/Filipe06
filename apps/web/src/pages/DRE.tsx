import { dre } from '../data/mockData'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(1)}%`

interface DRERowProps {
  label: string
  value: number
  base: number
  bold?: boolean
  negative?: boolean
  indented?: boolean
  separator?: boolean
  highlight?: 'blue' | 'green' | 'red'
}

function DRERow({ label, value, base, bold, negative, indented, highlight }: DRERowProps) {
  const displayValue = negative ? -Math.abs(value) : value
  const bgClass = highlight === 'blue' ? 'bg-blue-50' : highlight === 'green' ? 'bg-green-50' : highlight === 'red' ? 'bg-red-50' : ''
  const textClass = highlight === 'blue' ? 'text-blue-700' : highlight === 'green' ? 'text-green-700' : highlight === 'red' ? 'text-red-700' : ''

  return (
    <tr className={bgClass}>
      <td className={`py-3 ${indented ? 'pl-10' : 'pl-5'} ${bold ? 'font-semibold' : ''} ${textClass}`}>
        {label}
      </td>
      <td className={`text-right pr-5 py-3 font-${bold ? 'bold' : 'medium'} ${displayValue < 0 ? 'text-red-600' : textClass || 'text-slate-800'}`}>
        {fmt(displayValue)}
      </td>
      <td className="text-right pr-5 py-3 text-slate-400 text-sm">
        {pct(Math.abs(value), dre.receitaBruta)}
      </td>
    </tr>
  )
}

export default function DRE() {
  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">DRE – Demonstração de Resultado</h2>
          <p className="page-subtitle">Janeiro 2024 · Valores em R$</p>
        </div>
        <button className="btn-secondary">Exportar PDF</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        {[
          { label: 'Receita Bruta', value: fmt(dre.receitaBruta), color: 'border-blue-200 bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Lucro Bruto', value: fmt(dre.lucroBruto), color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
          { label: 'EBITDA', value: fmt(dre.ebitda), color: 'border-purple-200 bg-purple-50', textColor: 'text-purple-700' },
          { label: 'Resultado Líquido', value: fmt(dre.resultadoLiquido), color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.color}`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.textColor}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">DRE Simplificada</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th className="pl-5">Descrição</th>
              <th className="text-right pr-5">Valor</th>
              <th className="text-right pr-5">% Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <DRERow label="(+) Receita Bruta" value={dre.receitaBruta} base={dre.receitaBruta} bold highlight="blue" />
            <DRERow label="(-) Deduções e Impostos" value={dre.deducoes} base={dre.receitaBruta} negative indented />
            <DRERow label="(=) Receita Líquida" value={dre.receitaLiquida} base={dre.receitaBruta} bold />
            <DRERow label="(-) Custos dos Produtos/Serviços" value={dre.custos} base={dre.receitaBruta} negative indented />
            <DRERow label="(=) Lucro Bruto" value={dre.lucroBruto} base={dre.receitaBruta} bold highlight="green" />
            <DRERow label="(-) Despesas de Vendas" value={dre.despesasVendas} base={dre.receitaBruta} negative indented />
            <DRERow label="(-) Despesas Administrativas" value={dre.despesasAdministrativas} base={dre.receitaBruta} negative indented />
            <DRERow label="(-) Despesas de Marketing" value={dre.despesasMarketing} base={dre.receitaBruta} negative indented />
            <DRERow label="(=) EBITDA" value={dre.ebitda} base={dre.receitaBruta} bold highlight="blue" />
            <DRERow label="(-) Depreciação e Amortização" value={dre.depreciacaoAmortizacao} base={dre.receitaBruta} negative indented />
            <DRERow label="(=) EBIT" value={dre.ebit} base={dre.receitaBruta} bold />
            <DRERow label="(+/-) Resultado Financeiro" value={dre.resultadoFinanceiro} base={dre.receitaBruta} indented />
            <DRERow label="(-) IRPJ/CSLL" value={dre.irpj} base={dre.receitaBruta} negative indented />
            <DRERow label="(=) Resultado Líquido" value={dre.resultadoLiquido} base={dre.receitaBruta} bold highlight="green" />
          </tbody>
        </table>
      </div>
    </div>
  )
}
