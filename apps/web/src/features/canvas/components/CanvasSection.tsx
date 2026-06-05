import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import {
  Target, BarChart2, Users, CheckSquare, Database,
  LineChart, Bell, Bot, Zap, Plus
} from 'lucide-react'
import CanvasItemComp from './CanvasItem'
import ItemEditorModal from './ItemEditorModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import type { CanvasSection as TCanvasSection, CanvasItem } from '../types'

const ICONS: Record<string, React.ElementType> = {
  Target, BarChart2, Users, CheckSquare, Database,
  LineChart, Bell, Bot, Zap,
}

interface Props {
  section: TCanvasSection
  onAddItem: (sectionId: string, title: string, description: string) => void
  onEditItem: (itemId: string, data: { title: string; description: string | null }) => void
  onDeleteItem: (itemId: string, sectionId: string) => void
}

export default function CanvasSection({ section, onAddItem, onEditItem, onDeleteItem }: Props) {
  const [addModal, setAddModal] = useState(false)
  const [editItem, setEditItem] = useState<CanvasItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<CanvasItem | null>(null)

  const Icon = ICONS[section.icon || ''] || Target
  const itemIds = section.items.map(i => i.id)

  const { setNodeRef, isOver } = useDroppable({ id: section.id })

  return (
    <div className={`bg-white rounded-[20px] border border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.06)] flex flex-col transition-all duration-200 ${isOver ? 'ring-2 ring-blue-200' : ''}`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 truncate">{section.title}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 flex-shrink-0">
                  {section.items.length}
                </span>
              </div>
              {section.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{section.description}</p>
              )}
            </div>
          </div>
          <button
            aria-label={`Adicionar item em ${section.title}`}
            onClick={() => setAddModal(true)}
            className="w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 transition-colors flex-shrink-0"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[60px]">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {section.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-xs text-slate-400">Adicione o primeiro item</p>
            </div>
          ) : (
            section.items.map(item => (
              <CanvasItemComp
                key={item.id}
                item={item}
                onEdit={i => setEditItem(i)}
                onDelete={i => setDeleteItem(i)}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Modals */}
      {addModal && (
        <ItemEditorModal
          sectionTitle={section.title}
          onSave={({ title, description }) => onAddItem(section.id, title, description)}
          onClose={() => setAddModal(false)}
        />
      )}
      {editItem && (
        <ItemEditorModal
          item={editItem}
          sectionTitle={section.title}
          onSave={({ title, description }) => onEditItem(editItem.id, { title, description: description || null })}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <DeleteConfirmDialog
          title={deleteItem.title}
          onConfirm={() => { onDeleteItem(deleteItem.id, section.id); setDeleteItem(null) }}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  )
}
