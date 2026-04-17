import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../lib/auth'

interface Props {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: Props) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}