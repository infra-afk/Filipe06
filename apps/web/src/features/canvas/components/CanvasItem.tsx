import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { CanvasItem as TCanvasItem } from '../types'

interface Props {
  item: TCanvasItem
  onEdit: (item: TCanvasItem) => void
  onDelete: (item: TCanvasItem) => void
}

export default function CanvasItem({ item, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 rounded-xl px-2.5 py-2 transition-all duration-150 ${
        isDragging
          ? 'shadow-xl scale-[1.03] rotate-1 opacity-40'
          : 'canvas-item'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar item"
        className="flex-shrink-0 text-yellow-500/50 hover:text-yellow-600 cursor-grab active:cursor-grabbing touch-none p-0.5 transition-colors"
      >
        <GripVertical size={13} />
      </button>

      <span
        className="flex-1 text-sm font-medium text-slate-800 truncate cursor-pointer select-none"
        onClick={() => onEdit(item)}
        title={item.title}
      >
        {item.title}
      </span>

      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          aria-label="Opções do item"
          onClick={() => setMenuOpen(o => !o)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-yellow-200/60 text-slate-400 hover:text-slate-600 transition-all duration-100"
        >
          <MoreHorizontal size={13} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-7 z-30 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-36 overflow-hidden">
            <button
              onClick={() => { onEdit(item); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil size={13} className="text-slate-400" />
              Editar
            </button>
            <div className="mx-2 border-t border-slate-100" />
            <button
              onClick={() => { onDelete(item); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
