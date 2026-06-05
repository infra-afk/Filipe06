import { Bell, Search, Menu, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/canvases': 'Canvas Operacional',
  '/objetivos': 'Objetivos',
  '/indicadores': 'Indicadores',
  '/vendas': 'Vendas',
  '/despesas': 'Despesas',
  '/devolucoes': 'Devoluções',
  '/dre': 'DRE',
  '/alertas': 'Alertas',
  '/decisoes': 'Decisões',
  '/agentes': 'Agentes IA',
  '/automacoes': 'Automações',
  '/configuracoes': 'Configurações',
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const pageName = pageNames[location.pathname] ||
    (location.pathname.startsWith('/canvas/') ? 'Canvas' : 'Dashboard')

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900">{pageName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-48">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-600 outline-none w-full placeholder-slate-400"
          />
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-100">
          <span className="text-xs font-medium text-slate-600">Jan 2024</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
          <span className="text-xs font-semibold text-blue-700">AD</span>
        </div>
      </div>
    </header>
  )
}
