import { useSelector } from 'react-redux'
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

  const { data: notifications, isLoading } = useNotifications(userId)
  const { mutate: markRead   } = useMarkNotificationRead()
  const { mutate: remove     } = useDeleteNotification()
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead()
  const { mutate: removeAll,   isPending: removingAll } = useDeleteAllNotifications()

  if (isLoading) return <Loader />

  const hasNotifications = notifications && notifications.length > 0
  const hasUnread = notifications?.some((n) => !n.read)

  const sorted = [...(notifications || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  )

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h5 className="mb-0">Notifications</h5>
        {hasNotifications && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={!hasUnread || markingAll}
              onClick={() => markAllRead({ userId })}
            >
              Mark all as read
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={removingAll}
              onClick={() => removeAll({ userId })}
            >
              Delete all
            </button>
          </div>
        )}
      </div>

      {!hasNotifications && (
        <p className="text-muted">No notifications.</p>
      )}

      {sorted.map((n) => (
        <div
          key={n.notificationId || n.notificationID}
          className="card mb-2"
          style={{
            backgroundColor: n.read ? 'var(--surface)' : 'rgba(79, 70, 229, 0.06)',
            borderLeft: n.read ? '4px solid transparent' : '4px solid var(--primary)',
          }}
        >
          <div className="card-body d-flex align-items-center gap-2">
            {!n.read && (
              <span
                className="rounded-circle"
                style={{ width: 8, height: 8, backgroundColor: 'var(--primary)', flexShrink: 0 }}
              />
            )}
            <span className="flex-grow-1" style={{ fontWeight: n.read ? 400 : 600 }}>
              {n.content || n.message}
            </span>
            {!n.read && (
              <button
                className="btn btn-outline-secondary btn-sm"
                title="Mark as read"
                onClick={() => markRead({ userId, notificationId: n.notificationId || n.notificationID })}
              >
                ✓
              </button>
            )}
            <button
              className="btn btn-outline-danger btn-sm"
              title="Delete"
              onClick={() => remove({ userId, notificationId: n.notificationId || n.notificationID })}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
