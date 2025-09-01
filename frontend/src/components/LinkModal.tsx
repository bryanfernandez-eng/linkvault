"use client"

import type React from "react"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X, Pin } from "lucide-react"
import { createLink, updateLink, deleteLink } from "../services/api"
import type { Link, SectionWithLinks, CreateLinkData, UpdateLinkData } from "../types"

interface LinkModalProps {
  link?: Link | null
  sections: SectionWithLinks[]
  onClose: () => void
}

function LinkModal({ link, sections, onClose }: LinkModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!link

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateLinkData>({
    defaultValues: {
      title: "",
      url: "",
      description: "",
      is_pinned: false,
      section_id: undefined,
    },
  })

  const isPinned = watch("is_pinned")

  useEffect(() => {
    if (link) {
      reset({
        title: link.title,
        url: link.url,
        description: link.description || "",
        is_pinned: link.is_pinned,
        section_id: link.section_id,
      })
    }
  }, [link, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateLinkData) => createLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLinkData) => updateLink(link!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink(link!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const onSubmit = (data: CreateLinkData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (window.confirm("Delete this link?")) {
      deleteMutation.mutate()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">{isEditing ? "Edit Link" : "Add New Link"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400"
              placeholder="Link title"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
              URL *
            </label>
            <input
              id="url"
              type="url"
              {...register("url", { required: "URL is required" })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400"
              placeholder="https://example.com"
            />
            {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-slate-300 mb-1">
              Section
            </label>
            <select
              id="section"
              {...register("section_id")}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100"
            >
              <option value="" className="bg-slate-800 text-slate-100">
                Select a section
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id} className="bg-slate-800 text-slate-100">
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_pinned"
              type="checkbox"
              {...register("is_pinned")}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-800/50"
            />
            <label htmlFor="is_pinned" className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Pin className={`h-4 w-4 ${isPinned ? "text-purple-400" : "text-slate-500"}`} />
              Pin to top
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Delete Link
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 border border-slate-600/50 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LinkModal
