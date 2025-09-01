import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Settings, LogOut, Pin } from 'lucide-react'
import { getDashboard, logout, reorderSections } from '../services/api'
import { SectionOrder } from '../types'
import Header from '../components/Header'
import SectionList from '../components/SectionList'
import LinkModal from '../components/LinkModal'
import SectionModal from '../components/SectionModal'
import LoadingSpinner from '../components/LoadingSpinner'

function Dashboard() {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<any>(null)
  const [editingSection, setEditingSection] = useState<any>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      window.location.href = '/login'
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (orders: SectionOrder[]) => reorderSections(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-center text-red-600 mt-8">Error loading dashboard</div>

  const dashboardData = data?.data
  if (!dashboardData) return null

  const handleSectionReorder = (newOrders: SectionOrder[]) => {
    reorderMutation.mutate(newOrders)
  }

  const handleEditLink = (link: any) => {
    setEditingLink(link)
    setIsLinkModalOpen(true)
  }

  const handleEditSection = (section: any) => {
    setEditingSection(section)
    setIsSectionModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsLinkModalOpen(false)
    setIsSectionModalOpen(false)
    setEditingLink(null)
    setEditingSection(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => logoutMutation.mutate()} />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Link
          </button>
          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        {/* Pinned Links */}
        {dashboardData.pinned_links.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-semibold text-gray-900">Pinned Links</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.pinned_links.map((link) => (
                <div
                  key={link.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate mr-2">{link.title}</h3>
                    <button
                      onClick={() => handleEditLink(link)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
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
          </div>
        )}

        {/* Sections */}
        <SectionList
          sections={dashboardData.sections}
          onSectionReorder={handleSectionReorder}
          onEditLink={handleEditLink}
          onEditSection={handleEditSection}
        />
      </main>

      {/* Modals */}
      {isLinkModalOpen && (
        <LinkModal
          link={editingLink}
          sections={dashboardData.sections}
          onClose={handleCloseModals}
        />
      )}

      {isSectionModalOpen && (
        <SectionModal
          section={editingSection}
          onClose={handleCloseModals}
        />
      )}
    </div>
  )
}

export default Dashboard