import { useState } from 'react'
import {
  Building2, User, Bell, Database, Shield, Palette, Users,
  Check, Eye, EyeOff, Plus, Trash2, Mail, Phone, Globe,
  Sun, Moon, Monitor, ChevronRight, AlertCircle, CheckCircle2,
  Key, Clock, Smartphone, Upload, LayoutGrid, ShoppingCart,
  Receipt, FileText, BarChart2, Bot, Kanban, LayoutDashboard,
  RefreshCcw, Lightbulb, Send, Inbox, X, Lock, Unlock,
  UserCheck, UserX, MessageSquare, BellRing,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Secao = 'empresa' | 'perfil' | 'usuarios' | 'notificacoes' | 'integracoes' | 'seguranca' | 'aparencia'

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
  papel: 'Admin' | 'Analista' | 'Visualizador'
  ativo: boolean
  permissoes: ModuloKey[]
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

function SecaoUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioLocal[]>([
    { id: '1', nome: 'infra',        email: 'infra@chuasa.com',         papel: 'Admin',        ativo: true,  permissoes: TODOS_ACESSOS },
    { id: '2', nome: 'Filipe',       email: 'filipe@chuasa.com',        papel: 'Admin',        ativo: true,  permissoes: TODOS_ACESSOS },
    { id: '3', nome: 'Weslei Alves', email: 'weslei.alves@chuasa.com',  papel: 'Analista',     ativo: true,  permissoes: ['dashboard','canvas','kanban','indicadores','vendas','despesas','dre','alertas'] },
    { id: '4', nome: 'Ana Lima',     email: 'ana.lima@chuasa.com',      papel: 'Visualizador', ativo: false, permissoes: ACESSOS_VISUALIZADOR },
  ])
  const [permModal, setPermModal] = useState<UsuarioLocal | null>(null)
  const [adicionando, setAdicionando] = useState(false)
  const [novoNome,  setNovoNome]  = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoPapel, setNovoPapel] = useState<UsuarioLocal['papel']>('Visualizador')
  const [novasPerms, setNovasPerms] = useState<ModuloKey[]>(ACESSOS_VISUALIZADOR)

  const PAPEIS: UsuarioLocal['papel'][] = ['Admin', 'Analista', 'Visualizador']

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
    setUsuarios(p => p.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u))
  }

  function alterarPapel(id: string, papel: UsuarioLocal['papel']) {
    setUsuarios(p => p.map(u => u.id === id ? { ...u, papel } : u))
  }

  function remover(id: string) {
    setUsuarios(p => p.filter(u => u.id !== id))
  }

  function adicionar() {
    if (!novoEmail.trim()) return
    setUsuarios(p => [...p, {
      id: Date.now().toString(),
      nome: novoNome || novoEmail.split('@')[0],
      email: novoEmail,
      papel: novoPapel,
      ativo: true,
      permissoes: novasPerms,
    }])
    setNovoNome(''); setNovoEmail(''); setNovoPapel('Visualizador')
    setNovasPerms(ACESSOS_VISUALIZADOR); setAdicionando(false)
  }

  function toggleNovasPerm(key: ModuloKey) {
    setNovasPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  return (
    <>
      <div className="space-y-4">
        <SectionCard
          title={`Usuários com Acesso (${usuarios.length})`}
          icon={Users}
          action={
            !adicionando ? (
              <button
                onClick={() => setAdicionando(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
              >
                <Plus size={12} /> Novo usuário
              </button>
            ) : undefined
          }
        >
          <div className="space-y-2">
            {usuarios.map(u => (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                  u.ativo ? 'border-slate-100 hover:border-slate-200' : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: u.ativo ? 'linear-gradient(135deg,#1d4ed8,#0f766e)' : '#94a3b8' }}
                >
                  {u.nome.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{u.nome}</p>
                    {!u.ativo && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">Inativo</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>

                {/* Módulos liberados */}
                <button
                  onClick={() => setPermModal(u)}
                  className="hidden group-hover:flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-all flex-shrink-0"
                >
                  <Shield size={11} /> {u.permissoes.length} módulos
                </button>
                <span className="group-hover:hidden text-xs text-slate-400 flex-shrink-0">
                  {u.permissoes.length} módulos
                </span>

                {/* Papel */}
                <select
                  value={u.papel}
                  onChange={e => alterarPapel(u.id, e.target.value as UsuarioLocal['papel'])}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer flex-shrink-0 ${PAPEL_COR[u.papel]}`}
                >
                  {PAPEIS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {/* Ações */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => toggleAtivo(u.id)}
                    title={u.ativo ? 'Desativar' : 'Ativar'}
                    className={`p-1.5 rounded-lg transition-all ${u.ativo ? 'text-slate-300 hover:text-amber-500 hover:bg-amber-50' : 'text-slate-300 hover:text-green-500 hover:bg-green-50'}`}
                  >
                    {u.ativo ? <UserX size={13} /> : <UserCheck size={13} />}
                  </button>
                  <button
                    onClick={() => remover(u.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulário novo usuário */}
          {adicionando && (
            <div className="mt-3 border border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Novo usuário</p>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Nome">
                  <Input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome" />
                </Campo>
                <Campo label="E-mail *">
                  <Input value={novoEmail} onChange={e => setNovoEmail(e.target.value)} placeholder="email@empresa.com" type="email" />
                </Campo>
              </div>

              <Campo label="Perfil de acesso">
                <div className="flex gap-2">
                  {PAPEIS.map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        setNovoPapel(p)
                        if (p === 'Admin') setNovasPerms(TODOS_ACESSOS)
                        if (p === 'Analista') setNovasPerms(['dashboard','canvas','kanban','indicadores','vendas','despesas','dre','alertas'])
                        if (p === 'Visualizador') setNovasPerms(ACESSOS_VISUALIZADOR)
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        novoPapel === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Módulos liberados">
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {TODOS_MODULOS.map(mod => {
                    const on = novasPerms.includes(mod.key)
                    return (
                      <button
                        key={mod.key}
                        onClick={() => toggleNovasPerm(mod.key)}
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
              </Campo>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={adicionar}
                  disabled={!novoEmail.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-all"
                >
                  <Check size={13} /> Cadastrar
                </button>
                <button
                  onClick={() => setAdicionando(false)}
                  className="px-4 py-2 text-xs text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Legenda dos perfis */}
        <SectionCard title="Perfis de Acesso" icon={Shield}>
          <div className="space-y-3">
            {[
              { papel: 'Admin',        desc: 'Acesso total — pode gerenciar usuários, configurações e todos os módulos', cor: PAPEL_COR['Admin'] },
              { papel: 'Analista',     desc: 'Pode visualizar e editar dados, criar canvas e gerenciar indicadores',      cor: PAPEL_COR['Analista'] },
              { papel: 'Visualizador', desc: 'Apenas visualiza dashboards pré-configurados, sem edição',                 cor: PAPEL_COR['Visualizador'] },
            ].map(({ papel, desc, cor }) => (
              <div key={papel} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cor}`}>{papel}</span>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
              </div>
            ))}
            <p className="text-xs text-slate-400 pt-1">
              Clique em <strong>"X módulos"</strong> em qualquer usuário para personalizar os acessos individualmente.
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

// ─── Seções existentes (inalteradas) ─────────────────────────────────────────

function SecaoEmpresa() {
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-4">
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
  const [showPass, setShowPass] = useState(false)
  const [saved, setSaved] = useState(false)
  const nome = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initials = nome.slice(0, 2).toUpperCase()
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
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium">
              <Upload size={12} /> Alterar foto
            </button>
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
              <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" />
              <button onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Campo>
          <Campo label="Nova senha"><Input type="password" placeholder="••••••••" /></Campo>
          <Campo label="Confirmar nova senha"><Input type="password" placeholder="••••••••" /></Campo>
        </div>
      </SectionCard>
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all">
          {saved ? <><CheckCircle2 size={14} /> Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
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
  const [tema, setTema] = useState<'light' | 'dark' | 'auto'>('light')
  const [saved, setSaved] = useState(false)
  return (
    <div className="space-y-4">
      <SectionCard title="Tema da Interface" icon={Palette}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', label: 'Claro',      icon: Sun,     preview: 'bg-white border-slate-200' },
            { key: 'dark',  label: 'Escuro',     icon: Moon,    preview: 'bg-slate-800 border-slate-700' },
            { key: 'auto',  label: 'Automático', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-800 border-slate-300' },
          ].map(({ key, label, icon: Icon, preview }) => (
            <button key={key} onClick={() => setTema(key as any)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${tema === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`w-full h-12 rounded-xl border mb-3 ${preview}`} />
              <div className="flex items-center gap-1.5">
                <Icon size={13} className={tema === key ? 'text-blue-600' : 'text-slate-400'} />
                <span className={`text-xs font-semibold ${tema === key ? 'text-blue-700' : 'text-slate-600'}`}>{label}</span>
                {tema === key && <CheckCircle2 size={12} className="text-blue-500 ml-auto" />}
              </div>
            </button>
          ))}
        </div>
      </SectionCard>
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all">
          {saved ? <><CheckCircle2 size={14} /> Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
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
        </div>
      </div>
    </div>
  )
}
