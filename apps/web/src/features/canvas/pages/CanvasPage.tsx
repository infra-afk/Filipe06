import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react'
import { useCanvas } from '../hooks/useCanvas'
import CanvasBoard from '../components/CanvasBoard'

export default function CanvasPage() {
  const { canvasId } = useParams<{ canvasId: string }>()
  const navigate = useNavigate()
  const { canvas, loading, saving, error, addItem, removeItem } = useCanvas(canvasId!)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !canvas) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-700">Não foi possível carregar o canvas</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={() => navigate('/canvases')}
          className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Topbar do canvas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/canvases')}
            aria-label="Voltar para lista de canvases"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{canvas.name}</h1>
            {canvas.description && (
              <p className="text-xs text-slate-400 mt-0.5">{canvas.description}</p>
            )}
          </div>
        </div>

        {saving && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Save size={13} className="animate-pulse" />
            Salvando...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <CanvasBoard
        canvas={canvas}
        onAddItem={(sectionId, title, description) => addItem(sectionId, title, description)}
        onDeleteItem={(itemId, sectionId) => removeItem(itemId, sectionId)}
      />
    </div>
  )
}
