import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from '../hooks/useNotifications.js'
import Loader from '../components/common/Loader.jsx'

/**
 * NotificationsPage  — Owner: E
 *
 * TODO (E):
 *  - Style unread vs read notifications differently
 *  - Add a "Mark all as read" batch action
 */
export default function NotificationsPage() {
  const currentUser = useSelector(selectCurrentUser)
  const userId      = currentUser?.userId

  const { data: notifications, isLoading } = useNotifications(userId)
  const { mutate: markRead  } = useMarkNotificationRead()
  const { mutate: remove    } = useDeleteNotification()

  if (isLoading) return <Loader />

  return (
    <div style={{ maxWidth: 600 }}>
      <h5 className="mb-3">Notifications</h5>
      {notifications?.length === 0 && (
        <p className="text-muted">No notifications.</p>
      )}
      {notifications?.map((n) => (
        <div key={n.notificationId} className="card mb-2">
          <div className="card-body d-flex align-items-center gap-2">
            <span className="flex-grow-1">{n.content || n.message}</span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => markRead({ userId, notificationId: n.notificationId })}
            >
              ✓
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => remove({ userId, notificationId: n.notificationId })}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
