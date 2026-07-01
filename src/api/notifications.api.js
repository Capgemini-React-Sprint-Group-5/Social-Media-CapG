import client from './client.js'

/**
 * api/notifications.api.js  — Owner: E
 */

/** GET /Notifications */
export const getNotifications = (userId) =>
  client.get('/Notifications', {
    params: {
      userID: Number(userId),
    },
  });

/** PUT /Notifications/:notificationId */
export const markNotificationRead = async (userId, notificationId) => {
  const notif = await client.get(`/Notifications/${notificationId}`);
  return client.put(`/Notifications/${notificationId}`, {
    ...notif,
    read: true
  });
};

/** DELETE /Notifications/:notificationId */
export const deleteNotification = (userId, notificationId) =>
  client.delete(`/Notifications/${notificationId}`);
