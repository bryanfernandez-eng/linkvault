"use client"

import type React from "react"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { createSection, updateSection, deleteSection } from "../services/api"
import type { SectionWithLinks, CreateSectionData, UpdateSectionData } from "../types"

interface SectionModalProps {
  section?: SectionWithLinks | null
  onClose: () => void
}

function SectionModal({ section, onClose }: SectionModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!section

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSectionData>({
    defaultValues: {
      name: "",
    },
  })

  useEffect(() => {
    if (section) {
      reset({
        name: section.name,
      })
    }
  }, [section, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateSectionData) => createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSectionData) => updateSection(section!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSection(section!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      onClose()
    },
  })

  const onSubmit = (data: CreateSectionData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Delete section "${section!.name}"? All links will be moved to Uncategorized.`)) {
      deleteMutation.mutate()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const canDelete = section && section.name !== "Uncategorized"

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">{isEditing ? "Edit Section" : "Add New Section"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-1">
              Section Name *
            </label>
            <input
              id="name"
              type="text"
              {...register("name", {
                required: "Section name is required",
                maxLength: { value: 100, message: "Name must be 100 characters or less" },
              })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter section name"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div>
              {isEditing && canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Delete Section
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
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

export default SectionModal
