import { NavLink } from 'react-router-dom'
import {
  Settings, TrendingUp, LogOut, X, LayoutGrid, Kanban, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { path: '/canvases',      label: 'Canvas',        icon: LayoutGrid,    highlight: true  },
  { path: '/kanban',        label: 'Kanban',         icon: Kanban,        highlight: false },
  { path: '/formulario',    label: 'Formulário',     icon: ClipboardList, highlight: false },
  { path: '/configuracoes', label: 'Configurações',  icon: Settings,      highlight: false },
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
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <TrendingUp size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">CHUA</p>
            <p className="text-[11px] text-slate-400 leading-tight">Dashboard Executivo</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden" aria-label="Fechar menu">
            <X size={16} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon, highlight }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${highlight && !isActive ? 'text-blue-600 font-semibold hover:bg-blue-50' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate leading-tight">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="sidebar-link w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
