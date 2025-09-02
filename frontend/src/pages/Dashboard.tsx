"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pin,
  Star,
  ExternalLink,
  Copy,
  Edit3,
  Sparkles,
} from "lucide-react";
import {
  getDashboard,
  logout,
  reorderSections,
  updateLink,
} from "../services/api";
import type { SectionOrder, Link } from "../types";
import Header from "../components/Header";
import SectionList from "../components/SectionList";
import LinkModal from "../components/LinkModal";
import SectionModal from "../components/SectionModal";
import LoadingSpinner from "../components/LoadingSpinner";

function Dashboard() {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: SectionOrder[]) => reorderSections(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ linkId, isPinned }: { linkId: number; isPinned: boolean }) =>
      updateLink(linkId, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="text-center text-red-600 mt-8">
        Error loading dashboard
      </div>
    );

  const dashboardData = data?.data;
  if (!dashboardData) return null;

  const handleSectionReorder = (newOrders: SectionOrder[]) => {
    reorderMutation.mutate(newOrders);
  };

  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleTogglePin = (link: Link, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinMutation.mutate({ linkId: link.id, isPinned: link.is_pinned });
  };

  const handleCopyLink = async (link: Link, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedLinkId(link.id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCloseModals = () => {
    setIsLinkModalOpen(false);
    setIsSectionModalOpen(false);
    setEditingLink(null);
    setEditingSection(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onLogout={() => logoutMutation.mutate()} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Link</span>
          </button>
          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-3 bg-slate-800/60 text-slate-200 px-6 py-3 rounded-xl hover:bg-slate-700/60 border border-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Section</span>
          </button>
        </div>

        {/* Enhanced Pinned Links Section */}
        {dashboardData.pinned_links.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-md">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Pinned Links</h2>
              </div>
              <div className="text-sm text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
                {dashboardData.pinned_links.length} pinned
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {dashboardData.pinned_links.map((link) => {
                const [failedFavicon, setFailedFavicon] = useState(false);

                return (
                  <div
                    key={link.id}
                    className="group relative bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 border-2 border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:border-purple-400/40 transition-all duration-300 cursor-pointer transform hover:scale-105 backdrop-blur-sm"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    {/* Pin Badge - Fixed Position */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full shadow-lg">
                      <Pin className="h-4 w-4 fill-current" />
                    </div>

                    {/* Link Content */}
                    <div className="mb-4">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Enhanced favicon display */}
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-900/60 to-indigo-900/60 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-purple-500/30">
                          {link.favicon_url && !failedFavicon ? (
                            <img
                              src={link.favicon_url}
                              alt=""
                              className="w-8 h-8 object-contain"
                              onError={() => setFailedFavicon(true)}
                            />
                          ) : (
                            <Star className="w-6 h-6 text-purple-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-100 text-lg leading-tight mb-2 group-hover:text-purple-300 transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-purple-300 text-sm font-medium truncate bg-purple-900/40 px-2 py-1 rounded-md inline-block">
                            {link.url
                              .replace(/^https?:\/\//, "")
                              .replace(/^www\./, "")}
                          </p>
                        </div>
                      </div>

                      {link.description && (
                        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
                          {link.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons - Bottom of Card - Always Visible */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/30 transition-all duration-200">
                      <button
                        onClick={(e) => handleTogglePin(link, e)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/60 text-purple-300 hover:bg-purple-800/60 rounded-lg transition-all text-sm font-medium"
                        title="Unpin link"
                      >
                        <Pin className="h-3.5 w-3.5 fill-current" />
                        Unpin
                      </button>

                      <button
                        onClick={(e) => handleCopyLink(link, e)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                          copiedLinkId === link.id
                            ? "bg-green-900/60 text-green-300"
                            : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
                        }`}
                        title={
                          copiedLinkId === link.id ? "Copied!" : "Copy link"
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedLinkId === link.id ? "Copied!" : "Copy"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLink(link);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300 rounded-lg transition-all text-sm font-medium"
                        title="Edit link"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </div>

                    {/* Premium Hover Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Sections */}
        <SectionList
          sections={dashboardData.sections}
          onSectionReorder={handleSectionReorder}
          onEditLink={handleEditLink}
          onEditSection={handleEditSection}
        />

        {/* Empty State */}
        {dashboardData.sections.length === 0 &&
          dashboardData.pinned_links.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-900/60 to-indigo-900/60 rounded-2xl flex items-center justify-center">
                <ExternalLink className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">
                Welcome to LinkVault!
              </h3>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                Start organizing your links by creating your first link or
                section.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Link
                </button>
              </div>
            </div>
          )}
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
        <SectionModal section={editingSection} onClose={handleCloseModals} />
      )}
    </div>
  );
}

export default Dashboard;
