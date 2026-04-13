import { Outlet } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'

export function AppLayout() {
  return (
    <>
      <AppNavbar />
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
