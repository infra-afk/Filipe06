import { useState, useRef, useEffect } from 'react'
import {
  Building2, User, Bell, Database, Shield, Palette, Users,
  Check, Eye, EyeOff, Plus, Trash2, Mail, Phone, Globe,
  Sun, Moon, Monitor, ChevronRight, AlertCircle, CheckCircle2,
  Key, Clock, Smartphone, Upload, LayoutGrid, ShoppingCart,
  Receipt, FileText, BarChart2, Bot, Kanban, LayoutDashboard,
  RefreshCcw, Lightbulb, Send, Inbox, X, Lock, Unlock,
  UserCheck, UserX, MessageSquare, BellRing, BookOpen,
  Server, Code2, GitBranch, Layers, Zap, HelpCircle,
  Search, Edit2, Filter,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getToken } from '../lib/auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Secao = 'empresa' | 'perfil' | 'usuarios' | 'notificacoes' | 'integracoes' | 'seguranca' | 'aparencia' | 'documentacao'

const TODOS_MODULOS = [
  { key: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { key: 'canvas',      label: 'Canvas',       icon: LayoutGrid      },
  { key: 'kanban',      label: 'Kanban',       icon: Kanban          },
  { key: 'indicadores', label: 'Indicadores',  icon: BarChart2       },
  { key: 'vendas',      label: 'Vendas',       icon: ShoppingCart    },
  { key: 'despesas',    label: 'Despesas',     icon: Receipt         },
  { key: 'devolucoes',  label: 'Devoluções',   icon: RefreshCcw      },
  { key: 'dre',         label: 'DRE',          icon: FileText        },
  { key: 'alertas',     label: 'Alertas',      icon: Bell            },
  { key: 'decisoes',    label: 'Decisões',     icon: Lightbulb       },
  { key: 'agentes',     label: 'Agentes IA',   icon: Bot             },
  { key: 'configuracoes', label: 'Configurações', icon: Shield       },
] as const

type ModuloKey = typeof TODOS_MODULOS[number]['key']

interface UsuarioLocal {
  id: string
  nome: string
  email: string
  papel: 'Admin' | 'Analista' | 'Visualizador' | 'Solicitante'
  ativo: boolean
  permissoes: ModuloKey[]
  senha?: string
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  de: string
  para: string
  hora: string
  lida: boolean
  tipo: 'info' | 'alerta' | 'sucesso' | 'erro'
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
      {...props}
    />
  )
}

function Toggle({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div>
        <span className="text-sm text-slate-700 font-medium">{label}</span>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-4 ${on ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

const PAPEL_COR: Record<UsuarioLocal['papel'], string> = {
  Admin:        'bg-red-100 text-red-700',
  Analista:     'bg-blue-100 text-blue-700',
  Visualizador: 'bg-slate-100 text-slate-600',
  Solicitante:  'bg-green-100 text-green-700',
}

const NOTIF_TIPO: Record<Notificacao['tipo'], { bg: string; icon: any; cor: string }> = {
  info:    { bg: 'bg-blue-50',   icon: BellRing,      cor: 'text-blue-600'   },
  alerta:  { bg: 'bg-amber-50',  icon: AlertCircle,   cor: 'text-amber-600'  },
  sucesso: { bg: 'bg-green-50',  icon: CheckCircle2,  cor: 'text-green-600'  },
  erro:    { bg: 'bg-red-50',    icon: AlertCircle,   cor: 'text-red-600'    },
}

// ─── Modal de Permissões ──────────────────────────────────────────────────────

function PermissoesModal({ usuario, onToggle, onClose }: {
  usuario: UsuarioLocal
  onToggle: (key: ModuloKey) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}
            >
              {usuario.nome.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{usuario.nome}</p>
              <p className="text-xs text-slate-400">{usuario.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-700 font-medium">Módulos liberados: {usuario.permissoes.length} de {TODOS_MODULOS.length}</p>
        </div>

        <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
          {TODOS_MODULOS.map(mod => {
            const ativo = usuario.permissoes.includes(mod.key)
            return (
              <button
                key={mod.key}
                onClick={() => onToggle(mod.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  ativo ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ativo ? 'bg-blue-600' : 'bg-slate-100'}`}>
                  <mod.icon size={13} className={ativo ? 'text-white' : 'text-slate-400'} />
                </div>
                <span className={`text-sm font-medium flex-1 ${ativo ? 'text-blue-800' : 'text-slate-600'}`}>{mod.label}</span>
                {ativo
                  ? <Unlock size={13} className="text-blue-500" />
                  : <Lock size={13} className="text-slate-300" />
                }
              </button>
            )
          })}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => {
              TODOS_MODULOS.forEach(m => { if (!usuario.permissoes.includes(m.key)) onToggle(m.key) })
            }}
            className="text-xs text-blue-600 font-semibold hover:text-blue-800"
          >
            Liberar todos
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Seção Usuários ───────────────────────────────────────────────────────────

const TODOS_ACESSOS: ModuloKey[] = TODOS_MODULOS.map(m => m.key)
const ACESSOS_VISUALIZADOR: ModuloKey[] = ['dashboard', 'indicadores', 'vendas']
const ACESSOS_SOLICITANTE: ModuloKey[] = ['dashboard','canvas','kanban','indicadores','vendas','despesas','dre','alertas','decisoes']
const ACESSOS_ANALISTA: ModuloKey[] = ['dashboard','canvas','kanban','indicadores','vendas','despesas','dre','alertas','decisoes']
const PAPEIS: UsuarioLocal['papel'][] = ['Admin', 'Analista', 'Visualizador', 'Solicitante']

function forcaSenha(s: string): { label: string; cor: string; bg: string; pct: number } {
  if (!s) return { label: '', cor: '', bg: '', pct: 0 }
  const pts = [s.length >= 8, /[A-Z]/.test(s), /[0-9]/.test(s), /[^A-Za-z0-9]/.test(s)].filter(Boolean).length
  if (pts <= 1) return { label: 'Fraca',      cor: 'text-red-500',   bg: 'bg-red-400',    pct: 25  }
  if (pts === 2) return { label: 'Média',      cor: 'text-amber-500', bg: 'bg-amber-400',  pct: 50  }
  if (pts === 3) return { label: 'Forte',      cor: 'text-blue-600',  bg: 'bg-blue-500',   pct: 75  }
  return            { label: 'Muito forte', cor: 'text-green-600', bg: 'bg-green-500',  pct: 100 }
}

function permsParaPapel(p: UsuarioLocal['papel']): ModuloKey[] {
  if (p === 'Admin')        return TODOS_ACESSOS
  if (p === 'Analista')     return ACESSOS_ANALISTA
  if (p === 'Solicitante')  return ACESSOS_SOLICITANTE
  return ACESSOS_VISUALIZADOR
}

function FormUsuario({
  titulo,
  initial,
  onSalvar,
  onCancelar,
}: {
  titulo: string
  initial?: Partial<UsuarioLocal>
  onSalvar: (u: Omit<UsuarioLocal, 'id'> & { senha: string }) => void
  onCancelar: () => void
}) {
  const [nome,      setNome]      = useState(initial?.nome  ?? '')
  const [email,     setEmail]     = useState(initial?.email ?? '')
  const [senha,     setSenha]     = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [papel,     setPapel]     = useState<UsuarioLocal['papel']>(initial?.papel ?? 'Visualizador')
  const [perms,     setPerms]     = useState<ModuloKey[]>(initial?.permissoes ?? ACESSOS_VISUALIZADOR)
  const [verSenha,  setVerSenha]  = useState(false)
  const [verConf,   setVerConf]   = useState(false)
  const [erros,     setErros]     = useState<Record<string, string>>({})

  const forca = forcaSenha(senha)
  const editando = !!initial?.id

  function togglePerm(key: ModuloKey) {
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  function mudarPapel(p: UsuarioLocal['papel']) {
    setPapel(p)
    setPerms(permsParaPapel(p))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!nome.trim())  e.nome  = 'Nome é obrigatório'
    if (!email.trim()) e.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido'
    if (!editando || senha) {
      if (!editando && !senha) e.senha = 'Senha é obrigatória'
      if (senha && senha.length < 6) e.senha = 'Mínimo 6 caracteres'
      if (senha && confirmar !== senha) e.confirmar = 'As senhas não conferem'
    }
    setErros(e)
    return Object.keys(e).length === 0
  }

  function salvar() {
    if (!validar()) return
    onSalvar({ nome: nome.trim(), email: email.trim(), papel, ativo: initial?.ativo ?? true, permissoes: perms, senha })
  }

  return (
    <div className="border border-blue-200 rounded-2xl bg-blue-50/30 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-blue-600">
        <p className="text-xs font-bold text-white uppercase tracking-widest">{titulo}</p>
        <button onClick={onCancelar} className="p-1 rounded-lg hover:bg-blue-700 transition-colors">
          <X size={14} className="text-white" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Nome + Email */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Campo label="Nome completo *">
              <Input
                value={nome}
                onChange={e => { setNome(e.target.value); setErros(v => ({ ...v, nome: '' })) }}
                placeholder="Ex: Maria Santos"
                className={erros.nome ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
              />
            </Campo>
            {erros.nome && <p className="text-[11px] text-red-500 mt-1">{erros.nome}</p>}
          </div>
          <div>
            <Campo label="E-mail *">
              <Input
                value={email}
                onChange={e => { setEmail(e.target.value); setErros(v => ({ ...v, email: '' })) }}
                placeholder="email@empresa.com"
                type="email"
                className={erros.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
              />
            </Campo>
            {erros.email && <p className="text-[11px] text-red-500 mt-1">{erros.email}</p>}
          </div>
        </div>

        {/* Senha */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Campo label={editando ? 'Nova senha (opcional)' : 'Senha *'}>
              <div className="relative">
                <Input
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErros(v => ({ ...v, senha: '' })) }}
                  placeholder="••••••••"
                  type={verSenha ? 'text' : 'password'}
                  className={`pr-9 ${erros.senha ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {verSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Campo>
            {erros.senha && <p className="text-[11px] text-red-500 mt-1">{erros.senha}</p>}
            {/* Barra de força */}
            {senha && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${forca.bg}`}
                    style={{ width: `${forca.pct}%` }}
                  />
                </div>
                <p className={`text-[11px] font-medium ${forca.cor}`}>{forca.label}</p>
              </div>
            )}
          </div>
          <div>
            <Campo label="Confirmar senha">
              <div className="relative">
                <Input
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); setErros(v => ({ ...v, confirmar: '' })) }}
                  placeholder="••••••••"
                  type={verConf ? 'text' : 'password'}
                  className={`pr-9 ${erros.confirmar ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : (confirmar && confirmar === senha ? 'border-green-300 focus:ring-green-100' : '')}`}
                />
                <button
                  type="button"
                  onClick={() => setVerConf(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {verConf ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {confirmar && confirmar === senha && (
                  <CheckCircle2 size={13} className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
            </Campo>
            {erros.confirmar && <p className="text-[11px] text-red-500 mt-1">{erros.confirmar}</p>}
          </div>
        </div>

        {/* Dica de senha forte */}
        {!editando && (
          <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <Key size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use 8+ caracteres com letras maiúsculas, números e símbolos para uma senha muito forte.
            </p>
          </div>
        )}

        {/* Perfil de acesso */}
        <Campo label="Perfil de acesso">
          <div className="flex gap-2">
            {PAPEIS.map(p => (
              <button
                key={p}
                onClick={() => mudarPapel(p)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  papel === p
                    ? p === 'Admin'    ? 'bg-red-600 text-white border-red-600'
                    : p === 'Analista' ? 'bg-blue-600 text-white border-blue-600'
                    :                   'bg-slate-600 text-white border-slate-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {papel === 'Admin'        && 'Acesso completo a todos os módulos e configurações.'}
            {papel === 'Analista'     && 'Pode criar canvas, editar dados e gerenciar indicadores.'}
            {papel === 'Solicitante'  && 'Visualiza dashboards e kanban. Cria canvas para solicitar novos dashboards.'}
            {papel === 'Visualizador' && 'Visualiza dashboards e indicadores em modo somente leitura.'}
            {papel === 'Visualizador' && 'Somente leitura — visualiza dashboards sem edição.'}
          </p>
        </Campo>

        {/* Módulos */}
        <Campo label="Módulos liberados">
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {TODOS_MODULOS.map(mod => {
              const on = perms.includes(mod.key)
              return (
                <button
                  key={mod.key}
                  onClick={() => togglePerm(mod.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <mod.icon size={11} />
                  {mod.label}
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">{perms.length} de {TODOS_MODULOS.length} módulos selecionados</p>
        </Campo>

        {/* Ações */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={salvar}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
          >
            <Check size={13} /> {editando ? 'Salvar alterações' : 'Cadastrar usuário'}
          </button>
          <button
            onClick={onCancelar}
            className="px-4 py-2.5 text-xs text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || ''

function authHeader(): Record<string, string> {
  const token = getToken()
  const h: Record<string, string> = {}
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

function SecaoUsuarios() {
  const DEFAULT_USUARIOS: UsuarioLocal[] = [
    { id: '1', nome: 'Infra Admin',  email: 'infra@chuasa.com',        papel: 'Admin',        ativo: true,  permissoes: TODOS_ACESSOS },
    { id: '2', nome: 'Filipe',       email: 'filipe@chuasa.com',       papel: 'Admin',        ativo: true,  permissoes: TODOS_ACESSOS },
    { id: '3', nome: 'Weslei Alves', email: 'weslei.alves@chuasa.com', papel: 'Analista',     ativo: true,  permissoes: ACESSOS_ANALISTA },
    { id: '4', nome: 'Ana Lima',     email: 'ana.lima@chuasa.com',     papel: 'Visualizador', ativo: false, permissoes: ACESSOS_VISUALIZADOR },
  ]

  const [usuarios, setUsuarios] = useState<UsuarioLocal[]>(() => {
    try {
      const saved = localStorage.getItem('chua_usuarios')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_USUARIOS
  })

  useEffect(() => {
    localStorage.setItem('chua_usuarios', JSON.stringify(usuarios))
  }, [usuarios])

  const [permModal,      setPermModal]      = useState<UsuarioLocal | null>(null)
  const [adicionando,    setAdicionando]    = useState(false)
  const [editandoId,     setEditandoId]     = useState<string | null>(null)
  const [confirmDelete,  setConfirmDelete]  = useState<string | null>(null)
  const [filtro,         setFiltro]         = useState('')
  const [filtroPapel,    setFiltroPapel]    = useState<'todos' | UsuarioLocal['papel']>('todos')

  const ativos   = usuarios.filter(u => u.ativo).length
  const inativos = usuarios.length - ativos

  const usuariosFiltrados = usuarios.filter(u => {
    const q = filtro.toLowerCase()
    const matchText  = !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchPapel = filtroPapel === 'todos' || u.papel === filtroPapel
    return matchText && matchPapel
  })

  // Carrega usuários reais do banco
  useEffect(() => {
    fetch(`${API_URL}/auth/users`, { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then((rows: Array<{ id: string; email: string; full_name: string; ativo: boolean }>) => {
        if (!Array.isArray(rows) || rows.length === 0) return
        setUsuarios(rows.map(r => ({
          id: r.id,
          nome: r.full_name || r.email.split('@')[0],
          email: r.email,
          papel: 'Analista' as const,
          ativo: r.ativo,
          permissoes: TODOS_ACESSOS,
        })))
      })
      .catch(() => {})
  }, [])

  function togglePermModal(key: ModuloKey) {
    if (!permModal) return
    setPermModal(prev => {
      if (!prev) return null
      const has = prev.permissoes.includes(key)
      const perms = has ? prev.permissoes.filter(p => p !== key) : [...prev.permissoes, key]
      const updated = { ...prev, permissoes: perms }
      setUsuarios(u => u.map(x => x.id === updated.id ? updated : x))
      return updated
    })
  }

  function toggleAtivo(id: string) {
    const u = usuarios.find(x => x.id === id)
    if (!u) return
    const rota = u.ativo ? 'deactivar' : 'reativar'
    fetch(`${API_URL}/auth/users/${id}/${rota}`, {
      method: 'PATCH',
      headers: authHeader(),
    }).catch(() => {})
    setUsuarios(p => p.map(x => x.id === id ? { ...x, ativo: !x.ativo } : x))
  }

  // Soft delete: desativa no banco (dados preservados), remove da lista local
  function remover(id: string) {
    fetch(`${API_URL}/auth/users/${id}/deactivar`, {
      method: 'PATCH',
      headers: authHeader(),
    }).catch(() => {})
    setUsuarios(p => p.filter(u => u.id !== id))
    setConfirmDelete(null)
  }

  function adicionar(data: Omit<UsuarioLocal, 'id'> & { senha: string }) {
    const { senha: _s, ...rest } = data
    setUsuarios(p => [...p, { ...rest, id: Date.now().toString() }])
    setAdicionando(false)
  }

  function salvarEdicao(data: Omit<UsuarioLocal, 'id'> & { senha: string }) {
    const { senha: _s, ...rest } = data
    setUsuarios(p => p.map(u => u.id === editandoId ? { ...u, ...rest } : u))
    setEditandoId(null)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    valor: usuarios.length, cor: 'text-slate-700', bg: 'bg-white',      borda: 'border-slate-200' },
            { label: 'Ativos',   valor: ativos,          cor: 'text-green-700', bg: 'bg-green-50',   borda: 'border-green-200' },
            { label: 'Inativos', valor: inativos,        cor: 'text-slate-500', bg: 'bg-slate-50',   borda: 'border-slate-200' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.borda} rounded-2xl px-4 py-3 flex items-center justify-between`}>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
              <span className={`text-2xl font-bold ${s.cor}`}>{s.valor}</span>
            </div>
          ))}
        </div>

        {/* Filtros + Botão novo */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtroPapel}
              onChange={e => setFiltroPapel(e.target.value as typeof filtroPapel)}
              className="pl-7 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-600 cursor-pointer transition-all"
            >
              <option value="todos">Todos os perfis</option>
              {PAPEIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {!adicionando && !editandoId && (
            <button
              onClick={() => setAdicionando(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex-shrink-0"
            >
              <Plus size={13} /> Novo usuário
            </button>
          )}
        </div>

        {/* Formulário novo usuário */}
        {adicionando && (
          <FormUsuario
            titulo="Novo usuário"
            onSalvar={adicionar}
            onCancelar={() => setAdicionando(false)}
          />
        )}

        {/* Lista de usuários */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Usuários com Acesso
                {filtro || filtroPapel !== 'todos'
                  ? <span className="ml-1.5 text-xs font-normal text-slate-400">({usuariosFiltrados.length} de {usuarios.length})</span>
                  : <span className="ml-1.5 text-xs font-normal text-slate-400">({usuarios.length})</span>
                }
              </h3>
            </div>
          </div>

          {usuariosFiltrados.length === 0 ? (
            <div className="py-10 text-center">
              <Users size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Nenhum usuário encontrado</p>
              {(filtro || filtroPapel !== 'todos') && (
                <button
                  onClick={() => { setFiltro(''); setFiltroPapel('todos') }}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {usuariosFiltrados.map(u => (
                <div key={u.id}>
                  {/* Linha do usuário */}
                  {editandoId === u.id ? (
                    <div className="p-4">
                      <FormUsuario
                        titulo={`Editar — ${u.nome}`}
                        initial={u}
                        onSalvar={salvarEdicao}
                        onCancelar={() => setEditandoId(null)}
                      />
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 px-5 py-3.5 transition-colors group hover:bg-slate-50/80 ${!u.ativo ? 'opacity-60' : ''}`}>
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                        style={{ background: u.ativo ? 'linear-gradient(135deg,#1d4ed8,#0f766e)' : '#94a3b8' }}
                      >
                        {u.nome.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{u.nome}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PAPEL_COR[u.papel]}`}>{u.papel}</span>
                          {!u.ativo && (
                            <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">Inativo</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{u.email}</p>
                      </div>

                      {/* Módulos */}
                      <button
                        onClick={() => setPermModal(u)}
                        title="Gerenciar permissões"
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-all flex-shrink-0"
                      >
                        <Shield size={12} />
                        <span>{u.permissoes.length} módulos</span>
                      </button>

                      {/* Ações */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditandoId(u.id)}
                          title="Editar usuário"
                          className="p-2 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleAtivo(u.id)}
                          title={u.ativo ? 'Desativar acesso' : 'Reativar acesso'}
                          className={`p-2 rounded-lg transition-all ${
                            u.ativo
                              ? 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                              : 'text-slate-300 hover:text-green-500 hover:bg-green-50'
                          }`}
                        >
                          {u.ativo ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          title="Remover usuário"
                          className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmação de exclusão */}
                  {confirmDelete === u.id && (
                    <div className="mx-5 mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-700 flex-1 font-medium">
                        Remover <strong>{u.nome}</strong>? Esta ação não pode ser desfeita.
                      </p>
                      <button
                        onClick={() => remover(u.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all flex-shrink-0"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all flex-shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Perfis de acesso */}
        <SectionCard title="Perfis de Acesso" icon={Shield}>
          <div className="space-y-3">
            {[
              { papel: 'Admin' as const,        cor: PAPEL_COR['Admin'],        desc: 'Acesso total — pode gerenciar usuários, configurações e todos os módulos.' },
              { papel: 'Analista' as const,     cor: PAPEL_COR['Analista'],     desc: 'Pode visualizar e editar dados, criar canvas e gerenciar indicadores.' },
              { papel: 'Visualizador' as const, cor: PAPEL_COR['Visualizador'], desc: 'Apenas visualiza dashboards pré-configurados, sem edição.' },
            ].map(({ papel, desc, cor }) => (
              <div key={papel} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cor}`}>{papel}</span>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
            ))}
            <p className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
              <Shield size={11} className="text-slate-400" />
              Clique em <strong>X módulos</strong> para personalizar os acessos individualmente por usuário.
            </p>
          </div>
        </SectionCard>
      </div>

      {permModal && (
        <PermissoesModal
          usuario={permModal}
          onToggle={togglePermModal}
          onClose={() => setPermModal(null)}
        />
      )}
    </>
  )
}

// ─── Seção Notificações ───────────────────────────────────────────────────────

const NOTIFS_INICIAIS: Notificacao[] = [
  { id: '1', titulo: 'Margem abaixo da meta', mensagem: 'A margem líquida caiu para 18%, abaixo do limite de 20% configurado.', de: 'Sistema', para: 'Você', hora: '10 min', lida: false, tipo: 'alerta' },
  { id: '2', titulo: 'Dashboard Comercial concluído', mensagem: 'O dashboard comercial foi entregue e está disponível para revisão no Kanban.', de: 'Ana Lima', para: 'Você', hora: '1h', lida: false, tipo: 'sucesso' },
  { id: '3', titulo: 'Novo usuário cadastrado', mensagem: 'Ana Lima foi adicionada ao sistema com perfil Visualizador.', de: 'Sistema', para: 'Você', hora: '3h', lida: true, tipo: 'info' },
  { id: '4', titulo: 'Relatório semanal disponível', mensagem: 'O resumo executivo da semana 22 está pronto para download.', de: 'Sistema', para: 'Você', hora: 'Ontem', lida: true, tipo: 'info' },
  { id: '5', titulo: 'Despesas acima do orçamento', mensagem: 'As despesas do mês ultrapassaram o orçamento em R$ 12.400.', de: 'Sistema', para: 'Você', hora: '2d', lida: true, tipo: 'erro' },
]

function SecaoNotificacoes() {
  const [tab, setTab]         = useState<'inbox' | 'enviar'>('inbox')
  const [notifs, setNotifs]   = useState<Notificacao[]>(NOTIFS_INICIAIS)
  const [titulo, setTitulo]   = useState('')
  const [mensagem, setMensagem] = useState('')
  const [dest, setDest]       = useState('todos')
  const [tipo, setTipo]       = useState<Notificacao['tipo']>('info')
  const [enviado, setEnviado] = useState(false)
  const [email,     setEmail]    = useState(true)
  const [whatsapp,  setWhatsapp] = useState(false)
  const [dashboard, setDashboard] = useState(true)
  const [alertas,   setAlertas]  = useState(true)
  const [relatorio, setRelatorio] = useState(false)
  const [resumo,    setResumo]   = useState(true)

  const naoLidas = notifs.filter(n => !n.lida).length

  useEffect(() => {
    localStorage.setItem('chua_notif_unread', String(naoLidas))
    window.dispatchEvent(new Event('chua-notif-change'))
  }, [naoLidas])

  function marcarLida(id: string) {
    setNotifs(p => p.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  function marcarTodas() {
    setNotifs(p => p.map(n => ({ ...n, lida: true })))
  }

  function removerNotif(id: string) {
    setNotifs(p => p.filter(n => n.id !== id))
  }

  function enviar() {
    if (!titulo.trim() || !mensagem.trim()) return
    const nova: Notificacao = {
      id: Date.now().toString(),
      titulo,
      mensagem,
      de: 'Você',
      para: dest === 'todos' ? 'Todos os usuários' : dest,
      hora: 'Agora',
      lida: false,
      tipo,
    }
    setNotifs(p => [nova, ...p])
    setTitulo(''); setMensagem('')
    setEnviado(true)
    setTimeout(() => setEnviado(false), 2500)
    setTab('inbox')
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setTab('inbox')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${
            tab === 'inbox' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Inbox size={14} />
          Caixa de entrada
          {naoLidas > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {naoLidas}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('enviar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all ${
            tab === 'enviar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Send size={14} />
          Enviar mensagem
        </button>
      </div>

      {tab === 'inbox' && (
        <SectionCard
          title={`Notificações (${notifs.length})`}
          icon={Bell}
          action={
            naoLidas > 0 ? (
              <button onClick={marcarTodas} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                Marcar todas como lidas
              </button>
            ) : undefined
          }
        >
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-300">
              <Bell size={28} />
              <p className="text-sm mt-2">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.map(n => {
                const t = NOTIF_TIPO[n.tipo]
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 p-3.5 rounded-xl border transition-all group cursor-pointer ${
                      n.lida ? 'border-slate-100 hover:border-slate-200' : `border-l-4 ${n.tipo === 'alerta' ? 'border-l-amber-400' : n.tipo === 'erro' ? 'border-l-red-400' : n.tipo === 'sucesso' ? 'border-l-green-400' : 'border-l-blue-400'} border-slate-100 ${t.bg}`
                    }`}
                    onClick={() => marcarLida(n.id)}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${t.bg}`}>
                      <t.icon size={14} className={t.cor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${n.lida ? 'text-slate-600' : 'text-slate-900'}`}>
                          {n.titulo}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400">{n.hora}</span>
                          <button
                            onClick={e => { e.stopPropagation(); removerNotif(n.id) }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 text-slate-300 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensagem}</p>
                      <p className="text-[10px] text-slate-400 mt-1">De: {n.de}</p>
                    </div>
                    {!n.lida && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      )}

      {tab === 'enviar' && (
        <SectionCard title="Enviar Notificação" icon={Send}>
          <div className="space-y-4">
            {enviado && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 animate-fade-up">
                <CheckCircle2 size={15} className="text-green-600" />
                <p className="text-sm font-semibold text-green-700">Notificação enviada com sucesso!</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Campo label="Destinatário">
                <select
                  value={dest}
                  onChange={e => setDest(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
                >
                  <option value="todos">Todos os usuários</option>
                  <option value="Admin">Apenas Admins</option>
                  <option value="Analista">Apenas Analistas</option>
                  <option value="Visualizador">Apenas Visualizadores</option>
                  <option value="infra@chuasa.com">infra@chuasa.com</option>
                  <option value="filipe@chuasa.com">filipe@chuasa.com</option>
                  <option value="weslei.alves@chuasa.com">weslei.alves@chuasa.com</option>
                </select>
              </Campo>
              <Campo label="Tipo">
                <div className="flex gap-1.5">
                  {(['info','sucesso','alerta','erro'] as Notificacao['tipo'][]).map(t => {
                    const cfg = NOTIF_TIPO[t]
                    return (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 capitalize transition-all ${
                          tipo === t ? `${cfg.bg} ${cfg.cor} border-current` : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </Campo>
            </div>

            <Campo label="Título *">
              <Input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Atualização importante do sistema"
              />
            </Campo>

            <Campo label="Mensagem *">
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                placeholder="Escreva a mensagem da notificação..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
              />
            </Campo>

            <button
              onClick={enviar}
              disabled={!titulo.trim() || !mensagem.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}
            >
              <Send size={14} /> Enviar notificação
            </button>
          </div>
        </SectionCard>
      )}

      {/* Configurações de canal */}
      <SectionCard title="Canais de Recebimento" icon={MessageSquare}>
        <Toggle on={email}     onChange={setEmail}     label="E-mail"              desc="Receber notificações no e-mail cadastrado" />
        <Toggle on={whatsapp}  onChange={setWhatsapp}  label="WhatsApp"            desc="Receber alertas via WhatsApp" />
        <Toggle on={dashboard} onChange={setDashboard} label="No dashboard"        desc="Sininho com notificações em tempo real" />
        <Toggle on={alertas}   onChange={setAlertas}   label="Alertas automáticos" desc="Indicadores fora da meta ou limite" />
        <Toggle on={relatorio} onChange={setRelatorio} label="Relatório semanal"   desc="Resumo automático toda segunda-feira" />
        <Toggle on={resumo}    onChange={setResumo}    label="Resumo mensal"       desc="Relatório executivo no primeiro dia do mês" />

        {whatsapp && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Campo label="Número WhatsApp">
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 bg-slate-50">
                  <Phone size={14} />
                </span>
                <Input placeholder="+55 (11) 99999-9999" className="rounded-l-none" />
              </div>
            </Campo>
          </div>
        )}
        {email && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Campo label="E-mail para notificações">
              <div className="flex gap-2">
                <span className="flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 bg-slate-50">
                  <Mail size={14} />
                </span>
                <Input placeholder="alertas@empresa.com" type="email" className="rounded-l-none" />
              </div>
            </Campo>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Upload de logo do banner ─────────────────────────────────────────────────

const LOGO_KEY = 'chua_banner_logo'

function SecaoLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(() => localStorage.getItem(LOGO_KEY) || '')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'erro'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setStatus('erro')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('logo', file)
      const res = await fetch('/api/upload/logo', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const url = `${data.url}?t=${Date.now()}`
      setLogoUrl(url)
      localStorage.setItem(LOGO_KEY, url)
      window.dispatchEvent(new Event('chua-logo-change'))
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('erro')
      setTimeout(() => setStatus('idle'), 3000)
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    fetch('/api/upload/logo', { method: 'DELETE' })
    setLogoUrl('')
    localStorage.removeItem(LOGO_KEY)
    window.dispatchEvent(new Event('chua-logo-change'))
  }

  return (
    <SectionCard title="Imagem do Banner (Canvas)" icon={Upload}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Esta imagem aparece no banner acima do Canvas Operacional. Ela é redimensionada proporcionalmente sem corte.
        </p>

        {/* Prévia */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden border-2 transition-all ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-dashed border-slate-200 bg-slate-50'
          }`}
          style={{ height: '140px' }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          {logoUrl ? (
            <>
              <img
                src={logoUrl}
                alt="Logo do banner"
                className="w-full h-full"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-600 flex items-center justify-center transition-colors"
                title="Remover imagem"
              >
                <X size={13} className="text-white" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Upload size={28} strokeWidth={1.5} />
              <p className="text-sm font-medium">Arraste a imagem aqui</p>
              <p className="text-xs">ou clique no botão abaixo</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />

        <div className="flex items-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50"
          >
            <Upload size={14} />
            {logoUrl ? 'Trocar imagem' : 'Selecionar imagem'}
          </button>
          {status === 'ok' && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 size={15} /> Imagem salva!
            </span>
          )}
          {status === 'erro' && (
            <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
              <AlertCircle size={15} /> Erro — use PNG, JPG ou WebP (máx 5 MB)
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400">PNG, JPG, WebP, SVG — máx 5 MB</span>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Seções existentes (inalteradas) ─────────────────────────────────────────

function SecaoEmpresa() {
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-4">
      <SecaoLogo />
      <SectionCard title="Dados da Empresa" icon={Building2}>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nome da empresa"><Input defaultValue="CHUA" /></Campo>
          <Campo label="CNPJ"><Input defaultValue="00.000.000/0001-00" /></Campo>
          <Campo label="Segmento"><Input defaultValue="Tecnologia" /></Campo>
          <Campo label="Cidade / Estado"><Input defaultValue="São Paulo, SP" /></Campo>
          <Campo label="Site"><Input placeholder="https://empresa.com.br" type="url" /></Campo>
          <Campo label="Telefone"><Input placeholder="(11) 99999-9999" /></Campo>
        </div>
      </SectionCard>
      <SectionCard title="Preferências Regionais" icon={Globe}>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Moeda padrão">
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              <option>BRL — Real Brasileiro</option><option>USD — Dólar Americano</option>
            </select>
          </Campo>
          <Campo label="Fuso horário">
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              <option>America/Sao_Paulo (UTC-3)</option>
            </select>
          </Campo>
          <Campo label="Formato de data">
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              <option>DD/MM/AAAA</option><option>MM/DD/YYYY</option>
            </select>
          </Campo>
          <Campo label="Formato de número">
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              <option>1.000,00 (padrão BR)</option><option>1,000.00 (padrão US)</option>
            </select>
          </Campo>
        </div>
      </SectionCard>
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
        >
          {saved ? <><CheckCircle2 size={14} /> Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}

function SecaoPerfil() {
  const { user } = useAuth()
  const nome = user?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = nome.slice(0, 2).toUpperCase()

  // Senha
  const [senhaAtual,  setSenhaAtual]  = useState('')
  const [novaSenha,   setNovaSenha]   = useState('')
  const [confirmar,   setConfirmar]   = useState('')
  const [verAtual,    setVerAtual]    = useState(false)
  const [verNova,     setVerNova]     = useState(false)
  const [loadingSenha, setLoadingSenha] = useState(false)
  const [erroSenha,   setErroSenha]   = useState('')
  const [okSenha,     setOkSenha]     = useState(false)

  const forca = forcaSenha(novaSenha)

  async function salvarSenha() {
    setErroSenha('')
    if (!senhaAtual) { setErroSenha('Informe a senha atual'); return }
    if (!novaSenha)  { setErroSenha('Informe a nova senha'); return }
    if (novaSenha.length < 6) { setErroSenha('Nova senha deve ter pelo menos 6 caracteres'); return }
    if (novaSenha !== confirmar) { setErroSenha('As senhas não conferem'); return }
    setLoadingSenha(true)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: senhaAtual, newPassword: novaSenha }),
      })
      const data = await res.json()
      if (!res.ok) { setErroSenha(data.error || 'Erro ao alterar senha'); return }
      setOkSenha(true)
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('')
      setTimeout(() => setOkSenha(false), 3000)
    } catch {
      setErroSenha('Erro de conexão com o servidor')
    } finally {
      setLoadingSenha(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Informações Pessoais" icon={User}>
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0f766e)' }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{nome}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nome completo"><Input defaultValue={nome} /></Campo>
          <Campo label="E-mail"><Input defaultValue={user?.email || ''} type="email" /></Campo>
          <Campo label="Cargo"><Input placeholder="Ex: Diretor Financeiro" /></Campo>
          <Campo label="Departamento"><Input placeholder="Ex: Financeiro" /></Campo>
        </div>
      </SectionCard>

      <SectionCard title="Alterar Senha" icon={Key}>
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <Campo label="Senha atual">
            <div className="relative">
              <Input
                value={senhaAtual}
                onChange={e => { setSenhaAtual(e.target.value); setErroSenha('') }}
                type={verAtual ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setVerAtual(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {verAtual ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Campo>

          <Campo label="Nova senha">
            <div className="relative">
              <Input
                value={novaSenha}
                onChange={e => { setNovaSenha(e.target.value); setErroSenha('') }}
                type={verNova ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setVerNova(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {verNova ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {novaSenha && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${forca.bg}`} style={{ width: `${forca.pct}%` }} />
                </div>
                <p className={`text-[11px] font-medium ${forca.cor}`}>{forca.label}</p>
              </div>
            )}
          </Campo>

          <Campo label="Confirmar nova senha">
            <div className="relative">
              <Input
                value={confirmar}
                onChange={e => { setConfirmar(e.target.value); setErroSenha('') }}
                type="password"
                placeholder="••••••••"
                className={confirmar && confirmar === novaSenha ? 'border-green-300 focus:ring-green-100' : ''}
              />
              {confirmar && confirmar === novaSenha && (
                <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
          </Campo>

          {erroSenha && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{erroSenha}</p>
            </div>
          )}

          {okSenha && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 font-medium">Senha alterada com sucesso!</p>
            </div>
          )}

          <button
            onClick={salvarSenha}
            disabled={loadingSenha}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all"
          >
            {loadingSenha ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
            ) : okSenha ? (
              <><CheckCircle2 size={14} /> Salvo!</>
            ) : (
              <><Key size={14} /> Alterar senha</>
            )}
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

function SecaoIntegracoes() {
  const integracoes = [
    { nome: 'Supabase',      status: 'conectado',    descricao: 'Banco de dados e autenticação',      cor: 'text-green-600 bg-green-50' },
    { nome: 'Google Sheets', status: 'desconectado', descricao: 'Importar planilhas automaticamente', cor: 'text-slate-400 bg-slate-50' },
    { nome: 'Excel / CSV',   status: 'desconectado', descricao: 'Upload manual de arquivos',          cor: 'text-slate-400 bg-slate-50' },
    { nome: 'ERP',           status: 'desconectado', descricao: 'Conectar sistema ERP da empresa',    cor: 'text-slate-400 bg-slate-50' },
    { nome: 'CRM',           status: 'desconectado', descricao: 'Dados de clientes e vendas',         cor: 'text-slate-400 bg-slate-50' },
  ]
  return (
    <div className="space-y-4">
      <SectionCard title="Conexões" icon={Database}>
        <div className="space-y-3">
          {integracoes.map(({ nome, status, descricao, cor }) => (
            <div key={nome} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${cor}`}>{nome.slice(0, 2).toUpperCase()}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{nome}</p>
                <p className="text-xs text-slate-400">{descricao}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status === 'conectado' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {status === 'conectado' ? 'Conectado' : 'Desconectado'}
              </span>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                {status === 'conectado' ? 'Configurar' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Configuração Supabase" icon={Database}>
        <div className="space-y-3">
          <Campo label="URL do projeto"><Input placeholder="https://xxxxx.supabase.co" className="font-mono text-xs" /></Campo>
          <Campo label="Anon Key"><Input type="password" placeholder="eyJhbGci..." className="font-mono text-xs" /></Campo>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Configure as variáveis no arquivo <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> para conectar ao Supabase com segurança.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"><Check size={14} /> Testar conexão</button>
        </div>
      </SectionCard>
    </div>
  )
}

function SecaoSeguranca() {
  const [twoFA, setTwoFA] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-4">
      <SectionCard title="Autenticação" icon={Shield}>
        <Toggle on={twoFA} onChange={setTwoFA} label="Autenticação em dois fatores (2FA)" desc="Adiciona uma camada extra de segurança no login" />
        {twoFA && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
            <Smartphone size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Configure o 2FA</p>
              <p className="text-xs text-blue-600 mt-0.5">Use Google Authenticator ou Authy para escanear o QR Code.</p>
              <button className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 underline">Ver QR Code</button>
            </div>
          </div>
        )}
      </SectionCard>
      <SectionCard title="Sessões Ativas" icon={Clock}>
        <div className="space-y-2">
          {[
            { dispositivo: 'Chrome — Windows 10', local: 'São Paulo, BR', atual: true,  hora: 'Agora' },
            { dispositivo: 'Safari — iPhone 14',  local: 'São Paulo, BR', atual: false, hora: 'Há 2 horas' },
          ].map(({ dispositivo, local, atual, hora }) => (
            <div key={dispositivo} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <Monitor size={15} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{dispositivo}</p>
                <p className="text-xs text-slate-400">{local} · {hora}</p>
              </div>
              {atual
                ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Sessão atual</span>
                : <button className="text-xs text-red-500 hover:text-red-700 font-medium">Encerrar</button>
              }
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all">
          {saved ? <><CheckCircle2 size={14} /> Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}

function SecaoAparencia() {
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const temas = [
    {
      key: 'claro' as const, label: 'Claro', icon: Sun,
      preview: (
        <div className="w-full h-16 rounded-xl border border-slate-200 bg-white flex flex-col gap-1 p-2 overflow-hidden">
          <div className="h-2 w-16 bg-slate-200 rounded-full" />
          <div className="h-2 w-10 bg-slate-100 rounded-full" />
          <div className="flex gap-1 mt-1">
            <div className="h-5 flex-1 bg-blue-100 rounded-lg" />
            <div className="h-5 flex-1 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ),
    },
    {
      key: 'escuro' as const, label: 'Escuro', icon: Moon,
      preview: (
        <div className="w-full h-16 rounded-xl border border-slate-700 bg-slate-900 flex flex-col gap-1 p-2 overflow-hidden">
          <div className="h-2 w-16 bg-slate-600 rounded-full" />
          <div className="h-2 w-10 bg-slate-700 rounded-full" />
          <div className="flex gap-1 mt-1">
            <div className="h-5 flex-1 bg-blue-900 rounded-lg" />
            <div className="h-5 flex-1 bg-slate-700 rounded-lg" />
          </div>
        </div>
      ),
    },
    {
      key: 'automatico' as const, label: 'Automático', icon: Monitor,
      preview: (
        <div className="w-full h-16 rounded-xl border border-slate-300 overflow-hidden flex">
          <div className="flex-1 bg-white flex flex-col gap-1 p-2">
            <div className="h-1.5 w-8 bg-slate-200 rounded-full" />
            <div className="h-1.5 w-5 bg-slate-100 rounded-full" />
          </div>
          <div className="flex-1 bg-slate-900 flex flex-col gap-1 p-2">
            <div className="h-1.5 w-8 bg-slate-600 rounded-full" />
            <div className="h-1.5 w-5 bg-slate-700 rounded-full" />
          </div>
        </div>
      ),
    },
  ]

  function salvar() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Tema da Interface" icon={Palette}>
        <div className="grid grid-cols-3 gap-4">
          {temas.map(({ key, label, icon: Icon, preview }) => (
            <button key={key} onClick={() => setTheme(key)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                theme === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
              }`}>
              {preview}
              <div className="flex items-center gap-1.5 mt-3">
                <Icon size={14} className={theme === key ? 'text-blue-600' : 'text-slate-400'} />
                <span className={`text-sm font-semibold ${theme === key ? 'text-blue-700' : 'text-slate-600'}`}>{label}</span>
                {theme === key && <CheckCircle2 size={13} className="text-blue-500 ml-auto" />}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          O tema é aplicado imediatamente e salvo para a próxima sessão.
        </p>
      </SectionCard>
      <div className="flex justify-end gap-3">
        <button onClick={salvar}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all">
          {saved ? <><CheckCircle2 size={14} /> Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}


// ─── Documentação ─────────────────────────────────────────────────────────────

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
        {title}
      </h4>
      {children}
    </div>
  )
}

function DocCard({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100" style={{ background: color + '10' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color }}>
          <Icon size={15} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="px-5 py-4 text-sm text-slate-600 leading-relaxed">{children}</div>
    </div>
  )
}

function DocTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-100">
      {rows.map(([label, value], i) => (
        <div key={i} className={`flex gap-4 px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
          <span className="text-xs font-semibold text-slate-500 w-48 flex-shrink-0">{label}</span>
          <span className="text-xs text-slate-700 font-mono">{value}</span>
        </div>
      ))}
    </div>
  )
}

function DocCode({ children }: { children: string }) {
  return (
    <pre className="text-xs font-mono bg-slate-900 text-green-300 rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre">
      {children}
    </pre>
  )
}

function DocList({ items, check }: { items: string[]; check?: boolean }) {
  return (
    <ul className="space-y-1.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
          {check
            ? <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
            : <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function DocAlert({ type, children }: { type: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: { bg: '#eff6ff', border: '#bfdbfe', icon: '💡', text: '#1e40af' },
    warn: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', text: '#92400e' },
    tip:  { bg: '#f0fdf4', border: '#bbf7d0', icon: '✅', text: '#14532d' },
  }
  const s = styles[type]
  return (
    <div className="rounded-xl px-4 py-3 text-xs leading-relaxed mt-3"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span className="mr-1.5">{s.icon}</span>{children}
    </div>
  )
}

function SecaoDocumentacao() {
  const [aba, setAba] = useState<string>('visao')

  const abas = [
    { key: 'visao',        label: '📋 Visão Geral'   },
    { key: 'arquitetura',  label: '🏗️ Arquitetura'   },
    { key: 'requisitos',   label: '⚙️ Requisitos'     },
    { key: 'instalacao',   label: '🚀 Instalação'     },
    { key: 'manual',       label: '📖 Manual do Usuário' },
    { key: 'funcionalidades', label: '✨ Funcionalidades' },
    { key: 'tecnica',      label: '🔧 Técnica (API)'  },
    { key: 'deploy',       label: '📦 Deploy'         },
    { key: 'manutencao',   label: '🛠️ Manutenção'    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f766e 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <BookOpen size={26} className="text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Documentação Oficial</p>
              <h2 className="text-white text-2xl font-black mt-0.5">CHUÁ Dashboard</h2>
              <p className="text-white/70 text-sm mt-1">
                Plataforma de Solicitações e Gestão de Dashboards Operacionais · Versão 1.0 · 2026
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-5 flex-wrap">
            {abas.map(a => (
              <button key={a.key} onClick={() => setAba(a.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={aba === a.key
                  ? { background: '#fff', color: '#1e3a8a' }
                  : { background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── VISÃO GERAL ─────────────────────────────────────────────────────────── */}
      {aba === 'visao' && (
        <div className="space-y-4">
          <DocCard icon={HelpCircle} title="Por que o CHUÁ foi criado?" color="#1d4ed8">
            <p className="mb-3">
              O <strong>CHUÁ</strong> nasceu da necessidade real de estruturar e centralizar o processo de solicitação
              de dashboards dentro de organizações. Antes da plataforma, as solicitações chegavam de forma desestruturada
              — via e-mail, mensagens ou reuniões — sem documentação, sem rastreabilidade e sem um fluxo de aprovação claro.
            </p>
            <p className="mb-3">
              O resultado era sempre o mesmo: dashboards construídos sem briefing claro, retrabalho constante,
              perda de contexto entre quem solicitou e quem desenvolveu, e impossibilidade de auditar decisões tomadas.
            </p>
            <p>
              O CHUÁ resolve isso com um fluxo de três etapas: o <strong>Canvas</strong> estrutura o briefing,
              o <strong>Kanban</strong> acompanha o desenvolvimento, e o <strong>Formulário</strong> registra formalmente
              a solicitação para auditoria e rastreabilidade histórica.
            </p>
          </DocCard>

          <DocCard icon={Users} title="Para quem é o CHUÁ?" color="#7c3aed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
              {[
                { role: 'Solicitante', desc: 'Qualquer colaborador que precisa de um dashboard. Usa o Canvas para estruturar o pedido sem precisar saber de tecnologia.', color: '#1d4ed8' },
                { role: 'Analista/Dev', desc: 'Equipe que recebe e constrói os dashboards. Acompanha o fluxo pelo Kanban e acessa o briefing completo de cada solicitação.', color: '#0f766e' },
                { role: 'Gestor/Diretor', desc: 'Acompanha o portfólio de dashboards em desenvolvimento, aprova solicitações e tem visão executiva do progresso.', color: '#dc2626' },
              ].map(({ role, desc, color }) => (
                <div key={role} className="rounded-xl p-4 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>
                    {role[0]}
                  </div>
                  <p className="text-xs font-bold text-slate-700 mb-1">{role}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </DocCard>

          <DocCard icon={Zap} title="Problema que resolve — dores e soluções" color="#f59e0b">
            <div className="space-y-2">
              {[
                ['Solicitações sem estrutura chegam por e-mail ou WhatsApp', 'Canvas Operacional com 9 etapas guiadas garante briefing completo'],
                ['Sem rastreabilidade: ninguém sabe em que etapa está o dashboard', 'Kanban com datas automáticas de passagem por cada coluna'],
                ['Retrabalho por falta de alinhamento entre solicitante e desenvolvedor', 'Briefing completo vinculado ao card garante contexto sempre disponível'],
                ['Impossível auditar por que um dashboard foi criado ou modificado', 'Cada card tem resumo executivo, observações e rastreabilidade de datas'],
                ['Logo e identidade da empresa não refletem na plataforma', 'Upload de logo com reflexo em tempo real em toda a interface'],
              ].map(([problema, solucao]) => (
                <div key={problema} className="rounded-xl p-3 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-xs mt-0.5 flex-shrink-0">✗</span>
                    <span className="text-xs text-slate-500">{problema}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 text-xs mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-xs text-slate-700 font-medium">{solucao}</span>
                  </div>
                </div>
              ))}
            </div>
          </DocCard>

          <DocCard icon={LayoutGrid} title="Fluxo completo da plataforma" color="#0f766e">
            <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
              {[
                { step: '1', label: 'Canvas', desc: 'Solicitante preenche o briefing em 9 etapas', color: '#1d4ed8' },
                { step: '→', label: '', desc: '', color: 'transparent' },
                { step: '2', label: 'Kanban', desc: 'Card criado automaticamente entra na coluna Entrada', color: '#0369a1' },
                { step: '→', label: '', desc: '', color: 'transparent' },
                { step: '3', label: 'Desenvolvimento', desc: 'Analista move o card pelas etapas do fluxo', color: '#0f766e' },
                { step: '→', label: '', desc: '', color: 'transparent' },
                { step: '4', label: 'Concluído', desc: 'Dashboard entregue com histórico completo', color: '#059669' },
              ].map(({ step, label, desc, color }, i) => (
                step === '→'
                  ? <div key={i} className="text-slate-300 text-xl font-bold hidden md:block">→</div>
                  : (
                    <div key={i} className="flex-1 rounded-xl p-3 text-center" style={{ background: color + '12', border: `1px solid ${color}30` }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white mx-auto mb-2" style={{ background: color }}>{step}</div>
                      <p className="text-xs font-bold text-slate-700">{label}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{desc}</p>
                    </div>
                  )
              ))}
            </div>
          </DocCard>
        </div>
      )}

      {/* ── ARQUITETURA ─────────────────────────────────────────────────────────── */}
      {aba === 'arquitetura' && (
        <div className="space-y-4">
          <DocCard icon={Layers} title="Visão geral da arquitetura" color="#7c3aed">
            <p className="mb-4">
              O CHUÁ segue uma arquitetura <strong>monorepo full-stack</strong> com separação clara entre frontend (SPA React)
              e backend (API REST Node.js), servidos por um Nginx como reverse proxy em uma VM Ubuntu.
            </p>
            <DocCode>{`┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Cliente)                   │
│              React 18 SPA — Vite Build                  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   NGINX (Reverse Proxy)                 │
│  /           → /apps/web/dist (estático)                │
│  /api        → localhost:3001 (API)                     │
│  /auth       → localhost:3001 (Auth)                    │
│  /uploads/   → /dashboard/uploads/ (arquivos)           │
└─────────────────────┬───────────────────────────────────┘
                      │ Proxy
                      ▼
┌─────────────────────────────────────────────────────────┐
│              NODE.JS API (PM2 — porta 3001)             │
│         Express + TypeScript + Zod + Multer             │
│  /auth/login   /auth/register   /auth/refresh           │
│  /api/canvases  /api/items  /api/upload/logo            │
└─────────────────────┬───────────────────────────────────┘
                      │ Pool (pg)
                      ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL 16 (localhost:5432)                 │
│  Schema: app_auth  →  users, sessions, refresh_tokens   │
│  Schema: public    →  canvases, canvas_items            │
└─────────────────────────────────────────────────────────┘`}</DocCode>
          </DocCard>

          <DocCard icon={GitBranch} title="Estrutura de pastas do projeto" color="#0369a1">
            <DocCode>{`dashboard/
├── apps/
│   ├── api/                     # Backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts   # POST /auth/login, /register, /refresh
│   │   │   │   └── auth.service.ts  # bcrypt + JWT
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts          # Middleware JWT (Bearer token)
│   │   │   ├── modules/
│   │   │   │   └── canvas/
│   │   │   │       ├── canvas.routes.ts
│   │   │   │       ├── canvas.queries.ts
│   │   │   │       └── canvas.schema.ts
│   │   │   ├── db.ts                # Pool pg
│   │   │   └── index.ts             # Express app + upload logo
│   │   └── package.json
│   └── web/                     # Frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── Layout.tsx        # Wrapper com Sidebar + Topbar
│       │   │   ├── Sidebar.tsx       # Menu lateral com logo dinâmica
│       │   │   └── Topbar.tsx        # Header com perfil dropdown
│       │   ├── contexts/
│       │   │   ├── AuthContext.tsx   # Estado global de autenticação
│       │   │   └── ThemeContext.tsx  # Tema claro/escuro
│       │   ├── data/
│       │   │   └── seedKanban.ts     # 40 cards de exemplo
│       │   ├── pages/               # Todas as páginas
│       │   ├── store/
│       │   │   └── kanbanStore.ts    # CRUD localStorage chua_cards
│       │   └── lib/
│       │       ├── api.ts            # Fetch autenticado
│       │       └── auth.ts           # Login/logout helpers
│       └── package.json
├── supabase/
│   └── schema_vm.sql            # Schema PostgreSQL completo
├── uploads/                     # Logos enviados via upload
├── ecosystem.config.js          # Configuração PM2
└── CLAUDE.md                    # Guia de dev para IA`}</DocCode>
          </DocCard>

          <DocCard icon={Database} title="Modelo de dados" color="#059669">
            <DocCode>{`-- Schema: app_auth
CREATE TABLE app_auth.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'user',   -- 'admin' | 'user'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Schema: public
CREATE TABLE canvases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES app_auth.users(id),
  title       TEXT NOT NULL,
  data        JSONB,                   -- briefing completo
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE canvas_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   UUID REFERENCES canvases(id) ON DELETE CASCADE,
  type        TEXT,
  content     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- LocalStorage (frontend) — chua_cards
-- KanbanCard: { id, nome, responsavel, solicitante,
--   dataEntrada, prazo, prioridade, coluna, observacoes,
--   tags[], dataAnalise, dataDesenvolvimento, dataRevisao,
--   dataConcluido, briefing: { titulo, objetivo[], indicadores[],
--   vendas[], despesas[], dre[], alertas[], decisoes[],
--   agentes[], extras, notas, resumo } }`}</DocCode>
            <DocAlert type="info">
              Os cards do Kanban são armazenados no <strong>localStorage</strong> do navegador (chave <code>chua_cards</code>).
              Para persistência em banco de dados, a migração para PostgreSQL está planejada na v2.0.
            </DocAlert>
          </DocCard>

          <DocCard icon={Shield} title="Fluxo de autenticação (JWT)" color="#dc2626">
            <DocCode>{`1. LOGIN
   POST /auth/login { email, password }
   → Valida email/senha no PostgreSQL (bcrypt)
   → Retorna { token, refreshToken, user }
   → Frontend guarda token em localStorage

2. REQUISIÇÃO AUTENTICADA
   GET /api/canvases
   Headers: { Authorization: "Bearer <token>" }
   → Middleware verifica assinatura JWT
   → Extrai userId do payload
   → Executa query filtrada por owner_id

3. REFRESH
   POST /auth/refresh { refreshToken }
   → Gera novo accessToken sem novo login
   → Refresh token tem validade de 30 dias

4. LOGOUT
   → Remove token e refreshToken do localStorage
   → Redireciona para /login`}</DocCode>
          </DocCard>
        </div>
      )}

      {/* ── REQUISITOS ──────────────────────────────────────────────────────────── */}
      {aba === 'requisitos' && (
        <div className="space-y-4">
          <DocCard icon={Server} title="Requisitos do servidor (produção)" color="#0f766e">
            <DocTable rows={[
              ['Sistema Operacional',   'Ubuntu 22.04 LTS ou 24.04 LTS (recomendado)'],
              ['CPU',                   'Mínimo 2 vCPUs (recomendado 4 vCPUs)'],
              ['Memória RAM',           'Mínimo 2 GB (recomendado 4 GB)'],
              ['Armazenamento',         'Mínimo 20 GB SSD'],
              ['Rede',                  'Porta 80 (HTTP) liberada no firewall'],
              ['Node.js',               'v20.x LTS ou superior'],
              ['PostgreSQL',            'v16 ou superior'],
              ['Nginx',                 'v1.18 ou superior'],
              ['PM2',                   'v5 ou superior (gerenciador de processos)'],
              ['npm',                   'v10 ou superior'],
            ]} />
          </DocCard>

          <DocCard icon={Code2} title="Requisitos de desenvolvimento (local)" color="#7c3aed">
            <DocTable rows={[
              ['Node.js',     'v20.x LTS (obrigatório)'],
              ['npm',         'v10+ (incluído com Node.js)'],
              ['PostgreSQL',  'v16+ rodando local ou Docker'],
              ['Git',         'v2.x para versionamento'],
              ['Editor',      'VS Code recomendado (com extensão ESLint + Tailwind CSS IntelliSense)'],
              ['Terminal',    'Bash, Zsh ou PowerShell (Windows)'],
            ]} />
            <DocAlert type="tip">
              Para desenvolvimento no Windows, recomenda-se usar <strong>WSL2</strong> (Windows Subsystem for Linux)
              com Ubuntu para garantir compatibilidade total com os scripts de build.
            </DocAlert>
          </DocCard>

          <DocCard icon={Globe} title="Requisitos do navegador (usuário final)" color="#f59e0b">
            <DocTable rows={[
              ['Google Chrome',   '≥ v100 (recomendado)'],
              ['Mozilla Firefox', '≥ v100'],
              ['Microsoft Edge',  '≥ v100 (Chromium-based)'],
              ['Safari',          '≥ v15 (macOS/iOS)'],
              ['Resolução mínima','1280 × 720 px'],
              ['JavaScript',      'Obrigatório habilitado'],
              ['LocalStorage',    'Obrigatório habilitado (usado pelo Kanban)'],
              ['Conexão',         'Necessário acesso à rede interna/VPN onde a VM está hospedada'],
            ]} />
            <DocAlert type="warn">
              O CHUÁ <strong>não funciona</strong> com JavaScript desabilitado ou em modo de navegação privada
              com localStorage bloqueado. Os cards do Kanban são armazenados localmente.
            </DocAlert>
          </DocCard>

          <DocCard icon={Layers} title="Dependências de produção (principais)" color="#0369a1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Backend</p>
                <DocTable rows={[
                  ['express',        '^4.18 — Framework HTTP'],
                  ['pg',             '^8.11 — Driver PostgreSQL'],
                  ['bcryptjs',       '^2.4 — Hash de senhas'],
                  ['jsonwebtoken',   '^9.0 — Autenticação JWT'],
                  ['multer',         '^1.4 — Upload de arquivos'],
                  ['zod',            '^3.22 — Validação de schemas'],
                  ['dotenv',         '^16.3 — Variáveis de ambiente'],
                  ['cors',           '^2.8 — Controle de CORS'],
                ]} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Frontend</p>
                <DocTable rows={[
                  ['react',          '^18 — UI library'],
                  ['react-router-dom','^6 — Roteamento SPA'],
                  ['tailwindcss',    '^3 — Utility CSS'],
                  ['recharts',       '^2 — Gráficos'],
                  ['@dnd-kit/core',  '^6 — Drag & drop'],
                  ['lucide-react',   '^0.x — Ícones'],
                  ['vite',           '^8 — Build tool'],
                  ['typescript',     '^5 — Tipagem estática'],
                ]} />
              </div>
            </div>
          </DocCard>
        </div>
      )}

      {/* ── INSTALAÇÃO ──────────────────────────────────────────────────────────── */}
      {aba === 'instalacao' && (
        <div className="space-y-4">
          <DocCard icon={Server} title="1. Preparar o servidor Ubuntu" color="#0369a1">
            <DocCode>{`# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar versões
node -v    # v20.x.x
npm -v     # v10.x.x
psql --version   # PostgreSQL 16.x
nginx -v   # nginx/1.x.x`}</DocCode>
          </DocCard>

          <DocCard icon={Database} title="2. Configurar o banco de dados" color="#059669">
            <DocCode>{`# Acessar o PostgreSQL como superusuário
sudo -u postgres psql

-- Dentro do psql:
CREATE DATABASE dashboard_db;
CREATE USER dashboard_user WITH PASSWORD 'Chua@2026!Secure';
GRANT ALL PRIVILEGES ON DATABASE dashboard_db TO dashboard_user;
\c dashboard_db
GRANT ALL ON SCHEMA public TO dashboard_user;
\q

# Aplicar o schema
psql -U dashboard_user -d dashboard_db -f supabase/schema_vm.sql

# Criar usuário admin inicial
sudo -u postgres psql -d dashboard_db -c "
INSERT INTO app_auth.users (email, full_name, password_hash, role)
VALUES ('admin@chuasa.com', 'Administrador',
  crypt('123456', gen_salt('bf')), 'admin')
ON CONFLICT DO NOTHING;"`}</DocCode>
          </DocCard>

          <DocCard icon={Code2} title="3. Instalar e buildar o projeto" color="#7c3aed">
            <DocCode>{`# Clonar o repositório
git clone https://github.com/infra-afk/Filipe06.git
cd Filipe06

# Criar arquivo de variáveis da API
cat > apps/api/.env << 'EOF'
PORT=3001
DATABASE_URL=postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db
JWT_SECRET=chua_jwt_secret_2026_ultra_secure_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
NODE_ENV=production
EOF

# Criar arquivo de variáveis do frontend
cat > apps/web/.env << 'EOF'
VITE_API_URL=
EOF

# Instalar todas as dependências
npm install

# Build completo (API TypeScript + Web Vite)
npm run build`}</DocCode>
          </DocCard>

          <DocCard icon={Zap} title="4. Iniciar com PM2" color="#f59e0b">
            <DocCode>{`# Iniciar todos os processos definidos no ecosystem.config.js
pm2 start ecosystem.config.js

# Verificar se estão rodando
pm2 list

# Salvar para reiniciar após reboot do servidor
pm2 save
pm2 startup  # Seguir as instruções exibidas

# Ver logs em tempo real
pm2 logs chua-api
pm2 logs chua-web`}</DocCode>
          </DocCard>

          <DocCard icon={Globe} title="5. Configurar Nginx" color="#dc2626">
            <DocCode>{`# Criar arquivo de configuração do site
sudo nano /etc/nginx/sites-available/chua

# Cole o conteúdo abaixo:
server {
    listen 80;
    server_name _;

    location / {
        root /home/srv_app/dashboard/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    location /uploads/ {
        alias /home/srv_app/dashboard/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass_header Authorization;
        client_max_body_size 10M;
    }

    location /auth {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_pass_header Authorization;
    }
}

# Ativar o site
sudo ln -s /etc/nginx/sites-available/chua /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`}</DocCode>
          </DocCard>
        </div>
      )}

      {/* ── MANUAL DO USUÁRIO ────────────────────────────────────────────────────── */}
      {aba === 'manual' && (
        <div className="space-y-4">
          <DocCard icon={User} title="Acesso e login" color="#1d4ed8">
            <DocSection title="Como acessar o sistema">
              <p className="text-sm text-slate-600 mb-3">
                Abra o navegador e acesse o endereço fornecido pelo administrador (ex: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">http://192.168.99.252</code>).
                Você será direcionado automaticamente para a tela de login.
              </p>
              <DocTable rows={[
                ['E-mail',   'Seu e-mail corporativo cadastrado pelo administrador'],
                ['Senha',    'Senha definida no cadastro (padrão inicial: 123456 — altere imediatamente)'],
                ['Sessão',   'Válida por 7 dias. Após expirar, faça login novamente.'],
              ]} />
            </DocSection>
          </DocCard>

          <DocCard icon={LayoutGrid} title="Canvas Operacional — Como usar" color="#1d4ed8">
            <DocSection title="O que é o Canvas?">
              <p className="text-sm text-slate-600">
                O Canvas é o ponto de partida para qualquer solicitação de dashboard. Ele guia você por 9 etapas
                para estruturar o briefing completo antes de criar o card no Kanban.
              </p>
            </DocSection>
            <DocSection title="Passo a passo">
              <div className="space-y-2">
                {[
                  ['Etapa 1 — Objetivos', 'Defina o objetivo principal do dashboard (ex: Aumentar Receita, Reduzir Churn) e para quem ele é destinado. Preencha o Título do Canvas nesta etapa.'],
                  ['Etapa 2 a 9', 'Para cada etapa, selecione os itens relevantes clicando nas sugestões (ficam em laranja quando selecionados) ou adicione itens personalizados no campo de texto.'],
                  ['Notas por etapa', 'Use o campo de notas no final de cada etapa para observações específicas, contextos ou restrições importantes.'],
                  ['Plano Final', 'Ao concluir todas as etapas, clique em "Ver Plano Final" para revisar o briefing completo antes de enviar.'],
                  ['Enviar para Kanban', 'Clique em "Enviar para Kanban" na tela de Plano Final. Um card será criado automaticamente na coluna "Entrada".'],
                ].map(([step, desc]) => (
                  <div key={step} className="rounded-xl p-3 bg-slate-50">
                    <p className="text-xs font-bold text-slate-700 mb-1">{step}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </DocSection>
          </DocCard>

          <DocCard icon={Kanban} title="Kanban — Como gerenciar cards" color="#0369a1">
            <DocSection title="Estrutura do quadro">
              <div className="grid grid-cols-5 gap-1 mb-3">
                {['Entrada', 'Em Análise', 'Em Dev.', 'Em Revisão', 'Concluído'].map((col, i) => (
                  <div key={col} className="text-center">
                    <div className="rounded-lg py-1.5 text-[10px] font-bold text-white mb-1"
                      style={{ background: ['#475569','#2563eb','#0369a1','#f59e0b','#059669'][i] }}>
                      {col}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight">
                      {['Nova solicitação','Em avaliação','Sendo construído','Validação final','Entregue'][i]}
                    </p>
                  </div>
                ))}
              </div>
            </DocSection>
            <DocSection title="Ações disponíveis">
              <DocList items={[
                'Arraste um card entre colunas para atualizar seu status (drag & drop)',
                'Clique em um card para ver o briefing completo e resumo executivo',
                'Edite responsável, prazo, prioridade e observações diretamente no card',
                'Adicione ou remova tags para facilitar a busca e filtros',
                'Arquive cards concluídos para manter o quadro limpo (histórico preservado)',
                'Use a busca no Canvas para localizar cards existentes antes de criar um novo',
              ]} check />
            </DocSection>
          </DocCard>

          <DocCard icon={Upload} title="Configurações — Logo e personalização" color="#7c3aed">
            <DocSection title="Alterar o logo da plataforma">
              <div className="space-y-2 text-sm text-slate-600">
                <p>Vá em <strong>Configurações → Empresa</strong> e localize a seção <strong>"Logo da Empresa"</strong>.</p>
                <div className="rounded-xl p-3 bg-slate-50 space-y-1">
                  <p className="text-xs font-bold text-slate-700">Para fazer upload:</p>
                  <DocList items={[
                    'Clique na área de upload ou arraste a imagem diretamente',
                    'Formatos aceitos: PNG, JPG, WEBP, SVG, GIF',
                    'Tamanho máximo: 5 MB',
                    'A logo aparecerá imediatamente na Sidebar sem recarregar a página',
                    'Para remover, clique no ícone de lixeira na prévia da imagem',
                  ]} check />
                </div>
              </div>
            </DocSection>
          </DocCard>

          <DocCard icon={Bell} title="Topbar — Perfil e notificações" color="#f59e0b">
            <DocList items={[
              'Clique no avatar (iniciais do nome) no canto superior direito para abrir o menu de perfil',
              'O menu mostra seu nome, e-mail e papel (Administrador/Analista/Visualizador)',
              'Clique em "Configurações" para ir direto para as preferências de conta',
              'Clique em "Sair da conta" para fazer logout com segurança',
              'O sino ao lado exibe notificações do sistema (badge vermelho quando há novas)',
            ]} check />
          </DocCard>
        </div>
      )}

      {/* ── FUNCIONALIDADES ─────────────────────────────────────────────────────── */}
      {aba === 'funcionalidades' && (
        <div className="space-y-4">
          {[
            {
              icon: LayoutGrid, color: '#1d4ed8', title: 'Canvas Operacional',
              items: [
                'Formulário guiado em 9 etapas: Objetivos, Indicadores, Vendas, Despesas, Devoluções, DRE, Alertas, Decisões, Agentes IA',
                'Progresso circular animado em tempo real (% de etapas concluídas)',
                'Sugestões pré-definidas por etapa + campo de item personalizado',
                'Campos extras configuráveis por etapa (audiência, frequência, limites, responsáveis)',
                'Área de notas livres por etapa para observações e restrições',
                'Navegação livre entre etapas pelo menu lateral esquerdo',
                'Busca integrada de cards existentes no Kanban (evita duplicidade)',
                'Tela de "Plano Final" com resumo completo de todas as seções',
                'Botão "Enviar para Kanban" cria card com briefing completo automaticamente',
                'Banner de logo personalizado acima do painel principal',
              ],
            },
            {
              icon: Kanban, color: '#0369a1', title: 'Kanban de Dashboards',
              items: [
                '5 colunas de fluxo: Entrada → Em Análise → Em Desenvolvimento → Em Revisão → Concluído',
                'Drag & drop entre colunas via @dnd-kit (suporte a touch e mouse)',
                'Rastreabilidade automática de datas ao mover entre colunas',
                'Cards com: nome, responsável, solicitante, prazo, prioridade (Alta/Média/Baixa) e tags',
                'Briefing completo do Canvas acessível via expansão do card',
                'Resumo executivo gerado automaticamente por IA no canvas',
                'Cores de prioridade: Alta (vermelho), Média (amarelo), Baixa (verde)',
                'Arquivamento de cards com histórico preservado',
                '40 cards de exemplo pré-carregados na primeira utilização',
                'Filtro e busca de cards por nome, responsável, solicitante ou tags',
              ],
            },
            {
              icon: BarChart2, color: '#059669', title: 'Dashboard de Indicadores',
              items: [
                'Receita Total, EBITDA, Margem Líquida, Churn, Vendas, Ticket Médio',
                'Gráficos de linha (tendência), barra (comparativo) e área (acumulado) via Recharts',
                'Cards de KPIs com variação percentual e indicador de status (ok/alerta/crítico)',
                'Tabela de vendas com cliente, canal, vendedor e valor',
                'Tabela de despesas por categoria e data',
                'DRE completo: receita bruta → deduções → receita líquida → custos → EBITDA → lucro',
                'Alertas automáticos com severidade (crítico/alto/médio)',
                'Painel de decisões com prioridade e status',
                'Status de agentes IA e histórico de execuções',
                'Painel de automações com controles liga/desliga',
              ],
            },
            {
              icon: Upload, color: '#7c3aed', title: 'Upload e Personalização',
              items: [
                'Upload de logo via drag & drop ou seleção de arquivo',
                'Formatos aceitos: PNG, JPG, WEBP, SVG, GIF (até 5 MB)',
                'Prévia imediata da imagem com object-fit: contain (sem distorção)',
                'Logo refletida em tempo real na Sidebar sem recarregar a página',
                'Logo refletida no banner do Canvas Operacional',
                'Cache busting automático para evitar imagem desatualizada',
                'Remoção de logo com um clique (restaura o logo padrão Chuá)',
                'Persistência via localStorage + arquivo físico no servidor',
                'Customização de tema claro/escuro via ThemeContext',
              ],
            },
            {
              icon: Shield, color: '#dc2626', title: 'Autenticação e Controle de Acesso',
              items: [
                'Login com e-mail e senha (hash bcrypt)',
                'Autenticação via JWT (accessToken + refreshToken)',
                'AccessToken com validade de 7 dias',
                'RefreshToken com validade de 30 dias para renovação silenciosa',
                'Middleware JWT aplicado em todas as rotas protegidas da API',
                'Três papéis: Admin (acesso total), Analista (CRUD), Visualizador (leitura)',
                'Permissões por módulo configuráveis por usuário no painel de Configurações',
                'Logout limpa todos os tokens do localStorage',
                'Redirecionamento automático para /login se token expirado',
              ],
            },
          ].map(({ icon, color, title, items }) => (
            <DocCard key={title} icon={icon} title={title} color={color}>
              <DocList items={items} check />
            </DocCard>
          ))}
        </div>
      )}

      {/* ── TÉCNICA (API) ───────────────────────────────────────────────────────── */}
      {aba === 'tecnica' && (
        <div className="space-y-4">
          <DocCard icon={Code2} title="Endpoints da API" color="#7c3aed">
            <div className="space-y-3">
              {[
                { group: 'Autenticação', color: '#1d4ed8', routes: [
                  ['POST', '/auth/register',       'Criar novo usuário',                  'Público'],
                  ['POST', '/auth/login',           'Login e geração de tokens',           'Público'],
                  ['POST', '/auth/refresh',         'Renovar accessToken',                 'Público'],
                ]},
                { group: 'Canvas', color: '#0369a1', routes: [
                  ['GET',    '/api/canvases',        'Listar canvases do usuário',          'JWT'],
                  ['POST',   '/api/canvases',        'Criar novo canvas',                   'JWT'],
                  ['GET',    '/api/canvases/:id',    'Buscar canvas por ID',               'JWT'],
                  ['PUT',    '/api/canvases/:id',    'Atualizar canvas',                   'JWT'],
                  ['DELETE', '/api/canvases/:id',    'Remover canvas',                     'JWT'],
                ]},
                { group: 'Upload', color: '#7c3aed', routes: [
                  ['POST',   '/api/upload/logo',    'Enviar logo (multipart/form-data)',   'JWT'],
                  ['DELETE', '/api/upload/logo',    'Remover logo do servidor',            'JWT'],
                ]},
                { group: 'Dashboards (mock)', color: '#059669', routes: [
                  ['GET', '/dashboard/resumo',      'KPIs consolidados',                   'JWT'],
                  ['GET', '/indicadores',           'Lista de indicadores com status',     'JWT'],
                  ['GET', '/vendas',                'Transações de vendas',               'JWT'],
                  ['GET', '/despesas',              'Lançamentos de despesas',            'JWT'],
                  ['GET', '/dre',                   'Demonstração de resultado',           'JWT'],
                  ['GET', '/alertas',               'Alertas do sistema',                 'JWT'],
                  ['GET', '/decisoes',              'Painel de decisões',                 'JWT'],
                ]},
              ].map(({ group, color, routes }) => (
                <div key={group}>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2" style={{ color }}>{group}</p>
                  <div className="rounded-xl overflow-hidden border border-slate-100">
                    {routes.map(([method, path, desc, auth], i) => (
                      <div key={path} className={`flex items-center gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <span className="text-[10px] font-black w-14 text-center px-1 py-0.5 rounded flex-shrink-0 text-white"
                          style={{ background: method === 'GET' ? '#059669' : method === 'POST' ? '#1d4ed8' : method === 'PUT' ? '#f59e0b' : '#dc2626' }}>
                          {method}
                        </span>
                        <span className="text-xs font-mono text-slate-700 w-48 flex-shrink-0">{path}</span>
                        <span className="text-xs text-slate-500 flex-1">{desc}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={auth === 'Público' ? { background: '#f0fdf4', color: '#059669' } : { background: '#eff6ff', color: '#1d4ed8' }}>
                          {auth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DocCard>

          <DocCard icon={Key} title="Exemplo de chamada autenticada" color="#0369a1">
            <DocCode>{`// Login
const res = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@chuasa.com', password: '123456' })
})
const { token, user } = await res.json()
localStorage.setItem('token', token)

// Requisição autenticada
const canvases = await fetch('/api/canvases', {
  headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
}).then(r => r.json())

// Upload de logo
const form = new FormData()
form.append('logo', file)  // file = File object do input
const upload = await fetch('/api/upload/logo', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` },
  body: form
}).then(r => r.json())
// Retorna: { url: '/uploads/logo.jpg' }`}</DocCode>
          </DocCard>

          <DocCard icon={Database} title="Variáveis de ambiente completas" color="#059669">
            <DocCode>{`# apps/api/.env
PORT=3001
DATABASE_URL=postgresql://dashboard_user:Chua@2026!Secure@localhost:5432/dashboard_db
JWT_SECRET=chua_jwt_secret_2026_ultra_secure_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
NODE_ENV=production

# apps/web/.env
VITE_API_URL=     # Vazio = usa proxy Nginx em /api`}</DocCode>
          </DocCard>
        </div>
      )}

      {/* ── DEPLOY ──────────────────────────────────────────────────────────────── */}
      {aba === 'deploy' && (
        <div className="space-y-4">
          <DocCard icon={Zap} title="Processo de deploy completo" color="#1d4ed8">
            <DocCode>{`# 1. Atualizar código do repositório
git pull origin main

# 2. Instalar dependências novas (se houver)
npm install

# 3. Build completo (API + Web)
npm run build
# Gera: apps/api/dist/ e apps/web/dist/

# 4. Restartar a API com PM2
pm2 restart chua-api

# 5. Recarregar Nginx (se config mudou)
sudo nginx -t && sudo systemctl reload nginx

# 6. Verificar status
pm2 list
pm2 logs chua-api --lines 20
curl http://localhost:3001/health`}</DocCode>
            <DocAlert type="tip">
              O frontend é estático — após o build, o Nginx serve os arquivos de <code>apps/web/dist/</code>
              diretamente, sem precisar restartar nenhum processo Node.js.
            </DocAlert>
          </DocCard>

          <DocCard icon={Server} title="Configuração do PM2 (ecosystem.config.js)" color="#0f766e">
            <DocCode>{`module.exports = {
  apps: [
    {
      name: 'chua-api',
      script: './apps/api/dist/index.js',
      instances: 2,           // Cluster mode para alta disponibilidade
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '300M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
    }
  ]
}`}</DocCode>
          </DocCard>

          <DocCard icon={Globe} title="Nginx — Configuração completa" color="#dc2626">
            <DocCode>{`server {
    listen 80;
    server_name _;

    # Servir o frontend React (SPA)
    location / {
        root /home/srv_app/dashboard/apps/web/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Servir uploads (logos, imagens)
    location /uploads/ {
        alias /home/srv_app/dashboard/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para a API Node.js
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass_header Authorization;
        client_max_body_size 10M;
    }

    # Proxy para rotas de autenticação
    location /auth {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_pass_header Authorization;
    }
}`}</DocCode>
          </DocCard>

          <DocCard icon={CheckCircle2} title="Checklist de deploy" color="#059669">
            <div className="space-y-1.5">
              {[
                ['Variáveis de ambiente corretas em apps/api/.env', true],
                ['Build executado sem erros (npm run build)', true],
                ['API responde em /health (HTTP 200)', true],
                ['Nginx sem erros de sintaxe (nginx -t)', true],
                ['PM2 mostra chua-api como online', true],
                ['Login funcional na URL de produção', true],
                ['Upload de logo funcionando', true],
                ['Cards do Kanban carregando', true],
                ['Permissões de diretório /uploads/ corretas (chmod o+rX)', true],
              ].map(([item, ok]) => (
                <div key={item as string} className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{item as string}</span>
                </div>
              ))}
            </div>
          </DocCard>
        </div>
      )}

      {/* ── MANUTENÇÃO ──────────────────────────────────────────────────────────── */}
      {aba === 'manutencao' && (
        <div className="space-y-4">
          <DocCard icon={RefreshCcw} title="Comandos de manutenção diária" color="#0369a1">
            <DocCode>{`# Verificar status geral
pm2 list
systemctl status nginx
systemctl status postgresql

# Ver logs da API (últimas 50 linhas)
pm2 logs chua-api --lines 50

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verificar uso de disco
df -h
du -sh /home/srv_app/dashboard/uploads/

# Verificar uso de memória
free -h
pm2 monit`}</DocCode>
          </DocCard>

          <DocCard icon={Database} title="Backup do banco de dados" color="#059669">
            <DocCode>{`# Backup manual do banco
pg_dump -U dashboard_user -d dashboard_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U dashboard_user -d dashboard_db < backup_20260612.sql

# Backup automatizado via cron (diário às 2h)
# Adicionar ao crontab: crontab -e
0 2 * * * pg_dump -U dashboard_user -d dashboard_db > \
  /home/srv_app/backups/db_$(date +\%Y\%m\%d).sql

# Backup dos uploads (logos)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz \
  /home/srv_app/dashboard/uploads/`}</DocCode>
          </DocCard>

          <DocCard icon={AlertCircle} title="Troubleshooting — Problemas comuns" color="#dc2626">
            <div className="space-y-3">
              {[
                {
                  problema: 'API retorna 502 Bad Gateway',
                  solucao: 'pm2 restart chua-api — verificar se a porta 3001 está em uso (lsof -i:3001)',
                  cmd: 'pm2 restart chua-api && pm2 logs chua-api',
                },
                {
                  problema: 'Frontend retorna 403 Forbidden',
                  solucao: 'Problema de permissões no diretório do dist',
                  cmd: 'sudo chmod o+x /home/srv_app && sudo chmod -R o+rX /home/srv_app/dashboard/apps/web/dist',
                },
                {
                  problema: 'Upload de imagem falha (413)',
                  solucao: 'client_max_body_size muito pequeno no Nginx',
                  cmd: '# Adicionar em /etc/nginx/sites-available/chua:\nclient_max_body_size 10M;',
                },
                {
                  problema: 'Cards do Kanban desapareceram',
                  solucao: 'localStorage foi limpo (troca de navegador ou modo privado). O seed automático recria os 40 cards de exemplo.',
                  cmd: '# Recarregar a página — initSeedCards() roda no carregamento',
                },
                {
                  problema: 'Login falha com credenciais corretas',
                  solucao: 'Verificar conexão com o banco PostgreSQL',
                  cmd: 'sudo systemctl status postgresql\ncurl http://localhost:3001/health',
                },
              ].map(({ problema, solucao, cmd }) => (
                <div key={problema} className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-2 bg-red-50">
                    <p className="text-xs font-bold text-red-700">⚠ {problema}</p>
                  </div>
                  <div className="px-4 py-2 bg-white">
                    <p className="text-xs text-slate-600 mb-2">{solucao}</p>
                    <pre className="text-[11px] font-mono bg-slate-900 text-green-300 rounded-lg px-3 py-2 overflow-x-auto">{cmd}</pre>
                  </div>
                </div>
              ))}
            </div>
          </DocCard>

          <DocCard icon={Clock} title="Atualizações e versionamento" color="#7c3aed">
            <DocTable rows={[
              ['v1.0 — Jun/2026', 'Versão inicial: Canvas + Kanban + Auth JWT + PostgreSQL'],
              ['v1.1 — planejado', 'Upload de logo + Sidebar dinâmica + Topbar com perfil'],
              ['v2.0 — planejado', 'Migrar Kanban cards para PostgreSQL (atualmente localStorage)'],
              ['v2.1 — planejado', 'Notificações em tempo real via WebSocket'],
              ['v3.0 — planejado', 'Integração com fontes de dados reais (APIs externas)'],
            ]} />
            <DocCode>{`# Para atualizar para uma nova versão
git pull origin main
npm install          # Instalar novas dependências
npm run build        # Rebuildar
pm2 restart chua-api # Restartar API`}</DocCode>
          </DocCard>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const MENU: { key: Secao; label: string; icon: any; badge?: string }[] = [
  { key: 'empresa',       label: 'Empresa',       icon: Building2                  },
  { key: 'perfil',        label: 'Meu Perfil',    icon: User                       },
  { key: 'usuarios',      label: 'Usuários',      icon: Users,    badge: 'Admin'   },
  { key: 'notificacoes',  label: 'Notificações',  icon: Bell,     badge: '2'       },
  { key: 'integracoes',   label: 'Integrações',   icon: Database                   },
  { key: 'seguranca',     label: 'Segurança',     icon: Shield                     },
  { key: 'aparencia',     label: 'Aparência',     icon: Palette                    },
  { key: 'documentacao',  label: 'Documentação',  icon: BookOpen                   },
]

export default function Configuracoes() {
  const [secao, setSecao] = useState<Secao>('empresa')

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
        <p className="text-sm text-slate-400 mt-0.5">Gerencie empresa, usuários, permissões, notificações e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Menu lateral */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 h-fit">
          <nav className="space-y-0.5">
            {MENU.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setSecao(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  secao === key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    secao === key ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>{badge}</span>
                )}
                {secao === key && <ChevronRight size={13} className="opacity-60" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          {secao === 'empresa'      && <SecaoEmpresa />}
          {secao === 'perfil'       && <SecaoPerfil />}
          {secao === 'usuarios'     && <SecaoUsuarios />}
          {secao === 'notificacoes' && <SecaoNotificacoes />}
          {secao === 'integracoes'  && <SecaoIntegracoes />}
          {secao === 'seguranca'    && <SecaoSeguranca />}
          {secao === 'aparencia'    && <SecaoAparencia />}
          {secao === 'documentacao' && <SecaoDocumentacao />}
        </div>
      </div>
    </div>
  )
}
