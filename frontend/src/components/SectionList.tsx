import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SectionWithLinks, SectionOrder, Link } from '../types'
import SortableSection from './SortableSection'

interface SectionListProps {
  sections: SectionWithLinks[]
  onSectionReorder: (orders: SectionOrder[]) => void
  onEditLink: (link: Link) => void
  onEditSection: (section: SectionWithLinks) => void
}

function SectionList({ sections, onSectionReorder, onEditLink, onEditSection }: SectionListProps) {
  const [items, setItems] = useState<SectionWithLinks[]>(sections)
  const [activeId, setActiveId] = useState<string | number | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync with parent sections when they change
  useEffect(() => {
    setItems(sections)
  }, [sections])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id && over) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update local state immediately for smooth UX
        setItems(newItems)

        // Create new order array
        const newOrders: SectionOrder[] = newItems.map((item, index) => ({
          id: item.id,
          order: index
        }))

        // Send to parent
        onSectionReorder(newOrders)
      }
    }
  }

  // Find the active section for drag overlay
  const activeSection = activeId ? items.find(item => item.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {items.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              onEditLink={onEditLink}
              onEditSection={onEditSection}
              isDragging={activeId === section.id}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeSection ? (
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 overflow-hidden transform scale-105">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-100">{activeSection.name}</h3>
                <div className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                  {activeSection.links.length}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default SectionList