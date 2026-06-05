import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutGrid, Loader2, Trash2, ChevronRight, Calendar } from 'lucide-react'
import { useCanvasList } from '../hooks/useCanvas'

export default function CanvasListPage() {
  const navigate = useNavigate()
  const { canvases, loading, error, createCanvas, deleteCanvas } = useCanvasList()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const canvas = await createCanvas(newName.trim())
      navigate(`/canvas/${canvas.id}`)
    } finally {
      setCreating(false)
      setShowForm(false)
      setNewName('')
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Remover este canvas permanentemente?')) return
    setDeletingId(id)
    try { await deleteCanvas(id) } finally { setDeletingId(null) }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Canvas Operacional</h1>
          <p className="page-subtitle">Monte e visualize a operação da sua empresa</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-150 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
        >
          <Plus size={16} />
          Novo canvas
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Criar novo canvas</p>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Canvas Operacional 2025..."
              maxLength={120}
              required
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              Criar
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewName('') }}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={26} className="animate-spin text-blue-400" />
        </div>
      ) : canvases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-5">
            <LayoutGrid size={32} className="text-blue-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1.5">Nenhum canvas ainda</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-xs">
            Crie seu primeiro canvas e visualize toda a operação da empresa em um único lugar.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
          >
            <Plus size={16} />
            Criar meu primeiro canvas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvases.map(canvas => (
            <div
              key={canvas.id}
              onClick={() => navigate(`/canvas/${canvas.id}`)}
              className="bg-white rounded-2xl border border-slate-100 p-5 cursor-pointer group transition-all duration-200 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 8px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.10), 0 2px 8px rgba(15,23,42,.06)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                  <LayoutGrid size={20} className="text-blue-500" />
                </div>
                <button
                  aria-label="Remover canvas"
                  onClick={e => handleDelete(canvas.id, e)}
                  disabled={deletingId === canvas.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                >
                  {deletingId === canvas.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 leading-snug">{canvas.name}</h3>
              {canvas.description && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{canvas.description}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar size={11} />
                  {fmt(canvas.created_at)}
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
