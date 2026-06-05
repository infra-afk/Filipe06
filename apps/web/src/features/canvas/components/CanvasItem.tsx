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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 bg-[#fff7bf] border border-[#f0d94a]/60 rounded-xl px-2 py-1.5 transition-all duration-150 ${
        isDragging ? 'shadow-lg scale-[1.02] rotate-1' : 'hover:shadow-md hover:-translate-y-0.5 hover:bg-[#fff3a3]'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar item"
        className="flex-shrink-0 text-yellow-600/60 hover:text-yellow-700 cursor-grab active:cursor-grabbing touch-none p-0.5"
      >
        <GripVertical size={14} />
      </button>

      <span
        className="flex-1 text-sm font-medium text-slate-800 truncate cursor-pointer"
        onClick={() => onEdit(item)}
        title={item.title}
      >
        {item.title}
      </span>

      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          aria-label="Opções do item"
          onClick={() => setMenuOpen(o => !o)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-yellow-200/60 text-slate-500 hover:text-slate-700 transition-all"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-6 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 w-36">
            <button
              onClick={() => { onEdit(item); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Pencil size={14} className="text-slate-400" />
              Editar
            </button>
            <button
              onClick={() => { onDelete(item); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
