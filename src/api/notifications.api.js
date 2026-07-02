import client from "./client.js";

// GET /Users/:userId/notifications
export const getNotifications = async (userId) =>
  (await client.get(`/Users/${userId}/notifications`)).data;

// PUT /Users/:userId/notifications/mark-read/:notificationId
export const markNotificationRead = (userId, notificationId) =>
  client.put(`/Users/${userId}/notifications/mark-read/${notificationId}`);

// DELETE /Users/:userId/notifications/delete/:notificationId
export const deleteNotification = (userId, notificationId) =>
  client.delete(`/Users/${userId}/notifications/delete/${notificationId}`);
