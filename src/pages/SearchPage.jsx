import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { useUserSearch } from '../hooks/useUsers.js'
import { useSendFriendRequest } from '../hooks/useFriends.js'
import Avatar from '../components/common/Avatar.jsx'
import Loader from '../components/common/Loader.jsx'

/**
 * SearchPage  — Owner: A
 * GET /api/users/search/:username
 *
 * TODO (A):
 *  - Debounce the search input (300ms) to reduce API calls
 *  - Show "already friends" state vs "request sent" state
 */
export default function SearchPage() {
  const navigate    = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [query, setQuery]     = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data: results, isLoading } = useUserSearch(submitted)
  const { mutate: sendRequest } = useSendFriendRequest()

  const handleSearch = (e) => {
    e.preventDefault()
    setSubmitted(query.trim())
  }

  const resultList = Array.isArray(results) ? results : results ? [results] : []

  return (
    <div style={{ maxWidth: 600 }}>
      <h5 className="mb-3">Search Users</h5>
      <form className="d-flex gap-2 mb-4" onSubmit={handleSearch}>
        <input
          className="form-control"
          placeholder="Search by username…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {isLoading && <Loader size="sm" />}

      {resultList.map((u) => (
        <div key={u.userId} className="d-flex align-items-center gap-2 card card-body mb-2">
          <Avatar username={u.username} size={36} />
          <span
            className="flex-grow-1"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${u.userId}`)}
          >
            {u.username}
          </span>
          {u.userId !== currentUser?.userId && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => sendRequest({ userId: currentUser.userId, friendId: u.userId })}
            >
              + Add Friend
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
