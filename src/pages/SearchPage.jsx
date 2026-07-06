import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { 
  useUserSearch 
} from '../hooks/useUsers.js'
import { 
  useSendFriendRequest, 
  useFriends, 
  usePendingRequests, 
  useSentRequests,
  useCancelFriendRequest,
  useAddFriend,
  useRemoveFriend 
} from '../hooks/useFriends.js'
import { useAllGroups, useJoinGroup, useLeaveGroup } from '../hooks/useGroups.js'
import Avatar from '../components/common/Avatar.jsx'
import Loader from '../components/common/Loader.jsx'

export default function SearchPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userId

  // ── Tab state ──────────────────────────────────────────────────────────
  const [searchTab, setSearchTab] = useState('users') // 'users' | 'groups'

  // ── Friends list ──────────────────────────────────────────────────────
  const {
    data: friends = [],
    isLoading: loadingFriends,
    refetch: refetchFriends,
  } = useFriends(userId)

  // ── Pending requests ─────────────────────────────────────────────────
  const {
    data: pending = [],
    isLoading: loadingPending,
    refetch: refetchPending,
  } = usePendingRequests(userId)

  const { data: sentRequests = [] } = useSentRequests(userId)
  const addFriendMutation = useAddFriend()
  const cancelFriendMutation = useCancelFriendRequest()

  // ── Mutations ────────────────────────────────────────────────────────
  const { mutate: addFriend, isPending: adding } = useAddFriend()
  const { mutate: removeFriend, isPending: removing } = useRemoveFriend()
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest()

  // ── Groups ────────────────────────────────────────────────────────────
  const { data: allGroups = [], isLoading: loadingGroups } = useAllGroups()
  const { mutate: joinGroup, isPending: joining } = useJoinGroup()
  const { mutate: leaveGroup, isPending: leaving } = useLeaveGroup()

  // ── Track which users are currently being processed ──────────────────
  const [processingUsers, setProcessingUsers] = useState(new Set())

  // ── Search ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ── User search ──────────────────────────────────────────────────────
  const {
    data: searchResults = [],
    isLoading: searching,
    isError: searchError,
  } = useUserSearch(debouncedQuery)

  // ── Group search (client-side filtering) ─────────────────────────────
  const filteredGroups = allGroups.filter((g) =>
    g.groupName.toLowerCase().includes(debouncedQuery.toLowerCase())
  )

  // ── Helper: Get user ID from any user object ──────────────────────────
  const getUserId = (user) => user?.userID ?? user?.userId ?? user?.id

  // ── Helper: Check friendship status ──────────────────────────────────
  const friendshipStatus = (targetUserId) => {
    if (Number(targetUserId) === Number(userId))
      return "self"

    const isFriend = friends.some(
      (f) => Number(f.friendId) === Number(targetUserId)
    )
    if (isFriend)
      return "friend"

    const sent = sentRequests.some(
      (r) => Number(r.userID2) === Number(targetUserId)
    )
    if (sent)
      return "sent"

    const received = pending.some(
      (r) => Number(r.userID1) === Number(targetUserId)
    )
    if (received)
      return "pending"

    return "none"
  }

  const isProcessing = (friendId) => processingUsers.has(friendId)

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSendRequest = (friendId) => {
    const status = friendshipStatus(friendId)
    if (status !== 'none') return

    setProcessingUsers(prev => new Set(prev).add(friendId))
    sendRequest(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending()
          setProcessingUsers(prev => {
            const next = new Set(prev)
            next.delete(friendId)
            return next
          })
        },
        onError: () => {
          setProcessingUsers(prev => {
            const next = new Set(prev)
            next.delete(friendId)
            return next
          })
        }
      }
    )
  }

  const handleCancelRequest = (friendId) => {
    cancelFriendMutation.mutate({
      userId,
      friendId,
    })
  }

  const handleJoinGroup = (groupId) => {
    joinGroup({ groupId, userId })
  }

  const handleLeaveGroup = (groupId) => {
    if (window.confirm('Leave this group?')) {
      leaveGroup({ groupId, userId })
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid page-container" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-search text-primary fs-2"></i>
        <h4 className="mb-0 fw-bold">Search</h4>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder={`Search ${searchTab === 'users' ? 'users by username...' : 'groups by name...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary border-start-0"
              onClick={() => setSearchQuery('')}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Tabs – Pill style */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 rounded-pill px-4 ${
              searchTab === 'users' ? 'active bg-primary text-white' : 'text-muted bg-light'
            }`}
            onClick={() => setSearchTab('users')}
          >
            <i className="bi bi-people"></i>
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 rounded-pill px-4 ${
              searchTab === 'groups' ? 'active bg-primary text-white' : 'text-muted bg-light'
            }`}
            onClick={() => setSearchTab('groups')}
          >
            <i className="bi bi-collection"></i>
            Groups
          </button>
        </li>
      </ul>

      {/* ─── Users Tab ─── */}
      {searchTab === 'users' && (
        <>
          {searching && <Loader size="sm" />}
          {searchError && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>Something went wrong with the search.</span>
            </div>
          )}

          {!searching && debouncedQuery && searchResults.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-person-x text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No users found for "{debouncedQuery}".</p>
            </div>
          )}

          {!searching &&
            searchResults.map((u) => {
              const uid = getUserId(u)
              if (!uid) return null

              const status = friendshipStatus(uid)
              const processing = isProcessing(uid)

              let actionButton = null

              if (status === 'self') {
                actionButton = (
                  <span className="badge bg-secondary d-flex align-items-center gap-1">
                    <i className="bi bi-person"></i> You
                  </span>
                )
              } else if (status === 'friend') {
                actionButton = (
                  <span className="badge bg-success d-flex align-items-center gap-1">
                    <i className="bi bi-check-circle"></i> Friend
                  </span>
                )
              } else if (status === 'sent') {
                actionButton = (
                  <button
                    className="btn btn-warning btn-sm"
                    disabled={processing || addFriendMutation.isPending || cancelFriendMutation.isPending}
                    onClick={() => handleCancelRequest(uid)}
                  >
                    Cancel Request
                  </button>
                )
              } else if (status === 'pending') {
                actionButton = (
                  <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-clock"></i> Pending
                      </>
                    )}
                  </span>
                )
              } else {
                actionButton = (
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    disabled={processing || addFriendMutation.isPending || cancelFriendMutation.isPending}
                    onClick={() => handleSendRequest(uid)}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus"></i>
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                )
              }

              return (
                <div
                  key={uid}
                  className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 shadow-sm mb-2 hover-shadow transition"
                  style={{ transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,0.075)'}
                >
                  <Avatar username={u.username} size={44} />
                  <span 
                    className="flex-grow-1 fw-semibold text-dark"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${uid}`)}
                  >
                    {u.username}
                  </span>
                  {actionButton}
                </div>
              )
            })}
        </>
      )}

      {/* ─── Groups Tab ─── */}
      {searchTab === 'groups' && (
        <>
          {loadingGroups && <Loader size="sm" />}
          {!loadingGroups && debouncedQuery && filteredGroups.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-collection text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No groups found for "{debouncedQuery}".</p>
            </div>
          )}

          {!loadingGroups &&
            filteredGroups.map((g) => {
              const groupId = g.groupID || g.id
              const isMember = (g.members || []).map(Number).includes(Number(userId))
              const memberCount = (g.members || [g.adminID]).length

              return (
                <div
                  key={groupId}
                  className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 shadow-sm mb-2 hover-shadow transition"
                  style={{ transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,0.075)'}
                >
                  <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                    <i className="bi bi-collection-fill text-primary fs-4"></i>
                  </div>
                  <div className="flex-grow-1">
                    <span 
                      className="fw-semibold text-dark d-block"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/groups/${groupId}/chat`)}
                    >
                      {g.groupName}
                    </span>
                    <span className="text-muted small">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                  </div>
                  {isMember ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleLeaveGroup(groupId)}
                      disabled={leaving}
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleJoinGroup(groupId)}
                      disabled={joining}
                    >
                      Join
                    </button>
                  )}
                </div>
              )
            })}
        </>
      )}
    </div>
  )
}