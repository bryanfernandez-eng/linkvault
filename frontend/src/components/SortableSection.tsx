"use client"

import type React from "react"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronRight, Settings, GripVertical, ExternalLink, Pin, Copy, Edit3 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SectionWithLinks, Link } from "../types"
import { deleteSection, updateLink } from "../services/api"

interface SortableSectionProps {
  section: SectionWithLinks
  onEditLink: (link: Link) => void
  onEditSection: (section: SectionWithLinks) => void
  isDragging?: boolean
}

function SortableSection({ section, onEditLink, onEditSection, isDragging = false }: SortableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const deleteMutation = useMutation({
    mutationFn: () => deleteSection(section.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: ({ linkId, isPinned }: { linkId: number; isPinned: boolean }) =>
      updateLink(linkId, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })

  const handleDelete = () => {
    if (window.confirm(`Delete section "${section.name}"? All links will be moved to Uncategorized.`)) {
      deleteMutation.mutate()
    }
    setShowMenu(false)
  }

  const handleTogglePin = (link: Link, e: React.MouseEvent) => {
    e.stopPropagation()
    togglePinMutation.mutate({ linkId: link.id, isPinned: link.is_pinned })
  }

  const handleCopyLink = async (link: Link, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(link.url)
      setCopiedLinkId(link.id)
      setTimeout(() => setCopiedLinkId(null), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleEditClick = (link: Link, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditLink(link)
  }

  const canDelete = section.name !== "Uncategorized"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-900/60 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/20 overflow-hidden transition-all duration-200 ${
        isDragging || isSortableDragging ? 'shadow-2xl border-purple-400/40 scale-105' : ''
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-300 p-1 rounded-md hover:bg-slate-700/50 transition-all touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-3 text-left group">
            <div className="p-1 rounded-md group-hover:bg-slate-700/50 transition-all">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-300" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{section.name}</h3>
            <div className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
              {section.links.length}
            </div>
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all"
          >
            <Settings className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-20 min-w-32">
                <button
                  onClick={() => {
                    onEditSection(section)
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Edit Section
                </button>
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    Delete Section
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-5">
          {section.links.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-300 text-lg font-medium">No links yet</p>
              <p className="text-slate-500 text-sm">Add your first link to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.links.map((link) => (
                <div
                  key={link.id}
                  className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 hover:shadow-lg hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:to-slate-900/80 transition-all duration-200 cursor-pointer"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  {/* Pin Button - Always Visible */}
                  <button
                    onClick={(e) => handleTogglePin(link, e)}
                    className={`absolute top-3 right-3 p-1.5 rounded-md transition-all ${
                      link.is_pinned
                        ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
                        : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300"
                    }`}
                    title={link.is_pinned ? "Unpin link" : "Pin link"}
                  >
                    <Pin className={`h-3.5 w-3.5 ${link.is_pinned ? "fill-current" : ""}`} />
                  </button>

                  {/* Quick Actions Toolbar - Appears on Hover */}
                  <div className="absolute top-3 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={(e) => handleCopyLink(link, e)}
                      className={`p-1.5 rounded-md transition-all ${
                        copiedLinkId === link.id
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300"
                      }`}
                      title={copiedLinkId === link.id ? "Copied!" : "Copy link"}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleEditClick(link, e)}
                      className="p-1.5 bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300 rounded-md transition-all"
                      title="Edit link"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Link Content */}
                  <div className="pr-8">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                        <ExternalLink className="w-5 h-5 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-100 text-base leading-tight mb-1 group-hover:text-purple-300 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-purple-400 truncate font-medium">
                          {link.url.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                        </p>
                      </div>
                    </div>

                    {link.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{link.description}</p>
                    )}
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
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