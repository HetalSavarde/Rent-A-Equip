import { Navigate } from 'react-router-dom'
import { auth } from '../lib/auth'
import { Layout } from './Layout'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!auth.isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <Layout>{children}</Layout>
}
