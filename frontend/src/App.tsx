import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { checkAuth } from './services/api'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuth,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  const isAuthenticated = authData?.data?.authenticated

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </div>
  )
}

export default App