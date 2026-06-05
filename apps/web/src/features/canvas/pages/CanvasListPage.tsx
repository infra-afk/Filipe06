import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutGrid, Loader2, Trash2, ChevronRight, TrendingUp } from 'lucide-react'
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
    if (!confirm('Remover este canvas?')) return
    setDeletingId(id)
    try {
      await deleteCanvas(id)
    } finally {
      setDeletingId(null)
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Canvas Operacional</h1>
          <p className="text-sm text-slate-500 mt-0.5">Seus canvases estratégicos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo canvas
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Novo canvas</h2>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome do canvas..."
              maxLength={120}
              required
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              Criar
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewName('') }}
              className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : canvases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <LayoutGrid size={28} className="text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Nenhum canvas ainda</h3>
          <p className="text-sm text-slate-400 mb-5">Crie seu primeiro canvas operacional</p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Criar canvas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvases.map(canvas => (
            <div
              key={canvas.id}
              onClick={() => navigate(`/canvas/${canvas.id}`)}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.05)] p-5 cursor-pointer hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <TrendingUp size={18} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    aria-label="Remover canvas"
                    onClick={e => handleDelete(canvas.id, e)}
                    disabled={deletingId === canvas.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {deletingId === canvas.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">{canvas.name}</h3>
              {canvas.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{canvas.description}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">{fmt(canvas.created_at)}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
