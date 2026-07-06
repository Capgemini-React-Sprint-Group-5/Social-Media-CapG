import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queryKeys.js'
import * as notifApi from '../api/notifications.api.js'


export function useNotifications(userId) {
  return useQuery({
    queryKey: queryKeys.notifications.byUser(userId),
    queryFn:  () => notifApi.getNotifications(userId),
    enabled:  !!userId,
  })
}


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


export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }) => notifApi.markAllNotificationsRead(userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(userId) })
    },
  })
}


export function useDeleteAllNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId }) => notifApi.deleteAllNotifications(userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(userId) })
    },
  })
}
