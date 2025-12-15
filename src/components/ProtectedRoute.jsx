import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  console.log('[ProtectedRoute] Rendering - path:', location.pathname, 'currentUser:', currentUser ? currentUser.email : 'null', 'loading:', loading)

  // Don't redirect if auth is still loading
  if (loading) {
    console.log('[ProtectedRoute] Auth loading, showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    console.log('[ProtectedRoute] No user, redirecting to /login')
    return <Navigate to="/login" replace />
  }

  console.log('[ProtectedRoute] User authenticated, rendering children')
  return children
}


