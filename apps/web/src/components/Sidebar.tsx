import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Target, BarChart2, ShoppingCart, Receipt,
  RefreshCcw, FileText, Bell, Lightbulb, Bot, Zap, Settings,
  TrendingUp, LogOut, X, LayoutGrid,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/canvases', label: 'Canvas', icon: LayoutGrid },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/objetivos', label: 'Objetivos', icon: Target },
  { path: '/indicadores', label: 'Indicadores', icon: BarChart2 },
  { path: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { path: '/despesas', label: 'Despesas', icon: Receipt },
  { path: '/devolucoes', label: 'Devoluções', icon: RefreshCcw },
  { path: '/dre', label: 'DRE', icon: FileText },
  { path: '/alertas', label: 'Alertas', icon: Bell },
  { path: '/decisoes', label: 'Decisões', icon: Lightbulb },
  { path: '/agentes', label: 'Agentes', icon: Bot },
  { path: '/automacoes', label: 'Automações', icon: Zap },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { signOut, user } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-60">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Dashboard</p>
            <p className="text-xs text-slate-400">Executivo</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 lg:hidden" aria-label="Fechar menu">
            <X size={18} className="text-slate-500" />
          </button>
        )}
      </div>

      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-xs font-medium text-slate-400 px-3 py-1 uppercase tracking-wider">Empresa CHUA</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-blue-700">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
