import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div 
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--background)', // Enforces your unified surface color
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* Our newly styled animated Navbar */}
      <Navbar />
      
      {/* Central Viewport Grid matching utilities.css layout bounds */}
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  )
}