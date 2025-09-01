import { useQuery } from '@tanstack/react-query'
import { Link2, LogOut } from 'lucide-react'
import { getCurrentUser } from '../services/api'

interface HeaderProps {
  onLogout: () => void
}

function Header({ onLogout }: HeaderProps) {
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  })

  const user = userData?.data

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">LinkVault</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600">
                Welcome, {user.name}
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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