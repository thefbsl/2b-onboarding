import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ allowedRoles }) => {
  const role = useAuthStore((state) => state.role)

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
