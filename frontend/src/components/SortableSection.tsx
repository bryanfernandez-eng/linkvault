import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Settings, GripVertical, ExternalLink } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SectionWithLinks, Link } from '../types'
import { deleteSection } from '../services/api'

interface SortableSectionProps {
  section: SectionWithLinks
  onEditLink: (link: Link) => void
  onEditSection: (section: SectionWithLinks) => void
}

function SortableSection({ section, onEditLink, onEditSection }: SortableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  
  const queryClient = useQueryClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteSection(section.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const handleDelete = () => {
    if (window.confirm(`Delete section "${section.name}"? All links will be moved to Uncategorized.`)) {
      deleteMutation.mutate()
    }
    setShowMenu(false)
  }

  const canDelete = section.name !== 'Uncategorized'

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-sm border">
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
            <span className="text-sm text-gray-500 ml-2">
              ({section.links.length} link{section.links.length !== 1 ? 's' : ''})
            </span>
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-32">
              <button
                onClick={() => {
                  onEditSection(section)
                  setShowMenu(false)
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4">
          {section.links.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">No links yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link) => (
                <div
                  key={link.id}
                  className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate mr-2">{link.title}</h4>
                    <div className="flex items-center gap-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => onEditLink(link)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                        title="Edit link"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {link.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{link.description}</p>
                  )}
                  
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SortableSection