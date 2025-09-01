"use client"

import { useQuery } from "@tanstack/react-query"
import { Link2, LogOut } from "lucide-react"
import { getCurrentUser } from "../services/api"

interface HeaderProps {
  onLogout: () => void
}

function Header({ onLogout }: HeaderProps) {
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  })

  const user = userData?.data

  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-slate-800/50 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              LinkVault
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && <div className="text-sm text-slate-300">Welcome, {user.name}</div>}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-all duration-200 hover:bg-slate-800/50 px-3 py-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
