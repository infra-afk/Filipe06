import { NavLink } from 'react-router-dom'
import {
  Settings, LogOut, X, LayoutGrid, Kanban, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ChuaLogo() {
  // Segmento base apontando para cima (12h), anel r1=21 r2=46, arco de ±12.5°
  // Pré-calculado: cos(12.5°)=0.9763  sin(12.5°)=0.2164
  // Outer: x=50±46*0.2164=50±9.95  y=50-46*0.9763=50-44.91=5.09
  // Inner: x=50±21*0.2164=50±4.54  y=50-21*0.9763=50-20.50=29.50
  const seg = "M40.05,5.09 A46,46 0 0,1 59.95,5.09 L54.54,29.50 A21,21 0 0,0 45.46,29.50 Z"
  // 11 posições de 12 (30° cada), gap na posição 4 (4h = 120°)
  const positions = [0,1,2,3,5,6,7,8,9,10,11]
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {positions.map(i => (
        <path
          key={i}
          d={seg}
          fill="#E5501E"
          transform={`rotate(${i * 30}, 50, 50)`}
        />
      ))}
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
