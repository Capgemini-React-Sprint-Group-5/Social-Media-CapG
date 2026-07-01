import client from './client.js'

/**
 * api/notifications.api.js  — Owner: E
 */

/** GET /api/users/:userId/notifications */
export const getNotifications = (userId) =>
  client.get(`/api/users/${userId}/notifications`)

/** PUT /api/users/:userId/notifications/mark-read/:notificationId */
export const markNotificationRead = (userId, notificationId) =>
  client.put(`/api/users/${userId}/notifications/mark-read/${notificationId}`)

/** DELETE /api/users/:userId/notifications/delete/:notificationId */
export const deleteNotification = (userId, notificationId) =>
  client.delete(`/api/users/${userId}/notifications/delete/${notificationId}`)
