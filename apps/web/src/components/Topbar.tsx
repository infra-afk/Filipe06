import { useRef, useState, useEffect } from 'react'
import { Bell, Menu, Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  '/kanban':        'Kanban',
  '/formulario':    'Formulário',
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pageName = pageNames[location.pathname] ||
    (location.pathname.startsWith('/canvas/') ? 'Canvas' : 'Dashboard')

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const email = user?.email || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

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
        {/* Sino */}
        <button
          aria-label="Notificações"
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
              {initials}
            </div>
            <ChevronDown size={13} className="text-slate-400" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>

              {/* Cabeçalho do usuário */}
              <div className="px-4 py-4 border-b border-slate-100"
                style={{ background: 'linear-gradient(135deg, #1d4ed808, #0f766e08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-blue-700 bg-blue-50">
                      <User size={9} /> Administrador
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="p-2">
                <button
                  onClick={() => { navigate('/configuracoes'); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                    <Settings size={15} className="text-slate-500" />
                  </div>
                  Configurações
                </button>

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  onClick={() => { signOut(); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
                    <LogOut size={15} className="text-red-500" />
                  </div>
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
