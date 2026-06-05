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

const ICON_COLORS: Record<string, { bg: string; text: string }> = {
  Target:      { bg: '#eff6ff', text: '#2563eb' },
  BarChart2:   { bg: '#f0fdf4', text: '#16a34a' },
  Users:       { bg: '#fdf4ff', text: '#9333ea' },
  CheckSquare: { bg: '#fff7ed', text: '#ea580c' },
  Database:    { bg: '#f0f9ff', text: '#0284c7' },
  LineChart:   { bg: '#f0fdf4', text: '#059669' },
  Bell:        { bg: '#fefce8', text: '#ca8a04' },
  Bot:         { bg: '#faf5ff', text: '#7c3aed' },
  Zap:         { bg: '#fff7ed', text: '#d97706' },
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
  const iconColor = ICON_COLORS[section.icon || 'Target'] || ICON_COLORS['Target']
  const itemIds = section.items.map(i => i.id)

  const { setNodeRef, isOver } = useDroppable({ id: section.id })

  return (
    <div className={`canvas-panel flex flex-col transition-all duration-200 ${
      isOver ? 'ring-2 ring-blue-300 ring-offset-1' : ''
    }`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconColor.bg }}>
              <Icon size={17} style={{ color: iconColor.text }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 truncate">{section.title}</h3>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 flex-shrink-0 leading-none">
                  {section.items.length}
                </span>
              </div>
              {section.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">{section.description}</p>
              )}
            </div>
          </div>
          <button
            aria-label={`Adicionar item em ${section.title}`}
            onClick={() => setAddModal(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0 hover:scale-110"
            style={{ background: iconColor.bg, color: iconColor.text }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100" />

      {/* Items */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-1.5 min-h-[56px]">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {section.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 text-center">
              <p className="text-[11px] text-slate-300 font-medium">Nenhum item ainda</p>
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
