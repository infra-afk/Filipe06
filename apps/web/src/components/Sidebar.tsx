import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Settings, LogOut, X, LayoutGrid, Kanban, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function ChuaLogo() {
  /*
   * Roda CHUÁ — 11 segmentos em arco de anel
   * r_outer=47, r_inner=27, span=±13° por segmento (26° total, gap=4°)
   * sin13°=0.2250  cos13°=0.9744
   * Outer: x=50±47*0.2250=50±10.58 → 39.42, 60.58  y=50-47*0.9744=50-45.80=4.20
   * Inner: x=50±27*0.2250=50±6.08  → 43.93, 56.08  y=50-27*0.9744=50-26.31=23.69
   */
  const seg = "M39.42,4.20 A47,47 0 0,1 60.58,4.20 L56.08,23.69 A27,27 0 0,0 43.93,23.69 Z"
  // 11 de 12 posições (30° cada) — gap na posição 4 (~4h no relógio)
  const positions = [0,1,2,3,5,6,7,8,9,10,11]
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {positions.map(i => (
        <path key={i} d={seg} fill="#E5501E"
          transform={`rotate(${i * 30}, 50, 50)`} />
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
  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem('chua_banner_logo') || '')

  useEffect(() => {
    function onLogoChange() { setLogoUrl(localStorage.getItem('chua_banner_logo') || '') }
    window.addEventListener('chua-logo-change', onLogoChange)
    return () => window.removeEventListener('chua-logo-change', onLogoChange)
  }, [])

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-60">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="flex items-center justify-center" style={{ maxHeight: '48px' }}>
              <img src={logoUrl} alt="Logo" style={{ maxHeight: '48px', maxWidth: '176px', objectFit: 'contain' }} />
            </div>
          ) : (
            <>
              <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                <ChuaLogo />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-black leading-none" style={{ color: '#6D7280', fontSize: '18px', letterSpacing: '0.15em', fontFamily: 'inherit' }}>CHUÁ</p>
                <p className="leading-none mt-0.5" style={{ color: '#A0A5AE', fontSize: '8px', letterSpacing: '0.22em', fontWeight: 500 }}>SOLICITAÇÕES DE DASHBOARD</p>
              </div>
            </>
          )}
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
