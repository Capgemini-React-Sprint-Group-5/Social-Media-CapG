import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '../store/index.js'
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useDeleteAllNotifications,
} from '../hooks/useNotifications.js'
import Loader from '../components/common/Loader.jsx'

/**
 * NotificationsPage  — Owner: E
 */
export default function NotificationsPage() {
  const currentUser = useSelector(selectCurrentUser)
  const userId      = currentUser?.userId
  const navigate     = useNavigate()

  const { data: notifications, isLoading } = useNotifications(userId)
  const { mutate: markRead   } = useMarkNotificationRead()
  const { mutate: remove     } = useDeleteNotification()
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()
  const { mutate: removeAll,   isPending: removingAll } = useDeleteAllNotifications()

  const handleNotificationClick = (n) => {
    const notificationId = n.notificationId || n.notificationID
    if (!n.read) markRead({ userId, notificationId })

    const fromUserId = n.fromUserID || n.fromUserId
    const postId = n.postID || n.postId

    if (n.type === 'message' && fromUserId) {
      navigate(`/messages/${fromUserId}`)
    } else if (n.type === 'like' && postId) {
      navigate(`/profile/${userId}?highlightPost=${postId}`)
    } else if (n.type === 'friend_request' && fromUserId) {
      navigate(`/profile/${fromUserId}`)
    }
  }

  if (isLoading) return <Loader />

  const hasNotifications = notifications && notifications.length > 0
  const hasUnread = notifications?.some((n) => !n.read)

  const sorted = [...(notifications || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  )

  return (
    <div
      className="mx-auto px-3"
      style={{ maxWidth: 640, paddingTop: '1.5rem', paddingBottom: '3rem' }}
    >
      <div
        className="bg-white shadow-sm"
        style={{ borderRadius: 'var(--radius-lg, 22px)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border, #E5E7EB)' }}
        >
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 38, height: 38, background: 'var(--primary-gradient)', color: '#fff', flexShrink: 0 }}
            >
              <i className="bi bi-bell-fill" style={{ fontSize: '1rem' }}></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>Notifications</h5>
              {hasUnread && (
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  You have unread notifications
                </span>
              )}
            </div>
          </div>

          {hasNotifications && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-light btn-sm rounded-3 fw-semibold d-flex align-items-center gap-1"
                disabled={!hasUnread || markingAll}
                onClick={() => markAllRead({ userId })}
              >
                <i className="bi bi-check2-all"></i>
                <span className="d-none d-sm-inline">Mark all as read</span>
              </button>
              <button
                className="btn btn-light text-danger btn-sm rounded-3 fw-semibold d-flex align-items-center gap-1"
                disabled={removingAll}
                onClick={() => removeAll({ userId })}
              >
                <i className="bi bi-trash"></i>
                <span className="d-none d-sm-inline">Delete all</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!hasNotifications && (
          <div className="text-center px-4" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light text-muted"
              style={{ width: 64, height: 64 }}
            >
              <i className="bi bi-bell-slash" style={{ fontSize: '1.6rem' }}></i>
            </div>
            <p className="text-muted mb-0 fw-medium">You're all caught up!</p>
            <p className="text-muted small mb-0">No notifications right now.</p>
          </div>
        )}

        {/* Notification list */}
        {hasNotifications && (
          <div>
            {sorted.map((n, idx) => {
              const notificationId = n.notificationId || n.notificationID
              const isClickable = ['message', 'like', 'friend_request'].includes(n.type)
              return (
                <div
                  key={notificationId}
                  className="d-flex align-items-start gap-3 px-4 py-3 notif-row"
                  role={isClickable ? 'button' : undefined}
                  onClick={isClickable ? () => handleNotificationClick(n) : undefined}
                  style={{
                    backgroundColor: n.read ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                    borderBottom: idx < sorted.length - 1 ? '1px solid var(--border, #E5E7EB)' : 'none',
                    transition: 'background-color 0.15s ease',
                    cursor: isClickable ? 'pointer' : 'default',
                  }}
                >
                  {/* Icon avatar */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: n.read ? '#F1F3F5' : 'rgba(79, 70, 229, 0.12)',
                      color: n.read ? '#6B7280' : 'var(--primary)',
                    }}
                  >
                    <i className="bi bi-person-fill" style={{ fontSize: '1.05rem' }}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p
                      className="mb-1"
                      style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.93rem', lineHeight: 1.5, color: 'var(--text, #1F2937)' }}
                    >
                      {n.content || n.message}
                    </p>
                    {n.timestamp && n.timestamp !== 'NOW()' && (
                      <span className="text-muted" style={{ fontSize: '0.76rem' }}>
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-center gap-1 flex-shrink-0">
                    {!n.read && (
                      <button
                        className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center p-0"
                        style={{ width: 32, height: 32 }}
                        title="Mark as read"
                        onClick={(e) => { e.stopPropagation(); markRead({ userId, notificationId }) }}
                      >
                        <i className="bi bi-check2" style={{ fontSize: '0.95rem' }}></i>
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-light text-danger rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{ width: 32, height: 32 }}
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); remove({ userId, notificationId }) }}
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
