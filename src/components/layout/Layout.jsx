import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

/**
 * Layout
 * Wraps all protected pages. Renders Navbar above the page content.
 * Usage: referenced in App.jsx — no need to import in page components.
 */
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}
