import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { useAuthStore } from './stores/authStore'
import './i18n'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const StatsPage = lazy(() => import('./pages/StatsPage').then(m => ({ default: m.StatsPage })))
const ResearchersPage = lazy(() => import('./pages/ResearchersPage').then(m => ({ default: m.ResearchersPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage').then(m => ({ default: m.EditProfilePage })))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage').then(m => ({ default: m.ComparisonPage })))
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const ThemesPage = lazy(() => import('./pages/ThemesPage').then(m => ({ default: m.ThemesPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { initialize, handleSessionExpiry, user } = useAuthStore()

  useEffect(() => {
    void initialize()
  }, [initialize])

  // Global fetch interceptor for 401 responses
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)
      if (response.status === 401 && useAuthStore.getState().user) {
        useAuthStore.getState().handleSessionExpiry()
      }
      return response
    }
    return () => {
      window.fetch = originalFetch
    }
  }, [handleSessionExpiry, user])

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><LoadingSpinner /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/researchers" element={<ResearchersPage />} />
          <Route path="/researchers/:id" element={<ProfilePage />} />
          <Route path="/researchers/:id/edit" element={<EditProfilePage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        </Route>
      </Routes>
    </Suspense>
  )
}
