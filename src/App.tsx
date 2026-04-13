import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { StatsPage } from './pages/StatsPage'
import { ResearchersPage } from './pages/ResearchersPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { ComparisonPage } from './pages/ComparisonPage'
import { MapPage } from './pages/MapPage'
import { ThemesPage } from './pages/ThemesPage'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'
import { useAuthStore } from './stores/authStore'
import './i18n'

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
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
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
