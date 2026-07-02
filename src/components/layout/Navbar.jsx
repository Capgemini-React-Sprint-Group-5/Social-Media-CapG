import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/index.js'
import { clearUser } from '../../store/slices/authSlice.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import Avatar from '../common/Avatar.jsx'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user     = useSelector(selectCurrentUser)
  const userId   = user?.userId

  const { data: notifications = [] } = useNotifications(userId)
  const unreadCount = notifications.length

  const handleLogout = () => {
    dispatch(clearUser())
    navigate('/login')
  }

<<<<<<< Updated upstream
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/home">SMP</Link>
=======
  const isActiveRoute = (path) => location.pathname === path
>>>>>>> Stashed changes

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark sticky-top fade-up"
      style={{ 
        background: 'var(--primary-gradient)', 
        boxShadow: 'var(--shadow-lg)',          
        backdropFilter: 'blur(20px)',           
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '0.65rem 0',
        zIndex: 1050
      }}
    >
      {/* CHANGED FROM "container" TO "container-fluid px-4" TO EXTEND TO THE EDGES */}
      <div className="container-fluid px-4">
        
        {/* BRAND LOGO */}
        <Link 
          className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-white hover-scale" 
          to="/"
          style={{ letterSpacing: '0.5px' }}
        >
          <span style={{ fontSize: '1.4rem', animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none', display: 'inline-block' }}>
            
          </span>
          <span className="fw-extrabold" style={{ color: '#ffffff' }}>
            SocialSphere
          </span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar-toggler border-0 p-2 text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* NAVIGATION LINKS */}
        <div className="collapse navbar-collapse" id="navbarNav">
<<<<<<< Updated upstream
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Feed</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/friends">Friends</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/messages">Messages</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/groups">Groups</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">Search</Link>
            </li>
=======
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1.5">
            {[
              { path: '/', label: 'Feed', icon: 'bi-house-door-fill' },
              { path: '/friends', label: 'Friends', icon: 'bi-people-fill' },
              { path: '/messages', label: 'Messages', icon: 'bi-chat-dots-fill' },
              { path: '/groups', label: 'Groups', icon: 'bi-collection-fill' },
              { path: '/search', label: 'Search', icon: 'bi-search' }
            ].map((tab) => {
              const active = isActiveRoute(tab.path)
              return (
                <li key={tab.path} className="nav-item position-relative">
                  <Link 
                    className="nav-link fw-semibold px-3 py-2 rounded-3 text-white transition-all d-flex align-items-center gap-2"
                    to={tab.path}
                    style={{
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      opacity: active ? 1 : 0.75,
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                      e.currentTarget.style.opacity = active ? '1' : '0.75'
                    }}
                  >
                    <i className={`${tab.icon} text-white`}></i>
                    {tab.label}

                    {active && (
                      <span 
                        className="position-absolute bottom-0 start-50 translate-middle-x bg-white rounded-pill"
                        style={{
                          height: '3px',
                          width: '20px',
                          marginBottom: '-2px',
                          boxShadow: '0 2px 6px rgba(255,255,255,0.6)'
                        }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
>>>>>>> Stashed changes
          </ul>

          {/* RIGHT UTILITIES CORNER */}
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            
            {/* NOTIFICATION BELL */}
            <li className="nav-item">
              <Link 
                className="nav-link text-white p-2 d-flex align-items-center justify-content-center position-relative rounded-circle hover-scale" 
                to="/notifications"
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  backgroundColor: 'rgba(255,255,255,0.08)'
                }}
              >
                <i className={`bi bi-bell-fill fs-5 ${unreadCount > 0 ? 'text-warning' : ''}`}></i>
                {unreadCount > 0 && (
                  <span 
                    className="position-absolute translate-middle badge rounded-circle bg-danger border border-2 border-primary d-flex align-items-center justify-content-center"
                    style={{ 
                      top: '4px', 
                      right: '-4px', 
                      fontSize: '0.65rem',
                      width: '20px',
                      height: '20px'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>

            {/* PROFILE BUTTON */}
            <li className="nav-item">
              <Link 
                className="d-flex align-items-center gap-2 text-decoration-none text-white px-2.5 py-1.5 rounded-pill shadow-sm" 
                to={`/profile/${user?.userId}`}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              >
                <Avatar src={user?.profile_picture} username={user?.username} size={26} />
                <span className="fw-bold text-white small pe-1">{user?.username}</span>
              </Link>
            </li>

            {/* LOGOUT BUTTON */}
            <li className="nav-item">
              <button 
                className="btn btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1.5 border-0" 
                style={{ 
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  )
}