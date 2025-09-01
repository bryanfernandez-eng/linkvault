import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  const [items, setItems] = useState(sections)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update items when sections prop changes
  if (items.length !== sections.length || 
      items.some((item, index) => item.id !== sections[index]?.id)) {
    setItems(sections)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Create new order array
      const newOrders: SectionOrder[] = newItems.map((item, index) => ({
        id: item.id,
        order: index
      }))

      onSectionReorder(newOrders)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default SectionList