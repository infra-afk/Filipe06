import { Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const pageNames: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/canvases':      'Canvas Operacional',
  '/objetivos':     'Objetivos',
  '/indicadores':   'Indicadores',
  '/vendas':        'Vendas',
  '/despesas':      'Despesas',
  '/devolucoes':    'Devoluções',
  '/dre':           'DRE',
  '/alertas':       'Alertas',
  '/decisoes':      'Decisões',
  '/agentes':       'Agentes IA',
  '/automacoes':    'Automações',
  '/configuracoes': 'Configurações',
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const { user } = useAuth()

  const pageName = pageNames[location.pathname] ||
    (location.pathname.startsWith('/canvas/') ? 'Canvas' : 'Dashboard')

  const initials = (user?.full_name || user?.email || 'U')
    .slice(0, 2).toUpperCase()

  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="p-2 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <h1 className="text-base font-bold text-slate-900">{pageName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Notificações"
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
