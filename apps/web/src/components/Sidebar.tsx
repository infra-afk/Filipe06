import { NavLink } from 'react-router-dom'
import {
  Settings, LogOut, X, LayoutGrid, Kanban, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ChuaLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Roda CHUA — 11 segmentos laranja em círculo */}
      {[0,1,2,3,4,5,6,7,8,9,10].map((i) => {
        const angle = (i * 360) / 12 - 90
        const rad = (angle * Math.PI) / 180
        const cx = 50 + 32 * Math.cos(rad)
        const cy = 50 + 32 * Math.sin(rad)
        return (
          <rect
            key={i}
            x={cx - 7}
            y={cy - 5}
            width={14}
            height={10}
            rx={3}
            fill="#E84E1B"
            transform={`rotate(${angle + 90}, ${cx}, ${cy})`}
          />
        )
      })}
    </svg>
  )
}

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
          <div className="w-10 h-10 flex items-center justify-center">
            <ChuaLogo />
          </div>
          <div>
            <p className="text-sm font-black leading-tight tracking-widest" style={{ color: '#6B7280', letterSpacing: '0.18em' }}>CHUÁ</p>
            <p className="text-[9px] font-medium leading-tight tracking-widest uppercase" style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>Além da Distribuição</p>
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
