import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as notifApi from '../api/notifications.api.js'

/**
 * hooks/useNotifications.js  — Owner: E
 */

/**
 * Fetch all notifications for a user.
 * Usage: const { data: notifications } = useNotifications(userId)
 */
export function useNotifications(userId) {
  return useQuery({
    queryKey: queryKeys.notifications.byUser(userId),
    queryFn:  () => notifApi.getNotifications(userId),
    enabled:  !!userId,
  })
}

/**
 * Mark a notification as read.
 * Usage:
 *   const { mutate: markRead } = useMarkNotificationRead()
 *   markRead({ userId, notificationId })
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, notificationId }) =>
      notifApi.markNotificationRead(userId, notificationId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(userId) })
    },
  })
}

/**
 * Delete a notification.
 * Usage:
 *   const { mutate: remove } = useDeleteNotification()
 *   remove({ userId, notificationId })
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, notificationId }) =>
      notifApi.deleteNotification(userId, notificationId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(userId) })
    },
  })
}
