import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RequireAdmin } from './components/RequireAdmin'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import UsersPage from './pages/Users'
import ListingsPage from './pages/Listings'
import RentalsPage from './pages/Rentals'
import FinesPage from './pages/Fines'
import DamagePage from './pages/Damage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected admin routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAdmin>
              <UsersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/listings"
          element={
            <RequireAdmin>
              <ListingsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/rentals"
          element={
            <RequireAdmin>
              <RentalsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/fines"
          element={
            <RequireAdmin>
              <FinesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/damage"
          element={
            <RequireAdmin>
              <DamagePage />
            </RequireAdmin>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
