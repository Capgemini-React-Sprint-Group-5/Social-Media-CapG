import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/index.js'
import { clearUser } from '../../store/slices/authSlice.js'

/**
 * Navbar  — Owner: A
 * Global navigation bar for all authenticated pages.
 * TODO (A): wire up notification badge count from useNotifications hook.
 */
export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user     = useSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(clearUser())
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/home">SMP</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
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
          </ul>

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              {/* TODO: replace with badge showing unread count */}
              <Link className="nav-link" to="/notifications">🔔 Notifications</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/profile/${user?.userId}`}>
                {user?.username}
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
