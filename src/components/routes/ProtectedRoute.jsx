import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/index.js'

/**
 * ProtectedRoute
 * Wraps all authenticated routes in App.jsx.
 * Redirects to /login if no session is present in Redux (authSlice).
 */
export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
