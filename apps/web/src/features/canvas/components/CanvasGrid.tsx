import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import CanvasSectionComp from './CanvasSection'
import type { Canvas } from '../types'

interface Props {
  canvas: Canvas
  onAddItem: (sectionId: string, title: string, description: string) => void
  onEditItem: (itemId: string, data: { title: string; description: string | null }) => void
  onDeleteItem: (itemId: string, sectionId: string) => void
  onReorder: (sectionId: string, oldIndex: number, newIndex: number) => void
}

const ROW1_KEYS = ['objetivos', 'indicadores', 'pessoas', 'decisoes']
const ROW2_KEYS = ['dados']
const ROW3_KEYS = ['analises', 'alertas', 'agentes', 'automacoes']

export default function CanvasGrid({ canvas, onAddItem, onEditItem, onDeleteItem, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const sections = canvas.sections || []

  function getSectionsByKeys(keys: string[]) {
    return keys.map(k => sections.find(s => s.key === k)).filter(Boolean) as typeof sections
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    for (const section of sections) {
      const items = section.items
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(section.id, oldIndex, newIndex)
        return
      }
    }
  }

  function renderRow(keys: string[], extraClass = '') {
    const rowSections = getSectionsByKeys(keys)
    if (rowSections.length === 0) return null
    return (
      <div className={`grid gap-4 ${extraClass}`} style={{ gridTemplateColumns: `repeat(${rowSections.length}, minmax(0, 1fr))` }}>
        {rowSections.map(section => (
          <CanvasSectionComp
            key={section.id}
            section={section}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        ))}
      </div>
    )
  }

  const dadosSection = sections.find(s => s.key === 'dados')

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {renderRow(ROW1_KEYS)}

        {dadosSection && (
          <CanvasSectionComp
            section={{ ...dadosSection, items: dadosSection.items }}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        )}

        {renderRow(ROW3_KEYS)}

        {/* Seções extras não mapeadas */}
        {(() => {
          const mapped = [...ROW1_KEYS, ...ROW2_KEYS, ...ROW3_KEYS]
          const extras = sections.filter(s => !mapped.includes(s.key))
          if (!extras.length) return null
          return (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(extras.length, 4)}, minmax(0, 1fr))` }}>
              {extras.map(section => (
                <CanvasSectionComp
                  key={section.id}
                  section={section}
                  onAddItem={onAddItem}
                  onEditItem={onEditItem}
                  onDeleteItem={onDeleteItem}
                />
              ))}
            </div>
          )
        })()}
      </div>
    </DndContext>
  )
}
